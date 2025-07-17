import { AppBar, Typography, Box, ToggleButton, ToggleButtonGroup, IconButton, Menu, MenuItem, useTheme} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import type { GovernanceType, NetworkType } from '@trilitech/types';
import ConnectButton from '@/components/shared/ConnectButton';

interface HeaderProps {
  currentPage?: 'slow' | 'fast' | 'sequencer' | null;
}

const NETWORKS: {[key: string]: NetworkType} = {
  mainnet: 'mainnet',
  // testnet: 'testnet',
};

const GOVERNANCES: { [key: string]: GovernanceType } = {
  slow: 'slow',
  fast: 'fast',
  sequencer: 'sequencer',
};

export const Header = observer(({ currentPage = null }: HeaderProps) => {
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleNetworkChange = (
    event: React.MouseEvent<HTMLElement>,
    newNetwork: NetworkType
  ) => {
    // if (newNetwork !== null) contractStore.setNetwork(newNetwork);
  };

  const handleGovernanceChange = (
    newGovernance: GovernanceType
  ) => {
    if (newGovernance !== null) {
      contractStore.setGovernance(newGovernance);
      router.push(`/governance/${newGovernance}`);
      handleMenuClose();
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Box
        sx={{
          height: '84px',
          px: {  lg: '104px' },
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
            <Typography variant="h6" component="div">
              Governance
            </Typography>
          </Link>

          <ToggleButtonGroup
            value="mainnet"
            exclusive
            // onChange={handleNetworkChange}
            size="small"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {Object.entries(NETWORKS).map(([key, value]) => (
              <ToggleButton key={key} value={value} sx={{ textTransform: 'capitalize' }}>
                {key}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: { sm: 'block', md: 'none' } }}>
        <ConnectButton />
          <IconButton sx={{ ml: 1 }} onClick={handleMenuOpen} color="primary" size="large">
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {/* {Object.entries(NETWORKS).map(([key, value]) => ( */}
              <MenuItem
                // key={key}
                // onClick={() => contractStore.setNetwork(value)}
                selected={true}
                sx={{ textTransform: 'capitalize' }}
              >
                "Mainnet"
              </MenuItem>
            {/* ))} */}
            {Object.entries(GOVERNANCES).map(([key, value]) => (
              <MenuItem
                key={key}
                onClick={() => handleGovernanceChange(value)}
                selected={currentPage === value}
                sx={{ textTransform: 'capitalize' }}
              >
                {value} Governance
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <ToggleButtonGroup
          value={currentPage}
          exclusive
          onChange={(_event, value) => value && handleGovernanceChange(value)}
          size="small"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {Object.entries(GOVERNANCES).map(([key, value]) => (
            <ToggleButton key={key} value={value} sx={{ textTransform: 'capitalize' }}>
              {key}
            </ToggleButton>
          ))}
       <ConnectButton/>
        </ToggleButtonGroup>
      </Box>
    </AppBar>
  );
});