import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Contract, TzktTransactionEvent, TzktContractStorageHistory, Voter, TzktApiHead, TzktContractStorage, PromotionContext, ContractConfig, OperationsPayload} from './types';
import { Period, Proposal, Upvote, Vote, Promotion, ContractAndConfig } from 'packages/types';
import { Database } from './db/Database';

export class TzktListener {
  private contracts: Contract[];
  private contract_configs: Record<string, ContractAndConfig> = {};
  private connection!: HubConnection;
  private governance_contract_indexer: GovernanceContractIndexer = new GovernanceContractIndexer();
  private database: Database = new Database();
  private readonly trackedFunctions: string[] = ['new_proposal', 'upvote_proposal', 'vote'];
  private readonly eventsUrl: string = process.env.TZKT_API_URL + '/ws';

  constructor(contracts: Contract[]) {
    logger.info(`[TzktListener] constructor(contracts=${contracts.map(c => c.address).join(',')})`);
    this.contracts = contracts;
  }

  public async start(): Promise<void> {
    logger.info('[TzktListener] start()');

    await this.database.initialize();
    await this.loadContractConfigs();

    this.connection = new HubConnectionBuilder()
      .withUrl(this.eventsUrl,)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection.on('head', (head: TzktApiHead) => {
      logger.info('[TzktListener] on "head" event');
      logger.info(`[TzktListener] New block received: Level ${head.data.level}`);
      this.handleBlock(head.data);
    });

    this.connection.on('operations', (operations_payload: OperationsPayload) => {
      logger.info('[TzktListener] on "operations" event');
      this.onOperations(operations_payload);
    });

    this.connection.onreconnected(() => {
      logger.info('[TzktListener] Reconnected, re-subscribing...');
      this.connection.invoke('SubscribeToHead');
      for (const contract of this.contracts) {
        this.connection.invoke('SubscribeToOperations', { address: contract.address, types: 'transaction' });
      }
    });

    await this.connection.start();
    logger.info('[TzktListener] SignalR connected');

    await this.connection.invoke('SubscribeToHead');
    logger.info('[TzktListener] Subscribed to head');

    for (const contract of this.contracts) {
      await this.connection.invoke('SubscribeToOperations', { address: contract.address, types: 'transaction' });
      logger.info(`[TzktListener] Subscribed to operations for ${contract.address}`);
    }
  }

  private async loadContractConfigs(): Promise<void> {
    logger.info('[TzktListener] loadContractConfigs()');
    const base_url: string = this.governance_contract_indexer.tzkt_api_url;

    await Promise.all(this.contracts.map(async contract => {
      const url: string = `${base_url}/contracts/${contract.address}/storage/history?limit=1`;
      logger.info(`[TzktListener] Fetching contract config from ${url}`);
      const response: Response = await fetch(url);
      const storage_history: TzktContractStorageHistory[] = (await response.json()) as TzktContractStorageHistory[];
      const on_chain_config: ContractConfig = storage_history[0].value.config;

      this.contract_configs[contract.address] = {
        contract_address: contract.address,
        started_at_level: Number(on_chain_config.started_at_level),
        period_length: Number(on_chain_config.period_length),
        adoption_period_sec: Number(on_chain_config.adoption_period_sec),
        upvoting_limit: Number(on_chain_config.upvoting_limit),
        scale: Number(on_chain_config.scale),
        proposal_quorum: Number(on_chain_config.proposal_quorum),
        promotion_quorum: Number(on_chain_config.promotion_quorum),
        promotion_supermajority: Number(on_chain_config.promotion_supermajority),
        active: contract.active,
        governance_type: contract.type
      } as ContractAndConfig;
    }));

    logger.info('[TzktListener] Loaded contract configs:', this.contract_configs);
    await this.database.upsertContracts(Object.values(this.contract_configs));
    logger.info('[TzktListener] Contract configs saved to database');
  }

