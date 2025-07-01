import { makeObservable, observable, computed, action, runInAction } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';

export class ContractStore {
  contractAddresses: Record<'kernel' | 'sequencer' | 'security', string> = {
    kernel: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    sequencer: 'KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U',
    security: 'KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2',
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
  loadingStates: Record<string, boolean> = {};
  errors: Record<string, string> = {};
  lastUpdated: Record<string, number> = {};
  
  // Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev');
  Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');

  constructor() {
    makeObservable(this, {
      contractAddresses: observable,
      proposals: observable,
      voters: observable,
      votingPowerMap: observable,
      winnerCandidate: observable,
      votingStates: observable,
      loadingStates: observable,
      errors: observable,
      lastUpdated: observable,
      setAddress: action,
      setLoading: action,
      setError: action,
      clearError: action,
      setLastUpdated: action,
    });
  }

  setAddress(label: 'kernel' | 'sequencer' | 'security', address: string) {
    this.contractAddresses[label] = address;
  }

  async fetchVotingState(label: 'kernel' | 'sequencer' | 'security') {
    this.setLoading(`fetchVotingState_${label}`, true);
    this.clearError(`fetchVotingState_${label}`);
    
    try {
      const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
      const storage: any = await contract.storage();

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

  getError(key: string): string | null {
    return this.errors[key] || null;
  }

  getLastUpdated(key: string): number {
    return this.lastUpdated[key] || 0;
  }

  async fetchWinner(label: 'kernel' | 'sequencer' | 'security'): Promise<void> {
    this.setLoading(`fetchWinner_${label}`, true);
    this.clearError(`fetchWinner_${label}`);
    
    runInAction(() => {
      this.winnerCandidate = null;
    });
    
    try {
      const contractAddress = this.contractAddresses[label];
      if (!contractAddress) {
        console.error(`Contract address for ${label} is not set`);
        return;
      }

      const contract = await this.Tezos.contract.at(contractAddress);
      const storage: any = await contract.storage();

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
      const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
      const storage: any = await contract.storage();

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
      const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
      const storage: any = await contract.storage();

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