import { FrontendPeriod } from "@/types/api";
import { Box, Button, Modal, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { formatDate } from "@/lib/formatDate";
import { HashDisplay } from "../shared/HashDisplay";
import { EllipsisBox } from "../shared/EllipsisBox";
import { VotersTable } from "../promotion/VotersTable";
import { contractStore } from "@/stores/ContractStore";
import { PromotionVotingStatsPanel } from "../period/PeriodVotingStatsPanel";
import { getLinkData } from "@/lib/getLinkData";
import { allLinkData, PayloadKey } from "@/data/proposalLinks";

interface PromotionModalProps {
  open: boolean;
  onClose: () => void;
  period: FrontendPeriod;
}

export const PromotionModal = observer(
  ({ open, onClose, period }: PromotionModalProps) => {
    const contract = contractStore.getContract(period.contract);

    return (
      <Modal open={open} onClose={onClose} disableAutoFocus>
        <Box
          className="modal-content"
          sx={{ p: {xs: 2, sm: 4 }, display: "flex", flexDirection: "column", gap: 5 }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
          >
            <Box>
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

            <PromotionVotingStatsPanel
              promotion={period.promotion!}
              period={period}
              contractAndConfig={contract!}
            />
          </Box>
          {/* Candidate Info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { sx: "flex-start", md: "space-between" },
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box>
              <Typography>Candidate:</Typography>
              <EllipsisBox>
                <HashDisplay hash={period.promotion?.proposal_hash || ""} />
              </EllipsisBox>
            </Box>
            <Box>
              { period.promotion?.proposal_hash && getLinkData(period.promotion?.proposal_hash as PayloadKey) && (
                <Button
                  variant="contained"
                  href={allLinkData.find(link => link.payloadKey === period.promotion?.proposal_hash)?.href || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Learn More
                </Button>
              )}
            </Box>
          </Box>

          <VotersTable proposalHash={period.promotion?.proposal_hash || ""} />
        </Box>
      </Modal>
    );
  }
);
