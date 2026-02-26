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
import { useState, useEffect, useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import { getWalletStore } from "@/stores/WalletStore";
import { validateAddress, ValidationResult } from "@tezos-x/octez.js-utils";

import { DelegationRule, fetchDelegationsForAddress } from "@/lib/delegationUtils";

type ActionType = "full_access" | "revoke" | "whitelist" | "blacklist";

export const ManageVotingKeysButton = observer(() => {
    const walletStore = getWalletStore();
    const [open, setOpen] = useState(false);
    const [votingKey, setVotingKey] = useState("");
    const [action, setAction] = useState<ActionType>("full_access");
    const [contracts, setContracts] = useState<string[]>([""]);
    const [fetchedWhitelist, setFetchedWhitelist] = useState<string[]>([]);
    const [fetchedBlacklist, setFetchedBlacklist] = useState<string[]>([]);

    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchDelegation = useCallback(async (key: string): Promise<void> => {
        if (!walletStore || !walletStore.address) return;

        if (validateAddress(key) !== ValidationResult.VALID) {
            if (isMounted.current) {
                setFetchedWhitelist([]);
                setFetchedBlacklist([]);
            }
            return;
        }

        try {
            const rules: Map<string, DelegationRule> = await fetchDelegationsForAddress(key);

            if (!isMounted.current) return;

            const myRule: DelegationRule | undefined = rules.get(walletStore.address);

            if (!myRule) {
                setFetchedWhitelist([]);
                setFetchedBlacklist([]);
                return;
            }

            const { isVotingKey, optAddresses } = myRule;
            const hasAddresses: boolean = !!(optAddresses && optAddresses.length > 0);

            if (isVotingKey) {
                setFetchedWhitelist(hasAddresses ? (optAddresses as string[]) : []);
                setFetchedBlacklist([]);
                return;
            }

            setFetchedBlacklist(hasAddresses ? (optAddresses as string[]) : []);
            setFetchedWhitelist([]);
        } catch (error) {
            console.error("Failed to fetch delegation details for input address", error);
        }
    }, [walletStore?.address]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDelegation(votingKey);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [votingKey, fetchDelegation]);

    const proposeVotingKey = async (): Promise<void> => {
        if (!walletStore) return;

        let isVotingKey: boolean = true;
        let optionalAddresses: string[] | null = null;

        if (action === "revoke") {
            isVotingKey = false;
            optionalAddresses = null;
        } else if (action === "full_access") {
            isVotingKey = true;
            optionalAddresses = null;
        } else if (action === "whitelist") {
            isVotingKey = true;
            optionalAddresses = contracts.filter((c: string) => c !== "");
        } else if (action === "blacklist") {
            isVotingKey = false;
            optionalAddresses = contracts.filter((c: string) => c !== "");
        }

        await walletStore.proposeVotingKey(votingKey, isVotingKey, optionalAddresses);
        setOpen(false);
        setVotingKey("");
        setAction("full_access");
        setContracts([""]);
    };

    const isVotingKeyError: boolean = votingKey !== "" && validateAddress(votingKey) !== ValidationResult.VALID;

    const hasInvalidContracts: boolean = (action === "whitelist" || action === "blacklist") &&
        contracts.some((c: string) => c !== "" && validateAddress(c) !== ValidationResult.VALID);

    const isValid: boolean = votingKey !== "" && !isVotingKeyError && !hasInvalidContracts &&
        ((action === "whitelist" || action === "blacklist") ? contracts.some((c: string) => c !== "") : true);

    const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAction = e.target.value as ActionType;
        setAction(newAction);

        if (newAction === "whitelist" && fetchedWhitelist.length > 0) {
            setContracts(fetchedWhitelist);
        } else if (newAction === "blacklist" && fetchedBlacklist.length > 0) {
            setContracts(fetchedBlacklist);
        } else {
            setContracts([""]);
        }
    };

    const handleContractChange = (index: number, value: string): void => {
        const newContracts: string[] = [...contracts];
        newContracts[index] = value;
        setContracts(newContracts);
    };

    const addContract = (): void => {
        setContracts([...contracts, ""]);
    };

    const removeContract = (index: number): void => {
        const newContracts: string[] = contracts.filter((_: string, i: number) => i !== index);
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
                Manage Voting Keys
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
                <DialogTitle>Manage Voting Keys</DialogTitle>
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
                            onChange={handleActionChange}
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
