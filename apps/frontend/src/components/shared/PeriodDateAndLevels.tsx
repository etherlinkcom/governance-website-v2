"use client";

import { formatDate } from "@/lib/formatDate";
import { FrontendPeriod } from "@/types/api";
import { Box, Typography } from "@mui/material";

export const PeriodDateAndLevels = ({ period }: { period: FrontendPeriod }) => {
  return (
    <Box sx={{width: { xs: "100%", sm: "auto" }}}>
      <Typography
        variant="body1"
        sx={{ display: { xs: "block", sm: "none" }, mb: 0 }}
      >
        Dates: {formatDate(period.startDateTime, false)} -{" "}
        {formatDate(period.endDateTime, false)}
      </Typography>
      <Typography
        variant="body1"
        sx={{ display: { xs: "none", sm: "block" }, mb: 0 }}
      >
        Start {formatDate(period.startDateTime)} - End{" "}
        {formatDate(period.endDateTime)}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Levels: {period.startLevel.toLocaleString()} -{" "}
        {period.endLevel.toLocaleString()}
      </Typography>
    </Box>
  );
};
