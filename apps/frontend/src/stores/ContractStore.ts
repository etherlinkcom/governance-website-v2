import {
  makeAutoObservable,
  flow,
  runInAction,
  action,
  observable,
} from "mobx";
import {
  GovernanceType,
  ContractAndConfig,
  Vote,
  Upvote,
  VoteOption,
  Promotion,
} from "@trilitech/types";
import { FuturePeriod, FrontendPeriod, FrontendProposal } from "@/types/api";
import { fetchJson } from "@/lib/fetchJson";

export type LoadingState = "loading" | "success" | "error" | undefined;

class ContractStore {
  private currentGovernance: GovernanceType | null = null;

  private addressToContract: Partial<Record<string, ContractAndConfig>> = {};
  private activeContracts: Partial<Record<string, ContractAndConfig>> = {};

  private pastPeriods: Partial<Record<GovernanceType, FrontendPeriod[]>> = {};
  private currentPeriod: Partial<Record<GovernanceType, FrontendPeriod>> = {};
  private futurePeriods: Partial<Record<GovernanceType, FuturePeriod[]>> = {};
  private votes: Partial<Record<string, Vote[]>> = {};
  private upvotes: Partial<Record<string, Upvote[]>> = {};

  private loadingStatePastPeriods: Partial<Record<GovernanceType, LoadingState>> = {};
  private loadingStateCurrentPeriod: Partial<Record<GovernanceType, LoadingState>> = {};
  private loadingStateFuturePeriods: Partial<Record<GovernanceType, LoadingState>> = {};
  private loadingStateVotes: Partial<Record<string, LoadingState>> = {};
  private loadingStateUpvotes: Partial<Record<string, LoadingState>> = {};

  private readonly futurePeriodsCount: number = 10;
  private readonly tzktApiUrl: string = "https://api.tzkt.io/v1";

  constructor() {
    makeAutoObservable(this, {
      setGovernance: flow,
    });
    this.getContracts();
  }

  get currentContract(): ContractAndConfig | undefined {
    return this.currentGovernance
      ? this.activeContracts[this.currentGovernance]
      : undefined;
  }

  public getContract(address: string): ContractAndConfig | undefined {
    return this.addressToContract[address];
  }

  get selectedGovernance(): GovernanceType | null {
    return this.currentGovernance;
  }

  get statePastPeriods(): LoadingState {
    return this.currentGovernance ? this.loadingStatePastPeriods[this.currentGovernance] : undefined;
  }

  get stateCurrentPeriod(): LoadingState {
    return this.currentGovernance ? this.loadingStateCurrentPeriod[this.currentGovernance] : undefined;
  }

  get stateFuturePeriods(): LoadingState {
    return this.currentGovernance ? this.loadingStateFuturePeriods[this.currentGovernance] : undefined;
  }

  get pastPeriodsData(): FrontendPeriod[] | undefined {
    return this.currentGovernance ? this.pastPeriods[this.currentGovernance] : undefined;
  }

  get currentPeriodData(): FrontendPeriod | undefined {
    return this.currentGovernance ? this.currentPeriod[this.currentGovernance] : undefined;
  }

  get futurePeriodsData(): FuturePeriod[] | undefined {
    return this.currentGovernance ? this.futurePeriods[this.currentGovernance] : undefined;
  }

  public getVotesForProposal(contractAddress: string, proposalHash: string, contractVotingIndex: number): {
    votes: Vote[];
    loadingState: LoadingState;
  } {
    const key = `${contractAddress} - ${proposalHash} - ${contractVotingIndex}`;

    if (!this.votes[key] && this.loadingStateVotes[key] === "loading") {
      runInAction(() => {
        this.getVotes(contractAddress, proposalHash, contractVotingIndex);
      });
    }

    return {
      votes: this.votes[key] || [],
      loadingState: this.loadingStateVotes[key],
    };
  }

  public getUpvotesForProposal(proposalHash: string, contractVotingIndex: number): {
    upvotes: Upvote[];
    loadingState: LoadingState;
  } {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (!this.upvotes[key] && this.loadingStateUpvotes[key] === "loading") {
      runInAction(() => {
        this.getUpvotes(proposalHash, contractVotingIndex);
      });
    }

    return {
      upvotes: this.upvotes[key] || [],
      loadingState: this.loadingStateUpvotes[key]
    };
  }

