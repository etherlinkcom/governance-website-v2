import { AppBar, Typography, Box, useTheme } from '@mui/material';
import { Menu } from '@/components/header/Menu';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';


export const Header = observer(() => {
  const theme = useTheme();

  return (
    <AppBar position="static" elevation={0}>
      <Box
        sx={{
          height: '84px',
          px: { lg: '104px' },
          py: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          backgroundColor: theme.palette.background.default,
          maxWidth: '1440px',
          margin: '0 auto',
          gap: '10px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Image
              src="/etherlink.svg"
              alt="Etherlink"
              width={150}
              height={32}
              style={{ display: 'block' }}
            />
            <Typography variant="h6" sx={{ml: -1}}>
              Governance
            </Typography>
          </Link>

        </Box>
          <Menu />
        </Box>
      </AppBar>
  );
});