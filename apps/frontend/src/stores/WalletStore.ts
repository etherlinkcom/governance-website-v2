import { makeAutoObservable, runInAction } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { ColorMode } from '@airgap/beacon-types';

export class WalletStore {
  address: string | null = null;
  balance: number = 0;
  votingPower: number = 0;

  // TODO env var
  private Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');
  private wallet: BeaconWallet;
  private delegatesViewContractAddress: string = process.env.NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT!;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  constructor() {
    this.wallet = new BeaconWallet({
        name: 'Etherlink Governance App',
        colorMode: ColorMode.DARK,
        iconUrl: '/favicon.ico',
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
        const res = await fetch(url);
        const raw = await res.text();
        if (res.ok && raw.trim() !== '') {
          const data = JSON.parse(raw);
          const staking = data.stakingBalance ?? 0;
          runInAction(() => {
            this.votingPower = ownLiquid + staking;
          });
          return;
        }
        // nothing available
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
            const r = await fetch(`${this.tzktApiUrl}/delegates/${delegateAddress}`);
            if (r.ok) {
              const d = await r.json();
              staking = d.stakingBalance ?? 0;
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
        const res = await fetch(`${this.tzktApiUrl}/delegates/${address}`);
        if (res.ok) {
          const data = await res.json();
          ownStaking = data.stakingBalance ?? 0;
        }
      } catch {}

      // total voting power = own liquid + sum of delegators + own staking
      runInAction(() => {
        this.votingPower = ownLiquid + delegateTotals.reduce((sum, v) => sum + v, 0) + ownStaking;
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
}

let walletStore: WalletStore | null = null;

export function getWalletStore() {
  if (typeof window === 'undefined') return null;
  if (!walletStore) walletStore = new WalletStore();
  return walletStore;
}