  private getPastPeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingStatePastPeriods[this.currentGovernance] === "loading") return;
    if (this.pastPeriods[this.currentGovernance]) return;
    try {
      this.loadingStatePastPeriods[this.currentGovernance] = "loading";

      const pastPeriods: { pastPeriods: FrontendPeriod[] } = yield fetchJson<{pastPeriods: FrontendPeriod[]}>(
        `/api/${this.currentGovernance}/pastPeriods`
      );
      this.pastPeriods[this.currentGovernance] = pastPeriods.pastPeriods;

      this.loadingStatePastPeriods[this.currentGovernance] = "success";
    } catch (error) {
      console.error("[ContractStore] Error fetching past periods:", error);
      this.loadingStatePastPeriods[this.currentGovernance] = "error";
    }
  });

  private getCurrentPeriod = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingStateCurrentPeriod[this.currentGovernance] === "loading") return;
    if (this.currentPeriod[this.currentGovernance]) return;

    this.loadingStateCurrentPeriod[this.currentGovernance] = "loading";
    try {
      const currentPeriod: { currentPeriod: FrontendPeriod } = yield fetchJson<{ currentPeriod: FrontendPeriod }>(
        `/api/${this.currentGovernance}/currentPeriod`
      );

      if (currentPeriod.currentPeriod.proposals) {
        currentPeriod.currentPeriod.proposals = observable.array(
          currentPeriod.currentPeriod.proposals
        );
      } else {
        currentPeriod.currentPeriod.proposals = observable.array([]);
      }

      this.currentPeriod[this.currentGovernance] = currentPeriod.currentPeriod;
      this.loadingStateCurrentPeriod[this.currentGovernance] = "success";
    } catch (error) {
      console.error("[ContractStore] Error fetching current period:", error);
      this.loadingStateCurrentPeriod[this.currentGovernance] = "error";
    }
   });

  private getContracts = flow(function* (this: ContractStore) {
    try {
      const { contracts }: { contracts: ContractAndConfig[] } = yield fetchJson<{ contracts: ContractAndConfig[] }>(`/api/contracts`);
      for (const contract of contracts) {

        if (this.addressToContract[contract.contract_address]) continue;
        if (contract.active) this.activeContracts[contract.governance_type] = contract;
        this.addressToContract[contract.contract_address] = contract;

      }
    } catch (error) {
      console.error("[ContractStore] Error fetching contracts:", error);
    }
  });

  private getFuturePeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingStateFuturePeriods[this.currentGovernance] === "loading") return;

    try {
      const contract: ContractAndConfig | undefined = this.activeContracts[this.currentGovernance];
      if (!contract) return;

      const cachedFuturePeriods: FuturePeriod[] | undefined = this.futurePeriods[this.currentGovernance];
      if (cachedFuturePeriods) return;

      this.loadingStateFuturePeriods[this.currentGovernance] = "loading";

      const tezosBlockTimeInMs: number = 8000;
      const contractStartLevel: number = contract.started_at_level;
      const periodLength: number = contract.period_length;

      const currentLevel: [{ level: number }] = yield fetchJson<[{ level: number }]>(
        `${this.tzktApiUrl}/blocks?limit=1&sort.desc=level`
      );
      const currentTime: number = new Date().getTime();

      const remainder: number =
        (currentLevel[0].level - contractStartLevel) % periodLength;
      const nextPeriodStart: number =
        currentLevel[0].level - remainder + periodLength;

      const futurePeriods: FuturePeriod[] = [];
      for (let i = 0; i < this.futurePeriodsCount; i++) {
        const startLevel: number = nextPeriodStart + i * periodLength;
        const endLevel: number = startLevel + periodLength - 1;

        const startDateTime: Date = new Date(
          currentTime + startLevel * tezosBlockTimeInMs
        );
        const endDateTime: Date = new Date(
          currentTime + endLevel * tezosBlockTimeInMs
        );

        futurePeriods.push({ startLevel, endLevel, startDateTime, endDateTime });
      }

      this.futurePeriods[this.currentGovernance] = futurePeriods;
      this.loadingStateFuturePeriods[this.currentGovernance] = "success";
  } catch (error) {
    console.error("[ContractStore] Error fetching future periods:", error);
    this.loadingStateFuturePeriods[this.currentGovernance] = "error";
  }
});

  public setGovernance = flow(function* (
    this: ContractStore,
    governanceType: GovernanceType
  ) {
    this.currentGovernance = governanceType;

    try {
      yield this.getCurrentPeriod();
      yield this.getPastPeriods();
      yield this.getFuturePeriods();
    } catch (error) {
      console.error("[ContractStore] Error setting governance:", error);
    }
  });

  public getVotes = flow(function* (
    this: ContractStore,
    contractAddress: string,
    proposalHash: string,
    contractVotingIndex: number
  ) {
    const key = `${contractAddress} - ${proposalHash} - ${contractVotingIndex}`;

    if (this.votes[key]) return this.votes[key];

    if (this.loadingStateVotes[key] === "loading") return;

    try {
      this.loadingStateVotes[key] = "loading";

      const response: { votes: Vote[] } = yield fetchJson<{ votes: Vote[] }>(
        `/api/votes?contractAddress=${contractAddress}&proposalHash=${proposalHash}&contractVotingIndex=${contractVotingIndex}`
      );

      this.votes[key] = observable.array(response.votes);
      this.loadingStateVotes[key] = "success";
      return response.votes;
    } catch (error) {
      console.error("[ContractStore] Error fetching votes:", error);
      this.loadingStateVotes[key] = "error";
      return [];
    }
  });

  public getUpvotes = flow(function* (
    this: ContractStore,
    proposalHash: string,
    contractVotingIndex: number
  ) {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (this.upvotes[key]) return this.upvotes[key];

    if (this.loadingStateUpvotes[key] === "loading") return;

    try {
      this.loadingStateUpvotes[key] = "loading";

      const response: { upvotes: Upvote[] } = yield fetchJson<{upvotes: Upvote[];}>(
        `/api/upvotes?proposalHash=${proposalHash}&contractVotingIndex=${contractVotingIndex}`
      );

      this.upvotes[key] = response.upvotes;
      this.loadingStateUpvotes[key] = "success";
      return response.upvotes;
    } catch (error) {
      console.error("[ContractStore] Error fetching votes:", error);
      this.loadingStateUpvotes[key] = "error";
      return [];
    }
  });

  public createProposal = action((
      contract_period_index: number,
      level: number,
      proposal_hash: string,
      transaction_hash: string,
      proposer: string,
      alias: string | undefined,
      contract_address: string,
      upvotes: string
    ): void => {
      const newProposal: FrontendProposal = {
        contract_period_index: contract_period_index,
        level: level,
        time: new Date().toISOString(),
        proposal_hash: proposal_hash,
        transaction_hash: transaction_hash,
        proposer: proposer,
        alias: alias,
        contract_address: contract_address,
        upvotes: upvotes,
      };

      const current: FrontendPeriod | undefined = this.currentPeriod[this.currentGovernance!];
      if (!current) return;

      const proposals = current.proposals || observable.array([]);
      proposals.push(newProposal);

      this.createUpvote(
        level,
        proposal_hash,
        proposer,
        alias,
        upvotes,
        transaction_hash,
        contract_address,
        contract_period_index,
        false
      );
    }
  );

  public createUpvote = action((
      level: number,
      proposal_hash: string,
      baker: string,
      alias: string | undefined,
      voting_power: string,
      transaction_hash: string,
      contract_address: string,
      contract_period_index: number,
      addToProposal: boolean = true
    ): void => {
      const newUpvote: Upvote = {
        level: level,
        time: new Date().toISOString(),
        proposal_hash: proposal_hash,
        baker: baker,
        alias: alias,
        voting_power: parseInt(voting_power),
        transaction_hash: transaction_hash,
        contract_address: contract_address,
        contract_period_index: contract_period_index,
      };

      const key: string = `${proposal_hash} - ${contract_period_index}`;
      let upvotes: Upvote[] | undefined = this.upvotes[key];
      if (!upvotes) upvotes = observable.array([]);

      upvotes.push(newUpvote);
      this.upvotes[key] = upvotes;

      if (!addToProposal) return;

      const proposals: FrontendPeriod | undefined = this.currentPeriod[this.currentGovernance!];
      if (!proposals) return;

      proposals.proposals?.forEach((proposal) => {
        if (proposal.proposal_hash === proposal_hash) {
          proposal.upvotes = (
            BigInt(proposal.upvotes) + BigInt(voting_power)
          ).toString();
        }
      });
    }
  );

  public createVote = action((
      proposal_hash: string,
      baker: string,
      alias: string | undefined,
      voting_power: string,
      vote: VoteOption,
      level: number,
      transaction_hash: string,
      contract_address: string,
      contract_period_index: number
    ): void => {
      const newVote: Vote = {
        proposal_hash: proposal_hash,
        baker: baker,
        alias: alias,
        voting_power: parseInt(voting_power),
        vote: vote,
        time: new Date().toISOString(),
        level: level,
        transaction_hash: transaction_hash,
        contract_address: contract_address,
      };

      const key: string = `${contract_address} - ${proposal_hash} - ${contract_period_index}`;
      let votes: Vote[] | undefined = this.votes[key];
      if (!votes) votes = observable.array([]);

      votes.push(newVote);
      this.votes[key] = votes;

      const promotion: Promotion | undefined = this.currentPeriod[this.currentGovernance!]?.promotion;
      if (promotion && promotion.proposal_hash === proposal_hash) {
        switch (vote) {
          case "yea":
            promotion.yea_voting_power += parseInt(voting_power);
            break;
          case "nay":
            promotion.nay_voting_power += parseInt(voting_power);
            break;
          case "pass":
            promotion.pass_voting_power += parseInt(voting_power);
            break;
        }
        promotion.total_voting_power += parseInt(voting_power);
      }
    }
  );
}

export const contractStore = new ContractStore();