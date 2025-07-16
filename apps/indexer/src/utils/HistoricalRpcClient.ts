import { ContractResponse, RpcClient } from "@taquito/rpc";

export class HistoricalRpcClient extends RpcClient {
  private blockLevel: number;

  constructor(url: string, blockLevel: number) {
    super(url);
    this.blockLevel = blockLevel;
  }

  setBlockLevel(blockLevel: number) {
    this.blockLevel = blockLevel;
  }

  getContract(address: string, _?: { block: string; } | undefined): Promise<ContractResponse> {
    return super.getContract(address, { block: this.blockLevel.toString(10) })
  }

}