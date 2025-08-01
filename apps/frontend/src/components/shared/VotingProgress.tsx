import {
  Box,
  darken,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { InfoIcon } from "./InfoIcon";

interface VotingProgressProps {
  label: string;
  value: string;
  required: number;
  progress: number;
  variant?: "subtitle1" | "body1";
}

export const VotingProgress = ({
  label,
  value,
  required,
  progress,
  variant = "subtitle1",
}: VotingProgressProps) => {
  const theme = useTheme();
  const baseColor = theme.palette.primary.main;
  const hoverColor = darken(baseColor, 0.5);
  const progressBarColor = Number(value) >= required ?
      theme.palette.success.main :
      theme.palette.error.main;
  const progressBarBackgroundColor = darken(progressBarColor, 0.5);

  return (
    <Box
      sx={{
        textAlign: "right",
        "& .info-icon": {
          color: baseColor,
        },
        "&:hover .info-icon": {
          color: hoverColor,
        },
      }}
    >
      <Tooltip
        title={`Current Voting Power: ${value}% / ${required}%`}
        placement="top"
        arrow={true}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant={variant}>{label}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant={variant}>
                {value}% / {required}%
              </Typography>
              <InfoIcon className="info-icon" color={baseColor} />
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              width: "100%",
              mb: 1,
              backgroundColor: progressBarBackgroundColor,
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressBarColor,
              },
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};
