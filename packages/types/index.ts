export type NetworkType = 'mainnet' | 'testnet';
export type GovernanceType = 'slow' | 'fast' | 'sequencer';
export type Period = {
  id: number;
  governance_type: GovernanceType;
  level_start: number;
  level_end: number;
  date_start: Date;
  date_end: Date;
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
  proposals: number[];
  promotions: number[];
};

export type ProposalStatus = 'pending' | 'promoted' | 'rejected';

export type Proposal = {
  id: number;
  key: string; // PayloadKey
  proposer: string; // Address
  period_id: number; // Foreign key to Period
  governance_type: GovernanceType;
  status: ProposalStatus;
  // Indexes: key, proposer, period_id, governance_type
};

export type Promotion = {
  id: number;
  proposal_id: number; // Foreign key to Proposal
  period_id: number;   // Foreign key to Period
  governance_type: GovernanceType;
  // Indexes: proposal_id, period_id, governance_type
};

export type Upvoter = {
  id: number;
  proposal_id: number; // Foreign key to Proposal
  baker: string;
  voting_power: number;
  time: Date;
  // Indexes: proposal_id, baker
};

export type Voter = {
  id: number;
  promotion_id: number; // Foreign key to Promotion
  baker: string;
  voting_power: number;
  vote: 'yea' | 'nay' | 'pass';
  time: Date;
  // Indexes: promotion_id, baker
};