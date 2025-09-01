import { contractStore } from "@/stores/ContractStore";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FuturePeriodCard } from "@/components/future/FuturePeriodCard";

export const Future = observer(() => {
  const isLoading = contractStore.isLoadingFuturePeriods;
  const futurePeriods = contractStore.futurePeriodsData;
  console.log({futurePeriods})

  if (isLoading) return <>Loading...</>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {futurePeriods?.map((period, key) => (
        <FuturePeriodCard key={key} futurePeriod={period} />
      ))}
    </Box>
  );
});
