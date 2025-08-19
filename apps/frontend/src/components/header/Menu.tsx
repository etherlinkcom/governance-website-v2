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
import { MobileMenu } from "@/components/header/MobileMenu";
import type { GovernanceType } from "@trilitech/types";
import { contractStore } from "@/stores/ContractStore";
import { useRouter } from "next/router";

interface MenuProps {
  currentPage?: GovernanceType | null;
}

export const KERNEL_TRACKS: {
  [key: string]: { value: GovernanceType; label: string };
} = {
  slow: { value: "slow", label: "Slow track" },
  fast: { value: "fast", label: "Fast track" },
};

export const Menu = ({ currentPage = null }: MenuProps) => {
  const theme = useTheme();
  const router = useRouter();

  const handleGovernanceChange = (newGovernance: GovernanceType) => {
    if (newGovernance !== null) {
      contractStore.setGovernance(newGovernance);
      router.push(`/governance/${newGovernance}`);
    }
  };

  const isKernelTrack = currentPage === "slow" || currentPage === "fast";
  const kernelValue = isKernelTrack ? currentPage : "";

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
              <MenuItem key={key} value={value}>
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
            color: "#bcbcbc !important",
            fontWeight: 700,
            "&:hover": {
              color: theme.palette.primary.main,
            },
          }}
        >
          Sequencer
        </Typography>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "#9b9b9b", borderRadius: '24px'}}
        />
        <ConnectButton />
      </Box>

      {/* Mobile Menu */}
      <MobileMenu
        currentPage={currentPage}
        onGovernanceChange={handleGovernanceChange}
      />
    </>
  );
};
