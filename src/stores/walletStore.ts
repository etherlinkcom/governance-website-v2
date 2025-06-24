import { makeAutoObservable } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

export class WalletStore {
  address: string | null = null;
  balance: number = 0;
  votingPower: Record<string, number> = {};

  Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');
  wallet = new BeaconWallet({ name: 'Governance App' });

  constructor() {
    makeAutoObservable(this);
    this.Tezos.setWalletProvider(this.wallet);
  }

  async connectWallet() {
    await this.wallet.requestPermissions();
    this.address = await this.wallet.getPKH();
    await this.fetchBalance();
  }

  async fetchBalance() {
    if (!this.address) return;
    const balance = await this.Tezos.tz.getBalance(this.address);
    this.balance = balance.toNumber() / 1_000_000;
  }

  async fetchVotingPower(contractAddress: string, label: 'kernel' | 'sequencer' | 'security') {
    if (!this.address) return;
    const contract = await this.Tezos.contract.at(contractAddress);
    const storage: any = await contract.storage();
    const power = await storage.voting_power.get(this.address);
    this.votingPower[label] = power?.toNumber?.() || 0;
  }
}

export const walletStore = new WalletStore();