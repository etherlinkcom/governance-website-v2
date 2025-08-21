import { ContractAndConfig, Period, Promotion, Proposal, Upvote, Vote, VoteOption } from "packages/types";
import { Contract, ContractConfig, Voter, TzktContractStorage, TzktContractStorageHistory, TzktTransactionEvent } from "./types";
import {logger} from './utils/logger'
import { LRUCache } from "./utils/LRUCache";

import { TezosToolkit } from '@taquito/taquito';
import { HistoricalRpcClient } from "./utils/HistoricalRpcClient";
import { Database } from "./db/Database";

type PeriodIndexToPeriod = {
    [period_index: number]: Period
}

export class GovernanceContractIndexer {

    tzkt_api_url: string = process.env.TZKT_API_URL || "https://api.tzkt.io/v1";
    tzkt_rpc_url: string = process.env.TZKT_RPC_URL || "https://rpc.tzkt.io/mainnet";
    delegate_view_contract: string =  process.env.DELEGATE_VIEW_CONTRACT || 'KT1Ut6kfrTV9tK967tDYgQPMvy9t578iN7iH';
    cache: LRUCache<any> = new LRUCache();
    database: Database = new Database();

    constructor() {}

    async initialize(): Promise<void> {
        logger.info('[GovernanceContractIndexer] Initializing...');
        await this.database.initialize();
        logger.info('[GovernanceContractIndexer] Initialized successfully');
    }


    public async indexContracts(contracts: Contract[], indexFromStart: boolean = false): Promise<void[]> {
        logger.info(`[GovernanceContractIndexer] indexContracts(${contracts.length} contracts)`);
        return Promise.all(contracts.map(contract => this.indexContract(contract, indexFromStart)));
    }

    public async indexContract(contract: Contract, indexFromStart: boolean = false): Promise<void> {
        logger.info(`[GovernanceContractIndexer] indexContract(${contract.address})`);

        let last_processed_period: Period | null = null;
        if (!indexFromStart) {
            last_processed_period = await this.database.getLastProcessedPeriod(contract.address);
            logger.info(`[GovernanceContractIndexer] Last processed period for contract ${contract.address}: ${last_processed_period?.contract_voting_index}`);
        }

        const data: TzktContractStorageHistory[] = await this.fetchJson<TzktContractStorageHistory[]>(
            `${this.tzkt_api_url}/contracts/${contract.address}/storage/history`,
            { 'limit': '1000' }
        );

        if (!data || data.length === 0) {
            logger.info(`[GovernanceContractIndexer] No storage history found for contract ${contract.address}`);
            return;
        }
        if (data.length >= 1000) throw new Error(`Storage history for contract ${contract.address} exceeds 1000 entries. Add pagination.`);
        if (!data[0].value.config) throw new Error(`No config found in storage history for contract ${contract.address}`);

        const contract_config: ContractConfig = data[0].value.config as ContractConfig;
        const contract_and_config: ContractAndConfig = {
            contract_address: contract.address,
            governance_type: contract.type,
            started_at_level: Number(contract_config.started_at_level),
            period_length: Number(contract_config.period_length),
            adoption_period_sec: Number(contract_config.adoption_period_sec),
            upvoting_limit: Number(contract_config.upvoting_limit),
            scale: Number(contract_config.scale),
            proposal_quorum: Number(contract_config.proposal_quorum),
            promotion_quorum: Number(contract_config.promotion_quorum),
            promotion_supermajority: Number(contract_config.promotion_supermajority),
            active: contract.active || false,
        }

        const txParams: Record<string, string> = { 'limit': '10000', 'target': contract.address };
        if (last_processed_period !== null) {
            txParams['level.ge'] = String(last_processed_period.level_start - 1);
        }
        const transactions: TzktTransactionEvent[] = await this.fetchJson<TzktTransactionEvent[]>(
            `${this.tzkt_api_url}/operations/transactions`,
            txParams
        );

        const last_storage_level: number = data[0].level;
        const last_level_activity: number = transactions.length ? transactions[transactions.length - 1].level : last_storage_level;
        const periods: PeriodIndexToPeriod = await this.getContractPeriodsWithoutProposalsOrPromotions(
            contract_and_config,
            last_level_activity,
            last_processed_period?.level_start
        );

        const { promotions, proposals, upvotes, votes } = await this.createProposalsPromotionsVotesAndUpvotes(
            contract_and_config,
            periods,
            transactions
        );

        await this.saveToDatabase({
            proposals: proposals,
            votes: votes,
            upvotes: upvotes,
            promotions: promotions,
            contracts: [contract_and_config],
            periods: Object.values(periods),
        })
    }

