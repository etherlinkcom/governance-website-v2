import { fetchJson } from "@/lib/fetchJson";

export interface DelegationRule {
    isVotingKey: boolean;
    optAddresses: string[] | null;
}

export interface DelegationInfo {
    bool?: boolean;
    set?: string[];
    is_voting_key?: boolean;
    opt_addresses?: string[];
    '0'?: boolean;
    '1'?: string[];
}

export interface TzktBigMapKey {
    active: boolean;
    hash: string;
    id: number;
    key: string;
    value: {
        [bakerAddress: string]: DelegationInfo | null;
    };
}

export async function fetchDelegationsForAddress(
    votingKey: string,
): Promise<Map<string, DelegationRule>> {
    const tzktApiUrl: string = process.env.NEXT_PUBLIC_TZKT_API_URL!
    const delegateContractAddress: string = process.env.NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT!

    const url: string = `${tzktApiUrl}/contracts/${delegateContractAddress}/bigmaps/voting_delegations/keys?key=${votingKey}`;
    const data: TzktBigMapKey[] = await fetchJson<TzktBigMapKey[]>(url);
    const rulesMap: Map<string, DelegationRule> = new Map<string, DelegationRule>();

    if (!data || data.length === 0 || !data[0].value) {
        return rulesMap;
    }

    const valueMap: { [bakerAddress: string]: DelegationInfo | null } = data[0].value;
    for (const [baker, info] of Object.entries(valueMap)) {
        if (!info) continue;

        const isVotingKey: boolean = (info.bool ?? info.is_voting_key ?? info['0']) === true;
        const optAddresses: string[] | null = info.set ?? info.opt_addresses ?? info['1'] ?? null;

        rulesMap.set(baker, { isVotingKey, optAddresses });
    }

    return rulesMap;
}
