import { makeObservable, observable, computed, action } from 'mobx';
import { FAKE_GOVERNANCE_DATA } from './mockData';


interface ContractConfig {
  address: string;
  title: string;
  description: string;
  votingPeriod: number;
  quorumThreshold: number;
}

interface ContractInfo {
  type: string;
  address: string;
  startedAtLevel: number;
  periodLength: string;
  adoptionPeriod: string;
  upvotingLimit: number;
  proposalQuorum: string;
  promotionQuorum: string;
  promotionSupermajority: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  votes: { for: number; against: number };
  endTime: Date;
  author: string;
  upvotes: string;
}

interface Upvoter {
  baker: string;
  votingPower: string;
  proposal: string;
  time: string;
}

interface Voter {
  baker: string;
  votingPower: string;
  vote: 'yea' | 'nay' | 'pass';
  time: string;
}

interface PromotionData {
  candidate: string;
  title: string;
  quorum: string;
  supermajority: string;
  votes: {
    yea: { percentage: number; count: number; label: string };
    nay: { percentage: number; count: number; label: string };
    pass: { percentage: number; count: number; label: string };
  };
  voters: Voter[];
}

interface GovernanceData {
  proposals: Proposal[];
  upvoters: Upvoter[];
  quorum: string;
  promotion: PromotionData;
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
  promotion: PromotionData | null = null;
  upvoters: Upvoter[] = [];
  quorum = '0%';
  loading = false;
  error: string | null = null;
  contractInfo: ContractInfo | null = null;

  constructor() {
    makeObservable(this, {
      currentNetwork: observable,
      currentContract: observable,
      proposals: observable,
      promotion: observable,
      upvoters: observable,
      quorum: observable,
      contractInfo: observable,
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
      title: `${this.currentContract.charAt(0).toUpperCase() + this.currentContract.slice(1)} ${networkSuffix}`
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
    if (!this.contractData || !this.currentContract) return;

    this.loading = true;
    this.error = null;

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with real API call
      const fakeData = FAKE_GOVERNANCE_DATA[this.currentContract];
      this.proposals = fakeData.proposals;
      this.upvoters = fakeData.upvoters;
      this.promotion = fakeData.promotion;
      this.quorum = fakeData.quorum;
      this.contractInfo = fakeData.contractInfo;

    } catch (err) {
      this.error = 'Failed to load governance data';
      console.error('Error loading governance data:', err);
    } finally {
      this.loading = false;
    }
  }
}

export const contractStore = new ContractStore();
export default ContractStore;