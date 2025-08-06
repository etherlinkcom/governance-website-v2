import { Box, Typography, Button, Container, Stack, Link } from "@mui/material";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: { xs: "center", sm: "flex-start" },
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Typography variant="h1" component="h1">
          Etherlink
        </Typography>

        <Typography variant="body1">
          Etherlink is an EVM-compatible, non-custodial Layer 2 blockchain
          powered by <Link href="https://tezos.com/developers/smart-rollups/">Tezos Smart Rollup technology.</Link>{' '}
          It enables seamless integration with existing Ethereum tools,
          including wallets and indexers, and facilitates asset transfers
          to and from other EVM-compatible chains.
          </Typography>

          <Typography variant="body1">
          Built upon the secure foundation of Tezos layer 1, Etherlink delivers a
          fast, fair, and (nearly) free experience. This permissionless and
          censorship-resistant environment empowers developers to actively
          create and participate in the next generation of decentralized applications.
        </Typography>

        <Typography variant="h2" component="h2">
          Etherlink Governance
        </Typography>

        <Typography variant="body1">
          Like Tezos, Etherlink has a built-in on-chain mechanism for proposing,
          selecting, testing, and activating upgrades without the need to hard
          fork. This mechanism makes Etherlink self-amending and empowers Tezos
          bakers to govern Etherlink's kernel upgrades and sequencer operators.
        </Typography>

        <Typography variant="body1">
          Etherlink has separate governance processes for slow kernel updates, for
          fast kernel updates, and for the sequencer operator. To ensure that
          decisions accurately reflect the consensus of the Etherlink community,
          all three governance processes are designed with the same robust
          safeguards. Like Tezos's governance process, Etherlink's governance
          process promotes transparency and fairness in decision-making.
        </Typography>

        <Typography variant="h3" component="h3">
          Learn more
        </Typography>

        <Typography variant="body1">
          You may find more information by using the following links:
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Button
            variant="contained"
            href="https://etherlink.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Etherlink
          </Button>

          <Button
            variant="outlined"
            href="https://docs.etherlink.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Etherlink documentation
          </Button>

          <Button
            variant="outlined"
            href="https://docs.etherlink.com/governance/how-is-etherlink-governed"
            target="_blank"
            rel="noopener noreferrer"
          >
            Governance documentation
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
