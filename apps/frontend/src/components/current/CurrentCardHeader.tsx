import { Box, Typography, LinearProgress, alpha } from "@mui/material";
import { formatDate } from "@/lib/formatDate";
import { useEffect, useState } from "react";
import { FrontendPeriod } from "@/types/api";

interface CurrentCardHeaderProps {
  currentPeriod: FrontendPeriod;
}

export const CurrentCardHeader = ({ currentPeriod }: CurrentCardHeaderProps) => {
  const [timeRemaining, setTimeRemaining] = useState("00:00");
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (!currentPeriod) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(currentPeriod.endDateTime);
      const startTime = new Date(currentPeriod.startDateTime);

      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining("00:00");
        setProgressPercentage(100);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(
          `${days}d ${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      }

      const totalDuration = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const percentage = Math.min(
        Math.max((elapsed / totalDuration) * 100, 0),
        100
      );
      setProgressPercentage(percentage);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [currentPeriod]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3
      }}
    >
      <Box>
        <Typography variant="body1">
          <strong>Start</strong> {formatDate(currentPeriod.startDateTime)}{" "}
          - <strong>End:</strong> {formatDate(currentPeriod.endDateTime)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Levels</strong>{" "}
          {currentPeriod.startLevel.toLocaleString()} -{" "}
          {currentPeriod.endLevel.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ mb: 3, width: "250px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">Time Remaining:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {timeRemaining}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: (theme) =>
              alpha(theme.palette.text.secondary, 0.1),
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
            },
          }}
        />
      </Box>
    </Box>
  );
};