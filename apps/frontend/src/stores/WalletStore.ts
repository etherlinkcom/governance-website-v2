import { makeAutoObservable, runInAction } from 'mobx';
import { Contract, Operation, TezosToolkit, TransactionWalletOperation } from '@tezos-x/octez.js';
import { BeaconWallet } from '@tezos-x/octez.js-dapp-wallet';
import { ColorMode, NetworkType } from '@tezos-x/octez.connect-types';
import BigNumber from 'bignumber.js';
import { formatNumber } from '@/lib/formatNumber';
import { VoteOption } from '@trilitech/types';
import toast from 'react-hot-toast';
import { TransactionOperationConfirmation } from '@/types/api';
import { fetchJson } from '@/lib/fetchJson';
import { DelegationRule, fetchDelegationsForAddress } from "@/lib/delegationUtils";

import { contractStore } from './ContractStore';

type VotingPower = {
  ownAmount: BigNumber | null;
  votingAmount: BigNumber | null;
  votingPercent?: BigNumber | null;
}

export type OperationResult = {
  opHash: string;
  level?: number;
  completed?: boolean
}

export class WalletStore {
  private _address: string | null = null;
  private _alias: string | undefined = undefined;
  private balance: number = 0;
  private votingPower: VotingPower | null = null;
  private delegates = new Map<string, VotingPower | null>();
  public canVoteOnAddresses = new Set<string>();
  private voting: boolean = false;

  private Tezos = new TezosToolkit(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.tzkt.io/mainnet");
  private wallet: BeaconWallet;
  private delegatesViewContractAddress: string = process.env.NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT || "KT1Ut6kfrTV9tK967tDYgQPMvy9t578iN7iH";
  private readonly tzktApiUrl: string = process.env.NEXT_PUBLIC_TZKT_API_URL || 'https://api.tzkt.io/v1';

  constructor() {
    this.wallet = new BeaconWallet({
      name: 'Etherlink Governance',
      colorMode: ColorMode.DARK,
      iconUrl: '/favicon.ico',
      preferredNetwork: process.env.NEXT_PUBLIC_NETWORK_TYPE === "mainnet" ?
        NetworkType.MAINNET :
        NetworkType.SHADOWNET
    });
    this.Tezos.setWalletProvider(this.wallet);
    makeAutoObservable(this);

    this.restoreConnection();
  }

  get address(): string | null {
    return this._address;
  }

  get alias(): string | undefined {
    return this._alias;
  }

  get isVoting(): boolean {
    return this.voting;
  }

  get formattedBalance(): string {
    return formatNumber(this.balance);
  }

  get votingPowerAmount(): string {
    return this.votingPower?.votingAmount ? this.votingPower.votingAmount.toString() : '0';
  }

  get formattedVotingAmount(): string {
    return this.votingPower?.votingAmount ? formatNumber(this.votingPower.votingAmount) : '0';
  }

  get hasVotingPower(): boolean {
    return this.votingPower?.votingAmount ? this.votingPower.votingAmount.isGreaterThan(0) : false;
  }

  get formattedVotingPercent(): string {
    return this.votingPower?.votingPercent ? this.votingPower.votingPercent.toPrecision(2) : '0';
  }

  get formattedDelegates(): [string, { votingAmount: string, votingPercent: string }][] {
    return Array.from(this.delegates.entries()).map(([key, value]) => {
      return [key, value ? {
        votingAmount: formatNumber(value.votingAmount || 0),
        votingPercent: value.votingPercent ? value.votingPercent.toPrecision(2) : '0',
      } : {
        votingAmount: '--',
        votingPercent: '--',
      }];
    })
  }

  get allVoterAddresses(): string[] {
    return [
      this._alias,
      ...Array.from(this.delegates.keys())
    ].filter((addr): addr is string => typeof addr === 'string');
  }

  public isVoter(address: string): boolean {
    return this.delegates.has(address) || this._address === address || this.alias === address;
  }

  public isDelegate(address: string): boolean {
    return this.delegates.has(address);
  }

  public canActOn(contractAddress: string): boolean {
    return this.canVoteOnAddresses.has(contractAddress);
  }

  private updateCanVoteOnAddresses(delegations: Map<string, DelegationRule>) {
    this.canVoteOnAddresses.clear();
    const activeContracts: string[] = Object.values(contractStore['activeContracts'] || {}).map(c => c!.contract_address);

    const ownPower: BigNumber | null | undefined = this.votingPower?.ownAmount;
    if (ownPower && ownPower.isGreaterThan(0)) {
      activeContracts.forEach(addr => this.canVoteOnAddresses.add(addr));
      return;
    }

    // If not a baker, check if delegates (bakers who assigned rights to this wallet) have rules
    if (delegations.size === 0) return;

    let hasBakerWithoutRules = false;
    for (const rule of delegations.values()) {
      if (!rule.optAddresses || rule.optAddresses.length === 0) {
        hasBakerWithoutRules = true;
        break;
      }
    }

    if (hasBakerWithoutRules) {
      // At least one delegate gave full access
      activeContracts.forEach(addr => this.canVoteOnAddresses.add(addr));
      return;
    }

    // Parse the response to see which contracts the connected wallet is able to vote on
    for (const rule of delegations.values()) {
      if (rule.isVotingKey) {
        // Whitelist
        rule.optAddresses?.forEach(addr => this.canVoteOnAddresses.add(addr));
      } else {
        // Blacklist
        const blocked = new Set(rule.optAddresses || []);
        activeContracts.forEach(addr => {
          if (!blocked.has(addr)) {
            this.canVoteOnAddresses.add(addr);
          }
        });
      }
    }
  }

  async connect(): Promise<void> {
    await this.wallet.requestPermissions({});
    const address = await this.wallet.getPKH();
    const alias = await fetchJson<{ alias?: string }>(`${this.tzktApiUrl}/accounts/${address}`);
    runInAction(() => {
      this._address = address;
      this._alias = alias.alias || undefined;
    });
    await Promise.all([
      this.refreshBalance(),
      this.refreshVotingPower(),
    ]);
    await this.refreshVotingDelegations();
  }

  async disconnect(): Promise<void> {
    await this.wallet.clearActiveAccount();
    runInAction(() => {
      this.delegates.clear();
      this.canVoteOnAddresses.clear();
      this._alias = undefined;
      this._address = null;
      this.balance = 0;
      this.votingPower = null;
    });
  }

  async refreshBalance(): Promise<void> {
    if (!this._address) return;
    const mutez = await this.Tezos.tz.getBalance(this._address);
    runInAction(() => {
      this.balance = mutez.toNumber();
    });
  }

  async refreshVotingDelegations(): Promise<void> {
    if (!this._address) return;
    try {
      const rules: Map<string, DelegationRule> = await fetchDelegationsForAddress(this._address);
      runInAction(() => this.updateCanVoteOnAddresses(rules));
    } catch (error) {
      console.error("Failed to fetch voting delegations", error);
    }
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
          const data: { totalVotingPower?: number } = await response.json();
          totalVotingPower = new BigNumber(data.totalVotingPower ?? 0);
        }
      } catch (error) {
        totalVotingPower = new BigNumber(0);
      }

