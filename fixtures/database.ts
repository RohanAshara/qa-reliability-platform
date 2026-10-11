import { Client, QueryResult } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export interface QueryMetrics {
  sql: string;
  durationMs: number;
  rowCount: number | null;
}

/**
 * Enterprise Database Helper for automated data integrity validation.
 * Supports direct SQL querying, relational integrity audits, orphan detection,
 * and test lifecycle data cleanup.
 */
export class DatabaseHelper {
  private client: Client | null = null;
  private connectionString: string;
  public queryLogs: QueryMetrics[] = [];

  constructor(connectionString?: string) {
    this.connectionString =
      connectionString ||
      process.env.DATABASE_URL ||
      'postgresql://admin:password@localhost:5432/qa_db';
  }

  /**
   * Establish connection to PostgreSQL database.
   */
  async connect(): Promise<void> {
    if (this.client) return;

    this.client = new Client({
      connectionString: this.connectionString,
      connectionTimeoutMillis: 5000,
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.client = null;
      throw new Error(
        `[DatabaseHelper] Failed to connect to PostgreSQL at ${this.connectionString}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Health probe to verify database connectivity.
   */
  async ping(): Promise<boolean> {
    try {
      const res = await this.query<{ result: number }>('SELECT 1 as result');
      return res.length > 0 && res[0].result === 1;
    } catch {
      return false;
    }
  }

  /**
   * Execute a query and return rows.
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.client) {
      await this.connect();
    }

    const start = performance.now();
    const result: QueryResult = await this.client!.query(sql, params);
    const durationMs = Math.round(performance.now() - start);

    this.queryLogs.push({
      sql,
      durationMs,
      rowCount: result.rowCount,
    });

    return result.rows as T[];
  }

  /**
   * Return a single row or null.
   */
  async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /**
   * Execute an INSERT/UPDATE/DELETE and return affected row count.
   */
  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.client) {
      await this.connect();
    }
    const result = await this.client!.query(sql, params);
    return result.rowCount ?? 0;
  }

  /**
   * Enterprise Relational Integrity Audit:
   * Checks whether child table contains orphaned foreign keys that do not exist in parent table.
   */
  async detectOrphans(
    childTable: string,
    foreignKey: string,
    parentTable: string,
    parentKey: string = 'id'
  ): Promise<any[]> {
    const sql = `
      SELECT c.${foreignKey} as orphan_id
      FROM ${childTable} c
      LEFT JOIN ${parentTable} p ON c.${foreignKey} = p.${parentKey}
      WHERE p.${parentKey} IS NULL AND c.${foreignKey} IS NOT NULL;
    `;
    return this.query(sql);
  }

  /**
   * Get row count of a table with optional WHERE filter.
   */
  async getRowCount(tableName: string, whereClause?: string): Promise<number> {
    const sql = whereClause
      ? `SELECT COUNT(*)::int as count FROM ${tableName} WHERE ${whereClause}`
      : `SELECT COUNT(*)::int as count FROM ${tableName}`;
    const result = await this.getOne<{ count: number }>(sql);
    return result?.count ?? 0;
  }

  /**
   * Safe cleanup of test records created during test runs.
   */
  async cleanup(tableName: string, column: string, value: any): Promise<number> {
    return this.execute(`DELETE FROM ${tableName} WHERE ${column} = $1`, [value]);
  }

  /**
   * Disconnect cleanly.
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}
