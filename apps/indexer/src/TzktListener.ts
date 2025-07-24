import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Contract, TzktTransactionEvent, TzktStorageHistory} from './types';
import { Period, Proposal, Upvote, Vote, Promotion } from 'packages/types';
import { Database } from './db/Database';

export class TzktListener {
  private contracts: Contract[];
  private contractConfigs: Record<string, { startedAtLevel: number; periodLength: number }> = {};
  private connection!: HubConnection;
  private seenPeriods = new Set<string>();
  private governanceContractIndexer = new GovernanceContractIndexer();
  private readonly functions = ['new_proposal', 'upvote_proposal', 'vote'];
  private database: Database = new Database();


  constructor(contracts: Contract[]) {
    this.contracts = contracts;
    this.start().catch(err => logger.error('[TzktListener] start error', err));
  }

  private async start(): Promise<void> {
    // 1) Load on‑chain config for each contract
    await this.loadContractConfigs();

    this.connection = new HubConnectionBuilder()
      .withUrl('https://api.tzkt.io/v1/events')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection.on('head', (raw: any) => {
      const block = raw.data ?? raw;
      logger.info(`[TzktListener] New block received: Level ${block.level}`);
      this.handleBlock(block);
    });

    this.connection.on('operations', payload => this.onOperations(payload));

    await this.connection.start();
    logger.info('[TzktListener] SignalR connected');

    await this.connection.invoke('SubscribeToHead');
    logger.info('[TzktListener] Subscribed to head');

    for (const c of this.contracts) {
      await this.connection.invoke('SubscribeToOperations', {
        address: c.address,
        types:   'transaction'
     });
      logger.info(`[TzktListener] Subscribed to operations for ${c.address}`);
    }

  }

  /** Fetch each contract’s started_at_level & period_length */
  private async loadContractConfigs(): Promise<void> {
    const base = this.governanceContractIndexer.tzkt_api_url;
    await Promise.all(this.contracts.map(async c => {
      const resp = await fetch(`${base}/contracts/${c.address}/storage/history?limit=1`);
      const hist = (await resp.json()) as TzktStorageHistory[];
      const cfg = hist[0].value.config;
      this.contractConfigs[c.address] = {
        startedAtLevel: Number(cfg.started_at_level),
        periodLength:   Number(cfg.period_length),
      };
    }));
    logger.info('[TzktListener] Loaded contract configs:', this.contractConfigs);
  }

    private onOperations(payload: any) {
    // debug
    // logger.debug('[TzktListener] raw operations payload:', JSON.stringify(payload).slice(0,500));

    const items = payload.data ?? payload;
    const ops: any[] = Array.isArray(items) ? items : [items];

    for (const op of ops) {
      if (
        !op ||
        typeof op !== 'object' ||
        !op.target?.address ||
        !op.parameter ||
        typeof op.type !== 'string'
      ) {
        logger.debug('[TzktListener] skipping non‑tx payload', op);
        continue;
      }

      this.processOperation(op as TzktTransactionEvent);
    }
  }


    private processOperation(operation: TzktTransactionEvent) {
    logger.info(`[TzktListener] processOperation(${operation.type}, id=${operation.id})`);
    const contract = this.contracts.find(c => c.address === operation.target.address);
    if (!contract) return;

    const entry = operation.parameter!.entrypoint;
    if (this.functions.includes(entry)) {
      this.handleContractFunction(contract, operation, entry);
    }
  }


  private handleContractFunction(
    contract: Contract,
    operation: TzktTransactionEvent,
    fn: string
  ) {
    logger.info(`[TzktListener] handleContractFunction(${contract.address}, id=${operation.id}, fn=${fn})`);
    switch (fn) {
      case 'new_proposal':
        return this.handleNewProposal(operation, contract);
      case 'upvote_proposal':
        return this.handleUpvoteProposal(operation, contract);
      case 'vote':
        return this.handleVote(operation, contract);
      default:
        logger.warn(`[TzktListener] Unknown function: ${fn}`);
    }
  }

  private async handleNewProposal(operation: TzktTransactionEvent, contract: Contract) {
    const cfg = this.contractConfigs[contract.address];
    if (!cfg) return;
    const { startedAtLevel, periodLength } = cfg;
    const level = operation.level;
    const diff  = level - startedAtLevel;
    if (diff < 0) return;

    const periodIndex = Math.floor(diff / periodLength);
    const proposalHash = operation.parameter!.value;

    logger.info(
      `[TzktListener] new_proposal at ${contract.address} ` +
      `level=${level} period=${periodIndex} hash=${proposalHash}`
    );

    const p: Proposal = {
      contract_period_index: periodIndex,
      level,
      time: operation.timestamp,
      proposal_hash: proposalHash,
      transaction_hash: operation.hash,
      contract_address: contract.address,
      proposer: operation.sender.address,
      alias: operation.sender.alias,
      upvotes: 0,
    };
    logger.info(`[TzktListener] New proposal: ${JSON.stringify(p)}`);
    await this.database.upsertProposals([p]);
  }

