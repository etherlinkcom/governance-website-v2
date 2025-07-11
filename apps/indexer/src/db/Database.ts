import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export class Database {
  private connection: mysql.Connection | null = null;
  private migrationsDir: string = path.join(__dirname, '../../migrations');
  private connectionConfig: mysql.ConnectionOptions = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'governance',
      port: parseInt(process.env.DB_PORT || '3306')
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

  private async ensureMigrationsTable(): Promise<void> {
    logger.info('[Database] ensureMigrationsTable()');
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.connection!.execute(sql);
  }

  private async getAppliedMigrations(): Promise<Set<string>> {
    logger.info('[Database] getAppliedMigrations()');
    const [rows] = await this.connection!.execute('SELECT name FROM migrations ORDER BY id') as any;
    return new Set(rows.map((row: any) => row.name));
  }

  private async applyMigration(id: number, name: string, sql: string): Promise<void> {
    logger.info(`[Database] applyMigration(${id}, ${name})`);

    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.connection!.execute(statement);
      }
    }

    await this.connection!.execute(
      'INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, NOW())',
      [id, name]
    );

    logger.info(`[Database] Migration ${name} applied successfully`);
  }

  private async runMigrations(): Promise<void> {
    logger.info('[Database] runMigrations()');

    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();

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

      await this.applyMigration(id, file, sql);
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

  // Helper methods for common database operations
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    logger.info(`[Database] query(${sql}, ${params})`);
    const connection = await this.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    logger.info(`[Database] queryOne(${sql}, ${params})`);
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async insert(sql: string, params?: any[]): Promise<number> {
    logger.info(`[Database] insert(${sql}, ${params})`);
    const connection = await this.getConnection();
    const [result] = await connection.execute(sql, params) as any;
    return result.insertId;
  }

  async update(sql: string, params?: any[]): Promise<number> {
    logger.info(`[Database] update(${sql}, ${params})`);
    const connection = await this.getConnection();
    const [result] = await connection.execute(sql, params) as any;
    return result.affectedRows;
  }

  async delete(sql: string, params?: any[]): Promise<number> {
    logger.info(`[Database] delete(${sql}, ${params})`);
    const connection = await this.getConnection();
    const [result] = await connection.execute(sql, params) as any;
    return result.affectedRows;
  }
}