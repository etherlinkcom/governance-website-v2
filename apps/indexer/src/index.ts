import { all_contracts } from "./contracts";
import { GovernanceContractIndexer } from "./GovernanceContractIndexer";
import { Contract } from "./types";
import { TzktListener } from "./TzktListener";
import { logger } from "./utils/logger";

const indexer = new GovernanceContractIndexer();
indexer.initialize()
// indexer.indexContracts(all_contracts)