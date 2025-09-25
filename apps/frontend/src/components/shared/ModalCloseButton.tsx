import { Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export const ModalCloseButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -4, mt: -3, mr: -2  }}>
      <IconButton
        onClick={onClose}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
}