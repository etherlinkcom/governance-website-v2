import { makeAutoObservable } from 'mobx';
import { TezosToolkit } from '@taquito/taquito';

export class ContractStore {
  contractAddresses: Record<'kernel' | 'sequencer' | 'security', string> = {
    kernel: '',
    sequencer: '',
    security: '',
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
  Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev');

  constructor() {
    makeAutoObservable(this);
  }

  setAddress(label: 'kernel' | 'sequencer' | 'security', address: string) {
    this.contractAddresses[label] = address;
  }

  async fetchProposals(label: 'kernel' | 'sequencer' | 'security') {
    const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
    const storage: any = await contract.storage();
    const proposals = await storage.proposals.entries();
    this.proposals[label] = proposals.map(([key, value]: any) => ({ hash: key, ...value }));
  }

  async fetchVoters(label: 'kernel' | 'sequencer' | 'security') {
    const contract = await this.Tezos.contract.at(this.contractAddresses[label]);
    const storage: any = await contract.storage();
    const entries = await storage.voting_power.entries();
    this.votingPowerMap[label] = Object.fromEntries(entries.map(([addr, val]: any) => [addr, val.toNumber()]));
    this.voters[label] = Object.keys(this.votingPowerMap[label]);
  }

  async vote(label: 'kernel' | 'sequencer' | 'security', kernelHash: string, voteType: 'yea' | 'nay' | 'pass') {
    const contract = await this.Tezos.wallet.at(this.contractAddresses[label]);
    const op = await contract.methods.vote(voteType, kernelHash).send();
    await op.confirmation();
  }
}

export const contractStore = new ContractStore();