import { makeAutoObservable } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

export class WalletStore {
  address: string | null = null;
  balance: number = 0;
  votingPower: number = 0;  
  winnerCandidate: string | null = null;

  private Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');
  private wallet: BeaconWallet;

  constructor() {
    this.wallet = new BeaconWallet({ name: 'Governance App' });
    this.Tezos.setWalletProvider(this.wallet);
    makeAutoObservable(this);
  }


  async connect(): Promise<void> {
    await this.wallet.requestPermissions({});
    this.address = await this.wallet.getPKH();
    await Promise.all([
      this.refreshBalance(),
      this.refreshVotingPower(),
    ]);
  }


  async disconnect(): Promise<void> {
    await this.wallet.clearActiveAccount();
    this.address = null;
    this.balance = 0;
    this.votingPower = 0;
    this.winnerCandidate = null;
  }

  async refreshBalance(): Promise<void> {
    if (!this.address) return;
    const mutez = await this.Tezos.tz.getBalance(this.address);
    this.balance = mutez.toNumber() / 1_000_000;
  }

  async refreshVotingPower(): Promise<void> {
    if (!this.address) return;
    const addro = "tz3cqThj23Feu55KDynm7Vg81mCMpWDgzQZq"
    try {
      const url = `https://api.tzkt.io/v1/delegates/${this.address}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      console.log('Response from voting power API:', res);
      const data: { stakingBalance?: number } = await res.json();
      this.votingPower = data.stakingBalance ?? 0;
    } catch (err) {
      console.error('Error fetching voting power:', err);
      this.votingPower = 0;
    }
  }

}

export const walletStore = new WalletStore();
