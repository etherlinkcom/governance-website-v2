import { GovernanceType } from "packages/types";

export type Contract = {
    type: GovernanceType;
    address: string;
}
export type SenderAlias = {
    sender: string;
    alias?: string;
}

export type ContractConfig = {
    scale: string;
    period_length: string;
    upvoting_limit: string;
    proposal_quorum: string;
    promotion_quorum: string;
    started_at_level: string;
    adoption_period_sec: string;
    promotion_supermajority: string;
};


export type TzktStorageHistory= {
  id: number;
  level: number;
  timestamp: string; // ISO date string
  operation: {
    type: string; // e.g. "transaction"
    hash: string;
    counter: number;
    parameter: {
      entrypoint: string;
      value: string;
    };
  };
  value: {
    config: ContractConfig,
    metadata: number;
    last_winner: null | {
      payload: string;
      trigger_history: number;
    };
    voting_context: {
      period: {
        // Only one of these will be present depending on entrypoint
        proposal?: {
          proposals: number;
          winner_candidate: string | null;
          total_voting_power: string;
          upvoters_proposals: number;
          upvoters_upvotes_count: number;
          max_upvotes_voting_power: string | null;
        };
        promotion?: {
          voters: number;
          nay_voting_power: string;
          winner_candidate: string;
          yea_voting_power: string;
          pass_voting_power: string;
          total_voting_power: string;
        };
      };
      period_index: string;
    };
  };
};