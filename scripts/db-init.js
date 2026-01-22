#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env.local manually (no external deps)
function loadEnv(envPath = '.env.local') {
  try {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(fullPath)) return;
    const raw = fs.readFileSync(fullPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx);
      let val = trimmed.slice(idx + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
    console.log('Loaded environment variables from', envPath);
  } catch (err) {
    console.warn('Could not load .env.local:', err.message);
  }
}

async function run() {
  loadEnv('.env.local');

  const schemaPath = path.resolve(process.cwd(), 'lib', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('Could not find lib/schema.sql');
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  const connectionString = process.env.DATABASE_URL;
  const clientConfig = connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
        database: process.env.DATABASE_NAME,
        ssl: { rejectUnauthorized: false },
      };

  // For local/dev connections with self-signed certs, disable TLS verification for this run
  if (clientConfig.ssl) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('Disabling TLS certificate verification (NODE_TLS_REJECT_UNAUTHORIZED=0) for this run.');
  }

  const client = new Client(clientConfig);

  try {
    await client.connect();
    console.log('Connected to DB. Applying schema from lib/schema.sql...');

    // Execute the entire schema in one query to preserve dollar-quoted functions/triggers
    await client.query(schema);

    console.log('Schema applied successfully ✅');
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema:', err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) { }
  }
}

run();