  private onOperations(operations_payload: OperationsPayload): void {
    logger.info('[TzktListener] onOperations()');
    const transactionEvents: TzktTransactionEvent[] = operations_payload.data || [];

    for (const transaction_event of transactionEvents) {
      this.processOperation(transaction_event);
    }
  }

  private processOperation(transaction_event: TzktTransactionEvent): void {
    logger.info(`[TzktListener] processOperation(type=${transaction_event.type}, id=${transaction_event.id})`);
    const contract: Contract | undefined = this.contracts.find(c => c.address === transaction_event.target.address);
    if (!contract) return;

    const entrypoint: string = transaction_event.parameter!.entrypoint;
    if (this.trackedFunctions.includes(entrypoint)) this.handleContractFunction(transaction_event, entrypoint);
  }

  private handleContractFunction(transaction_event: TzktTransactionEvent, entrypoint: string): void {
    logger.info(`[TzktListener] handleContractFunction(contract=${transaction_event.target.address}, id=${transaction_event.id}, fn=${entrypoint})`);
    switch (entrypoint) {
      case 'new_proposal':
        this.handleNewProposal(transaction_event);
        break;
      case 'upvote_proposal':
        this.handleUpvoteProposal(transaction_event);
        break;
      case 'vote':
        this.handleVote(transaction_event);
        break;
      default:
        logger.warn(`[TzktListener] Untracked function: ${entrypoint}`);
    }
  }

  private async handleNewProposal(transaction_event: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleNewProposal(contract=${transaction_event.target.address}, id=${transaction_event.id})`);
    const contract_config: ContractAndConfig | undefined = this.contract_configs[transaction_event.target.address];
    if (!contract_config) {
      logger.error(`[TzktListener] handleNewProposal—no config for ${transaction_event.target.address}`);
      return;
    }

    const { started_at_level, period_length } = contract_config;
    const level: number = transaction_event.level;
    const level_difference: number = level - started_at_level;
    if (level_difference < 0) {
      logger.error(`[TzktListener] NewProposal at level ${level} is before started_at_level ${started_at_level}`);
      return;
    }

    const period_index: number = Math.floor(level_difference / period_length);
    const proposal_hash: string = transaction_event.parameter!.value;

    logger.info(`[TzktListener] new_proposal at ${transaction_event.target.address} level=${level} period=${period_index} hash=${proposal_hash}`);
    const global_voting_index: number = await this.governance_contract_indexer.getGlobalVotingPeriodIndex(level, level + 1);
    const delegates: Voter[] = await this.governance_contract_indexer.getVotersForAddress(
      transaction_event.sender.address, level, global_voting_index
    );

    const proposal: Proposal = {
      contract_period_index: period_index,
      level,
      time: transaction_event.timestamp,
      proposal_hash: proposal_hash,
      transaction_hash: transaction_event.hash,
      contract_address: transaction_event.target.address,
      proposer: delegates[0].address,
      alias: delegates[0].alias
    };

    logger.info(`[TzktListener] New proposal: ${JSON.stringify(proposal)}`);
    await this.database.upsertProposals([proposal]);

    logger.info(`[TzktListener] Registering automatic upvote for proposal ${proposal_hash} by proposer ${proposal.proposer}`);

    const upvotes: Upvote[] = [];
    for (const delegate of delegates) {
      const upvote: Upvote = {
        level,
        time: transaction_event.timestamp,
        proposal_hash: proposal_hash,
        voting_power: delegate.votingPower,
        contract_address: transaction_event.target.address,
        baker: delegate.address,
        alias: delegate.alias,
        transaction_hash: transaction_event.hash,
        contract_period_index: period_index
      };
      upvotes.push(upvote);
    }

    logger.info(`[TzktListener] Automatic upvote: ${JSON.stringify(upvotes, null, 2)}`);
    await this.database.upsertUpvotes(upvotes);


    const period_record: Period | null = await this.database.getPeriod(transaction_event.target.address, period_index);
    if (!period_record) {
      logger.error(`[TzktListener] No period record found for ${transaction_event.target.address} period ${period_index} to include ${proposal_hash}`);
      return;
    }

    if (!period_record.proposal_hashes?.includes(proposal_hash)) {
      period_record.proposal_hashes?.push(proposal_hash);
      await this.database.upsertPeriods([period_record]);
      logger.info(`[TzktListener] Updated period ${transaction_event.target.address}-${period_index} with new proposal hash ${proposal_hash}`);
    } else {
      logger.info(`[TzktListener] Period ${transaction_event.target.address}-${period_index} already contains proposal hash ${proposal_hash}`);
    }
  }

  private async handleUpvoteProposal(transaction_event: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleUpvoteProposal(contract=${transaction_event.target.address}, id=${transaction_event.id})`);
    const contract_config: ContractAndConfig = this.contract_configs[transaction_event.target.address];
    if (!contract_config) {
      logger.error(`[TzktListener] handleUpvoteProposal—no config for ${transaction_event.target.address}`);
      return;
    }

