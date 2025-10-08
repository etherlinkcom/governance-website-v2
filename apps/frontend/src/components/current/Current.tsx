import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
} from "@mui/material";
import { contractStore } from "@/stores/ContractStore";
import { EmptyCurrentPeriod } from "@/components/current/EmptyCurrentPeriod";
import { ProposalView } from "@/components/proposal/ProposalView";
import { PromotionView } from "@/components/promotion/PromotionView";
import { ComponentLoading } from "../shared/ComponentLoading";
import { FrontendPeriod } from "@/types/api";

export const Current = observer(() => {
  const currentPeriod: FrontendPeriod | undefined = contractStore.currentPeriodData;
  const isLoading: boolean = contractStore.isLoadingCurrentPeriod;

  if (isLoading || !currentPeriod) {
    return (
      <Box sx={{ width: "100%", mx: "auto"}}>
        <Card sx={{ p: 3, height: "600px", borderRadius: "16px" }}>
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "flex-start", sm: "space-between" },
            alignItems: "center"
          }}>
          <Box sx={{width: "100%"}}>
            <ComponentLoading width={400} height={24} sx={{width: { xs: "80%", sm: "400px" }}} />
            <ComponentLoading width={300} height={24} sx={{width: { xs: "70%", sm: "300px" }}} />
          </Box>
          <ComponentLoading width={190} height={22} sx={{width: { xs: "100%", sm: "190px" }}} />
          </Box>
          <ComponentLoading width={250} height={22} sx={{mt:3, width: { xs: "50%", sm: "250px" }}} />
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mx: "auto" }}>
      <Card sx={{ height: "auto", minHeight: 600, borderRadius: "16px", boxShadow: 'none', backgroundColor: 'transparent' }}>
          {currentPeriod.proposals && currentPeriod.proposals.length > 0 ? (
            <ProposalView period={currentPeriod} />
          ) : currentPeriod.promotion ? (
            <PromotionView period={currentPeriod} />
          ) : (
            <EmptyCurrentPeriod currentPeriod={currentPeriod} />
          )}
      </Card>
    </Box>
  );
});
