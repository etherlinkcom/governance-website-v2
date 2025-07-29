import {
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import { ContractAndConfig } from '@trilitech/types';
import { CopyButton } from '@/components/shared/CopyButton';

interface ContractInfoModalProps {
  open: boolean;
  onClose: () => void;
  contract: ContractAndConfig;
}

export const ContractInfoModal = ({ open, onClose, contract }: ContractInfoModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Contract Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Contract Address
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Link
              variant="body2"
              href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${contract.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="contract-link"
            >
              {contract.contract_address}
            </Link>
            <CopyButton
              text={contract.contract_address}
              message="Contract address copied!"
              size="small"
              sx={{color: 'primary.main', mt:0.5}}
            />
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
  );
};