import { Baker, ContractOperation, PayloadKey, Proposal, ProposalPeriod, TzktContractOperation, TzktTezosPeriodInfo, TzktVoter, Upvoter } from "@/stores/types";
export interface ProcessedProposal {
  readonly key: PayloadKey;
  readonly proposer: string;
  readonly upvotesVotingPower: bigint;
}


//// upvoters_proposals bigmap id to get
//// pass ^ into tzkt API


/**
 * Proposal 1
 * Time of proposal 1 get from txHash new_proposal
 * Time for promotion 1
 * tzkt to get the winner
 *
 *
 Get all proposals from contract
 Get time of proposal by tzkt? ticket hash?
 Get all upvoters for each proposal
 */


export interface TzktBigMapEntry<K, V> {
  key: K;
  value: V;
}

 async function fetchJson<T>(
    endpoint: string,
    params?: Record<string, string>,
    fetchParams: RequestInit = { cache: 'no-store' }
  ): Promise<T> {
    //TODO: improve
    let url = endpoint;
    if (params)
      url = `${url}?${new URLSearchParams(params).toString()}`;

    const res = await fetch(url, fetchParams);
    return await res.json() as T;
  }

const API_TZKT_URL: string = 'https://api.tzkt.io'

async function getBigMapEntries<K, V>(id: string): Promise<Array<TzktBigMapEntry<K, V>>> {
    const url = `${API_TZKT_URL}/v1/bigmaps/${id}/keys`;
    return fetchJson(url, { select: 'key,value' });
  }

export async function getProposals(proposalPeriod: ProposalPeriod): Promise<ProcessedProposal[]> {
    let proposals: ProcessedProposal[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await getBigMapEntries<PayloadKey, Proposal>(proposalPeriod.proposals.toString());
      proposals = rawEntries.map(({ key, value }) => ({
        key: mapPayloadKey(key),
        proposer: value.proposer,
        upvotesVotingPower: BigInt(value.upvotes_voting_power.toString())
      } as ProcessedProposal));
    }

    return proposals.toSorted((a, b) => {
        return b.upvotesVotingPower > a.upvotesVotingPower ?
            1 : b.upvotesVotingPower < a.upvotesVotingPower ? -1 :
            0
    });
  }


  export const mapPayloadKey = (michelsonKey: PayloadKey): PayloadKey => {
  if (typeof michelsonKey === 'string')
    return michelsonKey;

  return {
    pool_address: michelsonKey.pool_address,
    sequencer_pk: michelsonKey.sequencer_pk
  }
}

  async function getContractOperations(
    address: string,
    entrypoints: string[],
    startLevel: number,
    endLevel: number
    ): Promise<ContractOperation[]> {
        const url = `${API_TZKT_URL}/v1/operations/transactions`;
        const params = {
        target: address,
        'entrypoint.in': entrypoints.join(','),
        'level.ge': startLevel.toString(),
        'level.le': endLevel.toString(),
        'select': 'hash,timestamp,sender,parameter'
        };
        const rawResult = await fetchAllChunks<TzktContractOperation>(url, 100, params);
        return rawResult.map(r => ({
            hash: r.hash,
            sender: r.sender,
            time: new Date(r.timestamp),
            parameter: r.parameter
        }))
  }


  export async function getUpvoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]> {
    const [
      operations,
      bakers
    ] = await Promise.all([
      getContractOperations(contractAddress, ['new_proposal', 'upvote_proposal'], periodStartLevel, periodEndLevel),
      getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

    return operations.map(o => {
      const baker = bakersMap.get(o.sender.address);

      return {
        address: o.sender.address,
        alias: o.sender.alias,
        proposalKey: mapPayloadKey(o.parameter.value),
        votingPower: baker!.votingPower,
        operationHash: o.hash,
        operationTime: o.time
      } as Upvoter
    });
  }

async function getBakers(level: number): Promise<Baker[]> {
    const votingPeriod = await getTezosVotingPeriod(level);
    const index = votingPeriod.index;
    const url = `${API_TZKT_URL}/v1/voting/periods/${index}/voters`;
    const rawResult = await fetchAllChunks<TzktVoter>(url, 100);
    return rawResult.map(r => ({
      address: r.delegate.address,
      alias: r.delegate.alias,
      votingPower: BigInt(r.votingPower.toString()),
    }) as Baker)
  }

 async function getTezosVotingPeriod(level: number): Promise<TzktTezosPeriodInfo> {
    const url = `${API_TZKT_URL}/v1/voting/periods`;
    const params = {
      'firstLevel.le': level.toString(),
      'lastLevel.ge': level.toString(),
    };
    const periods: TzktTezosPeriodInfo[] = await fetchJson<TzktTezosPeriodInfo[]>(url, params);
    const result = periods[0];

    if (result === undefined) {
      return await getClosestVotingPeriodFallback(level);
    }

    return result;
  }


async function fetchAllChunks<T>(url: string, limit: number, params?: Record<string, string>): Promise<T[]> {
    let offset = 0;
    let chunk: T[] = [];
    let result: T[] = [];
    do {
      chunk = await fetchJson<T[]>(url, { ...params, limit: limit.toString(), offset: offset.toString() });
      result.push(...chunk)
      offset += limit;
    } while (chunk.length)
    return result;
  }

  async function getClosestVotingPeriodFallback(level: number): Promise<TzktTezosPeriodInfo> {
    const currentLevel = await getCurrentBlockLevel();
    if (level < currentLevel)
      throw new Error(`Impossible to find tezos voting period for level ${level.toString()}`);

    const url = `${API_TZKT_URL}/v1/voting/periods/current`;
    const period: TzktTezosPeriodInfo = await fetchJson<TzktTezosPeriodInfo>(url);

    if (period === undefined)
      throw new Error(`Impossible to find current tezos voting period for level`);

    return period;
  }

  async function getCurrentBlockLevel(): Promise<number> {
    const url = `${API_TZKT_URL}/v1/head`;
    return (await fetchJson(url, undefined, { next: { revalidate: 10 } }) as any).level;
  }