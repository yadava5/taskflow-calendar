/**
 * Database configuration for Vercel API routes (Pure SQL via pg)
 */
import { Pool, types, type PoolClient, type QueryResult } from 'pg';
import { SUPABASE_CA } from './supabaseCA.js';

/**
 * TLS for the DB connection. Against Supabase we pin the Supabase Root
 * 2021 CA and REQUIRE certificate verification (rejectUnauthorized),
 * closing the MITM exposure of the old `sslmode=no-verify`. For a local
 * Postgres (no supabase/pooler in the host) TLS is left off.
 */
function resolveSsl(
  url: string
): false | { ca: string; rejectUnauthorized: true } {
  if (/supabase\.com|pooler\.supabase/.test(url)) {
    return { ca: SUPABASE_CA, rejectUnauthorized: true };
  }
  return false;
}

// Configure pg to parse TIMESTAMP WITHOUT TIME ZONE as UTC
// PostgreSQL TIMESTAMP WITHOUT TIME ZONE strips timezone info.
// By default, pg interprets returned timestamps as local time, which is incorrect.
// We need to interpret them as UTC since that's what we store.
// Type OID 1114 = TIMESTAMP (without time zone)
types.setTypeParser(1114, (stringValue: string) => {
  // Append 'Z' to indicate UTC when parsing
  return new Date(stringValue + 'Z');
});

// Database configuration object
export const databaseConfig = {
  url:
    process.env.DATABASE_URL ||
    'postgresql://localhost:5432/react_calendar_dev',
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
  connectionTimeout: parseInt(process.env.DATABASE_TIMEOUT || '10000'),
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '60000'),
};

// Global pool (cached in dev to avoid multiple instances during HMR)
declare global {
  var __pgPool: Pool | undefined;
}

const createPool = () => {
  const p = new Pool({
    connectionString: databaseConfig.url,
    max: databaseConfig.maxConnections,
    idleTimeoutMillis: databaseConfig.connectionTimeout,
    // Fail a stuck connect fast instead of hanging the whole request.
    connectionTimeoutMillis: databaseConfig.connectionTimeout,
    ssl: resolveSsl(databaseConfig.url),
    // Pin the schema for every connection this pool hands out. TaskFlow's
    // SQL uses unqualified table names (FROM users, FROM tasks, ...), and it
    // co-tenants a Supabase pooler with an app that connects as
    // `?schema=lifequest`. Without this, a pooled server connection left on
    // search_path=lifequest would resolve our unqualified queries against the
    // wrong schema → intermittent "relation ... does not exist" 500s. Setting
    // `options` also makes our connections un-shareable with the other tenant's
    // (the pooler keys server connections by startup parameters).
    // Single-token form (matches how Prisma sends `?schema=`), so the Supabase
    // pooler forwards it cleanly AND keys our server connections separately
    // from the co-tenant's `search_path=lifequest` ones — they never share.
    options: '--search_path=public',
  });
  // pg pools emit 'error' from IDLE clients (e.g. the Supabase pooler reaping a
  // server connection). With no listener, Node treats it as an unhandled
  // 'error' event and crashes the function → intermittent 500s. Swallow-and-log
  // instead; the pool transparently opens a fresh connection on the next query.
  p.on('error', (err) => {
    console.error('pg pool idle-client error (non-fatal):', err.message);
  });
  return p;
};

export const pool: Pool = globalThis.__pgPool || createPool();

// Cache the pool across warm serverless invocations (Fluid Compute reuses
// instances) so every request reuses one healthy, error-handled pool.
globalThis.__pgPool = pool;

export type SqlClient = Pool | PoolClient;

export async function initDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connected successfully (API)');
  } catch (error) {
    console.error('❌ Database connection failed (API):', error);
    throw error;
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { rows } = await pool.query('SELECT 1');
    return rows.length === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function cleanupDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database disconnected successfully (API)');
  } catch (error) {
    console.error('❌ Database disconnection failed (API):', error);
  }
}

// A dropped/reaped pooler connection surfaces as a connection-level error the
// first time pg touches it. These are safe to retry once on a pooled query
// (the retry draws a fresh connection); they are NOT retried inside a caller's
// own transaction (a passed-in `client`), where a mid-transaction reconnect
// would be incorrect.
function isTransientConnectionError(error: unknown): boolean {
  const e = error as { message?: string; code?: string };
  const msg = e?.message ?? '';
  return (
    /Connection terminated|connection terminated unexpectedly|server closed the connection|read ECONNRESET|Client has encountered a connection error|timeout expired|ETIMEDOUT|ECONNRESET|EPIPE/i.test(
      msg
    ) || e?.code === 'ECONNRESET'
  );
}

// Simple query helper
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = [],
  client?: SqlClient
): Promise<QueryResult<T>> {
  if (client) {
    return (client as PoolClient).query<T>(sql, params);
  }
  try {
    return await pool.query<T>(sql, params);
  } catch (error) {
    if (isTransientConnectionError(error)) {
      console.warn('pg transient error, retrying query once:', String(error));
      return pool.query<T>(sql, params);
    }
    throw error;
  }
}

// Transaction helper for API routes
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    client.release();
  }
}

// NOTE: no `process.on('beforeExit')` pool teardown here. Under Fluid Compute a
// warm instance is reused across requests, and `beforeExit` fires whenever the
// event loop drains between requests — ending the pool there would leave the
// next reused invocation querying an already-ended pool ("Cannot use a pool
// after calling end") → intermittent 500s. Let the platform reap connections.

export default pool;
