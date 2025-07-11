import { ContractAndConfig, Period, Promotion, Proposal, Upvote, Vote, VoteOption } from "packages/types";
import { Contract, ContractConfig, SenderAlias, TzktStorageHistory } from "./types";
import fs from 'fs/promises'; // TODO remove in prod
import {logger} from './utils/logger'
import { LRUCache } from "./utils/cache";

import { TezosToolkit } from '@taquito/taquito';
import { HistoricalRpcClient } from "./utils/HistoricalRpcClient";
import { Database } from "./db/Database";

type PeriodIndexToPeriod = {
    [period_index: number]: Period
}

export class GovernanceContractIndexer {
    base_url: string = 'https://api.tzkt.io/v1';
    delegate_view_contract: string = 'KT1Ut6kfrTV9tK967tDYgQPMvy9t578iN7iH';
    tezos_rpc_url: string = 'https://rpc.tzkt.io/mainnet';
    cache: LRUCache<any> = new LRUCache();
    database: Database = new Database();

    constructor() {}


    public async indexContracts(contracts: Contract[]): Promise<void[]> {
        logger.info(`[GovernanceContractIndexer] indexContracts(${contracts.length} contracts)`);
        return Promise.all(contracts.map(contract => this.indexContract(contract)));
    }

    public async indexContract(contract: Contract): Promise<void> {
        logger.info(`[GovernanceContractIndexer] indexContract(${contract.address})`);
        const data: TzktStorageHistory[] = await this.fetchJson<TzktStorageHistory[]>(
            `${this.base_url}/contracts/${contract.address}/storage/history`,
            { limit: '1000' }
        );

        logger.info(`[GovernanceContractIndexer] Fetching storage history for ${contract.type} contract at ${contract.address}...`);
        if (!data || data.length === 0) {
            logger.info(`[GovernanceContractIndexer] No storage history found for contract ${contract.address}`);
            return;
        }
        if (data.length >= 1000) throw new Error(`Storage history for contract ${contract.address} exceeds 1000 entries. Add pagination.`);
        if (!data[0].value.config) throw new Error(`No config found in storage history for contract ${contract.address}`);

        const contract_config = data[0].value.config as ContractConfig;
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

        }
        const periods: PeriodIndexToPeriod = await this.getContractPeriodsWithoutProposalsOrPromotions(contract_and_config);

