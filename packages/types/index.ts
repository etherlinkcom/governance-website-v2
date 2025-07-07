export type NetworkType = 'mainnet' | 'testnet';
export type GovernanceType = 'slow' | 'fast' | 'sequencer';

// storageHistory = https://api.tzkt.io/v1/contracts/KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK/storage/history?limit=1000
// operations = /v1/operations/transactions/{hash})

export type Period = {
  id: number;
  governance_type: GovernanceType; // Manual entrance
  level_start: number; // ((currentBlock - contractConfig.level_start) / contractConfig.period_length) - currentBlock
  level_end: number; // level_start + contractConfig.period_length
  date_start: Date; // https://api.tzkt.io/v1/blocks/{level_start}/timestamp
  date_end: Date; // https://api.tzkt.io/v1/blocks/{level_end}/timestamp
  /** Contract Configuration (Could be own table) */
  started_at_level: number;
  period_length: number;
  adoption_period_sec: number;
  upvoting_limit: number;
  proposers_governance_contract?: string;
  scale: number;
  proposal_quorum: number;
  promotion_quorum: number;
  promotion_supermajority: number;

  // Relations
  proposals?: string[]; // Calculated
  promotions?: string; // Calculated
};

export type ProposalStatus = 'pending' | 'promoted' | 'rejected';

export type Proposal = {
  id: number;
  key: string; // SH.operation.param.value
  proposer: string; // operations.sender.address
  period_id: number; // SH.value.period_index
  governance_type: GovernanceType; // ContractConfig.governance_type
  // Indexes: key, proposer, period_id, governance_type
};

/**

promotion_quorum
total_voting_power
max_upvotes_voting_power


max_upvotes_voting_power / total_voting_power > promotion_quorum ?
Check if a proposal.period_id.level_start and level_end
 */
export type Promotion = {
  id: number;
  proposal_id: string; // Foreign key to Proposal
  period_id: number;   // Foreign key to Period
  governance_type: GovernanceType;
  // Indexes: proposal_id, period_id, governance_type
};

export type Upvote = {
  id: number;
  proposal_id: string; // SH.operation.param.value
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  time: Date;
  // Indexes: proposal_id, baker
};

export type Vote = {
  id: number;
  promotion_id: number; // SH.value.voting_context.period.promotion.winning_candidate
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  vote: 'yea' | 'nay' | 'pass'; // SH.operation.parameter.value
  time: Date;
  // Indexes: promotion_id, baker
};