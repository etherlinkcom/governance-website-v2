import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Contract, TzktTransactionEvent, TzktStorageHistory } from './types';
import { Period, Proposal, Upvote, Vote, Promotion } from 'packages/types';
import { Database } from './db/Database';

export class TzktListener {
  private contracts: Contract[];
  private contractConfigs: Record<string, { startedAtLevel: number; periodLength: number }> = {};
  private connection!: HubConnection;
  private seenPeriods = new Set<string>();
  private governanceContractIndexer = new GovernanceContractIndexer();
  private readonly trackedFunctions: string[] = ['new_proposal', 'upvote_proposal', 'vote'];
  private database: Database = new Database();
  private readonly eventsUrl: string = 'https://api.tzkt.io/v1/events';

  constructor(contracts: Contract[]) {
    this.contracts = contracts;
    this.start().catch(error => logger.error('[TzktListener] start error', error));
  }

  private async start(): Promise<void> {
    // 1) Load on‑chain config for each contract
    await this.loadContractConfigs();

    this.connection = new HubConnectionBuilder()
      .withUrl(this.eventsUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection.on('head', (rawData: any) => {
      const headBlock = rawData.data ?? rawData;
      logger.info(`[TzktListener] New block received: Level ${headBlock.level}`);
      this.handleBlock(headBlock);
    });

    this.connection.on('operations', operationsPayload => {
      this.onOperations(operationsPayload);
    });

    await this.connection.start();
    logger.info('[TzktListener] SignalR connected');

    await this.connection.invoke('SubscribeToHead');
    logger.info('[TzktListener] Subscribed to head');

    for (const contract of this.contracts) {
      await this.connection.invoke('SubscribeToOperations', {
        address: contract.address,
        types: 'transaction'
      });
      logger.info(`[TzktListener] Subscribed to operations for ${contract.address}`);
    }
  }

  /** Fetch each contract’s started_at_level & period_length */
  private async loadContractConfigs(): Promise<void> {
    const baseUrl = this.governanceContractIndexer.tzkt_api_url;

    await Promise.all(this.contracts.map(async (contract) => {
      const response = await fetch(`${baseUrl}/contracts/${contract.address}/storage/history?limit=1`);
      const storageHistory = (await response.json()) as TzktStorageHistory[];
      const onChainConfig = storageHistory[0].value.config;

      this.contractConfigs[contract.address] = {
        startedAtLevel: Number(onChainConfig.started_at_level),
        periodLength: Number(onChainConfig.period_length),
      };
    }));

    logger.info('[TzktListener] Loaded contract configs:', this.contractConfigs);
  }

  private onOperations(operationsPayload: any): void {
    const rawItems = operationsPayload.data ?? operationsPayload;
    const transactionEvents = Array.isArray(rawItems) ? rawItems : [rawItems];

    for (const transactionEvent of transactionEvents) {
      if (
        !transactionEvent ||
        typeof transactionEvent !== 'object' ||
        !transactionEvent.target?.address ||
        !transactionEvent.parameter ||
        typeof transactionEvent.type !== 'string'
      ) {
        logger.debug('[TzktListener] skipping non‑tx payload', transactionEvent);
        continue;
      }

      this.processOperation(transactionEvent as TzktTransactionEvent);
    }
  }

  private processOperation(transactionEvent: TzktTransactionEvent): void {
    logger.info(`[TzktListener] processOperation(${transactionEvent.type}, id=${transactionEvent.id})`);

    const contract = this.contracts.find(c => c.address === transactionEvent.target.address);
    if (!contract) {
      return;
    }

    const entrypoint = transactionEvent.parameter!.entrypoint;
    if (this.trackedFunctions.includes(entrypoint)) {
      this.handleContractFunction(contract, transactionEvent, entrypoint);
    }
  }

  private handleContractFunction(contract: Contract, transactionEvent: TzktTransactionEvent, entrypoint: string): void {
    logger.info(`[TzktListener] handleContractFunction(${contract.address}, id=${transactionEvent.id}, fn=${entrypoint})`);

    switch (entrypoint) {
      case 'new_proposal':
        this.handleNewProposal(transactionEvent, contract);
        break;
      case 'upvote_proposal':
        this.handleUpvoteProposal(transactionEvent, contract);
        break;
      case 'vote':
        this.handleVote(transactionEvent, contract);
        break;
      default:
        logger.warn(`[TzktListener] Unknown function: ${entrypoint}`);
    }
  }

  private async handleNewProposal(transactionEvent: TzktTransactionEvent, contract: Contract): Promise<void> {
    const contractConfig = this.contractConfigs[contract.address];
    if (!contractConfig) {
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      return;
    }

    const periodIndex = Math.floor(levelDifference / periodLength);
    const proposalHash = transactionEvent.parameter!.value;

    logger.info(`[TzktListener] new_proposal at ${contract.address}` + ` level=${level} period=${periodIndex} hash=${proposalHash}`);

    const proposal: Proposal = {
      contract_period_index: periodIndex,
      level,
      time: transactionEvent.timestamp,
      proposal_hash: proposalHash,
      transaction_hash: transactionEvent.hash,
      contract_address: contract.address,
      proposer: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      upvotes: 0,
    };

    logger.info(`[TzktListener] New proposal: ${JSON.stringify(proposal)}`);
    await this.database.upsertProposals([proposal]);
  }

  private async handleUpvoteProposal(transactionEvent: TzktTransactionEvent, contract: Contract): Promise<void> {
    const contractConfig = this.contractConfigs[contract.address];
    if (!contractConfig) {
      logger.warn(`[TzktListener] Can't handleUpvoteProposal—no config for ${contract.address}`);
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      logger.warn(
        `[TzktListener] Upvote at level ${level} is before startedAtLevel ${startedAtLevel}`);
      return;
    }

    const periodIndex = Math.floor(levelDifference / periodLength);

    const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(level, level + 1);
    const votingPower = await this.governanceContractIndexer.getVotingPowerForAddress(transactionEvent.sender.address, globalVotingIndex);
    const delegateVotingPower = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(transactionEvent.sender.address, level, globalVotingIndex);

    const upvote: Upvote = {
      level,
      time: transactionEvent.timestamp,
      proposal_hash: transactionEvent.parameter!.value,
      voting_power: votingPower + delegateVotingPower,
      contract_address: contract.address,
      baker: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      transaction_hash: transactionEvent.hash,
      contract_period_index: periodIndex,
    };

    logger.info(`[TzktListener] upvote_proposal at ${contract.address}` + ` level=${level} period=${periodIndex}` + ` hash=${upvote.proposal_hash} voting_power=${upvote.voting_power}`);
    logger.info(`[TzktListener] Upvote: ${JSON.stringify(upvote)}`);
    await this.database.upsertUpvotes([upvote]);
  }

  private async handleVote(transactionEvent: TzktTransactionEvent, contract: Contract): Promise<void> {
    const contractConfig = this.contractConfigs[contract.address];
    if (!contractConfig) {
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      return;
    }

    const proposalPeriodIndex = Math.floor(levelDifference / periodLength);
    const promotionPeriodIndex = proposalPeriodIndex + 1;

    const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(level, level + 1);
    const votingPower = await this.governanceContractIndexer.getVotingPowerForAddress(transactionEvent.sender.address, globalVotingIndex);
    const delegateVotingPower = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(transactionEvent.sender.address, level, globalVotingIndex);

    const voteRecord: Vote = {
      proposal_hash: transactionEvent.parameter!.value.proposal_hash,
      baker: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      contract_address: contract.address,
      voting_power: votingPower + delegateVotingPower,
      vote: transactionEvent.parameter!.value,
      time: transactionEvent.timestamp,
      transaction_hash: transactionEvent.hash,
      level,
    };

    logger.info(`[TzktListener] ✔ vote @${contract.address}` + ` lvl=${level} propPeriod=${proposalPeriodIndex}` + ` promoPeriod=${promotionPeriodIndex}` + ` choice=${voteRecord.vote} vp=${voteRecord.voting_power}`);
    await this.database.upsertVotes([voteRecord]);

    const storageUrl = `${this.governanceContractIndexer.tzkt_api_url}` +
                       `/contracts/${contract.address}/storage?level=${level}`;
    const storageResponse = await fetch(storageUrl);
    if (!storageResponse.ok) {
      throw new Error(`HTTP ${storageResponse.status} fetching ${storageUrl}`);
    }
    const storageData = await storageResponse.json() as any;

    const promotionContext = storageData.voting_context?.period?.promotion;
    if (!promotionContext) {
      logger.warn(`[TzktListener] No on‑chain promotion context at lvl=${level} for ${contract.address}`);
      return;
    }

    const promotionRecord: Promotion = {
      proposal_hash: promotionContext.winner_candidate,
      contract_period_index: promotionPeriodIndex,
      contract_address: contract.address,
      yea_voting_power: Number(promotionContext.yea_voting_power),
      nay_voting_power: Number(promotionContext.nay_voting_power),
      pass_voting_power: Number(promotionContext.pass_voting_power),
      total_voting_power: Number(promotionContext.total_voting_power),
    };

    logger.info(
      `[TzktListener] promotion at ${contract.address}` +
      ` period=${promotionPeriodIndex}` +
      ` yea=${promotionRecord.yea_voting_power}` +
      ` nay=${promotionRecord.nay_voting_power}` +
      ` pass=${promotionRecord.pass_voting_power}` +
      ` total=${promotionRecord.total_voting_power}`
    );
    await this.database.upsertPromotions([promotionRecord]);
  }

  private async handleBlock(headBlock: { level: number; timestamp: string }): Promise<void> {
    const blockLevel = headBlock.level;

    for (const contract of this.contracts) {
      const contractConfig = this.contractConfigs[contract.address];
      if (!contractConfig) {
        continue;
      }

      const { startedAtLevel, periodLength } = contractConfig;
      const levelDifference = blockLevel - startedAtLevel;
      if (levelDifference < 0 || levelDifference % periodLength !== 0) {
        continue;
      }

      const periodIndex = levelDifference / periodLength;
      const periodKey = `${contract.address}-${periodIndex}`;
      if (this.seenPeriods.has(periodKey)) {
        continue;
      }
      this.seenPeriods.add(periodKey);

      const levelStart = startedAtLevel + periodIndex * periodLength;
      const levelEnd = levelStart + periodLength - 1;
      const dateStart = new Date(headBlock.timestamp);
      const dateEnd = await this.governanceContractIndexer.getDateFromLevel(levelEnd);

      const periodRecord: Period = {
        contract_voting_index: periodIndex,
        contract_address: contract.address,
        level_start: levelStart,
        level_end: levelEnd,
        date_start: dateStart,
        date_end: dateEnd,
        proposal_hashes: [],
        promotion_hash: undefined,
        max_upvotes_voting_power: 0,
        total_voting_power: 0,
        period_class: blockLevel >= levelStart && blockLevel <= levelEnd
          ? 'current'
          : 'future',
      };

      logger.info(`[TzktListener] New period ${periodKey}: ${JSON.stringify(periodRecord)}`);
      await this.database.upsertPeriods([periodRecord]);
    }
  }

  public async stop(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected) {
      await this.connection.stop();
    }
    logger.info('[TzktListener] Listener stopped');
  }
}
