import dotenv from 'dotenv';
dotenv.config();

import express, {Request, Response} from "express";
import { TzktListener } from "./TzktListener";
import { all_contracts } from "./contracts";
import { GovernanceContractIndexer } from "./GovernanceContractIndexer";
import { logger } from "./utils/logger";
import { Contract } from './types';
import { listenerProblems } from "./health";

const app = express();
const port = process.env.PORT || 8080;

let listener: TzktListener | null = null;

async function startListener(): Promise<void> {
  listener = new TzktListener(all_contracts.filter((contract: Contract) => contract.active));
  try {
    await listener.start();
  } catch (err) {
    logger.error("[Indexer] Listener failed to start", err);
    listener = null; // so the next /start-listener call retries
  }
}

app.get("/start-listener", (_req: Request, res: Response) => {
  if (listener) {
    logger.info(`[Indexer] Listener already running`);
    return res.status(200).send("Listener already running");
  }
  startListener();
  res.send("TzKT Listener started");
});

app.get("/health", (_req: Request, res: Response) => {
  const problems = listenerProblems(listener);
  if (problems.length) {
    logger.warn(`[Health] Unhealthy: ${problems.join("; ")}`);
    return res.status(503).json({ ok: false, problems });
  }
  res.json({ ok: true });
});

app.get("/stop-listener", (_req: Request, res: Response) => {
  if (listener) {
    listener.stop();
    listener = null;
    return res.send("Listener stopped");
  }
  res.status(400).send("No listener running");
});

app.get("/index-active", async (req: Request, res: Response) => {
  try {
    const indexFromStart = req.query.indexFromStart === "true";
    logger.info(`[Indexer] Indexing all contracts. Indexing from start: ${indexFromStart}`);
    const indexer = new GovernanceContractIndexer();
    await indexer.initialize();
    await indexer.indexContracts(all_contracts.filter(c => c.active), indexFromStart);
    res.send("Indexer ran on active contracts");
  } catch (err) {
    logger.error("[Indexer] Failed to index active contracts", err);
    res.status(500).send("Failed to index active contracts");
  }
});

app.get("/index-all", async (req: Request, res: Response) => {
  try {
    const indexFromStart = req.query.indexFromStart === "true";
    logger.info(`[Indexer] Indexing all contracts. Indexing from start: ${indexFromStart}`);
    const indexer = new GovernanceContractIndexer();
    await indexer.initialize();
    await indexer.indexContracts(all_contracts, indexFromStart);
    res.send("Indexer ran on all contracts");
  } catch (err) {
    logger.error("[Indexer] Failed to index all contracts", err);
    res.status(500).send("Failed to index all contracts");
  }
});

app.listen(port, () => {
  logger.info(`[Indexer] Indexer API listening on port ${port}\nNetwork: ${process.env.NETWORK}\nDatabase: ${process.env.DB_NAME}`);
  startListener();
});