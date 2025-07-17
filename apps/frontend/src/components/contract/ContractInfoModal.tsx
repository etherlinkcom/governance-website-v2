import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  useTheme,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import { ContractAndConfig } from '@trilitech/types';

interface ContractInfoModalProps {
  open: boolean;
  onClose: () => void;
  contract: ContractAndConfig;
}

export const ContractInfoModal = ({ open, onClose, contract }: ContractInfoModalProps) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contract.contract_address);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleSnackbarClose = () => {
    setCopied(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            component: Paper,
            sx: {
              minWidth: { xs: 280, sm: 500 },
              boxShadow: `0px 0px 3px 1px ${theme.palette.primary.main}`,
              m: { xs: 1, sm: 3 },
              width: { xs: '100%', sm: undefined },
            },
          },
        }}
      >
        <DialogTitle>
          Contract Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Contract Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  flex: 1
                }}
              >
                {contract.contract_address}
              </Typography>
              <IconButton
                size="small"
                onClick={handleCopyAddress}
                sx={{
                  padding: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, textTransform: 'capitalize' }}>
              <Chip
                label={contract.governance_type}
                size="small"
                variant="outlined"
              />
              <Chip
                label={contract.active ? 'Active' : 'Inactive'}
                size="small"
                color={contract.active ? 'success' : 'default'}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Started at Level
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.started_at_level}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Period Length
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.period_length}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Adoption Period
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.adoption_period_sec}s
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Upvoting Limit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.upvoting_limit}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Scale
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.scale}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quorum Settings
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Proposal Quorum
                  </Typography>
                  <Typography variant="body2">
                    {contract.proposal_quorum}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Promotion Quorum
                  </Typography>
                  <Typography variant="body2">
                    {contract.promotion_quorum}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Promotion Supermajority
                  </Typography>
                  <Typography variant="body2">
                    {contract.promotion_supermajority}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Address copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};