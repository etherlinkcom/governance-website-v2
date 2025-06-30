import { AppBar, Typography, Box, ToggleButton, ToggleButtonGroup, IconButton, Menu, MenuItem, useTheme} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  currentPage?: 'slow' | 'fast' | 'sequencer' | null;
}

const NETWORKS = [
  { value: 'mainnet', label: 'Mainnet' },
  { value: 'testnet', label: 'Testnet' },
];

const GOVERNANCES = [
  { value: 'slow', label: 'Slow Governance' },
  { value: 'fast', label: 'Fast Governance' },
  { value: 'sequencer', label: 'Sequencer Governance' },
];

export const Header = observer(({ currentPage = null }: HeaderProps) => {
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleGovernanceSelect = (type: 'slow' | 'fast' | 'sequencer') => {
    contractStore.setContract(type);
    router.push(`/governance/${type}`);
    handleMenuClose();
  };

  const handleNetworkChange = (
    event: React.MouseEvent<HTMLElement>,
    newNetwork: 'mainnet' | 'testnet'
  ) => {
    if (newNetwork !== null) contractStore.setNetwork(newNetwork);
  };

  const handleGovernanceChange = (
    event: React.MouseEvent<HTMLElement>,
    newGovernance: 'slow' | 'fast' | 'sequencer'
  ) => {
    if (newGovernance !== null) {
      contractStore.setContract(newGovernance);
      router.push(`/governance/${newGovernance}`);
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Box
        sx={{
          height: '84px',
          px: { xs: 2, md: '104px' },
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
            value={contractStore.currentNetwork}
            exclusive
            onChange={handleNetworkChange}
            size="small"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {NETWORKS.map((net) => (
              <ToggleButton key={net.value} value={net.value}>
                {net.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton onClick={handleMenuOpen} color="primary" size="large">
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {NETWORKS.map((net) => (
              <MenuItem
                key={net.value}
                onClick={() => contractStore.setNetwork(net.value as 'mainnet' | 'testnet')}
                selected={contractStore.currentNetwork === net.value}
              >
                {net.label}
              </MenuItem>
            ))}
            {GOVERNANCES.map((gov) => (
              <MenuItem
                key={gov.value}
                onClick={() => handleGovernanceSelect(gov.value as 'slow' | 'fast' | 'sequencer')}
                selected={currentPage === gov.value}
              >
                {gov.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <ToggleButtonGroup
          value={currentPage}
          exclusive
          onChange={handleGovernanceChange}
          size="small"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {GOVERNANCES.map((gov) => (
            <ToggleButton key={gov.value} value={gov.value}>
              {gov.label.replace(' Governance', '')}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </AppBar>
  );
});