import { makeAutoObservable, flow, runInAction } from 'mobx';
import { GovernanceType, ContractAndConfig, Vote, Upvote } from '@trilitech/types';
import { FuturePeriod, FrontendPeriod } from '@/types/api';
import { fetchJson } from '@/lib/fetchJson';

class ContractStore {
  private currentGovernance: GovernanceType | null = null;

  private addressToContract: Partial<Record<string, ContractAndConfig>> = {};
  private activeContracts: Partial<Record<string, ContractAndConfig>> = {};

  // TODO make strings so we only need one cache?
  private pastPeriods: Partial<Record<GovernanceType,  FrontendPeriod[]>> = {};
  private currentPeriod: Partial<Record<GovernanceType, FrontendPeriod>> = {};
  private futurePeriods: Partial<Record<GovernanceType, FuturePeriod[]>> = {};
  private votes: Partial<Record<string, Vote[]>> = {};
  private upvotes: Partial<Record<string, Upvote[]>> = {};

  // Loading states TODO one loading state with string keys?
  private loadingPastPeriods: Partial<Record<GovernanceType, boolean>> = {};
  private loadingCurrentPeriod: Partial<Record<GovernanceType, boolean>> = {};
  private loadingFuturePeriods: Partial<Record<GovernanceType, boolean>> = {};
  private loadingVotes: Partial<Record<string, boolean>> = {};
  private loadingUpvotes: Partial<Record<string, boolean>> = {};

  private error: string | null = null;

  private readonly futurePeriodsCount: number = 10;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

    constructor() {
    makeAutoObservable(this, {
      setGovernance: flow,
    });
    this.getContracts();
  }

  get currentError(): string | null {
    return this.error;
  }

  get currentContract(): ContractAndConfig | undefined {
    return this.currentGovernance ? this.activeContracts[this.currentGovernance] : undefined;
  }

  public getContract(address: string): ContractAndConfig | undefined {
    return this.addressToContract[address];
  }

  get selectedGovernance(): GovernanceType | null {
    return this.currentGovernance;
  }

  get isLoadingPastPeriods(): boolean {
    return this.currentGovernance ? this.loadingPastPeriods[this.currentGovernance] || false : false;
  }

  get isLoadingCurrentPeriod(): boolean {
    return this.currentGovernance ? this.loadingCurrentPeriod[this.currentGovernance] || false : false;
  }

  get isLoadingFuturePeriods(): boolean {
    return this.currentGovernance ? this.loadingFuturePeriods[this.currentGovernance] || false : false;
  }

  get pastPeriodsData(): FrontendPeriod[] | undefined {
    return this.currentGovernance ? this.pastPeriods[this.currentGovernance] : undefined;
  }

  get currentPeriodData(): FrontendPeriod | undefined {
    return this.currentGovernance ? this.currentPeriod[this.currentGovernance] : undefined;
  }

  get futurePeriodsData(): FuturePeriod[] | undefined {
    console.log(this.currentGovernance, this.futurePeriods)
    return this.currentGovernance ? this.futurePeriods[this.currentGovernance] : undefined;
  }

  public getVotesForProposal(proposalHash: string, contractVotingIndex: number): {
    votes: Vote[];
    isLoading: boolean;
  } {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (!this.votes[key] && !this.loadingVotes[key]) {
      runInAction(() => {
        this.getVotes(proposalHash, contractVotingIndex);
      });
    }

    return {
      votes: this.votes[key] || [],
      isLoading: this.loadingVotes[key] || false
    };
  }

  public getUpvotesForProposal(proposalHash: string, contractVotingIndex: number): {
    upvotes: Upvote[];
    isLoading: boolean;
  } {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (!this.upvotes[key] && !this.loadingUpvotes[key]) {
      runInAction(() => {
        this.getUpvotes(proposalHash, contractVotingIndex);
      });
    }

    return {
      upvotes: this.upvotes[key] || [],
      isLoading: this.loadingUpvotes[key] || false
    };
  }


