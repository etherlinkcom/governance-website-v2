import mysql from 'mysql2/promise';
import { GovernanceType, Period, ContractAndConfig } from '@trilitech/types';

export class Database {
  private connection: mysql.Connection | null = null;

  private connectionConfig: mysql.ConnectionOptions = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT!),
    timezone: 'Z',
    dateStrings: false,
    connectTimeout: 10000,
    keepAliveInitialDelay: 0,
    idleTimeout: 300000,
  };

  private async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.connectionConfig);
      await this.connection.execute("SET time_zone = '+00:00'");
      console.log('[Database] Connected to MySQL database');
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
      console.error('[Database] Query error:', error);
      console.error('[Database] SQL:', sql);
      console.error('[Database] Params:', params);
      throw error;
    }
  }

  async getContracts(governanceType: GovernanceType): Promise<ContractAndConfig[]> {
    console.log(`[Database] Fetching contracts for ${governanceType} governance`);

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
      WHERE governance_type = ?
      ORDER BY started_at_level DESC`,
      [governanceType]
    );
    // TODO and active first

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

    console.log(`[Database] Returned ${contracts.length} contracts for ${governanceType}`);
    return contracts;
  }

  async getPeriods(contractAddress: string): Promise<Period[]> {
    console.log(`[Database] Fetching periods for contract ${contractAddress}`);

    const rows = await this.query<any>(
      `SELECT
        contract_voting_index,
        contract_address,
        level_start,
        level_end,
        date_start,
        date_end,
        proposal_hashes,
        promotion_hash
      FROM periods
      WHERE contract_address = ?
        AND (
          (proposal_hashes IS NOT NULL AND proposal_hashes != '[]' AND proposal_hashes != '' AND proposal_hashes != 'null')
          OR (promotion_hash IS NOT NULL AND promotion_hash != '' AND promotion_hash != 'null')
        )
      ORDER BY contract_voting_index DESC`,
      [contractAddress]
    );

    const periods: Period[] = rows.map((row: any) => ({
      contract_voting_index: row.contract_voting_index,
      contract_address: row.contract_address,
      level_start: row.level_start,
      level_end: row.level_end,
      date_start: row.date_start,
      date_end: row.date_end,
      proposal_hashes: row.proposal_hashes ? JSON.parse(row.proposal_hashes) : [],
      promotion_hash: row.promotion_hash || undefined,
    }));

    console.log(`[Database] Returned ${periods.length} periods for contract ${contractAddress}`);
    return periods;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('[Database] Database connection closed');
    }
  }
}

export const database = new Database();