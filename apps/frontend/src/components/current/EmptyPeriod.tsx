import { Box, Typography, Button } from "@mui/material";
import { getWalletStore } from "@/stores/WalletStore";
import { observer } from "mobx-react-lite";

export const EmptyPeriod = observer(() => {
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
          {
            walletStore?.address ?
            "Submit Proposal" :
            "Connect"
            }
        </Button>
      </Box>
    </Box>
  );
});
