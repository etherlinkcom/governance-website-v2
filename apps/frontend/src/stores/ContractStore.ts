import { makeAutoObservable } from 'mobx';
import { GovernanceType, Period, ContractAndConfig } from '@trilitech/types';

class ContractStore {
  currentGovernance: GovernanceType | null = null;
  contractsByGovernance: Partial<Record<GovernanceType, ContractAndConfig[]>> = {};
  periodsByGovernance: Partial<Record<GovernanceType, Record<string, Period[]>>> = {};
  loadingByGovernance: Partial<Record<GovernanceType, boolean>> = {};
  loadingPeriodsByGovernance: Partial<Record<GovernanceType, Record<string, boolean>>> = {};
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async setGovernance(governanceType: GovernanceType) {
    this.currentGovernance = governanceType;
    this.error = null;

    if (!this.periodsByGovernance[governanceType]) {
      this.periodsByGovernance[governanceType] = {};
    }
    if (!this.loadingPeriodsByGovernance[governanceType]) {
      this.loadingPeriodsByGovernance[governanceType] = {};
    }

    if (!this.contractsByGovernance[governanceType]) {
      await this.getContracts();
    }
  }

  async getContracts() {
    if (!this.currentGovernance) return;

    this.loadingByGovernance[this.currentGovernance] = true;
    this.error = null;

    try {
      const response = await fetch(`/api/governance/${this.currentGovernance}/contracts`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contracts');
      }

      const data = await response.json();
      this.contractsByGovernance[this.currentGovernance] = data.contracts;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      this.contractsByGovernance[this.currentGovernance] = [];
    } finally {
      this.loadingByGovernance[this.currentGovernance] = false;
    }
  }

  async getPeriods(contractAddress: string) {
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
      const response = await fetch(`/api/contract/${contractAddress}/periods`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch periods');
      }

      const data = await response.json();
      this.periodsByGovernance[this.currentGovernance]![contractAddress] = data.periods;

    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error loading periods';
      this.periodsByGovernance[this.currentGovernance]![contractAddress] = [];
    } finally {
      this.loadingPeriodsByGovernance[this.currentGovernance]![contractAddress] = false;
    }
  }

  get contracts(): ContractAndConfig[] {
    return this.currentGovernance ? this.contractsByGovernance[this.currentGovernance] || [] : [];
  }

  get loading(): boolean {
    return this.currentGovernance ? this.loadingByGovernance[this.currentGovernance] || false : false;
  }

  get totalContracts(): number {
    return this.contracts.length;
  }

  getPeriodsForContract(contractAddress: string): Period[] {
    return this.currentGovernance ? this.periodsByGovernance[this.currentGovernance]?.[contractAddress] || [] : [];
  }

  isLoadingPeriods(contractAddress: string): boolean {
    return this.currentGovernance ? this.loadingPeriodsByGovernance[this.currentGovernance]?.[contractAddress] || false : false;
  }

  hasPeriodsLoaded(contractAddress: string): boolean {
    if (!this.currentGovernance) return false;
    return contractAddress in (this.periodsByGovernance[this.currentGovernance] || {});
  }

  get allPeriods(): Period[] {
    if (!this.currentGovernance) return [];
    return Object.values(this.periodsByGovernance[this.currentGovernance] || {}).flat();
  }

  get totalPeriods(): number {
    return this.allPeriods.length;
  }
}

export const contractStore = new ContractStore();