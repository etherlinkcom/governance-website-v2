import { observer } from "mobx-react-lite";
import { Box, Typography } from "@mui/material";
import { contractStore, LoadingState } from "@/stores/ContractStore";
import { PastPeriodsList, PeriodsListSkeleton } from "@/components/past/PastPeriodList";
import { FrontendPeriod } from "@/types/api";

export const Past = observer(() => {
  const pastPeriodsData: FrontendPeriod[] | undefined = contractStore.pastPeriodsData;

  const loadingState: LoadingState = contractStore.statePastPeriods;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Past Periods
      </Typography>
      {loadingState === "loading" || !loadingState ? (
        <PeriodsListSkeleton />
      ) : pastPeriodsData && pastPeriodsData.length > 0 ? (
        <PastPeriodsList periods={pastPeriodsData} />
      ) : (
        <Typography color="text.secondary">
          No past periods found.
        </Typography>
      )}
    </Box>
  );
});