import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/database';
import { ContractAndConfig } from '@trilitech/types';

type ContractsResponse = {
  contracts: ContractAndConfig[];
  error?: string;
}

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<ContractsResponse>
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    console.log(`[API] Fetching contracts for governance`);
    const contracts: ContractAndConfig[] = await database.getContracts();
    console.log(`[API] Found ${contracts.length} contracts for governance`);
    res.status(200).json({contracts});
  } catch (error) {
    console.error('[API] Error fetching contracts:', error);
    res.status(500).json({
      contracts: [],
      error: 'Failed to fetch contracts'
    });
  }
}