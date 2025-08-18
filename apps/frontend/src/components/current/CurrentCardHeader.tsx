import { Box } from "@mui/material";
import { FrontendPeriod } from "@/types/api";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { TimeRemaining } from "@/components/current/TimeRemaining";

interface CurrentCardHeaderProps {
  currentPeriod: FrontendPeriod;
}

export const CurrentCardHeader = ({
  currentPeriod,
}: CurrentCardHeaderProps) => {

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <PeriodDateAndLevels period={currentPeriod} />
        <TimeRemaining currentPeriod={currentPeriod} />
      </Box>
    </Box>
  );
};
