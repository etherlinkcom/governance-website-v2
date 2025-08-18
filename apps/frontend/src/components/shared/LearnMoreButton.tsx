import { PayloadKey } from "@/data/proposalLinks";
import { getLinkData } from "@/lib/getLinkData";
import { Button } from "@mui/material";

export const LearnMoreButton = ({ proposalHash }: { proposalHash?: string }) => {

    const linkData = getLinkData(proposalHash as PayloadKey);
    if (!linkData) return null;

    return (
        <Button
            variant="contained"
            href={linkData.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ whiteSpace: "nowrap" }}
        >
            Learn More
        </Button>
    );
};