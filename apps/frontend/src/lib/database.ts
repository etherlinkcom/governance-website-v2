import mysql from "mysql2/promise";
import {
  GovernanceType,
  Period,
  ContractAndConfig,
  Proposal,
  Upvote,
  Promotion,
  Vote,
} from "@trilitech/types";
import { PeriodDetailsResponse, FrontendPeriod } from "@/types/api";

export class Database {
  private connection: mysql.Connection | null = null;

  private connectionConfig: mysql.ConnectionOptions = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT!),
    timezone: "Z",
    dateStrings: false,
    connectTimeout: 10000,
    keepAliveInitialDelay: 0,
    idleTimeout: 300000,
  };

  private async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.connectionConfig);
      await this.connection.execute("SET time_zone = '+00:00'");
      console.log("[Database] Connected to MySQL database");
    }
  }

  private async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      await this.connect();
    }
    return this.connection!;
  }

  private async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const connection = await this.getConnection();
      const [rows] = await connection.execute(sql, params || []);
      return rows as T[];
    } catch (error) {
      console.error("[Database] Query error:", error);
      console.error("[Database] SQL:", sql);
      console.error("[Database] Params:", params);
      throw error;
    }
  }

  async getActiveContracts(
  ): Promise<ContractAndConfig[]> {
    console.log(`[Database] Fetching contracts for governance`);

    const rows = await this.query<any>(
      `SELECT
        contract_address,
        governance_type,
        started_at_level,
        active,
        period_length,
        adoption_period_sec,
        upvoting_limit,
        scale,
        proposal_quorum,
        promotion_quorum,
        promotion_supermajority
      FROM contracts
      WHERE active = 1`,
    );

    const contracts: ContractAndConfig[] = rows.map((row: any) => ({
      contract_address: row.contract_address,
      governance_type: row.governance_type,
      started_at_level: row.started_at_level,
      active: row.active,
      period_length: row.period_length,
      adoption_period_sec: row.adoption_period_sec,
      upvoting_limit: row.upvoting_limit,
      scale: row.scale,
      proposal_quorum: row.proposal_quorum,
      promotion_quorum: row.promotion_quorum,
      promotion_supermajority: row.promotion_supermajority,
    }));

    console.log(`[Database] Returned ${contracts.length} contracts`);
    return contracts;
  }

  async getCurrentPeriod(governanceType: GovernanceType): Promise<FrontendPeriod | null> {
    console.log(`[Database] Fetching current period for ${governanceType} governance`);

    const rows = await this.query<any>(
      `SELECT
      periods.date_start,
      periods.date_end,
      periods.contract_address,
      contracts.governance_type,
      periods.contract_voting_index,
      periods.promotion_hash,

      -- Promotion data
      promotions.yea_voting_power,
      promotions.nay_voting_power,
      promotions.pass_voting_power,
      promotions.total_voting_power,
      promotions.created_at as promotion_created_at,

      -- Proposal data
      proposals.proposal_hash,
      proposals.proposer,
      proposals.alias,
      proposals.upvotes,
      proposals.level,
      proposals.time,
      proposals.transaction_hash,
      proposals.created_at as proposal_created_at

    FROM periods
    JOIN contracts ON periods.contract_address = contracts.contract_address
    LEFT JOIN promotions ON periods.promotion_hash = promotions.proposal_hash
      AND periods.contract_voting_index = promotions.contract_period_index
      AND periods.contract_address = promotions.contract_address
    LEFT JOIN proposals ON periods.contract_address = proposals.contract_address
      AND periods.contract_voting_index = proposals.contract_period_index
    WHERE contracts.governance_type = ?
      AND contracts.active = 1
      AND periods.level_end = (
        SELECT MAX(p2.level_end)
        FROM periods p2
        JOIN contracts c2 ON p2.contract_address = c2.contract_address
        WHERE c2.governance_type = ? AND c2.active = 1
      )
    ORDER BY proposals.level DESC, proposals.created_at DESC`,
    [governanceType, governanceType]
  );

  if (rows.length === 0) {
    console.log(`[Database] No current period found for ${governanceType} governance`);
    return null;
  }

  return this.buildPeriodFromRows(rows)[0];
}

