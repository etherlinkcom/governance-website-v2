import mysql, { FieldPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { ContractAndConfig, Period, Promotion, Proposal, Upvote, Vote } from 'packages/types';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private pool: mysql.Pool | null = null;
  private migrationsDir: string = path.join(process.cwd(), 'src/db/migrations');
  private poolConfig: mysql.ConnectionOptions = {
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      port: parseInt(process.env.DB_PORT!),
      timezone: 'Z',
      dateStrings: false,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
      keepAliveInitialDelay: 0,
      idleTimeout: 300000,
      maxIdle: 10,
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
    try {
      if (!this.pool) {
        this.pool = mysql.createPool(this.poolConfig);
        await this.pool.execute("SET time_zone = '+00:00'");
        logger.info('[Database] Connected to MySQL database');
      }
    } catch (error) {
      logger.error('[Database] Error connecting to MySQL database:', error);
    }
  }

  async getPool(): Promise<mysql.Pool | null> {
    logger.info('[Database] getPool()');
    try {
      if (!this.pool) await this.connect();
      return this.pool;
    } catch (error: any) {
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.warn('[Database] Pool lost, recreating...');
        await this.close();
        await this.connect();
        return this.pool;
      }
      logger.error('[Database] Error getting database pool:', error);
    }
    return null;
  }

  private async runMigrations(): Promise<void> {
    logger.info('[Database] runMigrations()');

    await this.pool!.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const [rows] = await this.pool!.execute('SELECT name FROM migrations ORDER BY id') as any;
    const applied = new Set(rows.map((row: any) => row.name));

    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    logger.info(`[Database] Found ${files.length} migration files`);

    for (const file of files) {
      if (applied.has(file)) {
        logger.info(`[Database] Already applied: ${file}`);
        continue;
      }

      const id = parseInt(file.split('_')[0], 10);
      const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');

      logger.info(`[Database] Applying migration ${file} (id: ${id})...`);

      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await this.pool!.execute(statement);
        }
      }

      await this.pool!.execute(
        'INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, NOW())',
        [id, file]
      );

      logger.info(`[Database] Migration ${file} applied successfully`);
    }

    logger.info('[Database] All migrations applied successfully');
  }

  async close(): Promise<void> {
    logger.info('[Database] close() Closing database connection...');
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('[Database] Database connection closed');
    }
  }

  async upsert(sql: string, params?: any[]): Promise<{ insertId?: number; affectedRows: number }> {
    logger.info(`[Database] upsert(${sql}, ${params})`);
    const retries = 3;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const connection = await this.getPool();
        if (!connection) {
          logger.error('[Database] No pool available, skipping upsert.');
          return { affectedRows: 0, insertId: undefined };
        }
        const [result] = await connection.execute(sql, params) as any;
        return {
          insertId: result.insertId,
          affectedRows: result.affectedRows
        };
      } catch (error) {
          logger.error(`[Database] Error executing upsert (attempt ${attempt}): ${error}`);
          logger.info(`[Database] Retrying upsert (attempt ${attempt + 1})...`);
          await this.close();
          await this.connect();
          await new Promise(res => setTimeout(res, attempt * 1000));
          continue;
      }
    }
    return { affectedRows: 0, insertId: undefined };
  }

  private formatDateForMySQL(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private sanitizeValues(values: any[]): any[] {
    return values.map(value => {
      if (value === undefined) return null;

      if (value === '') return null;

      if (value && typeof value === 'object' && value.constructor === Object) {
        return JSON.stringify(value);
      }

      return value;
    });
  }

  async upsertProposal(proposal: Proposal): Promise<void> {
    try {

    const values = [
      proposal.contract_period_index,
      proposal.level,
      this.formatDateForMySQL(proposal.time),
      proposal.proposal_hash,
      proposal.transaction_hash,
      proposal.contract_address,
      proposal.proposer,
      proposal.alias,
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
  } catch (error) {
      logger.error(`[Database] Error upserting proposal: ${error}`);
    }
  }

  async upsertVote(vote: Vote): Promise<void> {
    try {

    const values = [
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
        proposal_hash,
        baker,
        alias,
        voting_power,
        vote,
        transaction_hash,
        level,
        time
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         voting_power = VALUES(voting_power),
         vote = VALUES(vote),
         alias = VALUES(alias),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  } catch (error) {
      logger.error(`[Database] Error upserting vote: ${error}`);
    }
  }

  async upsertPromotion(promotion: Promotion): Promise<void> {
    try {

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
    } catch (error) {
      logger.error(`[Database] Error upserting promotion: ${error}`);
    }
  }

  async upsertUpvote(upvote: Upvote): Promise<void> {
    try {

    const values = [
      upvote.level,
      this.formatDateForMySQL(upvote.time),
      upvote.transaction_hash,
      upvote.proposal_hash,
      upvote.baker,
      upvote.alias,
      upvote.voting_power,
      upvote.contract_period_index
    ];

    await this.upsert(
      `INSERT INTO upvotes (level, time, transaction_hash, proposal_hash, baker, alias, voting_power, contract_period_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         voting_power = VALUES(voting_power),
         alias = VALUES(alias),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
    } catch (error) {
      logger.error(`[Database] Error upserting upvote: ${error}`);
    }
  }

  async upsertContract(contract: ContractAndConfig): Promise<void> {
    try {

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
      contract.promotion_supermajority,
      contract.active ? 1 : 0
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
        promotion_supermajority,
        active
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         started_at_level = VALUES(started_at_level),
         period_length = VALUES(period_length),
         adoption_period_sec = VALUES(adoption_period_sec),
         upvoting_limit = VALUES(upvoting_limit),
         scale = VALUES(scale),
         proposal_quorum = VALUES(proposal_quorum),
         promotion_quorum = VALUES(promotion_quorum),
         promotion_supermajority = VALUES(promotion_supermajority),
         active = VALUES(active),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  } catch (error) {
      logger.error(`[Database] Error upserting contract: ${error}`);
    }
  }

  async upsertPeriod(period: Period): Promise<void> {
    try {

    const values = [
      period.contract_voting_index,
      period.contract_address,
      period.level_start,
      period.level_end,
      period.date_start ? this.formatDateForMySQL(period.date_start.toString()) : null,
      period.date_end ? this.formatDateForMySQL(period.date_end.toString()) : null,
      JSON.stringify(this.sanitizeValues(period.proposal_hashes || [])),
      period.promotion_hash,
      period.total_voting_power
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
        promotion_hash,
        total_voting_power
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         date_end = VALUES(date_end),
         proposal_hashes = VALUES(proposal_hashes),
          promotion_hash = CASE
            WHEN VALUES(promotion_hash) IS NOT NULL THEN VALUES(promotion_hash)
            ELSE promotion_hash
          END,
         total_voting_power = VALUES(total_voting_power),
         updated_at = CURRENT_TIMESTAMP`,
      this.sanitizeValues(values)
    );
  } catch (error) {
      logger.error(`[Database] Error upserting period: ${error}`);
    }
  }

  async upsertContracts(contracts: (ContractAndConfig)[]): Promise<void> {
    logger.info(`[Database] upsertContracts(${contracts.length} contracts)`);
    for (const contract of contracts) {
      await this.upsertContract(contract);
    }
  }

  async upsertPeriods(periods: Period[]): Promise<void> {
    logger.info(`[Database] upsertPeriods(${periods.length} periods)`);
    for (const period of periods) {
      await this.upsertPeriod(period);
    }
  }

  async upsertProposals(proposals: Proposal[]): Promise<void> {
    logger.info(`[Database] upsertProposals(${proposals.length} proposals)`);
    for (const proposal of proposals) {
      await this.upsertProposal(proposal);
    }
  }

  async upsertVotes(votes: Vote[]): Promise<void> {
    logger.info(`[Database] upsertVotes(${votes.length} votes)`);
    for (const vote of votes) {
      await this.upsertVote(vote);
    }
  }

  async upsertPromotions(promotions: Promotion[]): Promise<void> {
    logger.info(`[Database] upsertPromotions(${promotions.length} promotions)`);
    for (const promotion of promotions) {
      await this.upsertPromotion(promotion);
    }
  }

  async upsertUpvotes(upvotes: Upvote[]): Promise<void> {
    logger.info(`[Database] upsertUpvotes(${upvotes.length} upvotes)`);
    for (const upvote of upvotes) {
      await this.upsertUpvote(upvote);
    }
  }

  async getLastProcessedPeriod(contract_address: string): Promise<Period | null> {
      const connection = await this.getPool();
      if (!connection) {
          logger.error('[Database] No pool available, skipping getLastProcessedPeriod.');
          return null;
      }
      const [rows] = await connection.execute(
          `SELECT * FROM periods WHERE contract_address = ? ORDER BY contract_voting_index DESC LIMIT 1`,
          [contract_address]
      ) as [Period[], FieldPacket[]];
      return rows.length > 0 ? rows[0] : null;
  }


  async getPeriod(contract_address: string, contract_voting_index: number): Promise<Period | null> {
      const connection = await this.getPool();
      if (!connection) {
          logger.error('[Database] No pool available, skipping getPeriod.');
          return null;
      }
      const [rows] = await connection.execute(
          `SELECT * FROM periods WHERE contract_address = ? AND contract_voting_index = ?`,
          [contract_address, contract_voting_index]
      ) as [Period[], FieldPacket[]];
      return rows.length > 0 ? rows[0] : null;
  }
}