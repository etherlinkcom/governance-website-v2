export type NetworkType = 'mainnet' | 'testnet';
export type GovernanceType = 'slow' | 'fast' | 'sequencer';
export type VoteOption = 'yea' | 'nay' | 'pass';
// storageHistory = https://api.tzkt.io/v1/contracts/KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK/storage/history?limit=1000
// operations = /v1/operations/transactions/{hash})

export type Contract = {
  constract_address: string;
  governance_type: GovernanceType;
  started_at_level: number;
  period_length: number;
  adoption_period_sec: number;
  upvoting_limit: number;
  proposers_governance_contract?: string;
  scale: number;
  proposal_quorum: number;
  promotion_quorum: number;
  promotion_supermajority: number;
}

export type Period = {
  id?: number; // self assigned in SQL
  contract_voting_index: number;
  governance_type: GovernanceType;
  contract_address: string;
  level_start: number;
  level_end: number;
  date_start: Date;
  date_end: Date;

  // Relations
  proposal_keys?: string[]; // Calculated
  promotion_key?: string; // Calculated
};

export type Proposal = {
  id?: number; // self assigned in SQL
  contract_period_index: number; // SH.value.period_index
  level: number;
  time: string;
  key: string; // SH.operation.param.value
  transaction_hash: string;
  proposer: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  governance_type: GovernanceType; // ContractConfig.governance_type
  // Indexes: key, proposer, period_index, governance_type
};

export type Promotion = {
  id?: number; // self assigned in SQL
  proposal_key: string; // Foreign key to Proposal
  contract_period_index: number;   // Foreign key to Period
  governance_type: GovernanceType;
  transaction_hash: string; // SH.operation.hash
  level: number; // SH.operation.level
  time: string; // ISO date string
  // Indexes: proposal_id, period_index, governance_type
};

export type Upvote = {
  id?: number; // self assigned in SQL
  level: number;
  time: string; // ISO date string
  proposal_key: string; // SH.operation.param.value
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  transaction_hash: string; // SH.operation.hash
  // Indexes: proposal_id, baker
};

export type Vote = {
  id: number;
  proposal_key: string; // SH.value.voting_context.period.promotion.winning_candidate
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  vote: VoteOption; // SH.operation.parameter.value
  time: string;
  level: number;
  transaction_hash: string; // SH.operation.hash
  // Indexes: promotion_id, baker
};