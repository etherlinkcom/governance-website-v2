import { makeAutoObservable, runInAction } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { ColorMode } from '@airgap/beacon-types';

export class WalletStore {
  address: string | null = null;
  balance: number = 0;
  votingPower: number = 0;
  loading: Record<string, boolean> = {};
  error: Record<string, string | null> = {};
  lastUpdated: Record<string, number> = {};

  private Tezos = new TezosToolkit('https://ghostnet.tezos.ecadinfra.com');
  private wallet: BeaconWallet;
  private delegatesViewContractAddress: string = process.env.NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT!;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  private readonly contractAddresses = {
    slow: 'KT1HRPRfyzceEJmkHgiWx7DbhcUeMC43WioZ',
    fast: 'KT1HRPRfyzceEJmkHgiWx7DbhcUeMC43WioZ',
    sequencer: 'KT1HRPRfyzceEJmkHgiWx7DbhcUeMC43WioZ'
  };

  constructor() {
    this.wallet = new BeaconWallet({
        name: 'Etherlink Governance App',
        colorMode: ColorMode.DARK,
        iconUrl: '/favicon.ico',
        preferredNetwork: 'ghostnet'
    });
    this.Tezos.setWalletProvider(this.wallet);
    makeAutoObservable(this);

    this.restoreConnection();
  }

  async connect(): Promise<void> {
    await this.wallet.requestPermissions({});
    const address = await this.wallet.getPKH();
    runInAction(() => {
      this.address = address;
    });
    await Promise.all([
      this.refreshBalance(),
      this.refreshVotingPower(),
    ]);
  }

  async disconnect(): Promise<void> {
    await this.wallet.clearActiveAccount();
    runInAction(() => {
      this.address = null;
      this.balance = 0;
      this.votingPower = 0;
    });
  }

  async refreshBalance(): Promise<void> {
    if (!this.address) return;
    const mutez = await this.Tezos.tz.getBalance(this.address);
    runInAction(() => {
      this.balance = mutez.toNumber() / 1_000_000;
    });
  }

  async refreshVotingPower(): Promise<void> {
    if (!this.address) return;

    const address = this.address!;
    let ownLiquid = 0;
    try {
      // fetch own liquid balance first (delegators endpoint does not return own liquid balance)
      try {
        ownLiquid = (await this.Tezos.tz.getBalance(address)).toNumber();
      } catch (e) {
        console.warn('Failed to fetch own liquid balance:', e);
      }

      // calling onchain view to get delegators
      const contract = await this.Tezos.contract.at(this.delegatesViewContractAddress);
      const view = contract.contractViews.list_voters({
        0: address,
        1: null
      });
      const delegates: string[] = await view.executeView({ viewCaller: address });

      // If no delegators returned, check delegate endpoint
      if (delegates.length === 0) {
        const url = this.tzktApiUrl + `/delegates/${address}`;
        const response = await fetch(url);
        const raw = await response.text();
        if (response.ok && raw.trim() !== '') {
          const data = JSON.parse(raw);
          const staking = data.stakingBalance ?? 0;
          runInAction(() => {
            this.votingPower = ownLiquid + staking;
          });
          return;
        }
        runInAction(() => {
          this.votingPower = ownLiquid;
        });
        return;
      }

      // sum each delegators staking balance + liquid balance
      const delegateTotals = await Promise.all(
        delegates.map(async (delegateAddress) => {
          let staking = 0;
          try {
            const response = await fetch(`${this.tzktApiUrl}/delegates/${delegateAddress}`);
            if (response.ok) {
              const data = await response.json();
              staking = data.stakingBalance ?? 0;
            }
          } catch {}
          let liquid = 0;
          try {
            liquid = (await this.Tezos.tz.getBalance(delegateAddress)).toNumber();
          } catch {}
          return staking + liquid;
        })
      );

      // fetch own staking balance
      let ownStaking = 0;
      try {
        const response = await fetch(`${this.tzktApiUrl}/delegates/${address}`);
        if (response.ok) {
          const data = await response.json();
          ownStaking = data.stakingBalance ?? 0;
        }
      } catch {}

      // total voting power = own liquid + sum of delegators + own staking
      runInAction(() => {
        this.votingPower = ownLiquid + delegateTotals.reduce((sum, value) => sum + value, 0) + ownStaking;
      });
    } catch (err) {
      console.error('Error fetching voting power:', err);
      // fallback in error case: own liquid only
      runInAction(() => {
        this.votingPower = ownLiquid;
      });
    }
  }

  async restoreConnection() {
    const activeAccount = await this.wallet.client.getActiveAccount();
    if (activeAccount) {
      const address = await this.wallet.getPKH();
      runInAction(() => {
        this.address = address;
      });
      await Promise.all([
        this.refreshBalance(),
        this.refreshVotingPower(),
      ]);
    }
  }

  async vote(label: 'slow' | 'sequencer' | 'fast', voteType: 'yea' | 'nay' | 'pass') {
    this.setLoading(`vote_${label}`, true);
    this.clearError(`vote_${label}`);
    
    try {
      const contractAddress = this.contractAddresses[label];
      if (!contractAddress) {
        throw new Error(`Contract address for ${label} is not set`);
      }

      console.log(`Voting ${voteType} for ${label}`);

      const contract = await this.Tezos.wallet.at(contractAddress);
      const op = await contract.methodsObject.vote(voteType).send();
      
      console.log(`Vote transaction sent: ${op.opHash}`);
      
      await op.confirmation();
      
      console.log(`Vote confirmed for ${label}`);
      
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

  async upvoteProposal(label: 'slow' | 'sequencer' | 'fast', proposalHash: string) {
    this.setLoading(`upvote_${label}`, true);
    this.clearError(`upvote_${label}`);
    
    try {
      const contractAddress = this.contractAddresses[label];
      if (!contractAddress) {
        throw new Error(`Contract address for ${label} is not set`);
      }

      console.log(`Upvoting proposal ${proposalHash} for ${label}`);

      const contract = await this.Tezos.wallet.at(contractAddress);
      const op = await contract.methodsObject.upvote_proposal(proposalHash).send();
      
      console.log(`Upvote transaction sent: ${op.opHash}`);
      
      await op.confirmation();
      
      console.log(`Upvote confirmed for ${label}`);
      
      runInAction(() => {
        this.setLastUpdated(`upvote_${label}`);
      });
      
      return op.opHash;
    } catch (error) {
      const errorMessage = `Error upvoting proposal for ${label}: ${error}`;
      console.error(errorMessage);
      runInAction(() => {
        this.setError(`upvote_${label}`, errorMessage);
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(`upvote_${label}`, false);
      });
    }
  }

  // Helper methods for loading states
  setLoading(key: string, value: boolean) {
    this.loading[key] = value;
  }

  setError(key: string, error: string) {
    this.error[key] = error;
  }

  clearError(key: string) {
    this.error[key] = null;
  }

  setLastUpdated(key: string) {
    this.lastUpdated[key] = Date.now();
  }
}

let walletStore: WalletStore | null = null;

export function getWalletStore() {
  if (typeof window === 'undefined') return null;
  if (!walletStore) walletStore = new WalletStore();
  return walletStore;
}