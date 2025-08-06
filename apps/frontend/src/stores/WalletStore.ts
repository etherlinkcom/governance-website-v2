import { makeAutoObservable, runInAction } from 'mobx';
import { Contract, TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { ColorMode } from '@airgap/beacon-types';
import BigNumber from 'bignumber.js';
import { formatNumber } from '@/lib/formatNumber';


export type VotingPower = {
  votingAmount: BigNumber | null;
  votingPercent?: BigNumber | null;
}

export class WalletStore {
  private _address: string | null = null;
  private balance: number = 0;
  private votingPower: VotingPower | null = null;
  private delegates = new Map<string, VotingPower | null>();

  private Tezos = new TezosToolkit('https://mainnet.tezos.ecadinfra.com');
  private wallet: BeaconWallet;
  private delegatesViewContractAddress: string = process.env.NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT!;
  private readonly tzktApiUrl: string = 'https://api.tzkt.io/v1';

  constructor() {
    this.wallet = new BeaconWallet({
      name: 'Etherlink Governance',
        colorMode: ColorMode.DARK,
        iconUrl: '/favicon.ico',
    });
    this.Tezos.setWalletProvider(this.wallet);
    makeAutoObservable(this);

    this.restoreConnection();
  }

  get address(): string | null{
    return this._address;
  }

  get formattedBalance(): string {
    return formatNumber(this.balance);
  }

  get formattedVotingAmount(): string {
    return this.votingPower?.votingAmount ? formatNumber(this.votingPower.votingAmount) : '0';
  }

  get formattedVotingPercent(): string {
    return this.votingPower?.votingPercent ? this.votingPower.votingPercent.toPrecision(2) : '0';
  }

  get formattedDelegates(): [string, { votingAmount: string, votingPercent: string }][] {
    return Array.from(this.delegates.entries()).map(([key, value]) => {
      return [key, value ? {
        votingAmount: formatNumber(value.votingAmount || 0),
        votingPercent: value.votingPercent ? value.votingPercent.toPrecision(2) : '0',
      }: {
        votingAmount: '--',
        votingPercent: '--',
      }];
    })
  }

  async connect(): Promise<void> {
    await this.wallet.requestPermissions({});
    const address = await this.wallet.getPKH();
    runInAction(() => {
      this._address = address;
    });
    await Promise.all([
      this.refreshBalance(),
      this.refreshVotingPower(),
    ]);
  }

  async disconnect(): Promise<void> {
    await this.wallet.clearActiveAccount();
    runInAction(() => {
      this._address = null;
      this.balance = 0;
      this.votingPower = null;
    });
  }

  async refreshBalance(): Promise<void> {
    if (!this._address) return;
    const mutez = await this.Tezos.tz.getBalance(this._address);
    runInAction(() => {
      this.balance = mutez.toNumber() / 1_000_000;
    });
  }

  async refreshVotingPower(): Promise<void> {
    if (!this._address) return;

    try {

      const contract: Contract = await this.Tezos.contract.at(this.delegatesViewContractAddress);
      const view = contract.contractViews.list_voters({
        0: this._address,
        1: null
      });
      const delegates: string[] = await view.executeView({ viewCaller: this._address });
      delegates.unshift(this._address);

      let totalVotingPower: BigNumber = new BigNumber(0);
      try {
        const response: Response = await fetch(`${this.tzktApiUrl}/voting/periods/current`);
        if (response.ok) {
          const data: {totalVotingPower?: number} = await response.json();
          totalVotingPower = new BigNumber(data.totalVotingPower ?? 0);
        }
      } catch (error) {
        totalVotingPower = new BigNumber(0);
      }

      let ownVotingPower: BigNumber = new BigNumber(0);
      runInAction(() => this.delegates.clear());

      await Promise.allSettled(
        delegates.map(async (delegateAddress) => {
          try {

            const response: Response = await fetch(`${this.tzktApiUrl}/voting/periods/current/voters/${delegateAddress}`);
            if (!response.ok || response.status === 204) {
              runInAction(() => this.delegates.delete(delegateAddress));
              return;
            }

            const data: { votingPower?: number, delegate: { alias?: string} } = await response.json();
            ownVotingPower = ownVotingPower.plus(data.votingPower ?? 0);

            if (delegateAddress === this._address && delegates.length > 1) return;

            const votingPercent: BigNumber = new BigNumber(data.votingPower ?? 0).div(totalVotingPower).times(100);
            const delegateVotingPower: VotingPower = {
              votingAmount: new BigNumber(data.votingPower ?? 0),
              votingPercent: votingPercent.isNaN() ? null : votingPercent,
            }

            runInAction(() => {
              this.delegates.set(data.delegate.alias ?? delegateAddress, delegateVotingPower)
            });

          } catch (error) {
            if (delegateAddress === this._address) return;
            runInAction(() => this.delegates.set(delegateAddress, null));
          }
        })
      );

      runInAction(() => {
        this.votingPower = {
          votingAmount: new BigNumber(ownVotingPower),
          votingPercent: totalVotingPower.isZero() ? null : ownVotingPower.div(totalVotingPower).times(100),
        };
      });

    } catch (error) {
      runInAction(() => this.votingPower = null);
    }
  }

  async restoreConnection() {
    const activeAccount = await this.wallet.client.getActiveAccount();
    if (activeAccount) {
      const address = await this.wallet.getPKH();
      runInAction(() => {
        this._address = address;
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