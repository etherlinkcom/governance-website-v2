import { makeObservable, observable, computed, action, runInAction } from 'mobx';
import { GovernanceContractConfig } from './types';
import { TezosToolkit } from '@taquito/taquito';

export type GovernanceType = 'slow' | 'fast' | 'sequencer';
export type NetworkType = 'mainnet'
// Kernel = Slow
// Security = Fast

// TODO load on app start and cache data
export type GovernanceContractConfigProcessed = {
  started_at_level: number;
  period_length: number;
  adoption_period_sec: number;
  upvoting_limit: number;
  scale: number;
  proposal_quorum: number;
  promotion_quorum: number;
  promotion_supermajority: number;
}

class ContractStore {
  // TODO place in own file
  private static readonly ADDRESSES = {
    mainnet: {
      slow: 'KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J',
      fast: 'KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g',
      sequencer: 'KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF'
    },
  };

  currentNetwork: NetworkType = 'mainnet';
  contractType: GovernanceType | null = null;
  contractAddress: string | null = null;

  contractConfig: GovernanceContractConfigProcessed | null = null;
  Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com'); // TODO env

  error: string | null = null;
  loading: boolean = false;

  constructor() {
    makeObservable(this, {
      currentNetwork: observable,
      contractType: observable,
      contractConfig: observable,
      contractAddress: observable,
      error: observable,
      setNetwork: action,
      setContract: action,
      loadProposals: action,
    });
  }

  get isLoading() {
    return this.loading;
  }

  setNetwork(network: NetworkType) {
    this.currentNetwork = network;
    if (this.contractType) {
      this.loadProposals();
    }
  }

  async setContract(type: GovernanceType) {
    runInAction(async () => {
    try {
      this.loading = true;
      this.contractType = type;
      this.contractAddress = ContractStore.ADDRESSES[this.currentNetwork][this.contractType];
      await this.setContractDetails();
      // await this.loadProposals();
    } catch (error) {
      console.error('Error setting contract:', error);
      runInAction(() => {
        this.error = 'Failed to set contract';
      });
    } finally {
      this.loading = false;
    }});
  }

  setConfig(config: GovernanceContractConfig) {
    runInAction(() => {
    this.contractConfig = {
      started_at_level: config?.started_at_level.toNumber() || 0,
      period_length: config?.period_length.toNumber() || 0,
      adoption_period_sec: config?.adoption_period_sec.toNumber() || 0,
      upvoting_limit: config?.upvoting_limit.toNumber() || 0,
      scale: config?.scale.toNumber() || 0,
      proposal_quorum: config?.proposal_quorum.toNumber() || 0,
      promotion_quorum: config?.promotion_quorum.toNumber() || 0,
      promotion_supermajority: config?.promotion_supermajority.toNumber() || 0,
    };
    });
  }

  async setContractDetails() {
    try {
      if (!this.contractAddress) return;
      console.log('Fetching contract details for:', this.contractAddress);

      const contract = await this.Tezos.contract.at(this.contractAddress);
      const storage: any = await contract.storage();
      this.setConfig(storage.config);
    } catch (err) {
      console.error('Failed to fetch', err);
    }
  }

  async loadProposals() {
    if (!this.contractConfig || !this.contractType) return;
    this.error = null;

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with real API call

      runInAction(() => {
      });

    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to load governance data';
      });
      console.error('Error loading governance data:', err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const contractStore = new ContractStore();
export default ContractStore;