    public async getDelegatesForAddress(address: string, level: number): Promise<string[]> {
        logger.info(`[GovernanceContractIndexer] getDelegatesForAddress(${address}, ${level})`);
        try {
            const rpc_client = new HistoricalRpcClient(this.tzkt_rpc_url, level);
            const tezos_toolkit = new TezosToolkit(rpc_client);
            const contract = await tezos_toolkit.contract.at(this.delegate_view_contract);
            const view = contract.contractViews.list_voters({
                0: address,
                1: null
            });

            return await view.executeView({ viewCaller: address });
        } catch (error) {
            logger.warn(`[GovernanceContractIndexer] Error fetching delegates for address ${address} at level ${level}: ${error}`);
            return [];
        }
    }

    public async getVotersForAddress(address: string, level: number, global_voting_index: number): Promise<Voter[]> {
        logger.info(`[GovernanceContractIndexer] getVotersForAddress(${address}, ${level}, ${global_voting_index})`);
        try {
            const cacheKey = `delegates_${address}_${global_voting_index}`;
            if (this.cache) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached;
            }

            const voters: string[] = [address];
            const all_votes: Voter[] = [];
            const delegates: string[] = await this.getDelegatesForAddress(address, level);
            logger.info(`[GovernanceContractIndexer] Delegates for address ${address} at level ${level}: ${delegates.length} found`);

            voters.push(...delegates)

            for (let i = 0; i < voters.length; i++) {
                const voter = await this.getVotingPowerForAddress(voters[i], global_voting_index);
                if (!voter) continue;
                all_votes.push({
                    address: voter.address,
                    votingPower: voter.votingPower,
                    alias: voter.alias
                });
            }

            if (this.cache) this.cache.set(cacheKey, all_votes);
            return all_votes;
        } catch (error) {
            logger.error(`[GovernanceContractIndexer] Error getting delegate voting power for address ${address} at level ${level}: ${error}`);
            throw error;
        }
    }

    private async getDateFromLevel(level: number): Promise<Date> {
        logger.info(`[GovernanceContractIndexer] getDateFromLevel(${level})`);
            const utc = await this.fetchJson<string>(`${this.tzkt_api_url}/blocks/${level}/timestamp`);
            return new Date(utc);
    }

    private async getCurrentLevel(): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getCurrentLevel()`);
        const isoDate = new Date().toISOString();
        return await this.fetchJson<number>(`${this.tzkt_api_url}/blocks/${isoDate}/level`);
    }

    private async getContractPeriodsWithoutProposalsOrPromotions(
        contract_and_config: ContractAndConfig,
        last_level_activity: number,
        last_processed_level?: number
    ): Promise<PeriodIndexToPeriod> {
        logger.info(`[GovernanceContractIndexer] getContractPeriodsWithoutProposalsOrPromotions(${JSON.stringify(contract_and_config)})`);
        const periods: PeriodIndexToPeriod = {};
        const end_level: number = contract_and_config.active ? await this.getCurrentLevel() : last_level_activity;
        const period_length: number = contract_and_config.period_length;
        const started_at_level: number = last_processed_level ?? contract_and_config.started_at_level;

        for (let i = started_at_level; i <= end_level; i += period_length) {
            const level_end: number = i + period_length - 1;
            const date_start: Date = await this.getDateFromLevel(i);
            const date_end: Date = await this.getDateFromLevel(level_end);
            const contract_voting_index: number = Math.floor((i - contract_and_config.started_at_level) / period_length);
            const total_voting_power: number = await this.getTotalVotingPower(i);

            const period: Period = {
                contract_voting_index: contract_voting_index,
                contract_address: contract_and_config.contract_address,
                level_start: i,
                level_end: level_end,
                date_start: date_start,
                date_end: date_end,
                total_voting_power: total_voting_power,
            };
            periods[period.contract_voting_index] = period;
        }
        return periods;
    }

    public async getGlobalVotingPeriodIndex(start_level: number, end_level: number): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getGlobalVotingPeriodIndex(${start_level}, ${end_level})`);
        const data = await this.fetchJson<{ index: number }[]>(
            `${this.tzkt_api_url}/voting/periods`,
            { 'firstLevel.le': String(start_level), 'lastLevel.ge': String(end_level) }
        );
        if (!data || data.length === 0) throw new Error(`No voting period found for start level ${start_level} and end level ${end_level}`);
        if (data.length > 1) {
            logger.warn(`[GovernanceContractIndexer] Multiple voting periods found for start level ${start_level} and end level ${end_level}. Using the first one.`);
        }
        return data[0].index;
    }

    public async getVotingPowerForAddress(address: string, global_voting_index: number): Promise<Voter | undefined> {
        logger.info(`[GovernanceContractIndexer] getVotingPowerForAddress(${address}, ${global_voting_index})`);
        try {
            const data = await this.fetchJson<{ delegate: { address: string, alias: string | undefined }; votingPower: number }>(
                `${this.tzkt_api_url}/voting/periods/${global_voting_index}/voters/${address}`
            );
            if (!data) return undefined;

            return {
                address: data.delegate.address,
                alias: data.delegate.alias,
                votingPower: data.votingPower
            };
        } catch (error) {
            logger.warn(`Error fetching voting power for address ${address} at global_voting_index ${global_voting_index}: ${error}`);
        }
    }

    private async getPromotionHashAtPromotionLevel(contract_address: string, promotion_end_level: number, promotion_period_index: number): Promise<string | undefined> {
        logger.info(`[GovernanceContractIndexer] getPromotionHashAtPromotionLevel(${contract_address}, ${promotion_end_level}, ${promotion_period_index})`);
        const url = `${this.tzkt_api_url}/contracts/${contract_address}/storage`;
        const data = await this.fetchJson<TzktContractStorage>(url,
                { level: String(promotion_end_level) }
        );
        if (!data) throw new Error(`No data found for contract ${contract_address}`);

        if (!data.voting_context?.period?.promotion) return undefined;

        const winner_candidate = data.voting_context?.period?.promotion?.winner_candidate;

        if (promotion_period_index !== parseInt(data.voting_context?.period_index)) {
            throw new Error(`
                Period index mismatch for contract ${contract_address} at level ${promotion_end_level}
                expecting ${promotion_period_index}
                got ${parseInt(data.voting_context?.period_index)}
            `);
        }
        return winner_candidate;
    }

    public async getTotalVotingPower(level: number): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getTotalVotingPower(${level})`);
        const url = `${this.tzkt_rpc_url}/chains/main/blocks/${level}/votes/total_voting_power`;
        return Number(await this.fetchJson<string>(url));
    }

    public async getContractStorageAtLevel(contract_address: string, level: number): Promise<TzktContractStorage> {
        logger.info(`[GovernanceContractIndexer] getContractStorageAtLevel(${contract_address}, ${level})`);
        const url = `${this.tzkt_api_url}/contracts/${contract_address}/storage`;
        const data = await this.fetchJson<TzktContractStorage>(url, { level: String(level) });
        if (!data) throw new Error(`No data found for contract ${contract_address}`);
        return data;
    }

    private async createProposalsPromotionsVotesAndUpvotes(
        contract_and_config: ContractAndConfig,
        periods: PeriodIndexToPeriod,
        transactions: TzktTransactionEvent[]
    ): Promise<{ promotions: Promotion[], proposals: Proposal[], upvotes: Upvote[], votes: Vote[] }> {
        logger.info(`[GovernanceContractIndexer] createProposalsPromotionsVotesAndUpvotes(${contract_and_config.contract_address}, ${periods}, ${transactions.length} entries)`);
        const promotions_hash_to_promotion: Record<any, Promotion> = {};
        const proposals_hash_to_proposal: Record<any, Proposal> = {};
        const proposals: Proposal[] = [];
        const upvotes: Upvote[] = [];
        const votes: Vote[] = [];

        for (const entry of transactions) {
            if (entry.parameter?.entrypoint === 'new_proposal') {
                await this.handleNewProposal(entry, contract_and_config, periods, proposals, upvotes, proposals_hash_to_proposal, promotions_hash_to_promotion);
            }
            if (entry.parameter?.entrypoint === 'upvote_proposal') {
                await this.handleUpvoteProposal(entry, contract_and_config, upvotes, proposals_hash_to_proposal);
            }
            if (entry.parameter?.entrypoint === 'vote') {
                await this.handleVote(entry, contract_and_config, votes, promotions_hash_to_promotion);
            }
        }

        const promotions: Promotion[] = Object.values(promotions_hash_to_promotion);
        return { promotions, proposals, upvotes, votes };
    }

    private async handleNewProposal(
        entry: TzktTransactionEvent,
        contract_and_config: ContractAndConfig,
        periods: PeriodIndexToPeriod,
        proposals: Proposal[],
        upvotes: Upvote[],
        proposals_hash_to_proposal: Record<any, Proposal>,
        promotions_hash_to_promotion: Record<any, Promotion>
    ) {
        const period_index: number = Number((await this.getContractStorageAtLevel(contract_and_config.contract_address, entry.level)).voting_context.period_index);
        const proposal_hash = entry.parameter!.value;

        periods[period_index].proposal_hashes = periods[period_index].proposal_hashes || [];
        periods[period_index].proposal_hashes.push(proposal_hash);

        const global_voting_index: number = await this.getGlobalVotingPeriodIndex(entry.level, entry.level + 1);
        const delegates: Voter[] = await this.getVotersForAddress(entry.sender.address, entry.level, global_voting_index);

        let voting_power: number = 0;
        for (let i = 0; i < delegates.length; i++) {
            voting_power += delegates[i].votingPower;
            upvotes.push({
                level: entry.level,
                time: entry.timestamp,
                transaction_hash: entry.hash,
                proposal_hash: proposal_hash,
                baker: delegates[i].address,
                alias: delegates[i].alias,
                voting_power: delegates[i].votingPower,
                contract_address: contract_and_config.contract_address,
                contract_period_index: period_index,
            });
        }

        proposals.push({
            contract_period_index: period_index,
            level: entry.level,
            time: entry.timestamp,
            proposal_hash: proposal_hash,
            transaction_hash: entry.hash,
            contract_address: contract_and_config.contract_address,
            proposer: delegates[0].address,
            alias: delegates[0]?.alias || '',
            upvotes: voting_power,
        });

        proposals_hash_to_proposal[proposal_hash] = proposals[proposals.length - 1];

        const promotion_period_index = period_index + 1;
        if (!periods[promotion_period_index] || periods[promotion_period_index]?.promotion_hash) return;

        const promotion_end_level = periods[period_index + 1].level_end;
        const winning_candidate = await this.getPromotionHashAtPromotionLevel(
            contract_and_config.contract_address,
            promotion_end_level,
            promotion_period_index
        );
        if (!winning_candidate) return;

        const promotion_start_time = await this.getDateFromLevel(promotion_end_level);
        if (!promotion_start_time) return;

        periods[promotion_period_index].promotion_hash = winning_candidate;
        promotions_hash_to_promotion[winning_candidate] = {
            proposal_hash: winning_candidate,
            contract_period_index: promotion_period_index,
            contract_address: contract_and_config.contract_address,
            yea_voting_power: 0,
            nay_voting_power: 0,
            pass_voting_power: 0,
            total_voting_power: 0,
        };
    }

    private async handleUpvoteProposal(
        entry: TzktTransactionEvent,
        contract_and_config: ContractAndConfig,
        upvotes: Upvote[],
        proposals_hash_to_proposal: Record<any, Proposal>
    ) {
        const period_index: number = Number((await this.getContractStorageAtLevel(contract_and_config.contract_address, entry.level)).voting_context.period_index);
        const global_voting_index: number = await this.getGlobalVotingPeriodIndex(entry.level, entry.level + 1);
        const delegates: Voter[] = await this.getVotersForAddress(entry.sender.address, entry.level, global_voting_index);
        const proposal_hash = entry.parameter!.value;

        let voting_power: number = 0;
        for (let i = 0; i < delegates.length; i++) {
            voting_power += delegates[i].votingPower;
            upvotes.push({
                level: entry.level,
                time: entry.timestamp,
                transaction_hash: entry.hash,
                proposal_hash: proposal_hash,
                baker: delegates[i].address,
                alias: delegates[i].alias,
                voting_power: delegates[i].votingPower,
                contract_address: contract_and_config.contract_address,
                contract_period_index: period_index,
            });
        }

        if (proposals_hash_to_proposal[proposal_hash]) {
            proposals_hash_to_proposal[proposal_hash].upvotes += voting_power;
        }
    }

    private async handleVote(
        entry: TzktTransactionEvent,
        contract_and_config: ContractAndConfig,
        votes: Vote[],
        promotions_hash_to_promotion: Record<any, Promotion>
    ) {
        const global_voting_index: number = await this.getGlobalVotingPeriodIndex(entry.level, entry.level + 1);
        const delegates: Voter[] = await this.getVotersForAddress(entry.sender.address, entry.level, global_voting_index);
        const contract_storage_at_level: TzktContractStorage = await this.getContractStorageAtLevel(contract_and_config.contract_address, entry.level);
        const period_index: number = Number(contract_storage_at_level.voting_context.period_index);
        const promotion_hash = await this.getPromotionHashAtPromotionLevel(
            contract_and_config.contract_address,
            entry.level,
            period_index
        );

        for (let i = 0; i < delegates.length; i++) {
            votes.push({
                level: entry.level,
                time: entry.timestamp,
                proposal_hash: promotion_hash || '',
                baker: delegates[i].address,
                alias: delegates[i].alias,
                voting_power: delegates[i].votingPower,
                vote: entry.parameter!.value as VoteOption,
                transaction_hash: entry.hash,
                contract_address: contract_and_config.contract_address,
            });
        }

        const new_promotion = contract_storage_at_level.voting_context.period.promotion;
        if (!new_promotion) return;
        const promotion = promotions_hash_to_promotion[new_promotion?.winner_candidate];

        if (promotion) {
            promotion.yea_voting_power = Number(new_promotion.yea_voting_power);
            promotion.nay_voting_power = Number(new_promotion.nay_voting_power);
            promotion.pass_voting_power = Number(new_promotion.pass_voting_power);
            promotion.total_voting_power = Number(new_promotion.total_voting_power);
        }
    }

    protected async fetchJson<T>(
        endpoint: string,
        params?: Record<string, string>,
        fetchParams: RequestInit = { cache: 'no-store' }
    ): Promise<T> {
        logger.info(`[GovernanceContractIndexer] fetchJson(${endpoint}, ${JSON.stringify(params)}, ${JSON.stringify(fetchParams)})`);
        const maxRetries = 5;
        let url = endpoint;
        if (params) url = `${url}?${new URLSearchParams(params).toString()}`;

        if (this.cache) {
            const cached = this.cache.get(url);
            if (cached) {
                logger.info(`[GovernanceContractIndexer] Cache hit for ${url}`);
                return cached;
            }
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`[GovernanceContractIndexer] Fetching URL (attempt ${attempt}): ${url}`);

                const res = await fetch(url, fetchParams);
                if (res.status === 204) return undefined as unknown as T;
                if (res.status === 404) return undefined as unknown as T;

                if (res.status === 429) {
                    const retryAfter = res.headers.get('Retry-After');
                    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;

                    logger.warn(`[GovernanceContractIndexer] Rate limited. Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);

                    if (attempt === maxRetries) {
                    throw new Error(`Rate limited after ${maxRetries} attempts for ${url}`);
                    }

                    await this.sleep(delay);
                    continue;
                }

                if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText} for ${url}`);

                const data = await res.json() as T;
                if (this.cache) this.cache.set(url, data);
                return data;

            } catch (error) {
                if (attempt === maxRetries) throw error;

                const delay = Math.pow(2, attempt) * 1000;
                logger.warn(`[GovernanceContractIndexer] Request failed, retrying after ${delay}ms: ${error}`);
                await this.sleep(delay);
            }
        }
            throw new Error(`Failed to fetch after ${maxRetries} attempts: ${url}`);
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private async saveToDatabase(data: {
        proposals: Proposal[];
        votes: Vote[];
        upvotes: Upvote[];
        promotions: Promotion[];
        contracts: ContractAndConfig[];
        periods: Period[];
    }): Promise<void> {
        logger.info(`[GovernanceContractIndexer] Saving to database: ${data.proposals.length} proposals, ${data.votes.length} votes, ${data.upvotes.length} upvotes, ${data.promotions.length} promotions`);

        try {
            await this.database.upsertProposals(data.proposals);
            await this.database.upsertVotes(data.votes);
            await this.database.upsertUpvotes(data.upvotes);
            await this.database.upsertPromotions(data.promotions);
            await this.database.upsertContracts(data.contracts);
            await this.database.upsertPeriods(data.periods);

            logger.info('[GovernanceContractIndexer] Successfully saved all data to database');
        } catch (error) {
            logger.error(`[GovernanceContractIndexer] Error saving to database: ${error}`);
            throw error;
        }
    }
}