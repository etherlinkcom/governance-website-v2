import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "@/lib/database";
import { Upvote, Vote } from "@trilitech/types";

type UpvotesResponse = {
  upvotes: Upvote[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpvotesResponse>
) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const { proposalHash } = req.query;

  if (!proposalHash || typeof proposalHash !== "string") {
    return res
      .status(400)
      .json({ upvotes: [], error: "Valid proposalHash is required" });
  }

  try {
    console.log(`[API] Fetching upvotes for governance`);
    const upvotes: Upvote[] = await database.getUpvotes(proposalHash);
    console.log(`[API] Found ${upvotes.length} upvotes for governance`);
    res.status(200).json({ upvotes });
  } catch (error) {
    console.error("[API] Error fetching upvotes:", error);
    res.status(500).json({
      upvotes: [],
      error: "Failed to fetch contracts",
    });
  }
}
