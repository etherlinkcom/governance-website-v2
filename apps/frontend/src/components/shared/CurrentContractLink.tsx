import { Box, Link, Typography } from "@mui/material";
import { ContractAndConfig } from "@trilitech/types";
import { CopyButton } from "./CopyButton";
import { EllipsisBox } from "./EllipsisBox";

interface CurrentContractLinkProps {
  contract: ContractAndConfig;
}

export const CurrentContractLink = ({ contract }: CurrentContractLinkProps) => {
  const tzktUrl = process.env.NEXT_PUBLIC_TZKT_URL || "https://tzkt.io";
  const href = `${tzktUrl}/${contract.contract_address}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="body2">Contract:</Typography>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{ display: { xs: "none", sm: "inline" } }}
      >
        {contract.contract_address}
      </Link>
      <EllipsisBox sx={{ display: { xs: "block", sm: "none" }, color: "primary.main" }}>
        {contract.contract_address}
      </EllipsisBox>
      <CopyButton
        text={contract.contract_address}
        message="Contract address copied"
        sx={{ color: "primary.main" }}
      />
    </Box>
  );
};
