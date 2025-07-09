import { GovernanceType, Period, Promotion, Proposal, Upvote, Vote, VoteOption } from "packages/types";
import { Contract, ContractConfig, SenderAlias, TzktStorageHistory } from "./types";
import fs from 'fs/promises'; // TODO remove in prod
import {logger} from './utils/logger'
import { LRUCache } from "./utils/cache";


// Run on all contracts

// create db
// Save contract config to database
// Create listener for each newest contract
// Save to db

type PeriodIndexToPeriod = {
    [period_index: number]: Period
}

/**
contracts: {
    5316609: [
      {
        address: 'KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J',
        name: 'kernel'
      }, {
        address: 'KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g',
        name: 'security'
      }, {
        address: 'KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF',
        name: 'sequencer'
      }],
    7692289: [{
      address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
      name: 'kernel'
    }, {
      address: 'KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2',
      name: 'security'
    }, {
      address: 'KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U',
      name: 'sequencer'
    }],
    8767489: [{
      address: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
      name: 'kernel'
    }, {
      address: 'KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL',
      name: 'security'
    }, {
      address: 'KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa',
      name: 'sequencer'
    }]
  },
 */
const contracts: Contract[] = [
    {
        type: 'slow',
        address: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
    },
    {
        type: 'slow',
        address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    },
]

export class GovernanceContractIndexer {
    base_url: string = 'https://api.tzkt.io/v1';
    cache: LRUCache<any> | undefined = undefined;

    constructor(cache?: LRUCache<any>) {
        this.cache = cache;
    }

    private async getDateFromLevel(level: number): Promise<Date> {
        logger.info(`getDateFromLevel(${level})`);
        const utc = await this.fetchJson<string>(
            `${this.base_url}/blocks/${level}/timestamp`
        );
        const date = new Date(utc);
        // Add 4 hours for Dubai time // TODO remove in prod
        const dubaiDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
        return dubaiDate;
    }

    private async getCurrentLevel(): Promise<number> {
        logger.info('getCurrentLevel()')
        const isoDate = new Date().toISOString();
        return await this.fetchJson<number>(
            `${this.base_url}/blocks/${isoDate}/level`
        );
    }

