import { Box, Typography } from '@mui/material';

interface CandidateInfoProps {
  candidate: string;
  title: string;
  quorum: string;
  supermajority: string;
}

const CandidateInfo = ({ candidate, title, quorum, supermajority }: CandidateInfoProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">
        Candidate:
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {candidate}
      </Typography>
      <Typography variant="subtitle1">
        {title}
      </Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">
            Quorum:
          </Typography>
          <Typography variant="body1">
            {quorum}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">
            Supermajority:
          </Typography>
          <Typography variant="body1" >
            {supermajority}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateInfo;