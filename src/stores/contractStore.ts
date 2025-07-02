import { makeObservable, observable, computed, action, runInAction } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';

interface ContractVersion {
  kernel: string;
  sequencer: string;
  security: string;
  startDate: Date;
  endDate?: Date;
  level: number;
}

export class ContractStore {
  private static readonly CONTRACT_HISTORY: ContractVersion[] = [
    {
      level: 5316609,
      kernel: 'KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J',
      sequencer: 'KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF',
      security: 'KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g',
      startDate: new Date('2024-03-25T17:25:00Z'),
      endDate: new Date('2025-01-20T09:57:00Z'),
    },
    {
      level: 7692289,
      kernel: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
      sequencer: 'KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U',
      security: 'KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2',
      startDate: new Date('2025-01-20T09:57:00Z'),
      endDate: new Date('2025-05-01T13:07:00Z'),
    },
    {
      level: 8767489,
      kernel: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
      sequencer: 'KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa',
      security: 'KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL',
      startDate: new Date('2025-05-01T13:07:00Z'),
      endDate: undefined, // Waiting for V4
    },
  ];

  selectedDate: Date = new Date();
  
  contractAddresses: Record<'kernel' | 'sequencer' | 'security', string> = {
    kernel: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
    sequencer: 'KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa',
    security: 'KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL',
  };
  proposals: Record<string, any[]> = {
    kernel: [],
    sequencer: [],
    security: []
  };
  voters: Record<string, string[]> = {
    kernel: [],
    sequencer: [],
    security: []
  };
  votingPowerMap: Record<string, Record<string, number>> = {
    kernel: {},
    sequencer: {},
    security: {}
  };
  winnerCandidate: string | null = null;
  votingStates: Record<'kernel' | 'sequencer' | 'security', {
    period_type: 'proposal' | 'promotion' | null;
    period_index: number;
    total_voting_power: number;
    current_winner: string | null;
    period_end_level?: number;
  } | null> = {
    kernel: null,
    sequencer: null,
    security: null,
  };
  contractStorage: Record<'kernel' | 'sequencer' | 'security', any> = {
    kernel: null,
    sequencer: null,
    security: null,
  };
  loadingStates: Record<string, boolean> = {};
  errors: Record<string, string> = {};
  lastUpdated: Record<string, number> = {};
  
  // Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev');
  Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');

  constructor() {
    makeObservable(this, {
      contractAddresses: observable,
      selectedDate: observable,
      proposals: observable,
      voters: observable,
      votingPowerMap: observable,
      winnerCandidate: observable,
      votingStates: observable,
      contractStorage: observable,
      loadingStates: observable,
      errors: observable,
      lastUpdated: observable,
      setSelectedDate: action,
      setLoading: action,
      setError: action,
      clearError: action,
      setLastUpdated: action,
    });

    this.updateContractAddressesForDate(this.selectedDate);
  }

  private async getContractAndStorage(label: 'kernel' | 'sequencer' | 'security') {
    if (this.contractStorage[label]) {
      return { storage: this.contractStorage[label] };
    }
    
    const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
    const storage: any = await contract.storage();
    return { contract, storage };
  }

  private updateContractAddressesForDate(date: Date) {
    const version = this.getContractVersionForDate(date);
    
    runInAction(() => {
      this.contractAddresses = {
        kernel: version.kernel,
        sequencer: version.sequencer,
        security: version.security,
      };
      
      this.contractStorage = {
        kernel: null,
        sequencer: null,
        security: null,
      };
      
      this.proposals = { kernel: [], sequencer: [], security: [] };
      this.voters = { kernel: [], sequencer: [], security: [] };
      this.votingPowerMap = { kernel: {}, sequencer: {}, security: {} };
      this.votingStates = { kernel: null, sequencer: null, security: null };
      this.winnerCandidate = null;
    });
  }

