"use client";

import { Card, Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FuturePeriod } from "@/types/api";
import { formatDate } from "@/lib/formatDate";
import { ComponentLoading } from "../shared/ComponentLoading";

interface FuturePeriodCardProps {
  futurePeriod: FuturePeriod;
}

export const FuturePeriodListSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {[...Array(10)].map((_, idx) => (
      <Card key={idx} variant="outlined" sx={{ py: 1, px: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ComponentLoading height={16} borderRadius={1} sx={{width: {xs: 300, sm: 350}}} />
          <ComponentLoading width={172} height={14} borderRadius={1} />
        </Box>
      </Card>
    ))}
  </Box>
);

export const FuturePeriodCard = observer(({ futurePeriod }: FuturePeriodCardProps) => {

  return (
    <Card variant="outlined" sx={{ py: 1, px: 2 }}>
      <Box sx={{ display: "flex-column", gap:2, justifyContent: "flex-start", alignItems: "center" }}>
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Start {formatDate(futurePeriod.startDateTime)} - End {formatDate(futurePeriod.endDateTime)}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ display: { xs: "block", sm: "none" } }}
          >
            {formatDate(futurePeriod.startDateTime)} - {formatDate(futurePeriod.endDateTime)}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Levels: {futurePeriod.startLevel.toLocaleString()} - {futurePeriod.endLevel.toLocaleString()}
        </Typography>
      </Box>
    </Card>
  );
});
