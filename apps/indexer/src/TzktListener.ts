import WebSocket from 'ws';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';
import { logger } from './utils/logger';
import { Promotion, Proposal, Upvote, Vote } from 'packages/types';
import { Contract} from './types'

interface TzktTransactionEvent {
  type: string;
  id: number;
  level: number;
  timestamp: string;
  block: string;
  hash: string;
  counter: number;
  initiator?: {
    alias?: string;
    address: string;
  };
  sender: {
    alias?: string;
    address: string;
  };
  senderCodeHash: number;
  nonce: number;
  gasLimit: number;
  gasUsed: number;
  storageLimit: number;
  storageUsed: number;
  bakerFee: number;
  storageFee: number;
  allocationFee: number;
  target: {
    alias?: string;
    address: string;
  };
  targetCodeHash: number;
  amount: number;
  parameter?: {
    entrypoint: string;
    value: any;
  };
  storage?: any;
  diffs?: {
    bigmap: number;
    path: string;
    action: string;
    content: {
      hash: string;
      key: any;
      value: any;
    };
  }[];
  status: string;
  errors?: {
    type: string;
  }[];
  hasInternals: boolean;
  tokenTransfersCount: number;
  ticketTransfersCount: number;
  eventsCount: number;
  quote?: {
    btc: number;
    eur: number;
    usd: number;
    cny: number;
    jpy: number;
    krw: number;
    eth: number;
    gbp: number;
  };
}

export class TzktListener {
  private ws: WebSocket;
  private contracts: Contract[];
  private reconnectInterval: number = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private functions: string[] = [
    'new_proposal',
    'upvote_proposal',
    'vote',
    'trigger_kernel_upgrade'
  ];
  private governanceContractIndexer: GovernanceContractIndexer;

  constructor(contracts: Contract[]) {
    this.contracts = contracts;
    this.governanceContractIndexer = new GovernanceContractIndexer();
    this.ws = new WebSocket('wss://api.tzkt.io/v1/ws');
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.on('open', () => {
      logger.info('🔗 Connected to TzKT WebSocket');
      this.subscribeToContracts();
      this.startHeartbeat();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        logger.error('❌ Error parsing message:', error);
      }
    });

    this.ws.on('close', (code, reason) => {
      logger.info(`🔌 WebSocket closed: ${code} - ${reason}`);
      this.cleanup();
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      logger.error('❌ WebSocket error:', error);
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

      logger.info(`📡 Subscribing to contract: ${contract.address}`);
      this.ws.send(JSON.stringify(subscription));
    });
  }

  private handleMessage(message: any) {
    if (message.type === 'operation') {
      const operation: TzktTransactionEvent = message.data;
      this.processOperation(operation);
    } else if (message.type === 'subscribed') {
      logger.info(`✅ Subscription confirmed: ${message.channel}`);
    } else if (message.type === 'heartbeat') {
      logger.info('💓 Heartbeat received');
    }
  }

  private processOperation(operation: TzktTransactionEvent) {
    // Find which contract this operation belongs to
    const contract = this.contracts.find(c => c.address === operation.target.address);

    if (!contract) return;

    const entrypoint = operation.parameter?.entrypoint;

    if (entrypoint && this.functions.includes(entrypoint)) {
      this.handleContractFunction(contract, operation, entrypoint);
    }
  }

  private handleContractFunction(contract: Contract, operation: TzktTransactionEvent, functionName: string) {
    logger.info('\n🎯 Contract Function Called!');
    logger.info('==========================================');
    logger.info(`📋 Contract: ${contract.address}`);
    logger.info(`🔧 Function: ${functionName}`);
    logger.info(`👤 Sender: ${operation.sender.address}`);
    logger.info(`⏰ Timestamp: ${operation.timestamp}`);
    logger.info(`🏗️  Block Level: ${operation.level}`);
    logger.info(`📦 Transaction Hash: ${operation.hash}`);
    logger.info(`💰 Amount: ${operation.amount / 1000000} tz`);
    logger.info(`✅ Status: ${operation.status}`);

    if (operation.parameter?.value) {
      logger.info(`📝 Parameters:`, JSON.stringify(operation.parameter.value, null, 2));
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
      case 'trigger_kernel_upgrade':
        this.handleTriggerKernelUpgrade(operation, contract);
        break;
      default:
        logger.info(`🔍 Unknown function: ${functionName}`);
    }

    logger.info('==========================================\n');
  }

  private async handleNewProposal(operation: TzktTransactionEvent, contract: Contract): Promise<Proposal> {
    logger.info('🆕 NEW PROPOSAL DETECTED!');
    const period_index = 1; // TODO: Get the current period index from GovernanceContractIndexer or calculate it based on operation.level
    const proposal: Proposal = {
        contract_period_index: period_index,
        level: operation.level,
        time: operation.timestamp,
        proposal_hash: operation.parameter?.value,
        transaction_hash: operation.hash,
        governance_type: contract.type,
        proposer: operation.sender.address,
        alias: operation.sender.alias,
    }
    return proposal;
    // TODO save in db
  }

  private async handleUpvoteProposal(operation: TzktTransactionEvent, contract: Contract): Promise<Upvote> {
    logger.info('👍 PROPOSAL UPVOTE DETECTED!');
    const global_voting_index = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(operation.level, operation.level + 1);
    const voting_power = await this.governanceContractIndexer.getVotingPowerForAddress(operation.sender.address, global_voting_index);
    const delegate_voting_power = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(operation.sender.address, operation.level, global_voting_index);
    const upvote: Upvote = {
      level: operation.level,
      time: operation.timestamp,
      proposal_hash: operation.parameter?.value,
      voting_power: voting_power + delegate_voting_power,
      baker: operation.sender.address,
      alias: operation.sender.alias,
      transaction_hash: operation.hash,
    }
    return upvote;
  }

  private async handleVote(operation: TzktTransactionEvent, contract: Contract): Promise<Vote> {
    logger.info('🗳️  VOTE DETECTED!');
    const global_voting_index = await this.governanceContractIndexer.getGlobalVotingPeriodIndex(operation.level, operation.level + 1);
    const voting_power = await this.governanceContractIndexer.getVotingPowerForAddress(operation.sender.address, global_voting_index);
    const delegate_voting_power = await this.governanceContractIndexer.getDelegateVotingPowerForAddress(operation.sender.address, operation.level, global_voting_index);
    const vote: Vote = {
      proposal_hash: operation.parameter?.value.proposal_hash,
      baker: operation.sender.address,
      alias: operation.sender.alias,
      voting_power: voting_power + delegate_voting_power,
      vote: operation.parameter?.value, // Assuming vote is a string like 'YEA', 'NAY', etc.
      time: operation.timestamp,
      transaction_hash: operation.hash,
      level: operation.level,
    }
    return vote;
  }

  private async handleTriggerKernelUpgrade(operation: TzktTransactionEvent, contract: Contract): Promise<Promotion> {
    logger.info('🔄 TRIGGER KERNEL UPGRADE DETECTED!');
    const contract_period_index = 1; // TODO
    const promotion: Promotion = {
      proposal_hash: operation.parameter?.value.proposal_hash,
      contract_period_index: contract_period_index,
      governance_type: contract.type,
      transaction_hash: operation.hash,
      level: operation.level,
      time: operation.timestamp,
    }
    return promotion;
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
      logger.info('🔄 Attempting to reconnect...');
      this.ws = new WebSocket('wss://api.tzkt.io/v1/ws');
      this.setupWebSocket();
    }, this.reconnectInterval);
  }

  public stop() {
    this.cleanup();
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    logger.info('🛑 Listener stopped');
  }
}