  private getContractVersionForDate(date: Date): ContractVersion {
    for (const version of ContractStore.CONTRACT_HISTORY) {
      if (date >= version.startDate && (!version.endDate || date < version.endDate)) {
        return version;
      }
    }
    
    return ContractStore.CONTRACT_HISTORY[ContractStore.CONTRACT_HISTORY.length - 1];
  }

  async loadAllContractStorages() {
    this.setLoading('loadAllContractStorages', true);
    this.clearError('loadAllContractStorages');
    
    try {
      console.log('Loading all contract storages...');
      
      const storages = await Promise.all([
        this.Tezos.contract.at(this.contractAddresses.kernel).then(c => c.storage()),
        this.Tezos.contract.at(this.contractAddresses.sequencer).then(c => c.storage()),
        this.Tezos.contract.at(this.contractAddresses.security).then(c => c.storage()),
      ]);

      runInAction(() => {
        this.contractStorage.kernel = storages[0];
        this.contractStorage.sequencer = storages[1];
        this.contractStorage.security = storages[2];
        this.setLastUpdated('loadAllContractStorages');
      });
      
      console.log('All contract storages loaded successfully');
    } catch (error) {
      const errorMessage = `Error loading contract storages: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError('loadAllContractStorages', errorMessage);
      });
    } finally {
      runInAction(() => {
        this.setLoading('loadAllContractStorages', false);
      });
    }
  }

  async refreshContractStorage(label: 'kernel' | 'sequencer' | 'security') {
    this.setLoading(`refreshStorage_${label}`, true);
    this.clearError(`refreshStorage_${label}`);
    
    try {
      console.log(`Refreshing contract storage for ${label}...`);
      
      const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
      const storage: any = await contract.storage();
      
      runInAction(() => {
        this.contractStorage[label] = storage;
        this.setLastUpdated(`refreshStorage_${label}`);
      });
      
      console.log(`Contract storage refreshed for ${label}`);
    } catch (error) {
      const errorMessage = `Error refreshing contract storage for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`refreshStorage_${label}`, errorMessage);
      });
    } finally {
      runInAction(() => {
        this.setLoading(`refreshStorage_${label}`, false);
      });
    }
  }

  async setSelectedDateAndRefresh(date: Date) {
    this.setSelectedDate(date);
    await this.refreshAllContractsData();
  }

  setSelectedDate(date: Date) {
    this.selectedDate = date;
    this.updateContractAddressesForDate(date);
  }

  getCurrentContractVersion(): ContractVersion {
    return this.getContractVersionForDate(this.selectedDate);
  }

  getContractHistory(): ContractVersion[] {
    return ContractStore.CONTRACT_HISTORY;
  }

  getCurrentVersionInfo() {
    const version = this.getCurrentContractVersion();
    return {
      level: version.level,
      startDate: version.startDate,
      endDate: version.endDate,
      isCurrent: !version.endDate,
      addresses: {
        kernel: version.kernel,
        sequencer: version.sequencer,
        security: version.security,
      }
    };
  }

  setLoading(key: string, loading: boolean) {
    this.loadingStates[key] = loading;
  }

  setError(key: string, error: string) {
    this.errors[key] = error;
  }

  clearError(key: string) {
    delete this.errors[key];
  }

  setLastUpdated(key: string) {
    this.lastUpdated[key] = Date.now();
  }

  isLoading(key: string): boolean {
    return this.loadingStates[key] || false;
  }

  areAllStoragesLoaded(): boolean {
    return this.contractStorage.kernel !== null && 
           this.contractStorage.sequencer !== null && 
           this.contractStorage.security !== null;
  }

  getError(key: string): string | null {
    return this.errors[key] || null;
  }

  getLastUpdated(key: string): number {
    return this.lastUpdated[key] || 0;
  }

  async fetchVotingState(label: 'kernel' | 'sequencer' | 'security') {
    this.setLoading(`fetchVotingState_${label}`, true);
    this.clearError(`fetchVotingState_${label}`);
    
    try {
      const { storage } = await this.getContractAndStorage(label);
      const votingContext = storage.voting_context;
      if (!votingContext) {
        console.log(`No voting context found for ${label}`);
        runInAction(() => {
          this.votingStates[label] = null;
        });
        return;
      }

      const vc = votingContext.Some || votingContext;
      const period = vc.period;

      if (!period) {
        console.log(`No period found for ${label}`);
        runInAction(() => {
          this.votingStates[label] = null;
        });
        return;
      }

      let votingState: any = {
        period_index: vc.period_index?.toNumber() || 0,
        total_voting_power: 0,
        current_winner: null,
        period_type: null,
      };

      if (period.Proposal) {
        const proposalPeriod = period.Proposal;
        votingState.period_type = 'proposal';
        votingState.total_voting_power = proposalPeriod.total_voting_power?.toNumber() || 0;
        votingState.current_winner = proposalPeriod.winner_candidate;
        votingState.max_upvotes_voting_power = proposalPeriod.max_upvotes_voting_power?.toNumber() || 0;
      } else if (period.Promotion) {
        const promotionPeriod = period.Promotion;
        votingState.period_type = 'promotion';
        votingState.total_voting_power = promotionPeriod.total_voting_power?.toNumber() || 0;
        votingState.current_winner = promotionPeriod.winner_candidate;
        votingState.yea_voting_power = promotionPeriod.yea_voting_power?.toNumber() || 0;
        votingState.nay_voting_power = promotionPeriod.nay_voting_power?.toNumber() || 0;
        votingState.pass_voting_power = promotionPeriod.pass_voting_power?.toNumber() || 0;
      }

      runInAction(() => {
        this.votingStates[label] = votingState;
        this.setLastUpdated(`fetchVotingState_${label}`);
      });
      console.log(`Voting state for ${label}:`, votingState);
    } catch (error) {
      const errorMessage = `Error fetching voting state for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`fetchVotingState_${label}`, errorMessage);
      });
    } finally {
      runInAction(() => {
        this.setLoading(`fetchVotingState_${label}`, false);
      });
    }
  }

  async refreshAllData(label: 'kernel' | 'sequencer' | 'security') {
    console.log(`Refreshing all data for ${label}...`);
    
    try {
      await Promise.all([
        this.fetchVotingState(label),
        this.fetchProposals(label),
        this.fetchVoters(label),
        this.fetchWinner(label),
      ]);
      
      console.log(`All data refreshed for ${label}`);
    } catch (error) {
      console.error(`Error refreshing all data for ${label}:`, error);
    }
  }

  async refreshAllContractsData() {
    console.log('Refreshing all contracts data...');
    
    try {
      if (!this.areAllStoragesLoaded()) {
        await this.loadAllContractStorages();
      }
      
      await Promise.all([
        this.refreshAllData('kernel'),
        this.refreshAllData('sequencer'),
        this.refreshAllData('security'),
      ]);
      
      console.log('All contracts data refreshed');
    } catch (error) {
      console.error('Error refreshing all contracts data:', error);
    }
  }


  async fetchWinner(label: 'kernel' | 'sequencer' | 'security'): Promise<void> {
    this.setLoading(`fetchWinner_${label}`, true);
    this.clearError(`fetchWinner_${label}`);
    
    runInAction(() => {
      this.winnerCandidate = null;
    });
    
    try {
      const { storage } = await this.getContractAndStorage(label);
      const rawVC = storage.voting_context;
      const vc = rawVC?.Some ?? rawVC;

      const proposalObj = vc?.period?.proposal;
      if (!proposalObj) return;

      let winner = proposalObj.winner_candidate;
      if (winner?.Some) {
        winner = winner.Some;
      }

      let raw: string;
      if (typeof winner === 'string') {
        raw = winner;
      } else if ((winner as any)?.bytes) {
        raw = (winner as any).bytes;
      } else {
        raw = String(winner);
      }

      runInAction(() => {
        this.winnerCandidate = raw.startsWith('0x') ? raw : `0x${raw}`;
        this.setLastUpdated(`fetchWinner_${label}`);
      });
      console.log(`Winner candidate for ${label}:`, this.winnerCandidate);
    } catch (error) {
      const errorMessage = `Error fetching winner_candidate for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`fetchWinner_${label}`, errorMessage);
        this.winnerCandidate = null;
      });
    } finally {
      runInAction(() => {
        this.setLoading(`fetchWinner_${label}`, false);
      });
    }
  }

  async fetchProposals(label: 'kernel' | 'sequencer' | 'security') {
    try {
      const { storage } = await this.getContractAndStorage(label);
      const votingContext = storage.voting_context;
      if (!votingContext) {
        console.log(`No voting context found for ${label}`);
        runInAction(() => {
          this.proposals[label] = [];
        });
        return;
      }

      const vc = votingContext.Some || votingContext;
      const period = vc.period;

      if (!period) {
        console.log(`No period found for ${label}`);
        runInAction(() => {
          this.proposals[label] = [];
        });
        return;
      }

      let proposals: any[] = [];

      if (period.Proposal) {
        const proposalPeriod = period.Proposal;
        const proposalsMap = proposalPeriod.proposals;
        
        if (proposalsMap) {
          const entries = await proposalsMap.entries();
          proposals = entries.map(([key, value]: any) => ({
            hash: key,
            payload: key,
            proposers: value.proposers,
            upvotes_voting_power: value.upvotes_voting_power?.toNumber() || 0,
            period_type: 'proposal',
            period_index: vc.period_index?.toNumber() || 0,
            total_voting_power: proposalPeriod.total_voting_power?.toNumber() || 0,
            max_upvotes_voting_power: proposalPeriod.max_upvotes_voting_power?.toNumber() || 0,
            winner_candidate: proposalPeriod.winner_candidate,
          }));
        }
      } else if (period.Promotion) {
        const promotionPeriod = period.Promotion;
        proposals = [{
          hash: promotionPeriod.winner_candidate,
          payload: promotionPeriod.winner_candidate,
          period_type: 'promotion',
          period_index: vc.period_index?.toNumber() || 0,
          yea_voting_power: promotionPeriod.yea_voting_power?.toNumber() || 0,
          nay_voting_power: promotionPeriod.nay_voting_power?.toNumber() || 0,
          pass_voting_power: promotionPeriod.pass_voting_power?.toNumber() || 0,
          total_voting_power: promotionPeriod.total_voting_power?.toNumber() || 0,
          winner_candidate: promotionPeriod.winner_candidate,
        }];
      }

      runInAction(() => {
        this.proposals[label] = proposals;
      });
      console.log(`Fetched ${proposals.length} proposals for ${label}:`, proposals);
    } catch (error) {
      console.error(`Error fetching proposals for ${label}:`, error);
      runInAction(() => {
        this.proposals[label] = [];
      });
    }
  }

  async fetchVoters(label: 'kernel' | 'sequencer' | 'security') {
    this.setLoading(`fetchVoters_${label}`, true);
    this.clearError(`fetchVoters_${label}`);
    
    try {
      const { storage } = await this.getContractAndStorage(label);
      const votingContext = storage.voting_context;
      if (!votingContext) {
        console.log(`No voting context found for ${label}`);
        runInAction(() => {
          this.voters[label] = [];
          this.votingPowerMap[label] = {};
        });
        return;
      }

      const vc = votingContext.Some || votingContext;
      const period = vc.period;

      if (!period) {
        console.log(`No period found for ${label}`);
        runInAction(() => {
          this.voters[label] = [];
          this.votingPowerMap[label] = {};
        });
        return;
      }

      let voters: string[] = [];
      let votingPowerMap: Record<string, number> = {};

      if (period.Proposal) {
        const proposalPeriod = period.Proposal;
        
        const upvotersUpvotesCount = proposalPeriod.upvoters_upvotes_count;
        if (upvotersUpvotesCount) {
          const upvotersEntries = await upvotersUpvotesCount.entries();
          upvotersEntries.forEach(([voter, count]: any) => {
            const voterAddress = voter;
            const upvotesCount = count?.toNumber() || 0;
            voters.push(voterAddress);
            votingPowerMap[voterAddress] = upvotesCount;
          });
        }

        const delegationContract = storage.config.delegation_contract;
        if (delegationContract) {
          try {
            const delegationContractInstance = await this.Tezos.contract.at(delegationContract);
            const listVotersView = await delegationContractInstance.views.list_voters().read();
            
            if (listVotersView) {
              listVotersView.forEach((voterInfo: any) => {
                const [voterAddress, votingPower] = voterInfo;
                if (!voters.includes(voterAddress)) {
                  voters.push(voterAddress);
                }
                if (!votingPowerMap[voterAddress]) {
                  votingPowerMap[voterAddress] = votingPower?.toNumber() || 0;
                }
              });
            }
          } catch (error) {
            console.warn(`Could not fetch voters from delegation contract: ${error}`);
          }
        }

      } else if (period.Promotion) {
        const promotionPeriod = period.Promotion;
        
        const votersMap = promotionPeriod.voters;
        if (votersMap) {
          const votersEntries = await votersMap.entries();
          votersEntries.forEach(([voter, vote]: any) => {
            const voterAddress = voter;
            const voteType = vote;
            voters.push(voterAddress);
            
            votingPowerMap[voterAddress] = 1;
          });
        }
      }

      runInAction(() => {
        this.voters[label] = voters;
        this.votingPowerMap[label] = votingPowerMap;
        this.setLastUpdated(`fetchVoters_${label}`);
      });
      console.log(`Fetched ${voters.length} voters for ${label}:`, { voters, votingPowerMap });
    } catch (error) {
      const errorMessage = `Error fetching voters for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`fetchVoters_${label}`, errorMessage);
        this.voters[label] = [];
        this.votingPowerMap[label] = {};
      });
    } finally {
      runInAction(() => {
        this.setLoading(`fetchVoters_${label}`, false);
      });
    }
  }

  async vote(label: 'kernel' | 'sequencer' | 'security', voteType: 'yea' | 'nay' | 'pass') {
    this.setLoading(`vote_${label}`, true);
    this.clearError(`vote_${label}`);
    
    try {
      const contractAddress = this.contractAddresses[label];
      if (!contractAddress) {
        throw new Error(`Contract address for ${label} is not set`);
      }

      const votingState = this.votingStates[label];
      if (!votingState || votingState.period_type !== 'promotion') {
        throw new Error(`Cannot vote: not in promotion period for ${label}`);
      }

      const currentProposal = votingState.current_winner;
      if (!currentProposal) {
        throw new Error(`No current proposal to vote on for ${label}`);
      }

      console.log(`Voting ${voteType} on proposal ${currentProposal} for ${label}`);

      const contract = await this.Tezos.wallet.at(contractAddress);
      const op = await contract.methods.vote(voteType).send();
      
      console.log(`Vote transaction sent: ${op.opHash}`);
      
      await op.confirmation();
      
      console.log(`Vote confirmed for ${label}`);
      
      await this.refreshContractStorage(label);
      await this.fetchVotingState(label);
      
      runInAction(() => {
        this.setLastUpdated(`vote_${label}`);
      });
      
      return op.opHash;
    } catch (error) {
      const errorMessage = `Error voting ${voteType} for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`vote_${label}`, errorMessage);
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(`vote_${label}`, false);
      });
    }
  }
}

export const contractStore = new ContractStore();