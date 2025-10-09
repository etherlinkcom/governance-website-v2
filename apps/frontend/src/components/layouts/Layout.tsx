import { Box, Container, Link, Typography } from '@mui/material';
import { ReactNode } from 'react';
import {Header} from '@/components/header/Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

      <Box component="main" >
        {children}
      </Box>
    </Box>
  );
};