async getPastPeriods(governanceType: GovernanceType): Promise<FrontendPeriod[]> {
  console.log(`[Database] Fetching past periods with activity for ${governanceType} governance`);

  const rows = await this.query<any>(
    `SELECT
      periods.date_start,
      periods.date_end,
      periods.contract_address,
      contracts.governance_type,
      periods.contract_voting_index,
      periods.promotion_hash,

      -- Promotion data
      promotions.yea_voting_power,
      promotions.nay_voting_power,
      promotions.pass_voting_power,
      promotions.total_voting_power,
      promotions.created_at as promotion_created_at,

      -- Proposal data
      proposals.proposal_hash,
      proposals.proposer,
      proposals.alias,
      proposals.upvotes,
      proposals.level,
      proposals.time,
      proposals.transaction_hash,
      proposals.created_at as proposal_created_at

    FROM periods
    JOIN contracts ON periods.contract_address = contracts.contract_address
    LEFT JOIN promotions ON periods.promotion_hash = promotions.proposal_hash
      AND periods.contract_voting_index = promotions.contract_period_index
      AND periods.contract_address = promotions.contract_address
    LEFT JOIN proposals ON periods.contract_address = proposals.contract_address
      AND periods.contract_voting_index = proposals.contract_period_index
    WHERE contracts.governance_type = ?
      AND (
        EXISTS (
          SELECT 1 FROM proposals p
          WHERE p.contract_address = periods.contract_address
            AND p.contract_period_index = periods.contract_voting_index
        )
        OR periods.promotion_hash IS NOT NULL
      )
      AND NOT (contracts.active = 1 AND periods.level_end = (
        SELECT MAX(p2.level_end)
        FROM periods p2
        JOIN contracts c2 ON p2.contract_address = c2.contract_address
        WHERE c2.governance_type = ? AND c2.active = 1
      ))
    ORDER BY periods.level_end DESC, proposals.level DESC, proposals.created_at DESC`,
    [governanceType, governanceType]
  );

  return this.buildPeriodFromRows(rows);
}

  private buildPeriodFromRows(rows: any[]): FrontendPeriod[] {
    if (rows.length === 0) return [];

    const periodsMap = new Map<string, FrontendPeriod>();

    for (const row of rows) {
      const periodKey = `${row.contract_address}-${row.contract_voting_index}`;

      if (!periodsMap.has(periodKey)) {
        const period: FrontendPeriod = {
          startDateTime: new Date(row.date_start),
          endDateTime: new Date(row.date_end),
          startLevel: row.level_start,
          endLevel: row.level_end,
          contract: row.contract_address,
          governance: row.governance_type,
        };

        if (row.promotion_hash) {
          period.promotion = {
            proposal_hash: row.promotion_hash,
            contract_period_index: row.contract_voting_index,
            contract_address: row.contract_address,
            yea_voting_power: row.yea_voting_power || 0,
            nay_voting_power: row.nay_voting_power || 0,
            pass_voting_power: row.pass_voting_power || 0,
            total_voting_power: row.total_voting_power || 0,
          };
        }

        periodsMap.set(periodKey, period);
      }

      if (row.proposal_hash) {
        const period = periodsMap.get(periodKey)!;

        if (!period.proposals) period.proposals = [];

        const proposalExists = period.proposals.some(
          (p) => p.proposal_hash === row.proposal_hash
        );

        if (!proposalExists) {
          period.proposals.push({
            proposal_hash: row.proposal_hash,
            proposer: row.proposer || undefined,
            alias: row.alias || undefined,
            upvotes: row.upvotes || 0,
            level: row.level,
            time: row.time,
            transaction_hash: row.transaction_hash,
            contract_address: row.contract_address,
            contract_period_index: row.contract_voting_index,
          });
        }
      }
    }

    // Return as array - already sorted by SQL!
    return Array.from(periodsMap.values());
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log("[Database] Database connection closed");
    }
  }
}

export const database = new Database();
