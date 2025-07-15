import { makeObservable, observable, computed, action, runInAction } from 'mobx';
import { FAKE_GOVERNANCE_DATA } from './mockData';
import { TezosToolkit } from '@taquito/taquito';
import { getWalletStore } from './WalletStore';

type GovernanceType = 'slow' | 'fast' | 'sequencer';
type NetworkType = 'mainnet' | 'testnet';

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
      slow: 'KT1LyTGFFmi4zEyrDozxGdEAEdwTEY7b3Wzi',
      fast: 'KT1LyTGFFmi4zEyrDozxGdEAEdwTEY7b3Wzi',
      sequencer: 'KT1LyTGFFmi4zEyrDozxGdEAEdwTEY7b3Wzi'
    }
  };

  get Tezos(): TezosToolkit {
    const walletStore = getWalletStore();
    return walletStore ? walletStore.Tezos : new TezosToolkit('https://ghostnet.tezos.ecadinfra.com');
  }

  currentNetwork: NetworkType = 'testnet';
  currentContract: GovernanceType | null = null;
  proposals: Proposal[] = [];
  promotion: PromotionData | null = null;
  upvoters: Upvoter[] = [];
  quorum = '0%';
  loading = false;
  error: string | null = null;
  contractInfo: ContractInfo | null = null;
  lastUpdated: Record<string, number> = {};

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
      lastUpdated: observable,
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
      title: this.currentContract
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

      runInAction(() => {
        this.proposals = fakeData.proposals;
        this.upvoters = fakeData.upvoters;
        this.promotion = fakeData.promotion;
        this.quorum = fakeData.quorum;
        this.contractInfo = fakeData.contractInfo;
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

  async newProposal(label: GovernanceType, kernelRootHash: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const contractAddress = ContractStore.ADDRESSES[this.currentNetwork][label];
      if (!contractAddress) {
        throw new Error(`Contract address for ${label} is not set`);
      }

      console.log(`Creating new proposal with kernel root hash ${kernelRootHash} for ${label}`);

      const contract = await this.Tezos.wallet.at(contractAddress);
      const op = await contract.methodsObject.new_proposal(kernelRootHash).send();
      
      console.log(`New proposal transaction sent: ${op.opHash}`);
      
      await op.confirmation();
      
      console.log(`New proposal confirmed for ${label}`);
      
      runInAction(() => {
        this.lastUpdated[`newProposal_${label}`] = Date.now();
      });
      
      return op.opHash;
    } catch (error) {
      const errorMessage = `Error creating new proposal for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.error = errorMessage;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const contractStore = new ContractStore();
export default ContractStore;
