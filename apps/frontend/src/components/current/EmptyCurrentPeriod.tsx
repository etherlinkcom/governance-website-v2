import { Box, Button, Typography } from "@mui/material";
import { FrontendPeriod } from "@/types/api";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { TimeRemaining } from "@/components/current/TimeRemaining";
import { getWalletStore } from "@/stores/WalletStore";

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
        // await walletStore.submitProposal();
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
        <Box>
          <PeriodDateAndLevels period={currentPeriod} />
          <TimeRemaining currentPeriod={currentPeriod} />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" sx={{ mb: 3, textAlign: "left" }}>
          No Proposals Currently
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "left" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => handleButtonClick()}
          >
            {walletStore?.address ? "Submit Proposal" : "Connect"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
