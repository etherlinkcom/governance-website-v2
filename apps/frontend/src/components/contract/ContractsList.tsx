import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { contractStore } from '@/stores/ContractStore';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { ContractCard } from '@/components/contract/ContractCard';

const ContractsListSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <ComponentLoading width={120} height={32} />
      <ComponentLoading width={80} height={24} />
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...Array(3)].map((_, idx) => (
        <ComponentLoading key={idx} width="100%" height={80} borderRadius={2} />
      ))}
    </Box>
  </Box>
);

export const ContractsList = observer(() => {
  const { contracts, loading, currentGovernance } = contractStore;
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  const handleAccordionChange = (contractAddress: string) => {
    setExpandedContract(expandedContract === contractAddress ? null : contractAddress);
  };

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