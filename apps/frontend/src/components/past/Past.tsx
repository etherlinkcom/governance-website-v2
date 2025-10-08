import { observer } from "mobx-react-lite";
import { Box, Typography } from "@mui/material";
import { contractStore } from "@/stores/ContractStore";
import { PastPeriodsList } from "@/components/past/PastPeriodList";
import { FrontendPeriod } from "@/types/api";

export const Past = observer(() => {
  const pastPeriodsData: FrontendPeriod[] | undefined = contractStore.pastPeriodsData;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Past Periods
      </Typography>
      {pastPeriodsData && pastPeriodsData.length > 0 ? (
        <PastPeriodsList periods={pastPeriodsData} />
      ) : (
        <Typography color="text.secondary">
          No past periods found.
        </Typography>
      )}
    </Box>
  );
});