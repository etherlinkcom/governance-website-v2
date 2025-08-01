import { makeAutoObservable, flow, computed } from 'mobx';
import { GovernanceType, Period, ContractAndConfig, Vote, Promotion, Upvote, Proposal } from '@trilitech/types';
import { PeriodData, PeriodDetailsResponse } from '@/types/api';
import { fetchJson } from '@/lib/fetchJson';

class ContractStore {
  currentGovernance: GovernanceType | null = null;
  contractsByGovernance: Partial<Record<GovernanceType, ContractAndConfig[]>> = {};
  periodsByGovernance: Partial<Record<GovernanceType, Record<string, Period[]>>> = {};
  loadingByGovernance: Partial<Record<GovernanceType, boolean>> = {};
  loadingPeriodsByGovernance: Partial<Record<GovernanceType, Record<string, boolean>>> = {};
  periodDetails: Record<string, Record<number, {
    proposals?: Proposal[];
    upvotes?: Upvote[];
    promotions?: Promotion[];
    votes?: Vote[];
    timestamp: number;
  }>> = {};
  error: string | null = null;
  futurePeriodsCount: number = 3;
  periodDetailsLoading: Record<string, Record<number, boolean>> = {};
  periodDetailsErrors: Record<string, Record<number, string | null>> = {};
  readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  constructor() {
    makeAutoObservable(this, {
      setGovernance: flow,
      getPeriods: flow,

      contracts: computed,
      loading: computed,
      allPeriods: computed,
    });
  }

  public setGovernance = flow(function* (this: ContractStore, governanceType: GovernanceType) {
    this.currentGovernance = governanceType;
    this.error = null;

    if (!this.periodsByGovernance[governanceType]) {
      this.periodsByGovernance[governanceType] = {};
    }
    if (!this.loadingPeriodsByGovernance[governanceType]) {
      this.loadingPeriodsByGovernance[governanceType] = {};
    }

    if (!this.contractsByGovernance[governanceType]) {
      yield this.getContracts();
    }
  });

  public getPeriods = flow(function* (this: ContractStore, contractAddress: string) {
    if (!this.currentGovernance) return;

    if (!this.periodsByGovernance[this.currentGovernance]) {
      this.periodsByGovernance[this.currentGovernance] = {};
    }
    if (!this.loadingPeriodsByGovernance[this.currentGovernance]) {
      this.loadingPeriodsByGovernance[this.currentGovernance] = {};
    }

    if (this.loadingPeriodsByGovernance[this.currentGovernance]![contractAddress]) return;

    this.loadingPeriodsByGovernance[this.currentGovernance]![contractAddress] = true;
    this.error = null;

    try {
      const data = yield fetchJson<{ periods: Period[] }>(`/api/contract/${contractAddress}/periods`);
      let allPeriods = data.periods;

      const contract = this.contracts.find(c => c.contract_address === contractAddress);
      if (contract?.active) {
        const latestPeriod = allPeriods.length ? allPeriods[0] : 0;
        const generatedPeriods = yield this.generateCurrentAndFuturePeriods(contractAddress, latestPeriod);

        const generatedIndexes = new Set(generatedPeriods.map((p: Period) => p.contract_voting_index));
        const filteredPeriods = allPeriods.filter((p: Period) => !generatedIndexes.has(p.contract_voting_index));
        allPeriods = [...generatedPeriods, ...filteredPeriods];
      }

      this.periodsByGovernance[this.currentGovernance]![contractAddress] = allPeriods;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error loading periods';
      this.periodsByGovernance[this.currentGovernance]![contractAddress] = [];
    } finally {
      this.loadingPeriodsByGovernance[this.currentGovernance]![contractAddress] = false;
    }
  });

  private getContracts = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;

    this.loadingByGovernance[this.currentGovernance] = true;
    this.error = null;

