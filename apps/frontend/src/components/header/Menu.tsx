import {
  Box,
  Drawer,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ConnectButton from "@/components/header/ConnectButton";
import type { GovernanceType } from "@trilitech/types";
import { useState } from "react";
import { contractStore } from "@/stores/ContractStore";
import { useRouter } from "next/router";

interface MenuProps {
  currentPage?: GovernanceType | null;
}

const GOVERNANCES: { [key: string]: GovernanceType } = {
  slow: "slow",
  fast: "fast",
  sequencer: "sequencer",
};

export const Menu = ({ currentPage = null }: MenuProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleGovernanceChange = (newGovernance: GovernanceType) => {
    if (newGovernance !== null) {
      contractStore.setGovernance(newGovernance);
      router.push(`/governance/${newGovernance}`);
    }
  };

  return (
    <>
      {/* Desktop Menu */}
      <ToggleButtonGroup
        value={currentPage}
        exclusive
        onChange={(_event, value) => value && handleGovernanceChange(value)}
        size="small"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        {Object.entries(GOVERNANCES).map(([key, value]) => (
          <ToggleButton
            key={key}
            value={value}
            sx={{ textTransform: "capitalize" }}
          >
            {key}
          </ToggleButton>
        ))}
        <ConnectButton />
      </ToggleButtonGroup>

      {/* Mobile Menu */}
      <Box sx={{ display: { sm: "block", md: "none" } }}>
        <IconButton
          sx={{ ml: 1 }}
          onClick={() => setDrawerOpen(true)}
          color="primary"
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="bottom"
          aria-hidden={false}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {Object.entries(GOVERNANCES).map(([key, value]) => (
              <Typography
                key={key}
                onClick={() => {
                  handleGovernanceChange(value);
                  setDrawerOpen(false);
                }}
                sx={{
                  textTransform: "capitalize",
                  color: theme.palette.secondary.contrastText,
                  fontWeight: 700,
                  justifyContent: "flex-start",
                  px: 2,
                  py: 2,
                }}
              >
                {value} Governance
              </Typography>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ width: "100%", pb: 2 }}>
              <ConnectButton sx={{ width: "100%" }} />
            </Box>
          </Box>
        </Drawer>
      </Box>
    </>
  );
};
