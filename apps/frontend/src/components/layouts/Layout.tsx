import { Box, Container, Link, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import {Header} from '@/components/header/Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { contract } = router.query;

  const currentPage = contract as 'slow' | 'fast' | 'sequencer' | null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header currentPage={currentPage} />

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              2025 |{' '}
              <Link
                href="https://etherlink.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "none",
                  },
                }}
              >
                Etherlink
              </Link>
              {' | '}
              <Link
                href="https://docs.etherlink.com/governance/how-is-etherlink-governed"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "none",
                  },
                }}
              >
                Governance
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};