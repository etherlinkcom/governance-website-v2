import { Box, Button, Typography } from "@mui/material";
import { FrontendPeriod } from "@/types/api";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { TimeRemaining } from "@/components/current/TimeRemaining";
import { getWalletStore } from "@/stores/WalletStore";
import { SubmitProposalButton } from "./SubmitProposalModal";
import { GovernanceType } from "@trilitech/types";

interface EmptyCurrentPeriodProps {
  currentPeriod: FrontendPeriod;
}

export const EmptyCurrentPeriod = ({
  currentPeriod,
}: EmptyCurrentPeriodProps) => {
    const walletStore = getWalletStore();

    const handleButtonClick = async () => {
        if (!walletStore) return;
        if (!walletStore?.address) {
            await walletStore.connect();
            return;
        }
    }

  return (
    <Box sx={{ p: 3, height: 600 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
          <PeriodDateAndLevels period={currentPeriod} />
        <Box>
          <TimeRemaining currentPeriod={currentPeriod} />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" sx={{ mb: 3, textAlign: "left" }}>
          No Proposals Currently
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "left" }}>
          <SubmitProposalButton
            contractAddress={currentPeriod.contract}
            governanceType={currentPeriod.governance as GovernanceType}
            contractVotingIndex={currentPeriod.contract_voting_index}
          />
        </Box>
      </Box>
    </Box>
  );
};
