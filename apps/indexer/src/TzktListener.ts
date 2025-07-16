import WebSocket from 'ws';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Promotion, Proposal, Upvote, Vote } from 'packages/types';
import { Contract, TzktTransactionEvent} from './types'
import { Database } from './db/Database';

export class TzktListener {
  private contracts: Contract[];
  private readonly websocketUrl: string = 'wss://api.tzkt.io/v1/ws';
  private ws = new WebSocket(this.websocketUrl);
  private reconnectInterval: number = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private functions: string[] = [
    'new_proposal',
    'upvote_proposal',
    'vote',
  ];
  private governanceContractIndexer = new GovernanceContractIndexer();
  private database: Database = new Database();

  constructor(contracts: Contract[]) {
    this.contracts = contracts;
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.on('open', () => {
      logger.info(`[TzktListener] setupWebSocket()`);
      this.subscribeToContracts();
      this.startHeartbeat();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        logger.error(`[TzktListener] Error parsing message: ${error}`);
      }
    });

    this.ws.on('close', (code, reason) => {
      logger.info(`[TzktListener] WebSocket closed: ${code} - ${reason}`);
      this.cleanup();
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      logger.error(`[TzktListener] WebSocket error: ${error}`);
      this.cleanup();
      this.scheduleReconnect();
    });
  }

  private subscribeToContracts() {
    // Subscribe to all contract operations
    this.contracts.forEach(contract => {
      const subscription = {
        type: 'subscribe',
        channel: 'operations',
        filter: {
          target: contract.address,
          type: 'transaction',
          status: 'applied'
        }
      };

      logger.info(`[TzktListener] Subscribing to contract: ${contract.address}`);
      this.ws.send(JSON.stringify(subscription));
    });
  }

  private handleMessage(message: any) {
    logger.info(`[TzktListener] handleMessage(${JSON.stringify(message)})`);
    if (message.type === 'operation') {
      const operation: TzktTransactionEvent = message.data;
      this.processOperation(operation);
    } else if (message.type === 'subscribed') {
      logger.info(`[TzktListener] Subscription confirmed: ${message.channel}`);
    } else if (message.type === 'heartbeat') {
      logger.info(`[TzktListener] Heartbeat received`);
    }
  }

  private processOperation(operation: TzktTransactionEvent) {
    logger.info(`[TzktListener] processOperation(${operation.type}, ${operation.id})`);
    const contract = this.contracts.find(c => c.address === operation.target.address);

    if (!contract) return;

    const entrypoint = operation.parameter?.entrypoint;

    if (entrypoint && this.functions.includes(entrypoint)) {
      this.handleContractFunction(contract, operation, entrypoint);
    }
  }

  private handleContractFunction(contract: Contract, operation: TzktTransactionEvent, functionName: string) {
    logger.info(`[TzktListener] handleContractFunction(${contract.address}, ${operation.id}, ${functionName})`);

    if (operation.parameter?.value) {
      logger.info(`[TzktListener] Parameters:`, JSON.stringify(operation.parameter.value, null, 2));
    }

    switch (functionName) {
      case 'new_proposal':
        this.handleNewProposal(operation, contract);
        break;
      case 'upvote_proposal':
        this.handleUpvoteProposal(operation, contract);
        break;
      case 'vote':
        this.handleVote(operation, contract);
        break;
      default:
        logger.info(`[TzktListener] Unknown function: ${functionName}`);
    }

    logger.info(`[TzktListener] End of handleContractFunction(${contract.address}, ${operation.id}, ${functionName})`);
  }

  private async handleNewProposal(operation: TzktTransactionEvent, contract: Contract): Promise<void> {
    logger.info(`[TzktListener] handleNewProposal(${operation.id}, ${contract})`);
    const period_index = 1; // TODO: Get the current period index from GovernanceContractIndexer or calculate it based on operation.level
    const proposal: Proposal = {
        contract_period_index: period_index,
        level: operation.level,
        time: operation.timestamp,
        proposal_hash: operation.parameter?.value,
        transaction_hash: operation.hash,
        contract_address: contract.address,
        proposer: operation.sender.address,
        alias: operation.sender.alias,
    }
    await this.database.upsertProposals([proposal]);
  }

  private async handleUpvoteProposal(operation: TzktTransactionEvent, contract: Contract): Promise<void> {
    logger.info(`[TzktListener] handleUpvoteProposal(${operation.id}, ${contract})`);
    const global_voting_index = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(operation.level, operation.level + 1);
    const voting_power = await this.governanceContractIndexer.getVotingPowerForAddress(operation.sender.address, global_voting_index);
    const delegate_voting_power = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(operation.sender.address, operation.level, global_voting_index);
    const upvote: Upvote = {
      level: operation.level,
      time: operation.timestamp,
      proposal_hash: operation.parameter?.value,
      voting_power: voting_power + delegate_voting_power,
      contract_address: contract.address,
      baker: operation.sender.address,
      alias: operation.sender.alias,
      transaction_hash: operation.hash,
    }
    await this.database.upsertUpvotes([upvote]);
  }

  private async handleVote(operation: TzktTransactionEvent, contract: Contract): Promise<void> {
    logger.info(`[TzktListener] handleVote(${operation.id}, ${contract})`);
    const global_voting_index = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(operation.level, operation.level + 1);
    const voting_power = await this.governanceContractIndexer.getVotingPowerForAddress(operation.sender.address, global_voting_index);
    const delegate_voting_power = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(operation.sender.address, operation.level, global_voting_index);
    const vote: Vote = {
      proposal_hash: operation.parameter?.value.proposal_hash,
      baker: operation.sender.address,
      alias: operation.sender.alias,
      contract_address: contract.address,
      voting_power: voting_power + delegate_voting_power,
      vote: operation.parameter?.value,
      time: operation.timestamp,
      transaction_hash: operation.hash,
      level: operation.level,
    }
    await this.database.upsertVotes([vote]);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect() {
    this.reconnectTimeout = setTimeout(() => {
      logger.info(`[TzktListener] scheduleReconnect()`);
      this.ws = new WebSocket(this.websocketUrl);
      this.setupWebSocket();
    }, this.reconnectInterval);
  }

  public stop() {
    this.cleanup();
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    logger.info(`[TzktListener] Listener stopped`);
  }
}
