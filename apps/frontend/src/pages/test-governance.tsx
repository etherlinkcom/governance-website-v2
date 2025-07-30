import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import TestGovernance from '../components/TestGovernance';

const TestGovernancePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Test Governance Functions
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Test the vote and upvote functions for Etherlink governance contracts on Ghostnet.
        </Typography>
        
        <Paper>
          <TestGovernance />
        </Paper>
      </Box>
    </Container>
  );
};

export default TestGovernancePage; 