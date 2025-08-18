import { observer } from "mobx-react-lite";
import {
  Box,
  Typography,
  Card,
} from "@mui/material";
import { contractStore } from "@/stores/ContractStore";
import { EmptyCurrentPeriod } from "@/components/current/EmptyCurrentPeriod";
import { ProposalView } from "@/components/proposal/ProposalView";
import { PromotionView } from "@/components/promotion/PromotionView";

export const Current = observer(() => {
  const currentPeriod = contractStore.currentPeriodData;
  const isLoading = contractStore.isLoadingCurrentPeriod;

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", mx: "auto"}}>
        <Card sx={{ p: 1, height: "600px", borderRadius: "16px" }}>
          <Typography>Loading current period...</Typography>
        </Card>
      </Box>
    );
  }

  if (!currentPeriod) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Empty Period
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mx: "auto" }}>
      <Card sx={{ height: "auto", borderRadius: "16px" }}>
          {currentPeriod.proposals && currentPeriod.proposals.length > 0 ? (
            <ProposalView period={currentPeriod} isCurrent />
          ) : currentPeriod.promotion ? (
            <PromotionView period={currentPeriod} isCurrent />
          ) : (
              <EmptyCurrentPeriod currentPeriod={currentPeriod} />
          )}
      </Card>
    </Box>
  );
});
