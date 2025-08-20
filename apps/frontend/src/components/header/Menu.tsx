import {
  Box,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  Divider,
} from "@mui/material";
import ConnectButton from "@/components/header/ConnectButton";
import type { GovernanceType } from "@trilitech/types";
import { useRouter } from "next/router";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { observer } from "mobx-react-lite";

export const KERNEL_TRACKS: {
  [key: string]: { value: GovernanceType; label: string };
} = {
  slow: { value: "slow", label: "Slow track" },
  fast: { value: "fast", label: "Fast track" },
};

interface MenuProps {
  handleGovernanceChange: (governance: GovernanceType) => void;
}

export const Menu = observer(({ handleGovernanceChange }: MenuProps) => {
  const theme = useTheme();
  const router = useRouter();

  const { governance } = router.query;
  const isKernelTrack = governance === "slow" || governance === "fast";
  const kernelValue = isKernelTrack ? governance : "";

  return (
    <>
      {/* Desktop Menu */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* Kernel Dropdown */}
        <FormControl size="small" variant="filled">
          <Select
            value={kernelValue}
            onChange={(event) =>
              handleGovernanceChange(event.target.value as GovernanceType)
            }
            displayEmpty
            variant="standard"
            disableUnderline
            renderValue={() => "Kernel"}
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              color: isKernelTrack
                ? theme.palette.primary.dark + " !important"
                : "#bcbcbc !important",

              "& .MuiSvgIcon-root": {
                color: isKernelTrack
                  ? theme.palette.primary.dark + " !important"
                  : "#bcbcbc !important",
              },
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
            }}
          >
            {Object.entries(KERNEL_TRACKS).map(([key, { value, label }]) => (
              <MenuItem
                key={key}
                value={value}
                sx={{
                  color:
                    governance === value
                      ? theme.palette.primary.dark
                      : "#bcbcbc !important",
                }}
              >
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sequencer */}
        <Typography
          onClick={() => handleGovernanceChange("sequencer")}
          sx={{
            cursor: "pointer",
            color:
              governance === "sequencer"
                ? theme.palette.primary.dark + " !important"
                : "#bcbcbc !important",
            fontWeight: 700,
            "&:hover": {
              color: theme.palette.primary.dark + " !important",
            },
          }}
        >
          Sequencer
        </Typography>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "#9b9b9b", borderRadius: "24px" }}
        />
        <ConnectButton />
      </Box>

      <ConnectButton sx={{display: { xs: "flex", md: "none" }}} />
    </>
  );
});