        const { promotions, proposals, upvotes, votes } = await this.createProposalsPromotionsVotesAndUpvotes(
            contract,
            periods,
            data
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

    public async getDelegateVotingPowerForAddress(address: string, level: number, global_voting_index: number): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getDelegateVotingPowerForAddress(${address}, ${level}, ${global_voting_index})`);
        try {

            const cacheKey = `delegates_${address}_${global_voting_index}`;

            if (this.cache) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached;
            }
            const rpc_client = new HistoricalRpcClient(this.tezos_rpc_url, level);
            const tezos_toolkit = new TezosToolkit(rpc_client);
            const contract = await tezos_toolkit.contract.at(this.delegate_view_contract);
            const view = contract.contractViews.list_voters({
                0: address,
                1: null
            });
            const delegates: string[] = await view.executeView({ viewCaller: address });

            if (delegates.length === 0) {
                logger.info(`[GovernanceContractIndexer] No delegates found for address ${address}`);
                return 0;
            }

            const delegate_totals = await Promise.allSettled(
                delegates.map(async (addr) => {
                    return this.getVotingPowerForAddress(addr, global_voting_index)
                })
            );

            const delegate_sum: number =  delegate_totals.reduce((total, result) => {
                if (result.status === 'fulfilled') {
                    return total + result.value;
                } else {
                    logger.error(`Error fetching voting power for delegate: ${result.reason}`);
                    throw new Error(`Error fetching voting power for delegate: ${result.reason}`);
                }
            }, 0);
            if (this.cache) this.cache.set(cacheKey, delegate_sum);
            return delegate_sum;
        } catch (error) {
            logger.error(`Error getting delegate voting power for address ${address} at level ${level}: ${error}`);
        }
        return 0;
    }

    private async getDateFromLevel(level: number): Promise<Date> {
        logger.info(`[GovernanceContractIndexer] getDateFromLevel(${level})`);
            const utc = await this.fetchJson<string>(`${this.base_url}/blocks/${level}/timestamp`);
            const date = new Date(utc);
            // Add 4 hours for Dubai time // TODO remove in prod
            const dubaiDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
            return dubaiDate;

    }

    private async getCurrentLevel(): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getCurrentLevel()`);
        const isoDate = new Date().toISOString();
        return await this.fetchJson<number>(`${this.base_url}/blocks/${isoDate}/level`);
    }

    private async getContractPeriodsWithoutProposalsOrPromotions(
        contract_and_config: ContractAndConfig,
    ): Promise<PeriodIndexToPeriod> {
        logger.info(`[GovernanceContractIndexer] getContractPeriodsWithoutProposalsOrPromotions(${JSON.stringify(contract_and_config)})`);
        const periods: PeriodIndexToPeriod = {};
        const current_level: number = await this.getCurrentLevel();
        const period_length: number = contract_and_config.period_length;
        const started_at_level: number = contract_and_config.started_at_level;

        for (let i = started_at_level; i <= current_level; i += period_length + 1) {
            const level_end = i + period_length;
            const date_start = await this.getDateFromLevel(i);
            const date_end = await this.getDateFromLevel(level_end);
            const contract_voting_index = Math.floor((i - started_at_level) / period_length);

            const period: Period = {
                contract_voting_index: contract_voting_index,
                contract_address: contract_and_config.contract_address,
                level_start: i,
                level_end: level_end,
                date_start: date_start,
                date_end: date_end,
            };
            periods[period.contract_voting_index] = period;
        }
        return periods;
    }

    private async getSenderFromHash(hash: string): Promise<SenderAlias> {
        logger.info(`[GovernanceContractIndexer] getSenderFromHash(${hash})`);
        const data = await this.fetchJson<{ sender: { address: string; alias?: string } }[]>(
            `${this.base_url}/operations/transactions/${hash}`
        );
        if (!data) throw new Error(`No data found for transaction hash ${hash}`);
        return { sender: data[0]?.sender.address, alias: data[0]?.sender.alias || undefined };
    }

    public async getGlobalVotingPeriodIndex(start_level: number, end_level: number): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getGlobalVotingPeriodIndex(${start_level}, ${end_level})`);
        const data = await this.fetchJson<{ index: number }[]>(
            `${this.base_url}/voting/periods`,
            { 'firstLevel.le': String(start_level), 'lastLevel.ge': String(end_level) }
        );
        if (!data || data.length === 0) throw new Error(`No voting period found for start level ${start_level} and end level ${end_level}`);
        if (data.length > 1) {
            logger.warn(`[GovernanceContractIndexer] Multiple voting periods found for start level ${start_level} and end level ${end_level}. Using the first one.`);
        }
        return data[0].index;
    }

    public async getVotingPowerForAddress(address: string, global_voting_index: number): Promise<number> {
        logger.info(`[GovernanceContractIndexer] getVotingPowerForAddress(${address}, ${global_voting_index})`);
        let voting_power = 0;
        const data = await this.fetchJson<{ delegate: { address: string }; votingPower: number }>(
            `${this.base_url}/voting/periods/${global_voting_index}/voters/${address}`
        );
        if (!data) return voting_power;
        if (!data) throw new Error(`No voter found for address ${address} at global_voting_index ${global_voting_index}`);
        if (!data.votingPower) throw new Error(`No voting power found for address ${address} at global_voting_index ${global_voting_index}`);
        return data.votingPower;
    }

    private async getWinningCandidateAtLevel(contract_address: string, level: number, period_index: number): Promise<string> {
        logger.info(`[GovernanceContractIndexer] getWinningCandidateAtLevel(${contract_address}, ${level}, ${period_index})`);
        const url = `${this.base_url}/contracts/${contract_address}/storage`;
        const data = await this.fetchJson<{ voting_context: { period: { proposal?: { winner_candidate: string }; promotion?: { winner_candidate: string } }; period_index: string  } }>(
            url,
            { level: String(level) }
        );
        if (!data) throw new Error(`No data found for contract ${contract_address}`);
        const winner_candidate = data.voting_context?.period?.proposal?.winner_candidate || data.voting_context?.period?.promotion?.winner_candidate;
        if (!winner_candidate) throw new Error(`No winning candidate found for contract ${contract_address} at level ${level}`);
        if (!data.voting_context?.period_index) throw new Error(`No period index found for contract ${contract_address} at level ${level}`);
        if (period_index !== parseInt(data.voting_context?.period_index)) throw new Error(`Period index mismatch for contract ${contract_address} at level ${level} expecting ${parseInt(data.voting_context?.period_index)}`);
        return winner_candidate;
    }

    private async createProposalsPromotionsVotesAndUpvotes(
        contract: Contract,
        periods: PeriodIndexToPeriod,
        data: TzktStorageHistory[]
    ): Promise<{ promotions: Promotion[], proposals: Proposal[], upvotes: Upvote[], votes: Vote[] }> {
        logger.info(`[GovernanceContractIndexer] createProposalsPromotionsVotesAndUpvotes(${contract.address}, ${periods}, ${data.length} entries)`);
        const promotions_hash_to_promotion: Record<string, Promotion> = {};
        const proposals: Proposal[] = [];
        const upvotes: Upvote[] = [];
        const votes: Vote[] = [];
        const current_level = await this.getCurrentLevel();

        for (let i = data.length - 1; i >= 0; i--) {
            const entry = data[i];
            if (entry.operation?.parameter?.entrypoint === 'new_proposal') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash) || { sender: 'unknown', alias: undefined };
                const period_index = Number(entry.value.voting_context.period_index);
                const proposal_hash = entry.operation.parameter.value;
                proposals.push({
                    contract_period_index: period_index,
                    level: entry.level,
                    time: entry.timestamp,
                    proposal_hash: entry.operation.parameter.value,
                    transaction_hash: entry.operation.hash,
                    contract_address: contract.address,
                    proposer: sender,
                    alias: alias,
                });
                periods[period_index].proposal_hashes = periods[period_index].proposal_hashes || [];
                periods[period_index].proposal_hashes.push(proposal_hash);
                // TODO check for the next period if there is a promotion
                periods[period_index].proposal_hashes.push(proposal_hash);

                if (periods[period_index].promotion_hash) continue;

                const promotion_start_level = periods[period_index].level_end + 1;
                const winning_candidate = await this.getWinningCandidateAtLevel(contract.address, promotion_start_level, period_index);
                if (!winning_candidate) continue;
                const promotion_start_time = await this.getDateFromLevel(promotion_start_level);
                if (!promotion_start_time) continue;

                periods[period_index].promotion_hash = winning_candidate;

                if (current_level < promotion_start_level) continue;
                promotions_hash_to_promotion[winning_candidate] = {
                    proposal_hash: winning_candidate,
                    contract_period_index: period_index + 1,
                    contract_address: contract.address,
                    yea_voting_power: 0,
                    nay_voting_power: 0,
                    pass_voting_power: 0,
                    total_voting_power: 0,
                };
                continue;
            }
            if (entry.operation?.parameter?.entrypoint === 'upvote_proposal') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash);
                const global_voting_index = await this.getGlobalVotingPeriodIndex(entry.level, entry.level + 1);
                const voting_power = await this.getVotingPowerForAddress(sender, global_voting_index);
                const delegate_voting_power = await this.getDelegateVotingPowerForAddress(sender, entry.level, global_voting_index);
                upvotes.push({
                    level: entry.level,
                    time: entry.timestamp,
                    transaction_hash: entry.operation.hash,
                    proposal_hash: entry.operation.parameter.value,
                    baker: sender,
                    alias: alias,
                    voting_power: voting_power + delegate_voting_power,
                    contract_address: contract.address,
                });
                continue;
            }
            if (entry.operation?.parameter?.entrypoint === 'vote') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash) || { sender: 'unknown', alias: undefined };
                const global_voting_index = await this.getGlobalVotingPeriodIndex(entry.level, entry.level + 1);
                const voting_power = await this.getVotingPowerForAddress(sender, global_voting_index);
                const delegate_voting_power = await this.getDelegateVotingPowerForAddress(sender, entry.level, global_voting_index);
                votes.push({
                    id: entry.id,
                    level: entry.level,
                    time: entry.timestamp,
                    proposal_hash: entry.value.voting_context.period.promotion?.winner_candidate || '',
                    baker: sender,
                    alias: alias,
                    voting_power: voting_power + delegate_voting_power,
                    vote: entry.operation.parameter.value as VoteOption,
                    transaction_hash: entry.operation.hash,
                    contract_address: contract.address,
                });
                // Update promotion as well
                // Find promotion
                const new_promotion = entry.value.voting_context.period.promotion;
                if (!new_promotion) continue;
                const promotion = promotions_hash_to_promotion[new_promotion?.winner_candidate];
                if (promotion) {
                    promotion.yea_voting_power = Number(new_promotion.yea_voting_power);
                    promotion.nay_voting_power = Number(new_promotion.nay_voting_power);
                    promotion.pass_voting_power = Number(new_promotion.pass_voting_power);
                    promotion.total_voting_power = Number(new_promotion.total_voting_power);
                }
                continue;
            }
            // if (entry.operation?.parameter?.entrypoint === 'trigger_kernel_upgrade') {
            //     const period_index = Number(entry.value.voting_context.period_index);
            //     const promotion_hash = entry.value.last_winner?.payload || '';
            //     periods[period_index].promotion_hash = promotion_hash;
            //     promotions_hash_to_promotion[promotion_hash] = {
            //         proposal_hash: promotion_hash,
            //         contract_period_index: period_index,
            //         contract_address: contract.address,
            //         transaction_hash: entry.operation.hash,
            //         level: entry.level,
            //         time: entry.timestamp,
            //         yea_voting_power: 0,
            //         nay_voting_power: 0,
            //         pass_voting_power: 0,
            //         total_voting_power: 0,
            //     };
            // }
        }

        const promotions: Promotion[] = Object.values(promotions_hash_to_promotion);
        return { promotions, proposals, upvotes, votes };
    }

    protected async fetchJson<T>(
        endpoint: string,
        params?: Record<string, string>,
        fetchParams: RequestInit = { cache: 'no-store' }
    ): Promise<T> {
        logger.info(`[GovernanceContractIndexer] fetchJson(${endpoint}, ${JSON.stringify(params)}, ${JSON.stringify(fetchParams)})`);
        let url = endpoint;
        if (params) url = `${url}?${new URLSearchParams(params).toString()}`;

        if (this.cache) {
            const cached = this.cache.get(url);
            if (cached) {
                logger.info(`[GovernanceContractIndexer] Cache hit for ${url}`);
                return cached;
            }
        }

        logger.info(`[GovernanceContractIndexer] Fetching URL: ${url}`);

        const res = await fetch(url, fetchParams);
        if (!res.ok) throw new Error(`Unexpected status ${res.status} for ${url}`);

        const data = await res.json() as T;
        if (this.cache) this.cache.set(url, data);
        return data;
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
