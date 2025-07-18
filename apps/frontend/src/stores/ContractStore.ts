import { makeAutoObservable, flow, computed } from 'mobx';
import { GovernanceType, Period, ContractAndConfig, Vote, Promotion, Upvote, Proposal } from '@trilitech/types';
import { PeriodDetailsResponse } from '@/types/api';

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
  blockTimeMs: number = 6000;
  futurePeriodsCount: number = 3;
  periodDetailsLoading: Record<string, Record<number, boolean>> = {};
  periodDetailsErrors: Record<string, Record<number, string | null>> = {};

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

  private getContracts = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;

    this.loadingByGovernance[this.currentGovernance] = true;
    this.error = null;

    try {
      const response = yield fetch(`/api/governance/${this.currentGovernance}/contracts`);

      if (!response.ok) {
        const errorData = yield response.json();
        throw new Error(errorData.error || 'Failed to fetch contracts');
      }

      const data = yield response.json();
      this.contractsByGovernance[this.currentGovernance] = data.contracts;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      this.contractsByGovernance[this.currentGovernance] = [];
    } finally {
      this.loadingByGovernance[this.currentGovernance] = false;
    }
  });

  private generateCurrentAndFuturePeriods = flow(function* (this: ContractStore, contractAddress: string): Generator<any, Period[], any> {
    const contract = this.contracts.find(c => c.contract_address === contractAddress);
    if (!contract || !contract.active) return [];

    try {
      const tzktResponse = yield fetch('https://api.tzkt.io/v1/head');
      const head = yield tzktResponse.json();
      const currentLevel = head.level;
      const currentDate = new Date(head.timestamp);

      const periodDurationBlocks = contract.period_length;
      const startLevel = contract.started_at_level;

      const blocksFromStart = currentLevel - startLevel;
      const currentPeriodIndex = Math.max(1, Math.floor(blocksFromStart / periodDurationBlocks) + 1);

      const periods: Period[] = [];

      for (let i = 0; i <= this.futurePeriodsCount; i++) {
        const periodIndex = currentPeriodIndex + i;
        const periodLevelStart = startLevel + ((periodIndex - 1) * periodDurationBlocks);
        const periodLevelEnd = periodLevelStart + periodDurationBlocks - 1;

        const blocksFromCurrentToStart = periodLevelStart - currentLevel;
        const blocksFromCurrentToEnd = periodLevelEnd - currentLevel;

        const startDate = new Date(currentDate.getTime() + (blocksFromCurrentToStart * this.blockTimeMs));
        const endDate = new Date(currentDate.getTime() + (blocksFromCurrentToEnd * this.blockTimeMs));

        periods.push({
          contract_voting_index: periodIndex,
          contract_address: contractAddress,
          level_start: periodLevelStart,
          level_end: periodLevelEnd,
          date_start: startDate,
          date_end: endDate,
          proposal_hashes: [],
          promotion_hash: undefined,
          period_class: i === 0 ? 'current' : 'future'
        });
      }

      return periods;

    } catch (error) {
      console.error('Failed to generate periods:', error);
      return [];
    }
  });

  getPeriods = flow(function* (this: ContractStore, contractAddress: string) {
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
      const response = yield fetch(`/api/contract/${contractAddress}/periods`);

      if (!response.ok) {
        const errorData = yield response.json();
        throw new Error(errorData.error || 'Failed to fetch periods');
      }

      const data = yield response.json();
      let allPeriods = data.periods;

      // Add current and future periods for active contracts
      const contract = this.contracts.find(c => c.contract_address === contractAddress);
      if (contract?.active) {
        const generatedPeriods = yield this.generateCurrentAndFuturePeriods(contractAddress);

        // Merge with existing periods, avoiding duplicates
        const existingIndexes = new Set(allPeriods.map((p: Period) => p.contract_voting_index));
        const newPeriods = generatedPeriods.filter((p: Period) => !existingIndexes.has(p.contract_voting_index));

        allPeriods = [...allPeriods, ...newPeriods].sort((a, b) => b.contract_voting_index - a.contract_voting_index);
      }

      this.periodsByGovernance[this.currentGovernance]![contractAddress] = allPeriods;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error loading periods';
      this.periodsByGovernance[this.currentGovernance]![contractAddress] = [];
    } finally {
      this.loadingPeriodsByGovernance[this.currentGovernance]![contractAddress] = false;
    }
  });

  get contracts(): ContractAndConfig[] {
    return this.currentGovernance ? this.contractsByGovernance[this.currentGovernance] || [] : [];
  }

  get loading(): boolean {
    return this.currentGovernance ? this.loadingByGovernance[this.currentGovernance] || false : false;
  }

  public getPeriodsForContract(contractAddress: string): Period[] {
    return this.currentGovernance ? this.periodsByGovernance[this.currentGovernance]?.[contractAddress] || [] : [];
  }

  public isLoadingPeriods(contractAddress: string): boolean {
    return this.currentGovernance ? this.loadingPeriodsByGovernance[this.currentGovernance]?.[contractAddress] || false : false;
  }

  public hasPeriodsLoaded(contractAddress: string): boolean {
    if (!this.currentGovernance) return false;
    return contractAddress in (this.periodsByGovernance[this.currentGovernance] || {});
  }

  get allPeriods(): Period[] {
    if (!this.currentGovernance) return [];
    return Object.values(this.periodsByGovernance[this.currentGovernance] || {}).flat();
  }

  get getUpvotesForPeriod() {
    return (contractAddress: string, periodIndex: number): Upvote[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.upvotes) return cached.upvotes;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get getProposalsForPeriod() {
    return (contractAddress: string, periodIndex: number): Proposal[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.proposals) return cached.proposals;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get getVotesForPeriod() {
    return (contractAddress: string, periodIndex: number): Vote[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.votes) return cached.votes;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  get getPromotionsForPeriod() {
    return (contractAddress: string, periodIndex: number): Promotion[] => {
      const cached = this.periodDetails[contractAddress]?.[periodIndex];
      if (cached?.promotions) return cached.promotions;

      if (!this.isPeriodDetailsLoading(contractAddress, periodIndex)) {
        this.getPeriodDetails(contractAddress, periodIndex);
      }

      return [];
    };
  }

  private isValidCache(cached: any): boolean {
    return cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000; // 5 min
  }

  isPeriodDetailsLoading(contractAddress: string, periodIndex: number): boolean {
    return this.periodDetailsLoading[contractAddress]?.[periodIndex] || false;
  }

  getPeriodDetailsError(contractAddress: string, periodIndex: number): string | null {
    return this.periodDetailsErrors[contractAddress]?.[periodIndex] || null;
  }

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

  private getPeriodDetails = flow(function* (this: ContractStore, contractAddress: string, periodIndex: number) {
    if (!this.periodDetails[contractAddress]) {
      this.periodDetails[contractAddress] = {};
    }

    const cached = this.periodDetails[contractAddress][periodIndex];
    if (cached && this.isValidCache(cached)) {
      return cached;
    }

    // Prevent duplicate requests
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
      const response = yield fetch(`/api/contract/${contractAddress}/${periodIndex}/details`);
      if (!response.ok) throw new Error('Failed to fetch period details');

      const data: PeriodDetailsResponse = yield response.json();

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
}

export const contractStore = new ContractStore();