  private getPastPeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingPastPeriods[this.currentGovernance]) return;
    if (this.pastPeriods[this.currentGovernance]) return;
    try {
      this.loadingPastPeriods[this.currentGovernance] = true;
      const pastPeriods: {pastPeriods: FrontendPeriod[]} = yield fetchJson<{ pastPeriods: FrontendPeriod[] }>(
        `/api/${this.currentGovernance}/pastPeriods`
      );
      this.pastPeriods[this.currentGovernance] = pastPeriods.pastPeriods;
    } catch (error) {
      console.error('[ContractStore] Error fetching past periods:', error);
      this.error = 'Failed to fetch past periods';
    } finally {
      this.loadingPastPeriods[this.currentGovernance] = false;
    }
  })


  private getCurrentPeriod = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingCurrentPeriod[this.currentGovernance]) return;
    if (this.currentPeriod[this.currentGovernance]) return;

    this.loadingCurrentPeriod[this.currentGovernance] = true;
    try {
      const currentPeriod: {currentPeriod: FrontendPeriod} = yield fetchJson<{ currentPeriod: FrontendPeriod }>(
        `/api/${this.currentGovernance}/currentPeriod`
      );
      this.currentPeriod[this.currentGovernance] = currentPeriod.currentPeriod;
    } catch (error) {
      console.error('[ContractStore] Error fetching current period:', error);
      this.error = 'Failed to fetch current period';
    } finally {
      this.loadingCurrentPeriod[this.currentGovernance] = false;
    }
  })



  private getContracts = flow(function* (this: ContractStore) {
    try {
      const {contracts}: { contracts: ContractAndConfig[] } = yield fetchJson<{ contracts: ContractAndConfig[] }>(
        `/api/contracts`
      );
      for (const contract of contracts) {
        if (this.addressToContract[contract.contract_address]) continue;
        if (contract.active) this.activeContracts[contract.governance_type] = contract;
        this.addressToContract[contract.contract_address] = contract;
      }
    } catch (error) {
      console.error('[ContractStore] Error fetching contracts:', error);
      this.error = 'Failed to fetch contracts';
    }
  })


  private getFuturePeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingFuturePeriods[this.currentGovernance]) return;
    const contract: ContractAndConfig | undefined = this.activeContracts[this.currentGovernance];
    if (!contract) return;

    const cachedFuturePeriods: FuturePeriod[] | undefined = this.futurePeriods[this.currentGovernance];
    if (cachedFuturePeriods) return;

    this.loadingFuturePeriods[this.currentGovernance] = true;

    const tezosBlockTimeInMs: number = 8000;
    const contractStartLevel: number = contract.started_at_level;
    const periodLength: number = contract.period_length;

    // TODO make this in constructor as we dont need it every time
    const currentLevel: [{level: number}] = yield fetchJson<[{ level: number }]>(
      `${this.tzktApiUrl}/blocks?limit=1&sort.desc=level`
    );
    const currentTime: number = (new Date()).getTime();

    const remainder: number = (currentLevel[0].level - contractStartLevel) % periodLength
    const nextPeriodStart: number = currentLevel[0].level - remainder + periodLength;

    const futurePeriods: FuturePeriod[] = [];
    for (let i = 0; i < this.futurePeriodsCount; i++) {
      const startLevel: number = nextPeriodStart + (i * periodLength);
      const endLevel: number = startLevel + periodLength - 1;

      const startDateTime: Date = new Date(currentTime + (startLevel * tezosBlockTimeInMs));
      const endDateTime: Date = new Date(currentTime + (endLevel * tezosBlockTimeInMs));

      futurePeriods.push({ startLevel, endLevel, startDateTime, endDateTime });
    }

    this.futurePeriods[this.currentGovernance] = futurePeriods;
    this.loadingFuturePeriods[this.currentGovernance] = false;
  })


  public setGovernance = flow(function* (this: ContractStore, governanceType: GovernanceType) {
    this.currentGovernance = governanceType;
    this.error = null;

    try {
      yield this.getCurrentPeriod();
      yield this.getPastPeriods();
      yield this.getFuturePeriods();
    } catch (error) {
      console.error('[ContractStore] Error setting governance:', error);
      this.error = 'Failed to set governance';
    }
  });

  public getVotes = flow(function* (this: ContractStore, proposalHash: string, contractVotingIndex: number) {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (this.votes[key]) return this.votes[key];

    if (this.loadingVotes[key]) return;

    try {
      this.loadingVotes[key] = true;

      const response: { votes: Vote[] } = yield fetchJson<{ votes: Vote[] }>(
        `/api/votes?proposalHash=${proposalHash}&contractVotingIndex=${contractVotingIndex}`
      );

      this.votes[key] = response.votes;
      return response.votes;
    } catch (error) {
      console.error('[ContractStore] Error fetching votes:', error);
      this.error = 'Failed to fetch votes';
      return [];
    } finally {
      this.loadingVotes[key] = false;
    }
  });

  public getUpvotes = flow(function* (this: ContractStore, proposalHash: string, contractVotingIndex: number) {
    const key = `${proposalHash} - ${contractVotingIndex}`;

    if (this.upvotes[key]) return this.upvotes[key];

    if (this.loadingUpvotes[key]) return;

    try {
      this.loadingUpvotes[key] = true;

      const response: { upvotes: Upvote[] } = yield fetchJson<{ upvotes: Upvote[] }>(
        `/api/upvotes?proposalHash=${proposalHash}&contractVotingIndex=${contractVotingIndex}`
      );

      this.upvotes[key] = response.upvotes;
      return response.upvotes;
    } catch (error) {
      console.error('[ContractStore] Error fetching votes:', error);
      this.error = 'Failed to fetch votes';
      return [];
    } finally {
      this.loadingUpvotes[key] = false;
    }
  });
}

export const contractStore = new ContractStore();