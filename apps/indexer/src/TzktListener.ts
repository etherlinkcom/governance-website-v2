import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Contract, TzktTransactionEvent, TzktContractStorageHistory, Voter, TzktApiHead} from './types';
import { Period, Proposal, Upvote, Vote, Promotion } from 'packages/types';
import { Database } from './db/Database';

export class TzktListener {
  private contracts: Contract[];
  private contractConfigs: Record<string, { startedAtLevel: number; periodLength: number }> = {};
  private connection!: HubConnection;
  private governanceContractIndexer = new GovernanceContractIndexer();
  private readonly trackedFunctions: string[] = ['new_proposal', 'upvote_proposal', 'vote'];
  private database: Database = new Database();
  private readonly eventsUrl: string = process.env.TZKT_API_URL + '/events';

  constructor(contracts: Contract[]) {
    logger.info(`[TzktListener] constructor(contracts=${contracts.map(c => c.address).join(',')})`);
    this.contracts = contracts;
  }


  public async start(): Promise<void> {
    logger.info('[TzktListener] start()');

    await this.database.initialize();
    await this.loadContractConfigs();

    this.connection = new HubConnectionBuilder()
      .withUrl(this.eventsUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection.on('head', (head: TzktApiHead) => {
      logger.info('[TzktListener] on "head" event');
      logger.info(`[TzktListener] New block received: Level ${head.data.level}`);
      this.handleBlock(head.data);
    });

    this.connection.on('operations', operationsPayload => {
      logger.info('[TzktListener] on "operations" event');
      this.onOperations(operationsPayload);
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

  /** Fetch each contract’s started_at_level & period_length */
  private async loadContractConfigs(): Promise<void> {
    logger.info('[TzktListener] loadContractConfigs()');
    const baseUrl = this.governanceContractIndexer.tzkt_api_url;

    await Promise.all(this.contracts.map(async contract => {
      const response = await fetch(`${baseUrl}/contracts/${contract.address}/storage/history?limit=1`);
      const storageHistory = (await response.json()) as TzktContractStorageHistory[];
      const onChainConfig = storageHistory[0].value.config;

      this.contractConfigs[contract.address] = {
        startedAtLevel: Number(onChainConfig.started_at_level),
        periodLength: Number(onChainConfig.period_length)
      };
    }));

    logger.info('[TzktListener] Loaded contract configs:', this.contractConfigs);
  }

  private onOperations(operationsPayload: any): void {
    logger.info('[TzktListener] onOperations()');
    const rawItems = operationsPayload.data ?? operationsPayload;
    const transactionEvents = Array.isArray(rawItems) ? rawItems : [rawItems];

    for (const transactionEvent of transactionEvents) {
      if (
        !transactionEvent ||
        typeof transactionEvent !== 'object' ||
        !transactionEvent.target?.address ||
        !transactionEvent.parameter ||
        typeof transactionEvent.type !== 'string'
      ) continue;

      this.processOperation(transactionEvent as TzktTransactionEvent);
    }
  }

  private processOperation(transactionEvent: TzktTransactionEvent): void {
    logger.info(`[TzktListener] processOperation(type=${transactionEvent.type}, id=${transactionEvent.id})`);
    const contract = this.contracts.find(c => c.address === transactionEvent.target.address);
    if (!contract) return;

    const entrypoint = transactionEvent.parameter!.entrypoint;
    if (this.trackedFunctions.includes(entrypoint)) this.handleContractFunction(transactionEvent, entrypoint);
  }

  private handleContractFunction(transactionEvent: TzktTransactionEvent, entrypoint: string): void {
    logger.info(`[TzktListener] handleContractFunction(contract=${transactionEvent.target.address}, id=${transactionEvent.id}, fn=${entrypoint})`);
    switch (entrypoint) {
      case 'new_proposal':
        this.handleNewProposal(transactionEvent);
        break;
      case 'upvote_proposal':
        this.handleUpvoteProposal(transactionEvent);
        break;
      case 'vote':
        this.handleVote(transactionEvent);
        break;
      default:
        logger.warn(`[TzktListener] Untracked function: ${entrypoint}`);
    }
  }

  private async handleNewProposal(transactionEvent: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleNewProposal(contract=${transactionEvent.target.address}, id=${transactionEvent.id})`);
    const contractConfig = this.contractConfigs[transactionEvent.target.address];
    if (!contractConfig) {
      logger.error(`[TzktListener] handleNewProposal—no config for ${transactionEvent.target.address}`);
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      logger.error(`[TzktListener] NewProposal at level ${level} is before startedAtLevel ${startedAtLevel}`);
      return;
    }

    const periodIndex = Math.floor(levelDifference / periodLength);
    const proposalHash = transactionEvent.parameter!.value;

    const voters: Voter[] = await this.governanceContractIndexer.getVotersForAddress(transactionEvent.sender.address, transactionEvent.level, periodIndex);

    let voting_power: number = 0;
    for (let i = 0; i < voters.length; i++) {
        voting_power += voters[i].votingPower;
    }

    logger.info(`[TzktListener] new_proposal at ${transactionEvent.target.address} level=${level} period=${periodIndex} hash=${proposalHash}`);
    const proposal: Proposal = {
      contract_period_index: periodIndex,
      level,
      time: transactionEvent.timestamp,
      proposal_hash: proposalHash,
      transaction_hash: transactionEvent.hash,
      contract_address: transactionEvent.target.address,
      proposer: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
    };

    logger.info(`[TzktListener] New proposal: ${JSON.stringify(proposal)}`);
    await this.database.upsertProposals([proposal]);

    logger.info(`[TzktListener] Registering automatic upvote for proposal ${proposalHash} by proposer ${proposal.proposer}`);
    const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(level, level + 1);
    const voter = await this.governanceContractIndexer.getVotingPowerForAddress(transactionEvent.sender.address, globalVotingIndex);
    const delegates = await this.governanceContractIndexer.getDelegatesForAddress(transactionEvent.sender.address, level);
    let delegateVotingPower = 0;
    for (const delegate of delegates) {
      const voter = await this.governanceContractIndexer.getVotingPowerForAddress(delegate, globalVotingIndex);
      delegateVotingPower += voter?.votingPower ?? 0;
    }
    const upvote: Upvote = {
      level,
      time: transactionEvent.timestamp,
      proposal_hash: proposalHash,
      voting_power: (voter?.votingPower ?? 0) + delegateVotingPower,
      contract_address: transactionEvent.target.address,
      baker: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      transaction_hash: transactionEvent.hash,
      contract_period_index: periodIndex
    };
    logger.info(`[TzktListener] Automatic upvote: ${JSON.stringify(upvote)}`);
    await this.database.upsertUpvotes([upvote]);


    const periodRecord: Period | null = await this.database.getPeriod(transactionEvent.target.address, periodIndex);
    if (!periodRecord) {
      logger.error(`[TzktListener] No period record found for ${transactionEvent.target.address} period ${periodIndex}`);
      return;
    }

    if (!periodRecord.proposal_hashes?.includes(proposalHash)) {
      periodRecord.proposal_hashes?.push(proposalHash);
      await this.database.upsertPeriods([periodRecord]);
      logger.info(`[TzktListener] Updated period ${transactionEvent.target.address}-${periodIndex} with new proposal hash ${proposalHash}`);
    } else {
      logger.info(`[TzktListener] Period ${transactionEvent.target.address}-${periodIndex} already contains proposal hash ${proposalHash}`);
    }
  }

  private async handleUpvoteProposal(transactionEvent: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleUpvoteProposal(contract=${transactionEvent.target.address}, id=${transactionEvent.id})`);
    const contractConfig = this.contractConfigs[transactionEvent.target.address];
    if (!contractConfig) {
      logger.error(`[TzktListener] handleUpvoteProposal—no config for ${transactionEvent.target.address}`);
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      logger.error(`[TzktListener] Upvote at level ${level} is before startedAtLevel ${startedAtLevel}`);
      return;
    }

    const periodIndex = Math.floor(levelDifference / periodLength);
    const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(level, level + 1);
    const voter = await this.governanceContractIndexer.getVotingPowerForAddress(transactionEvent.sender.address, globalVotingIndex);
    const delegates = await this.governanceContractIndexer.getDelegatesForAddress(transactionEvent.sender.address, level);
    let delegateVotingPower = 0;
    for (const delegate of delegates) {
      const voter = await this.governanceContractIndexer.getVotingPowerForAddress(delegate, globalVotingIndex);
      delegateVotingPower += voter?.votingPower ?? 0;
    }

    const upvote: Upvote = {
      level,
      time: transactionEvent.timestamp,
      proposal_hash: transactionEvent.parameter!.value,
      voting_power: (voter?.votingPower ?? 0) + delegateVotingPower,
      contract_address: transactionEvent.target.address,
      baker: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      transaction_hash: transactionEvent.hash,
      contract_period_index: periodIndex
    };

    logger.info(`[TzktListener] upvote_proposal at ${transactionEvent.target.address} level=${level} period=${periodIndex} hash=${upvote.proposal_hash} voting_power=${upvote.voting_power}`);
    logger.info(`[TzktListener] Upvote: ${JSON.stringify(upvote)}`);
    await this.database.upsertUpvotes([upvote]);
  }

  private async handleVote(transactionEvent: TzktTransactionEvent): Promise<void> {
    logger.info(`[TzktListener] handleVote(contract=${transactionEvent.target.address}, id=${transactionEvent.id})`);
    const contractConfig = this.contractConfigs[transactionEvent.target.address];
    if (!contractConfig) {
      logger.error(`[TzktListener] handleVote—no config for ${transactionEvent.target.address}`);
      return;
    }

    const { startedAtLevel, periodLength } = contractConfig;
    const level = transactionEvent.level;
    const levelDifference = level - startedAtLevel;
    if (levelDifference < 0) {
      logger.error(`[TzktListener] Vote at level ${level} is before startedAtLevel ${startedAtLevel}`);
      return;
    }

    const proposalPeriodIndex = Math.floor(levelDifference / periodLength);
    const promotionPeriodIndex = proposalPeriodIndex + 1;

    const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(level, level + 1);
    const voter = await this.governanceContractIndexer.getVotingPowerForAddress(transactionEvent.sender.address, globalVotingIndex);
    const delegates = await this.governanceContractIndexer.getDelegatesForAddress(transactionEvent.sender.address, level);
    let delegateVotingPower = 0;
    for (const delegate of delegates) {
      const voter = await this.governanceContractIndexer.getVotingPowerForAddress(delegate, globalVotingIndex);
      delegateVotingPower += voter?.votingPower ?? 0;
    }

    const winnerCandidate = transactionEvent.storage?.voting_context?.period?.promotion?.winner_candidate;

    const voteRecord: Vote = {
      proposal_hash: winnerCandidate,
      baker: transactionEvent.sender.address,
      alias: transactionEvent.sender.alias,
      contract_address: transactionEvent.target.address,
      voting_power: (voter?.votingPower ?? 0) + delegateVotingPower,
      vote: transactionEvent.parameter!.value,
      time: transactionEvent.timestamp,
      transaction_hash: transactionEvent.hash,
      level
    };

    logger.info(`[TzktListener] vote @${transactionEvent.target.address} lvl=${level} propPeriod=${proposalPeriodIndex} promoPeriod=${promotionPeriodIndex} choice=${voteRecord.vote} vp=${voteRecord.voting_power}`);
    await this.database.upsertVotes([voteRecord]);

    const storageUrl = `${this.governanceContractIndexer.tzkt_api_url}` +
                       `/contracts/${transactionEvent.target.address}/storage?level=${level}`;
    const storageResponse = await fetch(storageUrl);
    if (!storageResponse.ok) throw new Error(`HTTP ${storageResponse.status} fetching ${storageUrl}`);

    const storageData = await storageResponse.json();
    const promotionContext = storageData.voting_context?.period?.promotion;
    if (!promotionContext) {
      throw new Error(`No on‑chain promotion context at lvl=${level} for ${transactionEvent.target.address}`);
    }

    const promotionRecord: Promotion = {
      proposal_hash: promotionContext.winner_candidate,
      contract_period_index: promotionPeriodIndex,
      contract_address: transactionEvent.target.address,
      yea_voting_power: Number(promotionContext.yea_voting_power),
      nay_voting_power: Number(promotionContext.nay_voting_power),
      pass_voting_power: Number(promotionContext.pass_voting_power),
      total_voting_power: Number(promotionContext.total_voting_power)
    };

    logger.info(
      `[TzktListener] promotion at ${transactionEvent.target.address} period=${promotionPeriodIndex} ` +
      `yea=${promotionRecord.yea_voting_power} nay=${promotionRecord.nay_voting_power} ` +
      `pass=${promotionRecord.pass_voting_power} total=${promotionRecord.total_voting_power}`
    );
    await this.database.upsertPromotions([promotionRecord]);
  }

  private async handleBlock(headBlock: { level: number; timestamp: string }): Promise<void> {
    logger.info(`[TzktListener] handleBlock(level=${headBlock.level})`);

    logger.info(`[TzktListener] Checking for new periods at level ${headBlock.level}`);

    for (const contract of this.contracts) {
      logger.info(`[TzktListener] Checking contract ${contract.address} for new period`);
      const contractConfig = this.contractConfigs[contract.address];
      if (!contractConfig) {
        logger.error(`[TzktListener] handleBlock—no config for ${contract.address}`);
        continue;
      }

      const { startedAtLevel, periodLength } = contractConfig;
      const levelDifference = headBlock.level - startedAtLevel;
      if (levelDifference < 0 || levelDifference % periodLength !== 0) {
        logger.info(`[TzktListener] ${periodLength - (levelDifference % periodLength)} blocks until next period for ${contract.address}`);
        continue;
      };

      const periodIndex = levelDifference / periodLength;

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
        total_voting_power: 0
      };
      // TODO check if promotion period

      logger.info(`[TzktListener] New period ${contract.address}-${periodIndex}: ${JSON.stringify(periodRecord)}`);
      await this.database.upsertPeriods([periodRecord]);
    }
  }

  public async stop(): Promise<void> {
    logger.info('[TzktListener] stop()');
    if (this.connection.state === HubConnectionState.Connected) await this.connection.stop();
    logger.info('[TzktListener] Listener stopped');
  }
}