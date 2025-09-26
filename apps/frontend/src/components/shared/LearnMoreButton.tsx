import { PayloadKey } from "@/data/proposalLinks";
import { getLinkData } from "@/lib/getLinkData";
import { Button, SxProps } from "@mui/material";

interface LearnMoreButtonProps {
    proposalHash?: string;
    sx?: SxProps;
}
export const LearnMoreButton = ({ proposalHash, sx }: LearnMoreButtonProps) => {

    const linkData = getLinkData(proposalHash as PayloadKey);
    if (!linkData) return null;

    return (
        <Button
            variant="contained"
            href={linkData.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" }, ...sx }}
        >
            Learn More
        </Button>
    );
};