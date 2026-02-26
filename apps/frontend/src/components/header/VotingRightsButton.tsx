import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { useState } from "react";
import { ClaimVotingRightsButton } from "./ClaimVotingRightsButton";
import { ManageVotingKeysButton } from "./ManageVotingKeysButton";

export const VotingRightsButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outlined"
                sx={{ width: { xs: "100%", sm: "auto" } }}
            >
                Voting Rights
            </Button>
            <Dialog
                disableEnforceFocus={true}
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
                fullWidth
                autoFocus={false}
                aria-hidden="false"
            >
                <DialogTitle>Voting Rights Management</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <ClaimVotingRightsButton />
                        <ManageVotingKeysButton />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
