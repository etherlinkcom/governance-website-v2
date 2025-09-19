import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "@/lib/database";
import { Vote } from "@trilitech/types";

type VotesResponse = {
  votes: Vote[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VotesResponse>
) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const { contractAddress, contractVotingIndex } = req.query;

  if (!contractAddress || typeof contractAddress !== "string") {
    return res
      .status(400)
      .json({ votes: [], error: "Valid contractAddress is required" });
  }

  if (!contractVotingIndex || Number.isNaN(Number(contractVotingIndex))) {
    return res
      .status(400)
      .json({ votes: [], error: "Valid contractVotingIndex is required" });
  }

  try {
    console.log(`[API] Fetching votes for governance`);
    const votes: Vote[] = await database.getVotes(contractAddress, Number(contractVotingIndex));
    console.log(`[API] Found ${votes.length} votes for governance`);
    res.status(200).json({ votes });
  } catch (error) {
    console.error("[API] Error fetching votes:", error);
    res.status(500).json({
      votes: [],
      error: "Failed to fetch contracts",
    });
  }
}
