import { latest_contracts } from "./contracts";
import { GovernanceContractIndexer } from "./GovernanceContractIndexer";
import { Contract } from "./types";
import { TzktListener } from "./TzktListener";
import { logger } from "./utils/logger";

// // Start the listener
// const listener = new TzktListener(latest_contracts);

// // Graceful shutdown
// process.on('SIGINT', () => {
//   logger.info('\n🔄 Shutting down gracefully...');
//   listener.stop();
//   process.exit(0);
// });

// // Keep the process running
// logger.info('🚀 Tezos Contract Listener started!');
// logger.info('Press Ctrl+C to stop');
const contracts: Contract[] = [
  {
    type: 'slow',
    address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
  },
]
const indexer = new GovernanceContractIndexer();
indexer.getStorageHistoryForContract(contracts[0])