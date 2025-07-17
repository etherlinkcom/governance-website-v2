import { makeAutoObservable } from 'mobx';
import { GovernanceType, Period, ContractAndConfig } from '@trilitech/types';

class ContractStore {
  currentGovernance: GovernanceType | null = null;
  contracts: ContractAndConfig[] = [];
  periods: Record<string, Period[]> = {}; // contractAddress -> periods
  loading: boolean = false;
  loadingPeriods: Record<string, boolean> = {}; // contractAddress -> loading
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async setGovernance(governanceType: GovernanceType) {
    this.currentGovernance = governanceType;
    this.error = null;
    this.contracts = [];
    this.periods = {};
    this.loadingPeriods = {};
    await this.getContracts();
  }

  async getContracts() {
    if (!this.currentGovernance) return;

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/governance/${this.currentGovernance}/contracts`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contracts');
      }

      const data = await response.json();
      this.contracts = data.contracts;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      this.contracts = [];
    } finally {
      this.loading = false;
    }
  }

  async getPeriods(contractAddress: string) {
    if (this.loadingPeriods[contractAddress]) return; // Already loading

    this.loadingPeriods[contractAddress] = true;
    this.error = null;

    try {
      const response = await fetch(`/api/contract/${contractAddress}/periods`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch periods');
      }

      const data = await response.json();
      this.periods[contractAddress] = data.periods;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error loading periods';
      this.periods[contractAddress] = [];
    } finally {
      this.loadingPeriods[contractAddress] = false;
    }
  }

  get totalContracts(): number {
    return this.contracts.length;
  }

  getPeriodsForContract(contractAddress: string): Period[] {
    return this.periods[contractAddress] || [];
  }

  isLoadingPeriods(contractAddress: string): boolean {
    return this.loadingPeriods[contractAddress] || false;
  }

  hasPeriodsLoaded(contractAddress: string): boolean {
    return contractAddress in this.periods;
  }

  get allPeriods(): Period[] {
    return Object.values(this.periods).flat();
  }

  get totalPeriods(): number {
    return this.allPeriods.length;
  }
}

export const contractStore = new ContractStore();