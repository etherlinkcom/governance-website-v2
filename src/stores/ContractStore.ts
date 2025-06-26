import { makeObservable, observable, computed, action } from 'mobx';

interface ContractConfig {
  address: string;
  title: string;
  description: string;
  votingPeriod: number;
  quorumThreshold: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  votes: { for: number; against: number };
  endTime: Date;
}

type GovernanceType = 'slow' | 'fast' | 'sequencer';
type NetworkType = 'mainnet' | 'testnet';

class ContractStore {
  private static readonly BASE_CONFIGS: Record<GovernanceType, Omit<ContractConfig, 'address' | 'title'>> = {
    slow: {
      description: 'Major protocol upgrades and significant changes that require careful consideration and extended voting periods.',
      votingPeriod: 14,
      quorumThreshold: 0.6
    },
    fast: {
      description: 'Routine updates and minor changes that can be implemented quickly with shorter voting periods.',
      votingPeriod: 3,
      quorumThreshold: 0.4
    },
    sequencer: {
      description: 'Sequencer management including validator selection, performance metrics, and operational parameters.',
      votingPeriod: 7,
      quorumThreshold: 0.5
    }
  };

  private static readonly ADDRESSES = {
    mainnet: {
      slow: '0x1234567890abcdef1234567890abcdef12345678',
      fast: '0x2345678901bcdef12345678901cdef123456789a',
      sequencer: '0x3456789012cdef123456789012def123456789ab'
    },
    testnet: {
      slow: '0xabcdef1234567890abcdef1234567890abcdef12',
      fast: '0xbcdef12345678901bcdef12345678901cdef1234',
      sequencer: '0xcdef123456789012cdef123456789012def12345'
    }
  };

  currentNetwork: NetworkType = 'mainnet';
  currentContract: GovernanceType | null = null;
  proposals: Proposal[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeObservable(this, {
      currentNetwork: observable,
      currentContract: observable,
      proposals: observable,
      loading: observable,
      error: observable,
      contractData: computed,
      setNetwork: action,
      setContract: action,
      loadProposals: action,
    });
  }

  get contractData(): ContractConfig | null {
    if (!this.currentContract) return null;

    const baseConfig = ContractStore.BASE_CONFIGS[this.currentContract];
    const address = ContractStore.ADDRESSES[this.currentNetwork][this.currentContract];
    const networkSuffix = this.currentNetwork === 'testnet' ? ' (Testnet)' : '';

    return {
      ...baseConfig,
      address,
      title: `${this.currentContract.charAt(0).toUpperCase() + this.currentContract.slice(1)} Governance${networkSuffix}`
    };
  }

  setNetwork(network: NetworkType) {
    this.currentNetwork = network;
    if (this.currentContract) {
      this.loadProposals();
    }
  }

  setContract(type: GovernanceType) {
    this.currentContract = type;
    this.loadProposals();
  }

  async loadProposals() {
    if (!this.contractData) return;

    this.loading = true;
    this.error = null;

    try {
      // TODO replace with real data
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.proposals = [
        {
          id: '1',
          title: `Sample ${this.currentContract} proposal`,
          description: 'This is a sample proposal for demonstration purposes.',
          status: 'active',
          votes: { for: 150, against: 30 },
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        {
          id: '2',
          title: 'Another proposal',
          description: 'Another sample proposal.',
          status: 'passed',
          votes: { for: 200, against: 50 },
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ];
    } catch (err) {
      this.error = 'Failed to load proposals';
      console.error('Error loading proposals:', err);
    } finally {
      this.loading = false;
    }
  }
}

export const contractStore = new ContractStore();
export default ContractStore;