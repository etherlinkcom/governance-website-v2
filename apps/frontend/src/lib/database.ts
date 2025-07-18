import mysql from 'mysql2/promise';
import { GovernanceType, Period, ContractAndConfig, Proposal, Upvote, Promotion, Vote } from '@trilitech/types';

//TODO put somewhere
export interface PeriodDetailsResponse {
  proposals?: Proposal[];
  upvotes?: Upvote[];
  promotions?: Promotion[];
  votes?: Vote[];
  periodInfo: {
    contractAddress: string;
    contractVotingIndex: number;
    hasProposals: boolean;
    hasPromotions: boolean;
  };
}

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
      ORDER BY active DESC, started_at_level DESC`,
      [governanceType]
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
        JSON_LENGTH(proposal_hashes) > 0
        OR (promotion_hash IS NOT NULL AND promotion_hash != '')
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
    proposal_hashes: row.proposal_hashes || [],
    promotion_hash: row.promotion_hash || undefined,
  }));

  console.log(`[Database] Returned ${periods.length} periods for contract ${contractAddress}`);
  return periods;
}

  async getPeriodDetails(contractAddress: string, contractVotingIndex: number): Promise<PeriodDetailsResponse> {
    console.log(`[Database] Fetching period details for contract ${contractAddress}, period ${contractVotingIndex}`);

    try {
      // Fetch proposals for this period
      const proposals = await this.query<Proposal>(
        `SELECT * FROM proposals
         WHERE contract_address = ? AND contract_period_index = ?
         ORDER BY created_at DESC`,
        [contractAddress, contractVotingIndex]
      );

      // Fetch upvotes for proposals in this period
      // Since upvotes table doesn't have direct period reference, we need to join with proposals
      const upvotes = await this.query<Upvote>(
        `SELECT u.*
         FROM upvotes u
         JOIN proposals p ON u.proposal_hash = p.proposal_hash
         WHERE p.contract_address = ? AND p.contract_period_index = ?
         ORDER BY u.created_at DESC`,
        [contractAddress, contractVotingIndex]
      );

      // Fetch promotions for this period
      const promotions = await this.query<Promotion>(
        `SELECT * FROM promotions
         WHERE contract_address = ? AND contract_period_index = ?
         ORDER BY created_at DESC`,
        [contractAddress, contractVotingIndex]
      );

      // Fetch votes for promotions in this period
      // Join votes with promotions to get votes for this specific period
      const votes = await this.query<Vote>(
        `SELECT v.*
         FROM votes v
         JOIN promotions pr ON v.proposal_hash = pr.proposal_hash
         WHERE pr.contract_address = ? AND pr.contract_period_index = ?
         ORDER BY v.created_at DESC`,
        [contractAddress, contractVotingIndex]
      );

      const response: PeriodDetailsResponse = {
        periodInfo: {
          contractAddress,
          contractVotingIndex,
          hasProposals: proposals.length > 0,
          hasPromotions: promotions.length > 0,
        }
      };

      // Only include arrays that have data
      if (proposals.length > 0) {
        response.proposals = proposals;
      }

      if (upvotes.length > 0) {
        response.upvotes = upvotes;
      }

      if (promotions.length > 0) {
        response.promotions = promotions;
      }

      if (votes.length > 0) {
        response.votes = votes;
      }

      console.log(`[Database] Period details - Proposals: ${proposals.length}, Upvotes: ${upvotes.length}, Promotions: ${promotions.length}, Votes: ${votes.length}`);

      return response;

    } catch (error) {
      console.error(`[Database] Error fetching period details for ${contractAddress}, period ${contractVotingIndex}:`, error);
      throw error;
    }
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