import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  user: process.env.DATABASE_USER || 'doadmin',
  password: process.env.DATABASE_PASSWORD || 'AVNS_fSdVchp9k4CbGWGAVRP',
  host: process.env.DATABASE_HOST || 'db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com',
  port: parseInt(process.env.DATABASE_PORT || '25060'),
  database: process.env.DATABASE_NAME || 'defaultdb',
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error('Database query error:', {
      text,
      params,
      error: dbError.message,
      code: dbError.code,
    });
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client) as any;
  const release = client.release.bind(client) as any;

  const queryStartTime = Date.now();
  (client as any).query = (...args: any[]) => {
    (client as any).lastQuery = args;
    return originalQuery(...args);
  };

  (client as any).release = () => {
    const queryDuration = Date.now() - queryStartTime;
    console.log('Released client after', queryDuration, 'ms');
    (client as any).query = originalQuery;
    release();
  };

  return client;
}

export default pool;
