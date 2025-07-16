export type NetworkType = 'mainnet' | 'testnet';
export type GovernanceType = 'slow' | 'fast' | 'sequencer';
export type VoteOption = 'yea' | 'nay' | 'pass';
// storageHistory = https://api.tzkt.io/v1/contracts/KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK/storage/history?limit=1000
// operations = /v1/operations/transactions/{hash})

export type ContractAndConfig = {
  contract_address: string;
  governance_type: GovernanceType;
  started_at_level: number;
  period_length: number;
  adoption_period_sec: number;
  upvoting_limit: number;
  scale: number;
  proposal_quorum: number;
  promotion_quorum: number;
  promotion_supermajority: number;
  active?: boolean;
}

export type Period = {
  id?: number; // self assigned in SQL
  contract_voting_index: number;
  contract_address: string;
  level_start: number;
  level_end: number;
  date_start: Date;
  date_end: Date;

  // Relations
  proposal_hashes?: string[]; // Calculated
  promotion_hash?: string; // Calculated
};

export type Proposal = {
  id?: number; // self assigned in SQL
  contract_period_index: number; // SH.value.period_index
  level: number;
  time: string;
  proposal_hash: string; // SH.operation.param.value
  transaction_hash: string;
  proposer: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  contract_address: string;
  // Indexes: key, proposer, period_index, governance_type
};

export type Promotion = {
  id?: number; // self assigned in SQL
  proposal_hash: string; // Foreign key to Proposal
  contract_period_index: number;   // Foreign key to Period
  // transaction_hash: string; // SH.operation.hash
  contract_address: string;
  yea_voting_power: number;
  nay_voting_power: number;
  pass_voting_power: number;
  total_voting_power: number;
  // Indexes: proposal_id, period_index, governance_type
};

export type Upvote = {
  id?: number; // self assigned in SQL
  level: number;
  time: string; // ISO date string
  proposal_hash: string; // SH.operation.param.value
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  transaction_hash: string; // SH.operation.hash
  contract_address: string;
  // Indexes: proposal_id, baker
};

export type Vote = {
  id?: number;
  proposal_hash: string; // SH.value.voting_context.period.promotion.winning_candidate
  baker: string; // operations.sender.address
  alias?: string; // operations.sender.alias
  voting_power: number; // Calculated using Adrians function
  vote: VoteOption; // SH.operation.parameter.value
  time: string;
  level: number;
  transaction_hash: string; // SH.operation.hash
  contract_address: string;
  // Indexes: promotion_id, baker
};