import { makeAutoObservable, flow, computed } from 'mobx';
import { GovernanceType, Period, ContractAndConfig, Vote, Promotion, Upvote, Proposal } from '@trilitech/types';
import { FuturePeriod, PeriodData, PeriodDetailsResponse, PeriodFrontend } from '@/types/api';
import { fetchJson } from '@/lib/fetchJson';

class ContractStore {
  private currentGovernance: GovernanceType | null = null;

  private contracts: Partial<Record<string, ContractAndConfig>> = {};

  // Caches
  // TODO make strings so we only need one cache?
  private pastPeriods: Partial<Record<GovernanceType,  PeriodFrontend[]>> = {};
  private currentPeriod: Partial<Record<GovernanceType, PeriodFrontend>> = {};
  private futurePeriods: Partial<Record<GovernanceType, FuturePeriod[]>> = {};

  // Loading states
  private loadingPastPeriods: Partial<Record<GovernanceType, boolean>> = {};
  private loadingCurrentPeriod: Partial<Record<GovernanceType, boolean>> = {};
  private loadingFuturePeriods: Partial<Record<GovernanceType, boolean>> = {};

  // Error states?

  private error: string | null = null;

  private readonly futurePeriodsCount: number = 3;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  constructor() {
    makeAutoObservable(this, {
      setGovernance: flow,
    });
    this.getActiveContracts();
  }

  private getPastPeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingPastPeriods[this.currentGovernance]) return;
    try {

      const cachedPeriods = this.pastPeriods[this.currentGovernance];
      // TODO validate cache
      if (cachedPeriods) return;

      this.loadingPastPeriods[this.currentGovernance] = true;
      const pastPeriods: PeriodFrontend[] = yield fetchJson<{ periods: PeriodFrontend[] }>(`/api/contract/${this.currentGovernance}/pastPeriods`);

      this.pastPeriods[this.currentGovernance] = pastPeriods;
      this.loadingPastPeriods[this.currentGovernance] = false;

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
      const currentPeriod: PeriodFrontend = yield fetchJson<{ period: PeriodFrontend }>(`/api/contract/${this.currentGovernance}/currentPeriod`);
      this.currentPeriod[this.currentGovernance] = currentPeriod;
    } catch (error) {
      console.error('[ContractStore] Error fetching current period:', error);
      this.error = 'Failed to fetch current period';
    } finally {
      this.loadingCurrentPeriod[this.currentGovernance] = false;
    }
  })



  private getActiveContracts = flow(function* (this: ContractStore) {

    try {

      const contracts: ContractAndConfig[] = yield fetchJson<{ contracts: ContractAndConfig[] }>(`/api/contracts`);
      for (const contract of contracts) {
        if (this.contracts[contract.governance_type]) continue;
        this.contracts[contract.governance_type] = contract;
      }

    } catch (error) {
      console.error('[ContractStore] Error fetching contracts:', error);
      this.error = 'Failed to fetch contracts';
    }
  })


    // This is not async/flow this is computed
  private getFuturePeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingFuturePeriods[this.currentGovernance]) return;
    if (!this.contracts[this.currentGovernance]) return;

    const cachedFuturePeriods = this.futurePeriods[this.currentGovernance];
    if (cachedFuturePeriods) return;

    this.loadingFuturePeriods[this.currentGovernance] = true;
    const startTime = this.contracts[this.currentGovernance].started_at_level
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

}

export const contractStore = new ContractStore();