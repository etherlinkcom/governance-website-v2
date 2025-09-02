import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Link,
  useTheme,
} from "@mui/material";

export default function Home() {
  const theme = useTheme();
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: { xs: "center", sm: "left" }, mb: 4 }}>

        <Typography variant="h1">
          Etherlink Governance
        </Typography>
        <Typography variant="body1">
          Your vote. Your network. Propose improvements and participate in protocol upgrades.
        </Typography>
      </Box>





      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "flex-start",
          maxWidth: "800px",
          mx: "auto",
        }}
      >

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
        <Typography
          variant="h3"
          component="h3"
          sx={{ color: theme.palette.primary.main + " !important" }}
        >
          What is Etherlink governance?
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 300 }}>
          Like Tezos, Etherlink has a built-in on-chain mechanism for proposing,
          selecting, testing, and activating upgrades without the need to hard
          fork. This mechanism makes Etherlink self-amending and empowers Tezos
          bakers to govern Etherlink's kernel upgrades and sequencer operators.
        </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
        <Typography
          variant="h3"
          component="h3"
          sx={{ color: theme.palette.primary.main + " !important" }}
        >
          How it Works
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 300 }}>
          Etherlink has separate governance processes for slow kernel updates,
          for fast kernel updates, and for the sequencer operator. To ensure
          that decisions accurately reflect the consensus of the Etherlink
          community, all three governance processes are designed with the same
          robust safeguards. Like Tezos's governance process, Etherlink's
          governance process promotes transparency and fairness in
          decision-making.
        </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: theme.palette.primary.main + " !important" }}
          >
            Learn more
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 300 }}>
            Still want to know more? Find more information by using the
            following links:
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          width={{ xs: "100%", sm: "auto" }}
        >
          <Button
            variant="outlined"
            className="home-page-button"
            href="https://etherlink.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Etherlink
          </Button>

          <Button
            variant="outlined"
            className="home-page-button"
            href="https://docs.etherlink.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Etherlink documentation
          </Button>

          <Button
            variant="outlined"
            className="home-page-button"
            href="https://docs.etherlink.com/governance/how-is-etherlink-governed"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Governance documentation
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
