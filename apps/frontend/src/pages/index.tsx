import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import Image from "next/image";

export default function Home() {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          display: { xs: "none", md: "block" },
          width: "100vw",
          height: "200vh",
          top: 0,
          minWidth: "100%",
          maxWidth: "100%",
          zIndex: 0,
          background: `radial-gradient(circle at 67% 26%,
                ${alpha(theme.palette.primary.main, 0.05)} 5%,
                ${alpha(theme.palette.primary.main, 0.01)} 10%,
                ${alpha(theme.palette.primary.main, 0)} 50%)`,
        }}
      />
    <Container sx={{ position: "relative", overflow: "visible" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          minHeight: "70vh",
          mt: { xs: 0, md: 8 },
          mb: 4,
          position: "relative",
          zIndex: 1,
          width: "100%",
        }}
      >
        {/* Text Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            textAlign: { xs: "center", md: "left" },
            mb: 4,
            gap: { xs: 4, sm: 3 },
          }}
        >
          <Typography variant="h1" sx={{ fontSize: 56 }}>
            Etherlink Governance
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: 20, color: "#b5b5b5 !important" }}
          >
            Your vote. Your network. Propose improvements and participate in
            protocol upgrades.
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "min(457px, 100%)",
            height: "auto",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            display: "flex",
            zIndex: 0,
            background: {
              xs:`radial-gradient(circle at 50% 51%,
                ${alpha(theme.palette.primary.main, 0.1)} 30%,
                ${alpha(theme.palette.primary.main, 0)} 70%)`,
              md: "none",
            }
          }}
        >
          <Image
            src="/HomePageBlocks.svg"
            alt="Etherlink"
            width={457}
            height={445}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              zIndex: 1,
              position: "relative",
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "flex-start",
          maxWidth: "600px",
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
            Like Tezos, Etherlink has a built-in on-chain mechanism for
            proposing, selecting, testing, and activating upgrades without the
            need to hard fork. This mechanism makes Etherlink self-amending and
            empowers Tezos bakers to govern Etherlink's kernel upgrades and
            sequencer operators.
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
            How it works
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
          minWidth={{ xs: "100%", md: "800px" }}
        >
          <Button
            variant="outlined"
            className="home-page-button"
            href="https://etherlink.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: { xs: "100%", md: "auto" },
              whiteSpace: "nowrap",
              textBreak: "keep-all",
            }}
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
    </>
  );
}
