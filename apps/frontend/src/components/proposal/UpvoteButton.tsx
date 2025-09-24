"use client";

import { Button, CircularProgress } from "@mui/material";
import { getWalletStore, OperationResult } from "@/stores/WalletStore";
import { contractStore } from "@/stores/ContractStore";
import { ContractAndConfig } from "@trilitech/types";
import { useState } from "react";

interface VoteButtonProps {
  proposalHash: string;
  contractVotingIndex: number;
}

export const UpvoteButton = ({ proposalHash, contractVotingIndex }: VoteButtonProps) => {
  const walletStore = getWalletStore();
  const contract: ContractAndConfig | undefined = contractStore.currentContract;
  const isCurrentPeriod: boolean = contractStore.currentPeriodData?.contract_voting_index === contractVotingIndex;

  const isUpvoting = walletStore?.isVoting;
  const [loading, setLoading] = useState(false);

  const handleUpvote = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!contract || !walletStore) return;
    setLoading(true);
    try {
      const operation: OperationResult | undefined = await walletStore.upvoteProposal(
        contract.contract_address,
        proposalHash
      );

      if (!operation?.completed) return;
      contractStore.createUpvote(
        operation?.level || 0,
        proposalHash,
        walletStore.address || '',
        walletStore.alias,
        walletStore.votingPowerAmount,
        operation?.opHash || '',
        contract.contract_address,
        contractVotingIndex,
      );
    } catch (error) {
      console.error('Error upvoting proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isCurrentPeriod || !walletStore?.hasVotingPower) return null;

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={handleUpvote}
      disabled={isUpvoting || loading}
      sx={{ mt: 1, minWidth: 97 }}
    >
      {isUpvoting || loading ? (
        <CircularProgress size="20px" sx={{ color: theme => theme.palette.primary.main }} />
      ) : (
        'Upvote'
      )}
    </Button>
  );
};