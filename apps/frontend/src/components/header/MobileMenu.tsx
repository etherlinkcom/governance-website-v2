import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useTheme,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ConnectButton from "@/components/header/ConnectButton";
import type { GovernanceType } from "@trilitech/types";
import { useState } from "react";
import { KERNEL_TRACKS } from "./Menu";

interface MobileMenuProps {
  currentPage?: GovernanceType | null;
  onGovernanceChange: (governance: GovernanceType) => void;
}

export const MobileMenu = ({ currentPage, onGovernanceChange }: MobileMenuProps) => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleGovernanceChange = (governance: GovernanceType) => {
    onGovernanceChange(governance);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: { sm: "block", md: "none" } }}>
      <IconButton
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
          {/* Kernel */}
          <Box sx={{ mb: 2 }}>
            <Accordion
              sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    borderBottomLeftRadius: '0',
                    borderBottomRightRadius: '0',
                  paddingX: theme.spacing(3),
                  paddingY: 0,
                  '&.Mui-expanded': {
                    backgroundColor: theme.palette.custom.tableBg.odd,
                  }
                },
              }}
            >
              <AccordionSummary
                sx={{
                    margin: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                  },
                }}
              >
                <Typography sx={{
                  color: '#bcbcbc',
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: 0,
                  '& .Mui-expanded': {
                    color: theme.palette.primary.main + ' !important'
                  }
                }}>
                  Kernel
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                    backgroundColor: theme.palette.custom.tableBg.even,
                    borderBottomLeftRadius: '24px',
                    borderBottomRightRadius: '24px',
                }}>
                {Object.entries(KERNEL_TRACKS).map(([key, { value, label }]) => (
                  <Typography
                    key={key}
                    onClick={() => handleGovernanceChange(value)}
                    sx={{
                      cursor: "pointer",
                      color: currentPage === value ? theme.palette.primary.main : "#bcbcbc",
                      fontWeight: 700,
                      fontSize: "14px",
                      margin: theme.spacing(0.5),
                      padding: theme.spacing(1, 3),
                      borderRadius: "100px",
                    //   backgroundColor: theme.palette.custom.background?.dropdown,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: theme.palette.custom.tableBg.odd,
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Sequencer Section */}
          <Typography
            onClick={() => handleGovernanceChange("sequencer")}
            sx={{
              cursor: "pointer",
              color: currentPage === "sequencer"
                ? theme.palette.primary.main
                : "#bcbcbc",
              fontWeight: 700,
              padding: theme.spacing(1.5, 2),
              borderRadius: "24px",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.custom.tableBg.odd,
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Sequencer
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ width: "100%", pb: 2 }}>
            <ConnectButton sx={{ width: "100%" }} />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};