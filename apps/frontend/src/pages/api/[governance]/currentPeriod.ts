import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/database';
import { GovernanceType } from '@trilitech/types';
import { FrontendPeriod } from '@/types/api';

type ContractsResponse = {
  currentPeriod: FrontendPeriod | null;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContractsResponse>
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { governance } = req.query;
  if (!governance || typeof governance !== 'string') {
    return res.status(400).json({
      currentPeriod: null,
      error: 'Invalid governance type'
    });
  }

  try {
    console.log(`[API] Fetching contracts for governance`);

    const currentPeriod: FrontendPeriod | null = await database.getCurrentPeriod(governance as GovernanceType);
    console.log(`[API] Found ${currentPeriod}`);

    res.status(200).json({currentPeriod});

  } catch (error) {

    console.error('[API] Error fetching contracts:', error);
    res.status(500).json({
      currentPeriod: null,
      error: 'Failed to fetch contracts'
    });

  }
}