    const { started_at_level, period_length } = contract_config;
    const level: number = transaction_event.level;
    const level_difference: number = level - started_at_level;

    if (level_difference < 0) {
      logger.error(`[TzktListener] Upvote at level ${level} is before started_at_level ${started_at_level}`);
      return;
    }

    const period_index: number = Math.floor(level_difference / period_length);
    const global_voting_index: number = await this.governance_contract_indexer.getGlobalVotingPeriodIndex(level, level + 1);
    const delegates: Voter[] = await this.governance_contract_indexer.getVotersForAddress(transaction_event.sender.address, level, global_voting_index);

    const upvotes: Upvote[] = [];
    for (const delegate of delegates) {
      const upvote: Upvote = {
        level,
        time: transaction_event.timestamp,
        proposal_hash: transaction_event.parameter!.value,
        voting_power: delegate.votingPower,
        contract_address: transaction_event.target.address,
        baker: delegate.address,
        alias: delegate.alias,
        transaction_hash: transaction_event.hash,
        contract_period_index: period_index
      }
      upvotes.push(upvote);
    }

    logger.info(`[TzktListener] Upvotes: ${JSON.stringify(upvotes, null, 2)}`);
    await this.database.upsertUpvotes(upvotes);
  }

  private async handleVote(transaction_event: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleVote(contract=${transaction_event.target.address}, id=${transaction_event.id})`);
    const contract_config: ContractAndConfig | undefined = this.contract_configs[transaction_event.target.address];
    if (!contract_config) {
      logger.error(`[TzktListener] handleVote—no config for ${transaction_event.target.address}`);
      return;
    }

    const { started_at_level, period_length } = contract_config;
    const level: number = transaction_event.level;
    const level_difference: number = level - started_at_level;
    if (level_difference < 0) {
      logger.error(`[TzktListener] Vote at level ${level} is before started_at_level ${started_at_level}`);
      return;
    }

    const promotion_period_index: number = Math.floor(level_difference / period_length);

    const global_voting_index: number = await this.governance_contract_indexer.getGlobalVotingPeriodIndex(level, level + 1);
    const delegates: Voter[] = await this.governance_contract_indexer.getVotersForAddress(transaction_event.sender.address, level, global_voting_index);
    const winning_candidate: string = transaction_event.storage?.voting_context?.period?.promotion?.winner_candidate;

    const votes: Vote[] = [];
    for (const delegate of delegates) {
      const voteRecord: Vote = {
        proposal_hash: winning_candidate,
        baker: delegate.address,
        alias: delegate.alias,
        contract_address: transaction_event.target.address,
        voting_power: delegate.votingPower,
        vote: transaction_event.parameter!.value,
        time: transaction_event.timestamp,
        transaction_hash: transaction_event.hash,
        level
      };
      votes.push(voteRecord);
    }

    await this.database.upsertVotes(votes);

    const storage_data: TzktContractStorage = await this.governance_contract_indexer.getContractStorageAtLevel(
      transaction_event.target.address, level
    );

    const promotion_context: PromotionContext | undefined = storage_data.voting_context?.period?.promotion;
    if (!promotion_context) {
      logger.error(`No on‑chain promotion context at lvl=${level} for ${transaction_event.target.address}`);
      return;
    }


    const promotion_record: Promotion = {
      proposal_hash: promotion_context.winner_candidate,
      contract_period_index: promotion_period_index,
      contract_address: transaction_event.target.address,
      yea_voting_power: Number(promotion_context.yea_voting_power),
      nay_voting_power: Number(promotion_context.nay_voting_power),
      pass_voting_power: Number(promotion_context.pass_voting_power),
      total_voting_power: Number(promotion_context.total_voting_power)
    };

    logger.info(`[TzktListener] promotion  ${JSON.stringify(promotion_record)}`);
    await this.database.upsertPromotions([promotion_record]);
  }

  private async handleBlock(head_block: { level: number; timestamp: string }): Promise<void> {
    logger.info(`[TzktListener] handleBlock(level=${head_block.level})`);

    for (const contract of this.contracts) {
      logger.info(`[TzktListener] Checking contract ${contract.address} for new period`);
      const contract_config: ContractAndConfig | undefined = this.contract_configs[contract.address];
      if (!contract_config) {
        logger.error(`[TzktListener] handleBlock—no config for ${contract.address}`);
        continue;
      }

      const confirmation_blocks: number = 3;
      const { started_at_level, period_length } = contract_config;
      const level_difference: number = head_block.level - started_at_level;

      if (level_difference < 0 || level_difference % period_length !== confirmation_blocks) {
        logger.info(`[TzktListener] ${period_length - (level_difference % period_length)} blocks until next period for ${contract.address}`);
        continue;
      }

      const period_index: number = (level_difference - confirmation_blocks) / period_length;

      const level_start: number = started_at_level + period_index * period_length;
      const level_end: number = level_start + period_length - 1;
      const date_start: Date = new Date(head_block.timestamp);
      const date_end: Date = await this.governance_contract_indexer.getDateFromLevel(level_end);

      let promotion_hash: string | undefined = undefined;
      try {
        promotion_hash = await this.governance_contract_indexer.getPromotionHashAtPromotionLevel(contract.address, level_end, period_index);
        if (promotion_hash) await this.createPromotion(promotion_hash, period_index, contract.address);
      } catch (error) {
        logger.warn(`[TzktListener] No promotion hash found for ${contract.address} at period ${period_index}`);
      }

      const period_record: Period = {
        contract_voting_index: period_index,
        contract_address: contract.address,
        level_start: level_start,
        level_end: level_end,
        date_start: date_start,
        date_end: date_end,
        proposal_hashes: [],
        promotion_hash: promotion_hash,
        total_voting_power: 0
      };

      logger.info(`[TzktListener] New period ${contract.address}-${period_index}: ${JSON.stringify(period_record)}`);
      await this.database.upsertPeriods([period_record]);
    }
  }

  private async createPromotion(promotion_hash: string, promotion_period_index: number, contract_address: string): Promise<void> {
    const promotion_record: Promotion = {
      proposal_hash: promotion_hash,
      contract_period_index: promotion_period_index,
      contract_address: contract_address,
      yea_voting_power: 0,
      nay_voting_power: 0,
      pass_voting_power: 0,
      total_voting_power: 0
    };
    await this.database.upsertPromotions([promotion_record]);
  }

  public async stop(): Promise<void> {
    logger.info('[TzktListener] stop()');
    if (this.connection.state === HubConnectionState.Connected) await this.connection.stop();
    logger.info('[TzktListener] Listener stopped');
  }
}
