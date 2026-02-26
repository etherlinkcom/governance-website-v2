import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { getWalletStore } from "@/stores/WalletStore";
import { validateAddress, ValidationResult } from "@tezos-x/octez.js-utils";

type ActionType = "full_access" | "revoke" | "whitelist" | "blacklist";

export const ManageVotingKeysButton = observer(() => {
    const walletStore = getWalletStore();
    const [open, setOpen] = useState(false);
    const [votingKey, setVotingKey] = useState("");
    const [action, setAction] = useState<ActionType>("full_access");
    const [contracts, setContracts] = useState<string[]>([""]);

    const proposeVotingKey = async () => {
        if (!walletStore) return;

        let isVotingKey = true;
        let optionalAddresses: string[] | null = null;

        if (action === "revoke") {
            isVotingKey = false;
            optionalAddresses = null;
        } else if (action === "full_access") {
            isVotingKey = true;
            optionalAddresses = null;
        } else if (action === "whitelist") {
            isVotingKey = true;
            optionalAddresses = contracts.filter(c => c !== "");
        } else if (action === "blacklist") {
            isVotingKey = false;
            optionalAddresses = contracts.filter(c => c !== "");
        }

        await walletStore.proposeVotingKey(votingKey, isVotingKey, optionalAddresses);
        setOpen(false);
        setVotingKey("");
        setAction("full_access");
        setContracts([""]);
    };

    const isVotingKeyError: boolean = votingKey !== "" && validateAddress(votingKey) !== ValidationResult.VALID;

    const hasInvalidContracts: boolean = (action === "whitelist" || action === "blacklist") &&
        contracts.some(c => c !== "" && validateAddress(c) !== ValidationResult.VALID);

    const isValid: boolean = votingKey !== "" && !isVotingKeyError && !hasInvalidContracts &&
        ((action === "whitelist" || action === "blacklist") ? contracts.some(c => c !== "") : true);

    const handleContractChange = (index: number, value: string) => {
        const newContracts = [...contracts];
        newContracts[index] = value;
        setContracts(newContracts);
    };

    const addContract = () => {
        setContracts([...contracts, ""]);
    };

    const removeContract = (index: number) => {
        const newContracts = contracts.filter((_, i) => i !== index);
        if (newContracts.length === 0) {
            newContracts.push("");
        }
        setContracts(newContracts);
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outlined"
                sx={{ width: "100%" }}
            >
                Propose Voting Key
            </Button>
            <Dialog
                disableEnforceFocus={true}
                open={open}
                onClose={() => setOpen(false)}
                autoFocus={false}
                aria-hidden="false"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Propose Voting Key</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Voting Key Address"
                            placeholder="tz1..."
                            value={votingKey}
                            onChange={e => setVotingKey(e.target.value)}
                            error={isVotingKeyError}
                            helperText={isVotingKeyError ? "Invalid address" : ""}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Action"
                            value={action}
                            onChange={e => setAction(e.target.value as ActionType)}
                        >
                            <MenuItem value="full_access">Add (Full Access)</MenuItem>
                            <MenuItem value="revoke">Revoke</MenuItem>
                            <MenuItem value="whitelist">Whitelist Contracts</MenuItem>
                            <MenuItem value="blacklist">Blacklist Contracts</MenuItem>
                        </TextField>

                        {(action === "whitelist" || action === "blacklist") && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Typography variant="subtitle2">
                                    {action === "whitelist" ? "Allowed Contracts" : "Blocked Contracts"}
                                </Typography>
                                {contracts.map((contract, index) => {
                                    const isContractError = contract !== "" && validateAddress(contract) !== ValidationResult.VALID;
                                    return (
                                        <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="KT1..."
                                                value={contract}
                                                onChange={e => handleContractChange(index, e.target.value)}
                                                error={isContractError}
                                                helperText={isContractError ? "Invalid contract address" : ""}
                                            />
                                            <Button color="error" onClick={() => removeContract(index)} sx={{ minWidth: "80px" }}>
                                                Remove
                                            </Button>
                                        </Box>
                                    );
                                })}
                                <Button
                                    onClick={addContract}
                                    sx={{ alignSelf: "flex-start" }}
                                    size="small"
                                >
                                    + Add Contract
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={proposeVotingKey}
                        variant="contained"
                        disabled={!isValid || walletStore?.isVoting}
                    >
                        {walletStore?.isVoting ? "Proposing..." : "Propose"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});
