// import type { NextApiRequest, NextApiResponse } from 'next';
// import { database } from '@/lib/database';

// type PeriodDetailsResponse = {
//   proposals?: any[];
//   upvotes?: any[];
//   promotions?: any[];
//   votes?: any[];
//   periodInfo: {
//     contractAddress: string;
//     contractVotingIndex: number;
//     hasProposals: boolean;
//     hasPromotions: boolean;
//   };
//   error?: string;
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<PeriodDetailsResponse>
// ) {
//   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');

//   if (req.method !== 'GET') {
//     return res.status(405).json({
//       periodInfo: {
//         contractAddress: '',
//         contractVotingIndex: 0,
//         hasProposals: false,
//         hasPromotions: false,
//       },
//       error: 'Method not allowed'
//     });
//   }

//   try {
//     const { address, periodIndex } = req.query;
//     const contractAddress = address as string;
//     const contractVotingIndex = parseInt(periodIndex as string);

//     if (!contractAddress || typeof contractAddress !== 'string') {
//       return res.status(400).json({
//         periodInfo: {
//           contractAddress: '',
//           contractVotingIndex: 0,
//           hasProposals: false,
//           hasPromotions: false,
//         },
//         error: 'Contract address is required'
//       });
//     }

//     if (isNaN(contractVotingIndex)) {
//       return res.status(400).json({
//         periodInfo: {
//           contractAddress,
//           contractVotingIndex: 0,
//           hasProposals: false,
//           hasPromotions: false,
//         },
//         error: 'Period index must be a valid number'
//       });
//     }

//     console.log(`[API] Fetching details for contract ${contractAddress}, period ${contractVotingIndex}`);

//     const periodDetails: PeriodDetailsResponse = await database.getPeriodDetails(contractAddress, contractVotingIndex);

//     console.log(`[API] Found period details for contract ${contractAddress}, period ${contractVotingIndex}`);

//     res.status(200).json(periodDetails);

//   } catch (error) {
//     console.error('[API] Error fetching period details:', error);
//     res.status(500).json({
//       periodInfo: {
//         contractAddress: '',
//         contractVotingIndex: 0,
//         hasProposals: false,
//         hasPromotions: false,
//       },
//       error: 'Failed to fetch period details'
//     });
//   }
// }