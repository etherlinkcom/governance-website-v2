import {
  Box,
  Drawer,
  Typography,
  useTheme,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { GovernanceType } from "@trilitech/types";
import { useEffect, useState } from "react";
import { KERNEL_TRACKS } from "./Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";

interface MobileMenuProps {
  handleGovernanceChange: (governance: GovernanceType) => void;
}

export const MobileMenu = ({ handleGovernanceChange }: MobileMenuProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false);

  const { governance } = router.query;

  const isKernelTrack = governance === "slow" || governance === "fast";

  const onGovernanceChange = (governance: GovernanceType) => {
    handleGovernanceChange(governance);
    setDrawerOpen(false);
  };

  const handleHomeClick = () => {
    setDrawerOpen(false);
    router.push("/");
  };

  useEffect(() => {
    if (!drawerOpen) {
      setAccordionExpanded(false);
    }
  }, [drawerOpen]);

  return (
    <Box sx={{ display: { sm: "block", md: "none" } }}>
      <MenuIcon
        fontSize="small"
        onClick={() => setDrawerOpen(true)}
        sx={{ color: "#BCBCBC", fontSize: "18px", mt: 0.8 }}
      />
      <Drawer
        anchor="bottom"
        aria-hidden={false}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            maxHeight: "390px",
            height: "auto",
          },
        }}
      >
        <Box
          sx={{
            gap: theme.spacing(1),
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              justifyContent: "flex-end",
              display: "flex",
              mr: 2,
              alignItems: "center",
              minHeight: "48px",
            }}
          >
            <CloseIcon onClick={() => setDrawerOpen(false)} fontSize="small" />
          </Box>
          <Box
            onClick={handleHomeClick}
            sx={{
              padding: theme.spacing(1.5, 3),
              borderRadius: "24px",
              cursor: "pointer",
              height: "40px",
              "&:hover": {
                backgroundColor: theme.palette.custom.tableBg.hover,
                "& p": {
                  color: theme.palette.primary.dark + " !important",
                },
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#bcbcbc !important",
              }}
            >
              Home
            </Typography>
          </Box>

          {/* Kernel */}
          <Box sx={{ borderRadius: "24px" }}>
            <Accordion
              expanded={accordionExpanded}
              onChange={(_, isExpanded) => setAccordionExpanded(isExpanded)}
              className="mobile-menu-accordion"
            >
              <AccordionSummary
                expandIcon={
                  <KeyboardArrowDownIcon
                    sx={{
                      color: isKernelTrack
                        ? theme.palette.primary.dark + " !important"
                        : "#bcbcbc !important",
                    }}
                  />
                }
                className="mobile-menu-summary"
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: isKernelTrack
                      ? theme.palette.primary.dark + " !important"
                      : "#bcbcbc !important",
                  }}
                >
                  Kernel
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="mobile-menu-details">
                {Object.entries(KERNEL_TRACKS).map(
                  ([key, { value, label }]) => (
                    <Typography
                      key={key}
                      onClick={() => onGovernanceChange(value)}
                      className="mobile-menu-track"
                      sx={{
                        color:
                          governance === value
                            ? theme.palette.primary.dark + " !important"
                            : "#bcbcbc !important",
                      }}
                    >
                      {label}
                    </Typography>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Sequencer Section */}
          <Typography
            onClick={() => onGovernanceChange("sequencer")}
            className="mobile-menu-item"
            sx={{
              color:
                governance === "sequencer"
                  ? theme.palette.primary.dark + " !important"
                  : "#bcbcbc !important",
            }}
          >
            Sequencer
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};
