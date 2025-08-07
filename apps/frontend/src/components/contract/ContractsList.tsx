import { Box, Card, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { contractStore } from '@/stores/ContractStore';
import { ContractCard } from '@/components/contract/ContractCard';
import { ComponentLoading } from '@/components/shared/ComponentLoading';

const ContractCardSkeleton = () => (
  <Card sx={{
    height: 74,
    display: 'flex',
    alignItems: 'center',
    padding: 2,
    justifyContent: 'space-between',
  }}>
      <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
      <ComponentLoading width="45vw" height={20} borderRadius={1} />
        <ComponentLoading width={20} height={30} borderRadius={1} />
    </Box>
      <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
        <ComponentLoading width={18} height={18} borderRadius={50} />
        <ComponentLoading width={15} height={10} borderRadius={1} />
      </Box>
  </Card>
);

const ContractsListSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...Array(4)].map((_, index) => (
        <ContractCardSkeleton key={index} />
      ))}
    </Box>
  </Box>
);

export const ContractsList = observer(() => {
  const { contracts, currentGovernance, loading } = contractStore;
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