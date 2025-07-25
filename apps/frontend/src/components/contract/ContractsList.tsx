import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { contractStore } from '@/stores/ContractStore';
import { ContractCard } from '@/components/contract/ContractCard';
import { ComponentLoading } from '@/components/shared/ComponentLoading';

const ContractCardSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 2,
      px: 0,
    }}
  >
    <Box sx={{ flex: 1 }}>
      <ComponentLoading width="60%" height={24} borderRadius={1} />
      <Box sx={{ mt: 0.5 }}>
        <ComponentLoading width="40%" height={20} borderRadius={1} />
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
      <ComponentLoading width={60} height={24} borderRadius={3} />
      <ComponentLoading width={32} height={32} borderRadius={50} />
    </Box>
  </Box>
);

const ContractsListSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...Array(4)].map((_, idx) => (
        <ContractCardSkeleton key={idx} />
      ))}
    </Box>
  </Box>
);

export const ContractsList = observer(() => {
  const { contracts, loading, currentGovernance } = contractStore;
  const [userExpandedContract, setUserExpandedContract] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const getExpandedContract = () => {
    if (hasUserInteracted) return userExpandedContract;

    const activeContract = contracts.find(contract => contract.active);
    return activeContract?.contract_address || null;
  };

  const expandedContract = getExpandedContract();

  const handleAccordionChange = (contractAddress: string) => {
    setHasUserInteracted(true);
    setUserExpandedContract(expandedContract === contractAddress ? null : contractAddress);
  };

  useEffect(() => {
    setHasUserInteracted(false);
    setUserExpandedContract(null);
  }, [currentGovernance]);

  if (loading) return <ContractsListSkeleton />;

  return (
    <Box sx={{ width: '100%'}}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {contracts.map((contract) => (
          <ContractCard
            key={contract.contract_address}
            contract={contract}
            expanded={expandedContract === contract.contract_address}
            onChange={handleAccordionChange}
          />
        ))}
      </Box>

      {contracts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No contracts found for {currentGovernance} governance
          </Typography>
        </Box>
      )}
    </Box>
  );
});