import { observer } from "mobx-react-lite";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { contractStore } from "@/stores/ContractStore";
import { CurrentCardHeader } from "@/components/current/CurrentCardHeader";
import { EmptyPeriod } from "../current/EmptyPeriod";

export const Current = observer(() => {
  const currentPeriod = contractStore.currentPeriodData;
  const isLoading = contractStore.isLoadingCurrentPeriod;

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", mx: "auto"}}>
        <Card sx={{ p: 1, height: "600px", borderRadius: "16px" }}>
          <Typography>Loading current period...</Typography>
        </Card>
      </Box>
    );
  }

  if (!currentPeriod) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Empty Period
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mx: "auto" }}>
      <Card sx={{ p: 1, height: "600px", borderRadius: "16px" }}>
        <CardContent>
          <CurrentCardHeader currentPeriod={currentPeriod} />
          {currentPeriod.proposals && currentPeriod.proposals.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Current Proposals
              </Typography>
            </Box>
          ) : currentPeriod.promotion ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Promotion Period
              </Typography>
            </Box>
          ) : (
            <EmptyPeriod />
          )}
        </CardContent>
      </Card>
    </Box>
  );
});