      let selfPower: BigNumber = new BigNumber(0);
      let aggregatedVotingPower: BigNumber = new BigNumber(0);
      runInAction(() => this.delegates.clear());

      if (delegates.length > 0) {
        await Promise.allSettled(
          delegates.map(async (delegateAddress) => {
            try {

              const response: Response = await fetch(`${this.tzktApiUrl}/voting/periods/current/voters/${delegateAddress}`);
              if (!response.ok || response.status === 204) {
                runInAction(() => this.delegates.delete(delegateAddress));
                return;
              }

              const data: { votingPower?: number, delegate: { alias?: string } } = await response.json();
              const powerAmount = new BigNumber(data.votingPower ?? 0);
              aggregatedVotingPower = aggregatedVotingPower.plus(powerAmount);

              if (delegateAddress === this._address) selfPower = powerAmount;
              if (delegateAddress === this._address && delegates.length > 1) return;

              const votingPercent: BigNumber = powerAmount.div(totalVotingPower).times(100);
              const delegateVotingPower: VotingPower = {
                ownAmount: powerAmount,
                votingAmount: powerAmount,
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
      }

      runInAction(() => {
        this.votingPower = {
          ownAmount: selfPower,
          votingAmount: new BigNumber(aggregatedVotingPower),
          votingPercent: totalVotingPower.isZero() ? null : aggregatedVotingPower.div(totalVotingPower).times(100),
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
      await this.refreshVotingDelegations();
    }
  }

  async vote(contractAddress: string, voteType: VoteOption): Promise<OperationResult | undefined> {
    if (this.voting) return;
    this.voting = true;
    try {

      const contract = await this.Tezos.wallet.at(contractAddress);
      const operation = await contract.methodsObject.vote(voteType).send();
      const confirmation: TransactionOperationConfirmation | undefined = await operation.confirmation();
      toast.success(`Successfully voted ${voteType}`);
      return { opHash: operation.opHash, level: confirmation?.block.header.level, completed: confirmation?.completed };

    } catch (error) {
      toast.error(`Error voting`);
      console.error(`Error voting ${voteType} for ${contractAddress}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

  async upvoteProposal(contractAddress: string, proposal: string): Promise<OperationResult | undefined> {
    if (this.voting) return;
    this.voting = true;
    try {
      const contract = await this.Tezos.wallet.at(contractAddress);
      let sequencerProposal;

      try {
        const parsed = JSON.parse(proposal);
        if (parsed && parsed.sequencer_pk && parsed.pool_address) {
          sequencerProposal = {
            sequencer_pk: parsed.sequencer_pk,
            pool_address: parsed.pool_address,
          };
        }
      } catch { }

      const operation = await contract.methodsObject.upvote_proposal(sequencerProposal ?? proposal).send();
      const confirmation: TransactionOperationConfirmation | undefined = await operation.confirmation();
      toast.success(`Successfully upvoted proposal`);
      return { opHash: operation.opHash, level: confirmation?.block.header.level, completed: confirmation?.completed };
    } catch (error) {
      toast.error(`Error upvoting proposal`);
      console.error(`Error upvoting proposal for ${contractAddress}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

  async submitSequencerProposal(
    contractAddress: string,
    poolAddress: string,
    sequencerPublicKey: string
  ): Promise<OperationResult | undefined> {
    if (this.voting) return;
    this.voting = true;
    try {

      const contract = await this.Tezos.wallet.at(contractAddress);
      const operation = await contract.methodsObject.new_proposal({
        sequencer_pk: sequencerPublicKey,
        pool_address: poolAddress,
      }).send();

      const confirmation: TransactionOperationConfirmation | undefined = await operation.confirmation();
      toast.success(`Submitted proposal`);
      return { opHash: operation.opHash, level: confirmation?.block.header.level, completed: confirmation?.completed };

    } catch (error) {
      toast.error(`Error submitting sequencer proposal`);
      console.error(`Error submitting sequencer proposal for ${contractAddress}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

  async submitProposal(contractAddress: string, proposal: string): Promise<OperationResult | undefined> {
    if (this.voting) return;
    this.voting = true;
    try {

      const contract = await this.Tezos.wallet.at(contractAddress);
      const operation: TransactionWalletOperation = await contract.methodsObject.new_proposal(proposal).send();
      const confirmation: TransactionOperationConfirmation | undefined = await operation.confirmation();
      toast.success(`Submitted proposal`);
      return { opHash: operation.opHash, level: confirmation?.block.header.level, completed: confirmation?.completed };

    } catch (error) {
      toast.error(`Error submitting proposal`);
      console.error(`Error submitting proposal for ${contractAddress}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

  async claimVotingRights(keyHash: string) {
    if (this.voting) return;
    this.voting = true;
    try {
      const contract = await this.Tezos.wallet.at(this.delegatesViewContractAddress);
      const operation = await contract.methodsObject.claim_voting_rights(keyHash).send();
      await operation.confirmation();
      toast.success(`Successfully claimed voting rights`);
      return operation.opHash;
    } catch (error) {
      toast.error(`Error claiming voting rights`);
      console.error(`Error claiming voting rights for ${keyHash}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

  async proposeVotingKey(votingKey: string, isVotingKey: boolean, optAddresses: string[] | null) {
    if (this.voting) return;
    this.voting = true;
    try {
      const contract = await this.Tezos.wallet.at(this.delegatesViewContractAddress);
      const operation = await contract.methodsObject.propose_voting_key({
        0: votingKey,
        1: isVotingKey,
        2: optAddresses
      }).send();
      await operation.confirmation();
      toast.success(`Successfully proposed voting key`);
      return operation.opHash;
    } catch (error) {
      toast.error(`Error proposing voting key`);
      console.error(`Error proposing voting key for ${votingKey}: ${error}`);
    } finally {
      this.voting = false;
    }
  }

}

let walletStore: WalletStore | null = null;

export function getWalletStore() {
  if (typeof window === 'undefined') return null;
  if (!walletStore) walletStore = new WalletStore();
  return walletStore;
}