    try {
      const data = yield fetchJson<{ contracts: ContractAndConfig[] }>(`/api/governance/${this.currentGovernance}/contracts`);
      this.contractsByGovernance[this.currentGovernance] = data.contracts;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      this.contractsByGovernance[this.currentGovernance] = [];
    } finally {
      this.loadingByGovernance[this.currentGovernance] = false;
    }
  });

  private generateCurrentAndFuturePeriods = flow(function* (
    this: ContractStore,
    contractAddress: string,
    latestPeriod?: Period
  ): Generator<any, Period[], any> {
    const contract = this.contracts.find(c => c.contract_address === contractAddress);
    if (!contract || !contract.active) return [];

    try {
      const head = yield fetchJson<{ level: number; timestamp: string }>(`${this.tzktApiUrl}/head`);
      const currentLevel = head.level;

      const periodDurationBlocks = contract.period_length;
      const startLevel = contract.started_at_level;

      const currentPeriodIndex = Math.max(
        1,
        Math.floor((currentLevel - startLevel) / periodDurationBlocks)
      );
      let periods: Period[] = [];

      if (
        latestPeriod &&
        currentLevel >= latestPeriod.level_start &&
        currentLevel <= latestPeriod.level_end
      ) {
        periods.push({...latestPeriod, period_class: 'current'});
      }

    const neededLevels: number[] = [];
    for (let i = 0; i <= this.futurePeriodsCount; i++) {
      const periodIndex = currentPeriodIndex + i;
      const periodLevelStart = startLevel + ((periodIndex) * periodDurationBlocks);
      const periodLevelEnd = periodLevelStart + periodDurationBlocks - 1;
      neededLevels.push(periodLevelStart, periodLevelEnd);
    }

    const uniqueLevels = Array.from(new Set(neededLevels))
    const timestampResults = yield Promise.allSettled(
      uniqueLevels.map(level =>
        fetchJson<string>(`${this.tzktApiUrl}/blocks/${level}/timestamp`)
          .then(timestamp => [level, timestamp] as [number, string])
      )
    );

    const levelToTimestamp = new Map<number, string>();
    for (const result of timestampResults) {
      if (result.status === 'fulfilled') {
        const [level, timestamp] = result.value;
        levelToTimestamp.set(level, timestamp);
      }
    }

    for (let i = periods.length; i <= this.futurePeriodsCount; i++) {
      const periodIndex: number = currentPeriodIndex + i;
      const periodLevelStart: number = startLevel + ((periodIndex) * periodDurationBlocks);
      const periodLevelEnd: number = periodLevelStart + periodDurationBlocks - 1;

      const startDateStr: string = levelToTimestamp.get(periodLevelStart) || '';
      const endDateStr: string = levelToTimestamp.get(periodLevelEnd) || '';

      periods.unshift({
        contract_voting_index: periodIndex,
        contract_address: contractAddress,
        level_start: periodLevelStart,
        level_end: periodLevelEnd,
        date_start: new Date(startDateStr) || 'Error retrieving date',
        date_end: new Date(endDateStr) || 'Error retrieving date',
        proposal_hashes: [],
        promotion_hash: undefined,
        period_class: i === 0 ? 'current' : 'future',
        total_voting_power: 0,
      });
    }

    return periods;

    } catch (error) {
      console.error('Failed to generate periods:', error);
      return [];
    }
  });


  private getPeriodDetails = flow(function* (this: ContractStore, contractAddress: string, periodIndex: number) {
    if (!this.periodDetails[contractAddress]) {
      this.periodDetails[contractAddress] = {};
    }

    const cached = this.periodDetails[contractAddress][periodIndex];
    if (cached && this.isValidCache(cached)) {
      return cached;
    }

    if (this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
      while (this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        yield new Promise(resolve => setTimeout(resolve, 100));
      }
      const newCached = this.periodDetails[contractAddress][periodIndex];
      if (newCached) return newCached;

      const error = this.getPeriodDetailsError(contractAddress, periodIndex);
      if (error) throw new Error(error);
    }

    this.setPeriodDetailsLoading(contractAddress, periodIndex, true);
    this.setPeriodDetailsError(contractAddress, periodIndex, null);

    try {
      const data = yield fetchJson<PeriodDetailsResponse>(`/api/contract/${contractAddress}/${periodIndex}/details`);
      this.periodDetails[contractAddress][periodIndex] = {
        ...data,
        timestamp: Date.now()
      };

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setPeriodDetailsError(contractAddress, periodIndex, errorMessage);
      throw error;
    } finally {
      this.setPeriodDetailsLoading(contractAddress, periodIndex, false);
    }
  });

  get contracts(): ContractAndConfig[] {
    return this.currentGovernance ? this.contractsByGovernance[this.currentGovernance] || [] : [];
  }

  get loading(): boolean {
    return this.currentGovernance ? this.loadingByGovernance[this.currentGovernance] || false : false;
  }

  get allPeriods(): Period[] {
    if (!this.currentGovernance) return [];
    return Object.values(this.periodsByGovernance[this.currentGovernance] || {}).flat();
  }

  get upvotesForPeriod() {
    return (contractAddress: string, periodIndex: number): Upvote[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.upvotes) return cached.upvotes;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get proposalsForPeriod() {
    return (contractAddress: string, periodIndex: number): Proposal[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.proposals) return cached.proposals;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get votesForPeriod() {
    return (contractAddress: string, periodIndex: number): Vote[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.votes) return cached.votes;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get promotionsForPeriod() {
    return (contractAddress: string, periodIndex: number): Promotion[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.promotions) return cached.promotions;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  public periodsForContract(contractAddress: string): Period[] {
    return this.currentGovernance ? this.periodsByGovernance[this.currentGovernance]?.[contractAddress] || [] : [];
  }

  public isLoadingPeriods(contractAddress: string): boolean {
    return this.currentGovernance ? this.loadingPeriodsByGovernance[this.currentGovernance]?.[contractAddress] || false : false;
  }

  public hasPeriodsLoaded(contractAddress: string): boolean {
    if (!this.currentGovernance) return false;
    return contractAddress in (this.periodsByGovernance[this.currentGovernance] || {});
  }

  public isPeriodDetailsLoading(contractAddress: string, periodIndex: number): boolean {
    return this.periodDetailsLoading[contractAddress]?.[periodIndex] || false;
  }

  public getPeriodDetailsError(contractAddress: string, periodIndex: number): string | null {
    return this.periodDetailsErrors[contractAddress]?.[periodIndex] || null;
  }

  public getPeriodData = (
    contractAddress?: string,
    contractVotingIndex?: number,
    hasProposals?: boolean,
    hasPromotions?: boolean
  ): PeriodData => {
    const hasValidParams = !!(contractAddress && contractVotingIndex);

    if (!hasValidParams) {
      return {
        proposals: [],
        promotions: [],
        upvoters: [],
        votes: [],
        isLoading: false,
        error: null,
        hasValidParams: false,
        proposalsPeriod: 0,
        promotionsPeriod: 0,
        proposalsPeriodData: null,
        promotionsPeriodData: null,
        contractAndConfig: undefined
      };
    }

    let proposalsPeriod: number;
    let promotionsPeriod: number;

    if (hasProposals) {
      proposalsPeriod = contractVotingIndex;
      promotionsPeriod = contractVotingIndex + 1;
    } else if (hasPromotions) {
      proposalsPeriod = contractVotingIndex - 1;
      promotionsPeriod = contractVotingIndex;
    } else {
      proposalsPeriod = contractVotingIndex;
      promotionsPeriod = contractVotingIndex;
    }

    const proposals = this.proposalsForPeriod(contractAddress, proposalsPeriod);
    const promotions = this.promotionsForPeriod(contractAddress, promotionsPeriod);
    const upvoters = this.upvotesForPeriod(contractAddress, proposalsPeriod);
    const votes = this.votesForPeriod(contractAddress, promotionsPeriod);

    const contractAndConfig = this.contracts.find(c => c.contract_address === contractAddress);
    const allPeriods = this.periodsForContract(contractAddress);
    const proposalsPeriodData = allPeriods.find(p => p.contract_voting_index === proposalsPeriod) || null;
    const promotionsPeriodData = allPeriods.find(p => p.contract_voting_index === promotionsPeriod) || null;

    const isLoading = this.isPeriodDetailsLoading(contractAddress, proposalsPeriod) ||
                    this.isPeriodDetailsLoading(contractAddress, promotionsPeriod) ||
                    this.isLoadingPeriods(contractAddress);

    const error = this.getPeriodDetailsError(contractAddress, proposalsPeriod) ||
                this.getPeriodDetailsError(contractAddress, promotionsPeriod);

    return {
      proposals,
      promotions,
      upvoters,
      votes,
      isLoading,
      error,
      hasValidParams,
      proposalsPeriod,
      promotionsPeriod,
      proposalsPeriodData,
      promotionsPeriodData,
      contractAndConfig
    };
  };

  private setPeriodDetailsLoading(contractAddress: string, periodIndex: number, loading: boolean) {
    if (!this.periodDetailsLoading[contractAddress]) {
      this.periodDetailsLoading[contractAddress] = {};
    }
    this.periodDetailsLoading[contractAddress][periodIndex] = loading;
  }

  private setPeriodDetailsError(contractAddress: string, periodIndex: number, error: string | null) {
    if (!this.periodDetailsErrors[contractAddress]) {
      this.periodDetailsErrors[contractAddress] = {};
    }
    this.periodDetailsErrors[contractAddress][periodIndex] = error;
  }

  private isValidCache(cached: any): boolean {
    return cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000; // 5 min
  }
}

export const contractStore = new ContractStore();