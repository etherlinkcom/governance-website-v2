import { contractStore, LoadingState } from "@/stores/ContractStore";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FuturePeriodCard, FuturePeriodListSkeleton } from "@/components/future/FuturePeriodCard";
import { FuturePeriod } from "@/types/api";

export const Future = observer(() => {
  const loadingState: LoadingState = contractStore.stateFuturePeriods;
  const futurePeriods: FuturePeriod[] | undefined = contractStore.futurePeriodsData;

  // TODO skeleton
  if (loadingState === "loading" || !loadingState) return <FuturePeriodListSkeleton />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {futurePeriods?.map((period, key) => (
        <FuturePeriodCard key={key} futurePeriod={period} />
      ))}
    </Box>
  );
});
