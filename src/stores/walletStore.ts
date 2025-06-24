import { makeAutoObservable, runInAction } from 'mobx';


//Example store, need to adjust

class WalletStore {
  votingPower: Record<'kernel' | 'sequencer' | 'security', number> = {
    kernel: 0,
    sequencer: 0,
    security: 0
  };

  constructor() {
    makeAutoObservable(this);
  }

  async fetchVotingPower(
    toolkit: any,
    address: string,
    contractAddress: string,
    label: 'kernel' | 'sequencer' | 'security'
  ) {
    if (!toolkit || !address) return;

    try {
      const contract = await toolkit.wallet.at(contractAddress);
      const storage: any = await contract.storage();
      const power = await storage.voting_power.get(address);

      runInAction(() => {
        this.votingPower[label] = power?.toNumber?.() || 0;
      });
    } catch (err) {
      console.error(`[walletStore] Error fetching ${label} voting power:`, err);
    }
  }
}

export const walletStore = new WalletStore();
