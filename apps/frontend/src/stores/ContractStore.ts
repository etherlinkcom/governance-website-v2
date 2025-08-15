import { makeAutoObservable, flow, computed } from 'mobx';
import { GovernanceType, Period, ContractAndConfig, Vote, Promotion, Upvote, Proposal } from '@trilitech/types';
import { FuturePeriod, PeriodData, PeriodDetailsResponse, FrontendPeriod } from '@/types/api';
import { fetchJson } from '@/lib/fetchJson';

class ContractStore {
  private currentGovernance: GovernanceType | null = null;

  // TODO get all contracts by contractaddress as well and look up periods that way
  // We could also join periods on contract quorum
  private contracts: Partial<Record<string, ContractAndConfig>> = {};

  // Caches
  // TODO make strings so we only need one cache?
  private pastPeriods: Partial<Record<GovernanceType,  FrontendPeriod[]>> = {};
  private currentPeriod: Partial<Record<GovernanceType, FrontendPeriod>> = {};
  private futurePeriods: Partial<Record<GovernanceType, FuturePeriod[]>> = {};

  // Loading states
  private loadingPastPeriods: Partial<Record<GovernanceType, boolean>> = {};
  private loadingCurrentPeriod: Partial<Record<GovernanceType, boolean>> = {};
  private loadingFuturePeriods: Partial<Record<GovernanceType, boolean>> = {};

  // Error states?

  private error: string | null = null;

  private readonly futurePeriodsCount: number = 10;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  constructor() {
    makeAutoObservable(this, {
      setGovernance: flow,
    });
    this.getActiveContracts();
  }

  get allContracts(): Partial<Record<string, ContractAndConfig>> {
    return this.contracts;
  }

  get currentError(): string | null {
    return this.error;
  }

  get currentContract(): ContractAndConfig | undefined {
    return this.currentGovernance ? this.contracts[this.currentGovernance] : undefined;
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
    return this.currentGovernance ? this.futurePeriods[this.currentGovernance] : undefined;
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



  private getActiveContracts = flow(function* (this: ContractStore) {
    try {
      const {contracts}: { contracts: ContractAndConfig[] } = yield fetchJson<{ contracts: ContractAndConfig[] }>(
        `/api/contracts`
      );
      for (const contract of contracts) {
        if (this.contracts[contract.governance_type]) continue;
        this.contracts[contract.governance_type] = contract;
      }
    } catch (error) {
      console.error('[ContractStore] Error fetching contracts:', error);
      this.error = 'Failed to fetch contracts';
    }
  })


  private getFuturePeriods = flow(function* (this: ContractStore) {
    if (!this.currentGovernance) return;
    if (this.loadingFuturePeriods[this.currentGovernance]) return;
    const contract: ContractAndConfig | undefined = this.contracts[this.currentGovernance];
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
      console.log(`[ContractStore] Set governance to ${governanceType}`);
      console.log(`[ContractStore] Current period:`, this.currentPeriod[governanceType]);
      console.log(`[ContractStore] Past periods:`, this.pastPeriods[governanceType]);
      console.log(`[ContractStore] Future periods:`, this.futurePeriods[governanceType]);
    } catch (error) {
      console.error('[ContractStore] Error setting governance:', error);
      this.error = 'Failed to set governance';
    }
  });

}

export const contractStore = new ContractStore();