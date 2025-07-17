import { makeAutoObservable } from 'mobx';
import { GovernanceType, Period, ContractAndConfig } from '@trilitech/types';

class ContractStore {
  currentGovernance: GovernanceType | null = null;
  contractsByGovernance: Partial<Record<GovernanceType, ContractAndConfig[]>> = {};
  periodsByGovernance: Partial<Record<GovernanceType, Record<string, Period[]>>> = {};
  loadingByGovernance: Partial<Record<GovernanceType, boolean>> = {};
  loadingPeriodsByGovernance: Partial<Record<GovernanceType, Record<string, boolean>>> = {};
  error: string | null = null;
  blockTimeMs: number = 6000;
  futurePeriodsCount: number = 3;

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


  private async generateCurrentAndFuturePeriods(contractAddress: string): Promise<Period[]> {
  const contract = this.contracts.find(c => c.contract_address === contractAddress);
  if (!contract || !contract.active) return [];

  try {
    const tzktResponse = await fetch('https://api.tzkt.io/v1/head');
    const head = await tzktResponse.json();
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
      let allPeriods = data.periods;

      // Add current and future periods for active contracts
      const contract = this.contracts.find(c => c.contract_address === contractAddress);
      if (contract?.active) {
        const generatedPeriods = await this.generateCurrentAndFuturePeriods(contractAddress);

        // Merge with existing periods, avoiding duplicates
        const existingIndexes = new Set(allPeriods.map((p: Period) => p.contract_voting_index));
        const newPeriods = generatedPeriods.filter(p => !existingIndexes.has(p.contract_voting_index));

        allPeriods = [...allPeriods, ...newPeriods].sort((a, b) => b.contract_voting_index - a.contract_voting_index);
      }

      this.periodsByGovernance[this.currentGovernance]![contractAddress] = allPeriods;
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