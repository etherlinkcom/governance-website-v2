import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { ContractAndConfig, Period, Promotion, Proposal, Upvote, Vote } from 'packages/types';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private connection: mysql.Connection | null = null;
  private migrationsDir: string = path.join(__dirname, './migrations');
  private connectionConfig: mysql.ConnectionOptions = {
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      port: parseInt(process.env.DB_PORT!),
      timezone: 'Z',
      dateStrings: false
    };

  constructor() {}

  async initialize(): Promise<void> {
    logger.info('[Database] initialize()');
    await this.connect();
    await this.runMigrations();
    logger.info('[Database] Database initialized successfully');
  }

  private async connect(): Promise<void> {
    logger.info('[Database] connect()');
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.connectionConfig);
      await this.connection.execute("SET time_zone = '+00:00'");
      logger.info('[Database] Connected to MySQL database');
    }
  }

  async getConnection(): Promise<mysql.Connection> {
    logger.info('[Database] getConnection()');
    if (!this.connection) {
      await this.connect();
    }
    return this.connection!;
  }

  private async runMigrations(): Promise<void> {
    logger.info('[Database] runMigrations()');

    // Ensure migrations table exists
    await this.connection!.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get applied migrations
    const [rows] = await this.connection!.execute('SELECT name FROM migrations ORDER BY id') as any;
    const applied = new Set(rows.map((row: any) => row.name));

    // Read and apply new migrations
    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        logger.info(`[Database] Already applied: ${file}`);
        continue;
      }

      const id = parseInt(file.split('_')[0], 10);
      const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');

      logger.info(`[Database] Applying migration ${file} (id: ${id})...`);

      // Execute migration statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection!.execute(statement);
        }
      }

      // Record migration as applied
      await this.connection!.execute(
        'INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, NOW())',
        [id, file]
      );

      logger.info(`[Database] Migration ${file} applied successfully`);
    }

    logger.info('[Database] All migrations applied successfully');
  }

  async close(): Promise<void> {
    logger.info('[Database] close() Closing database connection...');
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      logger.info('[Database] Database connection closed');
    }
  }

  async upsert(sql: string, params?: any[]): Promise<{ insertId?: number; affectedRows: number }> {
    logger.info(`[Database] upsert(${sql}, ${params})`);
    const connection = await this.getConnection();
    const [result] = await connection.execute(sql, params) as any;
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  private formatDateForMySQL(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private sanitizeValues(values: any[]): any[] {
    return values.map(value => {
      // Convert undefined to null
      if (value === undefined) return null;

      // Convert empty strings to null for optional fields (if desired)
      if (value === '') return null;

      return value;
    });
  }

  async upsertProposal(proposal: Proposal): Promise<void> {
    const values = [
      proposal.contract_period_index,
      proposal.level,
      this.formatDateForMySQL(proposal.time),
      proposal.proposal_hash,
      proposal.transaction_hash,
      proposal.contract_address,
      proposal.proposer,
      proposal.alias
    ];

    await this.upsert(
      `INSERT INTO proposals (
        contract_period_index,
        level,
        time,
        proposal_hash,
        transaction_hash,
        contract_address,
        proposer,
        alias
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         level = VALUES(level),
         time = VALUES(time),
         proposer = VALUES(proposer),
         alias = VALUES(alias),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertVote(vote: Vote): Promise<void> {
    const values = [
      vote.id,
      vote.proposal_hash,
      vote.baker,
      vote.alias,
      vote.voting_power,
      vote.vote,
      vote.transaction_hash,
      vote.level,
      this.formatDateForMySQL(vote.time)
    ];

    await this.upsert(
      `INSERT INTO votes (
        tzkt_id,
        proposal_hash,
        baker,
        alias,
        voting_power,
        vote,
        transaction_hash,
        level,
        time
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         voting_power = VALUES(voting_power),
         vote = VALUES(vote),
         alias = VALUES(alias),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertPromotion(promotion: Promotion): Promise<void> {
    const values = [
      promotion.proposal_hash,
      promotion.contract_period_index,
      promotion.contract_address,
      promotion.yea_voting_power,
      promotion.nay_voting_power,
      promotion.pass_voting_power,
      promotion.total_voting_power
    ];

    await this.upsert(
      `INSERT INTO promotions (
        proposal_hash,
        contract_period_index,
        contract_address,
        yea_voting_power,
        nay_voting_power,
        pass_voting_power,
        total_voting_power
      )
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         yea_voting_power = VALUES(yea_voting_power),
         nay_voting_power = VALUES(nay_voting_power),
         pass_voting_power = VALUES(pass_voting_power),
         total_voting_power = VALUES(total_voting_power),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertUpvote(upvote: Upvote): Promise<void> {
    const values = [
      upvote.level,
      this.formatDateForMySQL(upvote.time),
      upvote.transaction_hash,
      upvote.proposal_hash,
      upvote.baker,
      upvote.alias,
      upvote.voting_power
    ];

    await this.upsert(
      `INSERT INTO upvotes (level, time, transaction_hash, proposal_hash, baker, alias, voting_power)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         voting_power = VALUES(voting_power),
         alias = VALUES(alias),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertContract(contract: ContractAndConfig): Promise<void> {
    const values = [
      contract.contract_address,
      contract.governance_type,
      contract.started_at_level,
      contract.period_length,
      contract.adoption_period_sec,
      contract.upvoting_limit,
      contract.scale,
      contract.proposal_quorum,
      contract.promotion_quorum,
      contract.promotion_supermajority
    ];

    await this.upsert(
      `INSERT INTO contracts (
        contract_address,
        governance_type,
        started_at_level,
        period_length,
        adoption_period_sec,
        upvoting_limit,
        scale,
        proposal_quorum,
        promotion_quorum,
        promotion_supermajority
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         started_at_level = VALUES(started_at_level),
         period_length = VALUES(period_length),
         adoption_period_sec = VALUES(adoption_period_sec),
         upvoting_limit = VALUES(upvoting_limit),
         scale = VALUES(scale),
         proposal_quorum = VALUES(proposal_quorum),
         promotion_quorum = VALUES(promotion_quorum),
         promotion_supermajority = VALUES(promotion_supermajority),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertPeriod(period: Period): Promise<void> {
    const values = [
      period.contract_voting_index,
      period.contract_address,
      period.level_start,
      period.level_end,
      period.date_start ? this.formatDateForMySQL(period.date_start.toString()) : null,
      period.date_end ? this.formatDateForMySQL(period.date_end.toString()) : null,
      JSON.stringify(period.proposal_hashes || []),
      period.promotion_hash
    ];

    await this.upsert(
      `INSERT INTO periods (
        contract_voting_index,
        contract_address,
        level_start,
        level_end,
        date_start,
        date_end,
        proposal_hashes,
        promotion_hash
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         level_start = VALUES(level_start),
         level_end = VALUES(level_end),
         date_start = VALUES(date_start),
         date_end = VALUES(date_end),
         proposal_hashes = VALUES(proposal_hashes),
         promotion_hash = VALUES(promotion_hash),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  }

  async upsertContracts(contracts: (ContractAndConfig)[]): Promise<void> {
    for (const contract of contracts) {
      await this.upsertContract(contract);
    }
  }

  async upsertPeriods(periods: Period[]): Promise<void> {
    for (const period of periods) {
      await this.upsertPeriod(period);
    }
  }

  async upsertProposals(proposals: Proposal[]): Promise<void> {
    for (const proposal of proposals) {
      await this.upsertProposal(proposal);
    }
  }

  async upsertVotes(votes: Vote[]): Promise<void> {
    for (const vote of votes) {
      await this.upsertVote(vote);
    }
  }

  async upsertPromotions(promotions: Promotion[]): Promise<void> {
    for (const promotion of promotions) {
      await this.upsertPromotion(promotion);
    }
  }

  async upsertUpvotes(upvotes: Upvote[]): Promise<void> {
    for (const upvote of upvotes) {
      await this.upsertUpvote(upvote);
    }
  }
}