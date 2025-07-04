import { Box, Typography, Button, Container, Stack } from "@mui/material";

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
          Etherlink is an EVM-compatible layer-2 blockchain with a decentralized
          sequencer, offering very low fees and MEV protection, powered by Tezos
          Smart Rollup technology.
        </Typography>

        <Box component="ul" sx={{ listStyleType: "disc", pl: 2 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Decentralized:</strong> The decentralized sequencer reduces
            the risk of centralized control and manipulation.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Secure:</strong> Built-in MEV protection protects users against
            exploitation.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            <strong>Low fees:</strong> Think $0.01 per transaction, not $20.
          </Typography>
        </Box>

        <Typography variant="body1">
          Etherlink uses Smart Rollups on the decentralized Tezos protocol for
          data availability and will expand to use the Tezos Data Availability
          Layer.
        </Typography>

        <Typography variant="h2" component="h2">
          Etherlink governance
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
            href="https://docs.etherlink.com/governance"
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
