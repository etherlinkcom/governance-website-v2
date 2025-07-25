import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/database';
import { GovernanceType, ContractAndConfig } from '@trilitech/types';

type ContractsResponse = {
  contracts: ContractAndConfig[];
  governanceType: GovernanceType;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContractsResponse>
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({
      contracts: [],
      governanceType: 'slow',
      error: 'Method not allowed'
    });
  }

  try {
    const { type } = req.query;
    const governanceType = type as GovernanceType;

    if (!['slow', 'fast', 'sequencer'].includes(governanceType)) {
      return res.status(400).json({
        contracts: [],
        governanceType: 'slow',
        error: 'Invalid governance type. Must be slow, fast, or sequencer.'
      });
    }

    console.log(`[API] Fetching contracts for ${governanceType} governance`);

    const contracts = await database.getContracts(governanceType);

    console.log(`[API] Found ${contracts.length} contracts for ${governanceType}`);

    res.status(200).json({
      contracts,
      governanceType
    });

  } catch (error) {
    console.error('[API] Error fetching contracts:', error);
    res.status(500).json({
      contracts: [],
      governanceType: 'slow',
      error: 'Failed to fetch contracts'
    });
  }
}