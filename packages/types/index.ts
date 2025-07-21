export type NetworkType = 'mainnet' | 'testnet';
export type GovernanceType = 'slow' | 'fast' | 'sequencer';
export type VoteOption = 'yea' | 'nay' | 'pass';

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
  id?: number;
  contract_voting_index: number;
  contract_address: string;
  level_start: number;
  level_end: number;
  date_start: Date;
  date_end: Date;

  proposal_hashes?: string[];
  promotion_hash?: string;

  period_class?: 'current' | 'future';
};

export type Proposal = {
  id?: number;
  contract_period_index: number;
  level: number;
  time: string;
  proposal_hash: string;
  transaction_hash: string;
  proposer: string;
  alias?: string;
  contract_address: string;
  //TODO upvotes
};

export type Promotion = {
  id?: number;
  proposal_hash: string;
  contract_period_index: number;

  contract_address: string;
  yea_voting_power: number;
  nay_voting_power: number;
  pass_voting_power: number;
  total_voting_power: number;
};

export type Upvote = {
  id?: number;
  level: number;
  time: string;
  proposal_hash: string;
  baker: string;
  alias?: string;
  voting_power: number;
  transaction_hash: string;
  contract_address: string;
};

export type Vote = {
  id?: number;
  proposal_hash: string;
  baker: string;
  alias?: string;
  voting_power: number;
  vote: VoteOption;
  time: string;
  level: number;
  transaction_hash: string;
  contract_address: string;
};