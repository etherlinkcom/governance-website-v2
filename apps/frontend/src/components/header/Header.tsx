import { AppBar, Box, useTheme } from "@mui/material";
import { Menu } from "@/components/header/Menu";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { contractStore } from "@/stores/ContractStore";
import { GovernanceType } from "@trilitech/types";
import { useRouter } from "next/router";

export const Header = observer(() => {
  const theme = useTheme();

  const router = useRouter();

  const handleGovernanceChange = (newGovernance: GovernanceType) => {
    if (newGovernance !== null) {
      contractStore.setGovernance(newGovernance);
      router.push(`/governance/${newGovernance}`);
    }
  };
  return (
    <AppBar position="static" elevation={0}>
      <Box
        sx={{
          height: "84px",
          px: { lg: "104px" },
          py: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          backgroundColor: theme.palette.background.default,
          maxWidth: "1440px",
          margin: "0 auto",
          gap: "10px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Image
              src="/Etherlink Logo.svg"
              alt="Etherlink"
              width={162.5}
              height={48}
              style={{ display: "block" }}
            />
          </Link>
          <MobileMenu handleGovernanceChange={handleGovernanceChange} />
        </Box>
        <Menu handleGovernanceChange={handleGovernanceChange} />
      </Box>
    </AppBar>
  );
});