  private async handleUpvoteProposal(
  operation: TzktTransactionEvent,
  contract: Contract
) {
  const cfg = this.contractConfigs[contract.address];
  if (!cfg) {
    logger.warn(`[TzktListener] Can't handleUpvoteProposal—no config for ${contract.address}`);
    return;
  }

  const { startedAtLevel, periodLength } = cfg;
  const level = operation.level;
  const diff  = level - startedAtLevel;
  if (diff < 0) {
    logger.warn(`[TzktListener] Upvote at level ${level} is before startedAtLevel ${startedAtLevel}`);
    return;
  }

  // local period index
  const periodIndex = Math.floor(diff / periodLength);

  // fetch global voting index & power
  const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(
    level, level + 1
  );
  const votingPower = await this.governanceContractIndexer.getVotingPowerForAddress(
    operation.sender.address, globalVotingIndex
  );
  const delegateVotingPower = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(
    operation.sender.address, level, globalVotingIndex
  );

  const upvote: Upvote = {
    level:           level,
    time:            operation.timestamp,
    proposal_hash:   operation.parameter!.value,
    voting_power:    votingPower + delegateVotingPower,
    contract_address: contract.address,
    baker:           operation.sender.address,
    alias:           operation.sender.alias,
    transaction_hash: operation.hash,
    contract_period_index: periodIndex,
  };

  logger.info(
    `[TzktListener] upvote_proposal at ${contract.address}` +
    ` level=${level} period=${periodIndex}` +
    ` hash=${upvote.proposal_hash} voting_power=${upvote.voting_power}`
  );
  logger.info(`[TzktListener] Upvote: ${JSON.stringify(upvote)}`);
  await this.database.upsertUpvotes([upvote]);
}


private async handleVote(
  operation: TzktTransactionEvent,
  contract: Contract
) {
  const cfg = this.contractConfigs[contract.address];
  if (!cfg) return;
  const { startedAtLevel, periodLength } = cfg;
  const level = operation.level;
  const diff  = level - startedAtLevel;
  if (diff < 0) return;

  // compute periods
  const proposalPeriodIndex  = Math.floor(diff / periodLength);
  const promotionPeriodIndex = proposalPeriodIndex + 1;

  // build & log the vote object
  const globalVotingIndex = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(
    level, level + 1
  );
  const votingPower = await this.governanceContractIndexer.getVotingPowerForAddress(
    operation.sender.address, globalVotingIndex
  );
  const delegateVotingPower = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(
    operation.sender.address, level, globalVotingIndex
  );

  const vote: Vote = {
    proposal_hash:    operation.parameter!.value.proposal_hash,
    baker:            operation.sender.address,
    alias:            operation.sender.alias,
    contract_address: contract.address,
    voting_power:     votingPower + delegateVotingPower,
    vote:             operation.parameter!.value,
    time:             operation.timestamp,
    transaction_hash: operation.hash,
    level,
  };
  logger.info(
    `[TzktListener] ✔ vote @${contract.address}` +
    ` lvl=${level} propPeriod=${proposalPeriodIndex}` +
    ` promoPeriod=${promotionPeriodIndex}` +
    ` choice=${vote.vote} vp=${vote.voting_power}`
  );
  await this.database.upsertVotes([vote]);

  // pull the live promotion context
  const url = `${this.governanceContractIndexer.tzkt_api_url}/contracts/${contract.address}/storage?level=${level}`;
  const storage = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
    return r.json() as Promise<any>;
  });

  const promo = storage.voting_context?.period?.promotion;
  if (!promo) {
    logger.warn(
      `[TzktListener] No on‑chain promotion context at lvl=${level} for ${contract.address}`
    );
    return;
  }

  const promotion: Promotion = {
    proposal_hash:         promo.winner_candidate,
    contract_period_index: promotionPeriodIndex,
    contract_address:      contract.address,
    yea_voting_power:      Number(promo.yea_voting_power),
    nay_voting_power:      Number(promo.nay_voting_power),
    pass_voting_power:     Number(promo.pass_voting_power),
    total_voting_power:    Number(promo.total_voting_power),
  };

  logger.info(
    `[TzktListener] promotion at ${contract.address}` +
    ` period=${promotionPeriodIndex}` +
    ` yea=${promotion.yea_voting_power}` +
    ` nay=${promotion.nay_voting_power}` +
    ` pass=${promotion.pass_voting_power}` +
    ` total=${promotion.total_voting_power}`
  );
  await this.database.upsertPromotions([promotion]);
}

  private async handleBlock(block: { level: number; timestamp: string }) {
    const lvl = block.level;
    for (const c of this.contracts) {
      const cfg = this.contractConfigs[c.address];
      if (!cfg) continue;
      const { startedAtLevel, periodLength } = cfg;
      const diff = lvl - startedAtLevel;
      if (diff < 0 || diff % periodLength !== 0) continue;

      const idx = diff / periodLength;
      const key = `${c.address}-${idx}`;
      if (this.seenPeriods.has(key)) continue;
      this.seenPeriods.add(key);

      const level_start = startedAtLevel + idx * periodLength;
      const level_end   = level_start + periodLength - 1;
      const date_start  = new Date(block.timestamp);
      const date_end    = await this.governanceContractIndexer.getDateFromLevel(level_end);

      const now = lvl;

      const period: Period = {
        contract_voting_index: idx,
        contract_address:      c.address,
        level_start,
        level_end,
        date_start,
        date_end,
        proposal_hashes:           [],              
        promotion_hash:            undefined,       
        max_upvotes_voting_power:  0,               
        total_voting_power:        0,               
        period_class:              now >= level_start && now <= level_end
                              ? 'current'
                              : 'future',
      };
      logger.info(`[TzktListener] New period ${key}: ${JSON.stringify(period)}`);
      await this.database.upsertPeriods([period]);
    }
  }

  public async stop(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected) {
      await this.connection.stop();
    }
    logger.info('[TzktListener] Listener stopped');
  }
}