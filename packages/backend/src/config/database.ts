import { Pool, type PoolClient, type QueryResult } from 'pg';
import { SUPABASE_CA } from './supabaseCA.js';

/** Verify the DB server's cert against Supabase's CA (see lib/config). */
function resolveSsl(
  url: string
): false | { ca: string; rejectUnauthorized: true } {
  return /supabase\.com|pooler\.supabase/.test(url)
    ? { ca: SUPABASE_CA, rejectUnauthorized: true }
    : false;
}

// Pure SQL (pg) client for the backend workspace
export const databaseConfig = {
  url:
    process.env.DATABASE_URL ||
    'postgresql://localhost:5432/react_calendar_dev',
  max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
  idleTimeoutMillis: parseInt(process.env.DATABASE_TIMEOUT || '10000'),
};

declare global {
  var __backendPgPool: Pool | undefined;
}

const createPool = () => {
  const p = new Pool({
    connectionString: databaseConfig.url,
    max: databaseConfig.max,
    idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
    // Fail a stuck connect fast instead of hanging the whole request.
    connectionTimeoutMillis: databaseConfig.idleTimeoutMillis,
    ssl: resolveSsl(databaseConfig.url),
    // Pin the schema for every connection this pool hands out. AuthService's SQL
    // uses unqualified table names (FROM users, ...), and it co-tenants a
    // Supabase pooler with an app that connects as `?schema=lifequest`. Without
    // this, a pooled server connection left on search_path=lifequest resolves
    // our unqualified queries against the wrong schema → intermittent
    // "relation ... does not exist" 500s on login/register/refresh. Mirrors the
    // pin already on lib/config/database.ts (the CRUD pool); `options` also keys
    // our server connections separately from the co-tenant's so they never share.
    options: '--search_path=public',
  });
  // pg pools emit 'error' from IDLE clients (e.g. the Supabase pooler reaping a
  // server connection). With no listener Node treats it as an unhandled 'error'
  // event and crashes the function → intermittent 500s. Swallow-and-log; the
  // pool transparently opens a fresh connection on the next query.
  p.on('error', (err) => {
    console.error('pg pool idle-client error (non-fatal):', err.message);
  });
  return p;
};

// Cache the pool across warm serverless invocations (Fluid Compute reuses
// instances) so every request — in production too — reuses one healthy,
// error-handled pool rather than leaking a fresh pool per module evaluation.
export const pool: Pool = globalThis.__backendPgPool || createPool();
globalThis.__backendPgPool = pool;

export type SqlClient = Pool | PoolClient;

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
  console.log('✅ Backend (SQL) connected');
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  console.log('✅ Backend (SQL) disconnected');
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { rows } = await pool.query('SELECT 1');
    return rows.length === 1;
  } catch (e) {
    console.error('Database health check failed (backend):', e);
    return false;
  }
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failures
    }
    throw e;
  } finally {
    client.release();
  }
}

// A dropped/reaped pooler connection surfaces as a connection-level error the
// first time pg touches it. These are safe to retry once on a pooled query (the
// retry draws a fresh connection); NOT retried inside a caller's own transaction
// (a passed-in `client`), where a mid-transaction reconnect would be incorrect.
function isTransientConnectionError(error: unknown): boolean {
  const e = error as { message?: string; code?: string };
  const msg = e?.message ?? '';
  return (
    /Connection terminated|connection terminated unexpectedly|server closed the connection|read ECONNRESET|Client has encountered a connection error|timeout expired|ETIMEDOUT|ECONNRESET|EPIPE/i.test(
      msg
    ) || e?.code === 'ECONNRESET'
  );
}

export async function query<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  sql: string,
  params: unknown[] = [],
  client?: SqlClient
): Promise<QueryResult<T>> {
  if (client && 'query' in client) {
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

// Graceful shutdown for the long-running backend server. NOTE: deliberately no
// 'beforeExit' teardown — under serverless (Fluid Compute) beforeExit fires when
// the event loop drains BETWEEN requests on a reused instance; ending the pool
// there makes the next invocation query an already-ended pool ("Cannot use a
// pool after calling end") → intermittent 500s. Let the platform reap connections.
process.on('SIGINT', () => void disconnectDatabase());
process.on('SIGTERM', () => void disconnectDatabase());

export default pool;