    private async getContractPeriodsWithoutProposalsOrPromotions(
        contract_config: ContractConfig,
        contract_address: string,
        governance_type: GovernanceType
    ): Promise<PeriodIndexToPeriod> {
        logger.info(`getContractPeriodsWithoutProposalsOrPromotions(${JSON.stringify(contract_config, null, 2)}, ${contract_address}, ${governance_type})`);
        const periods: PeriodIndexToPeriod = {};
        const current_level = await this.getCurrentLevel();
        const period_length = Number(contract_config.period_length);
        const started_at_level = Number(contract_config.started_at_level);

        for (let i = started_at_level; i <= current_level; i += period_length + 1) {
            const level_end = i + period_length;
            const date_start = await this.getDateFromLevel(i);
            const date_end = await this.getDateFromLevel(level_end);
            const contract_voting_index = Math.floor((i - started_at_level) / period_length);

            const period: Period = {
                contract_voting_index: contract_voting_index,
                governance_type: governance_type,
                contract_address: contract_address,
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
        logger.info(`getSenderFromHash(${hash})`);
        const data = await this.fetchJson<{ sender: { address: string; alias?: string } }[]>(
            `${this.base_url}/operations/transactions/${hash}`
        );
        if (!data) throw new Error(`No data found for transaction hash ${hash}`);
        return { sender: data[0]?.sender.address, alias: data[0]?.sender.alias || undefined };
    }

    private async getGlobalVotingPeriodIndex(start_level: number, end_level: number): Promise<number> {
        logger.info(`getGlobalVotingPeriodIndex(${start_level}, ${end_level})`);
        const data = await this.fetchJson<{ index: number }[]>(
            `${this.base_url}/voting/periods`,
            { 'firstLevel.le': String(start_level), 'lastLevel.ge': String(end_level) }
        );
        if (!data || data.length === 0) throw new Error(`No voting period found for start level ${start_level} and end level ${end_level}`);
        if (data.length > 1) {
            logger.warn(`Multiple voting periods found for start level ${start_level} and end level ${end_level}. Using the first one.`);
        }
        return data[0].index;
    }

    private async getVotingPowerForAddress(address: string, start_level: number, end_level: number): Promise<number> {
        logger.info(`getVotingPowerForAddress(${address}, ${start_level}, ${end_level})`);
        const votingPeriodIndex = await this.getGlobalVotingPeriodIndex(start_level, end_level);
        const data = await this.fetchJson<{ delegate: { address: string }; votingPower: number }[]>(
            `${this.base_url}/voting/periods/${votingPeriodIndex}/voters`,
            { limit: '10000' }
        );
        if (!data) throw new Error(`No data found for address ${address} at start_level ${start_level}`);
        const voter = data.find((v: { delegate: { address: string }; votingPower: number }) => v.delegate.address === address);
        if (!voter) throw new Error(`No voter found for address ${address} at start_level ${start_level}`);
        if (!voter.votingPower) throw new Error(`No voting power found for address ${address} at start_level ${start_level}`);
        return voter.votingPower;
    }

    private async getWinningCandidateAtLevel(contract_address: string, level: number, period_index: number): Promise<string> {
        logger.info(`getWinningCandidateAtLevel(${contract_address}, ${level}, ${period_index})`);
        const url = `${this.base_url}/contracts/${contract_address}/storage`;
        logger.info(`Fetching winning candidate from ${url} at level ${level} for period index ${period_index}`);
        const data = await this.fetchJson<{ voting_context: { period: { proposal: { winner_candidate: string }; }; period_index: string  } }>(
            url,
            { level: String(level) }
        );
        if (!data) throw new Error(`No data found for contract ${contract_address}`);
        const winner_candidate = data.voting_context?.period?.proposal?.winner_candidate;
        if (!winner_candidate) throw new Error(`No winning candidate found for contract ${contract_address} at level ${level}`);
        if (!data.voting_context?.period_index) throw new Error(`No period index found for contract ${contract_address} at level ${level}`);
        if (period_index !== parseInt(data.voting_context?.period_index)) throw new Error(`Period index mismatch for contract ${contract_address} at level ${level}`);
        return winner_candidate;
    }

    private async createProposalsPromotionsVotesAndUpvotes(
        contract: Contract,
        periods: PeriodIndexToPeriod,
        data: TzktStorageHistory[]
    ): Promise<{ promotions: Promotion[], proposals: Proposal[], upvotes: Upvote[], votes: Vote[] }> {
        logger.info(`createProposalsPromotionsVotesAndUpvotes(${contract.address}, ${periods}, ${data.length} entries)`);
        const promotions: Promotion[] = [];
        const proposals: Proposal[] = [];
        const upvotes: Upvote[] = [];
        const votes: Vote[] = [];

        for (const entry of data) {
            if (entry.operation?.parameter?.entrypoint === 'new_proposal') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash) || { sender: 'unknown', alias: undefined };
                const period_index = Number(entry.value.voting_context.period_index);
                const proposal_key = entry.operation.parameter.value;
                proposals.push({
                    contract_period_index: period_index,
                    level: entry.level,
                    time: entry.timestamp,
                    key: entry.operation.parameter.value,
                    transaction_hash: entry.operation.hash,
                    governance_type: contract.type,
                    proposer: sender,
                    alias: alias,
                });
                periods[period_index].proposal_keys = periods[period_index].proposal_keys || [];
                periods[period_index].proposal_keys.push(proposal_key);

                if (periods[period_index].promotion_key) continue;

                const promotion_start_level = periods[period_index].level_end + 1;
                const winning_candidate = await this.getWinningCandidateAtLevel(contract.address, promotion_start_level, period_index);
                if (!winning_candidate) continue;

                periods[period_index].promotion_key = winning_candidate;
                continue;
            }
            if (entry.operation?.parameter?.entrypoint === 'upvote_proposal') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash);
                const voting_power = await this.getVotingPowerForAddress(sender, entry.level, entry.level + 1);
                upvotes.push({
                    level: entry.level,
                    time: entry.timestamp,
                    transaction_hash: entry.operation.hash,
                    proposal_key: entry.operation.parameter.value,
                    baker: sender,
                    alias: alias,
                    voting_power: voting_power,
                });
                continue;
            }
            if (entry.operation?.parameter?.entrypoint === 'vote') {
                const { sender, alias } = await this.getSenderFromHash(entry.operation.hash) || { sender: 'unknown', alias: undefined };
                const voting_power = await this.getVotingPowerForAddress(sender, entry.level, entry.level + 1);
                votes.push({
                    id: entry.id,
                    proposal_key: entry.value.voting_context.period.promotion?.winner_candidate || '',
                    baker: sender,
                    alias: alias,
                    voting_power: voting_power,
                    vote: entry.operation.parameter.value as VoteOption,
                    transaction_hash: entry.operation.hash,
                    level: entry.level,
                    time: entry.timestamp,
                });
                continue;
            }
        }

        return { promotions, proposals, upvotes, votes };
    }

    public async getStorageHistoryForContract(contract: Contract): Promise<void> {
        logger.info(`getStorageHistoryForContract(${contract.address})`);
        const data: TzktStorageHistory[] = await this.fetchJson<TzktStorageHistory[]>(
            `${this.base_url}/contracts/${contract.address}/storage/history`,
            { limit: '1000' }
        );

        logger.info(`Fetching storage history for ${contract.type} contract at ${contract.address}...`);
        if (!data || data.length === 0) {
            logger.info(`No storage history found for contract ${contract.address}`);
            return;
        }
        if (data.length >= 1000) throw new Error(`Storage history for contract ${contract.address} exceeds 1000 entries. Add pagination.`);
        if (!data[0].value.config) throw new Error(`No config found in storage history for contract ${contract.address}`);

        const contract_config = data[0].value.config as ContractConfig;
        const periods: PeriodIndexToPeriod = await this.getContractPeriodsWithoutProposalsOrPromotions(
            contract_config,
            contract.address,
            contract.type
        );

        const { promotions, proposals, upvotes, votes } = await this.createProposalsPromotionsVotesAndUpvotes(
            contract,
            periods,
            data
        );
        await fs.writeFile('proposals.json', JSON.stringify(proposals, null, 2));
        await fs.writeFile('upvotes.json', JSON.stringify(upvotes, null, 2));
        await fs.writeFile('promotions.json', JSON.stringify(promotions, null, 2));
        await fs.writeFile('votes.json', JSON.stringify(votes, null, 2));

        logger.info(
            `Processed ${data.length} entries for contract ${contract.address}. Found: ` +
            `${proposals.length} proposals, ` +
            `${upvotes.length} upvotes, ` +
            `${promotions.length} promotions, ` +
            `${votes.length} votes.`
        );
        logger.info('Proposals[0]:', proposals[0]);
        logger.info('Upvotes[0]:', upvotes[0]);
        logger.info('Promotions[0]:', promotions[0]);
        logger.info('Votes[0]:', votes[0]);
    }

    protected async fetchJson<T>(
        endpoint: string,
        params?: Record<string, string>,
        fetchParams: RequestInit = { cache: 'no-store' }
    ): Promise<T> {
        logger.info(`fetchJson(${endpoint}, ${JSON.stringify(params)}, ${JSON.stringify(fetchParams)})`);
        let url = endpoint;
        if (params) url = `${url}?${new URLSearchParams(params).toString()}`;

        if (this.cache) {
            const cached = this.cache.get(url);
            if (cached) {
                logger.info(`Cache hit for ${url}`);
                return cached;
            }
        }

        logger.info(`Fetching URL: ${url}`);

        const res = await fetch(url, fetchParams);
        if (!res.ok) throw new Error(`Unexpected status ${res.status} for ${url}`);

        const data = await res.json() as T;
        if (this.cache) this.cache.set(url, data);
        return data;
    }
}