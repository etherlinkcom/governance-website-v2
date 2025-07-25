import { all_contracts } from "./contracts";
import { GovernanceContractIndexer } from "./GovernanceContractIndexer";
import { Contract } from "./types";
import { TzktListener } from "./TzktListener";
import { logger } from "./utils/logger";

async function main() {
  logger.info("[Indexer] Starting Governance Contract Indexer...");
  const indexer = new GovernanceContractIndexer();
  await indexer.initialize();
  await indexer.indexContracts(all_contracts);
}

main()
  .then(() => {
    logger.info("[Indexer] Governance Contract Indexer completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("[Indexer] Governance Contract Indexer failed:", error);
    process.exit(1);
  });