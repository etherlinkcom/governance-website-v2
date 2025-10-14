"use client";

import { Card, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { contractStore } from "@/stores/ContractStore";
import { observer } from "mobx-react-lite";
import { FuturePeriod } from "@/types/api";
import { formatDate } from "@/lib/formatDate";

interface FuturePeriodCardProps {
  futurePeriod: FuturePeriod;
}

export const FuturePeriodCard = observer(({ futurePeriod }: FuturePeriodCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoading = contractStore.isLoadingFuturePeriods;

  if (isLoading) return <>Loading...</>;

  return (
    <Card variant="outlined" sx={{ py: 1, px: 2 }}>
      <Box sx={{ display: "flex-column", gap:2, justifyContent: "flex-start", alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          {isMobile ? (
            `${formatDate(futurePeriod.startDateTime, false)} - ${formatDate(futurePeriod.endDateTime, false)}`
          ) : (
            `Start ${formatDate(futurePeriod.startDateTime)} - End ${formatDate(futurePeriod.endDateTime)}`
          )}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          // sx={{ display: { xs: "none", sm: "block" } }}
        >
          Levels: {futurePeriod.startLevel.toLocaleString()} - {futurePeriod.endLevel.toLocaleString()}
        </Typography>
      </Box>
    </Card>
  );
});
