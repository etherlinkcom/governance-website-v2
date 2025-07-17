import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/database';
import { Period } from '@trilitech/types';

type PeriodsResponse = {
  periods: Period[];
  contractAddress: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PeriodsResponse>
) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({
      periods: [],
      contractAddress: '',
      error: 'Method not allowed'
    });
  }

  try {
    const { contract } = req.query;
    const contractAddress = contract as string;

    // Validate contract address
    if (!contractAddress || typeof contractAddress !== 'string') {
      return res.status(400).json({
        periods: [],
        contractAddress: '',
        error: 'Contract address is required'
      });
    }

    console.log(`[API] Fetching periods for contract ${contractAddress}`);

    const periods = await database.getPeriods(contractAddress);

    console.log(`[API] Found ${periods.length} periods for contract ${contractAddress}`);

    res.status(200).json({
      periods,
      contractAddress
    });

  } catch (error) {
    console.error('[API] Error fetching periods:', error);
    res.status(500).json({
      periods: [],
      contractAddress: '',
      error: 'Failed to fetch periods'
    });
  }
}