import dotenv from 'dotenv';
dotenv.config();

import express, {Request, Response} from "express";
import { TzktListener } from "./TzktListener";
import { all_contracts } from "./contracts";
import { GovernanceContractIndexer } from "./GovernanceContractIndexer";
import { logger } from "./utils/logger";
import { Contract } from './types';

const app = express();
const port = process.env.PORT || 8080;

let listener: TzktListener | null = null;

// TODO initialize db and run migrations here

app.get("/start-listener", (_req: Request, res: Response) => {
  if (listener) {
    return res.status(400).send("Listener already running");
  }
  listener = new TzktListener(all_contracts.filter((contract: Contract) => contract.active));
  listener.start()
  res.send("TzKT Listener started");
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
  logger.info(`[Indexer] Indexer API listening on port ${port}`);
});