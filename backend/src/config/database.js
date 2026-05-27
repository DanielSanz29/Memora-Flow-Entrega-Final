import mysql from 'mysql2/promise';
import initSqlJs from 'sql.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const databaseMode = (process.env.DB_MODE || 'mysql').toLowerCase();
const memoryMode = databaseMode === 'memory';

const mysqlConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'memora_flow',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'memora_user',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'memora_password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

const mysqlPool = memoryMode ? null : mysql.createPool(mysqlConfig);
let memoryDbPromise;

async function createMemoryDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const [schema, seed] = await Promise.all([
    fs.readFile(path.join(projectRoot, 'database', 'demo-schema.sql'), 'utf8'),
    fs.readFile(path.join(projectRoot, 'database', 'demo-seed.sql'), 'utf8')
  ]);
  db.run(schema);
  db.run(seed);
  return db;
}

async function memoryDb() {
  if (!memoryDbPromise) memoryDbPromise = createMemoryDb();
  return memoryDbPromise;
}

function normalizeForMemory(sql) {
  let statement = sql.replace(/\bTRUE\b/gi, '1').replace(/\bFALSE\b/gi, '0').replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
  if (/INSERT\s+INTO\s+orden_servicio_complementario/i.test(statement) && /ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(statement)) {
    statement = statement.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+precio_aplicado\s*=\s*VALUES\(precio_aplicado\)/i,
      'ON CONFLICT(orden_id, servicio_id) DO UPDATE SET precio_aplicado = excluded.precio_aplicado'
    );
  }
  return statement;
}

async function executeMemory(sql, params = []) {
  const db = await memoryDb();
  const statement = normalizeForMemory(sql).trim();
  if (/^(SELECT|WITH|PRAGMA)/i.test(statement)) {
    const stmt = db.prepare(statement);
    try {
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }
  db.run(statement, params);
  const affectedRows = db.getRowsModified();
  const idResult = db.exec('SELECT last_insert_rowid() AS id');
  const insertId = idResult[0]?.values?.[0]?.[0] ?? 0;
  return { affectedRows, insertId };
}

function stripDatabaseSelection(sql) {
  return sql
    .replace(/CREATE\s+DATABASE[\s\S]*?;\s*/i, '')
    .replace(/USE\s+[A-Za-z0-9_]+\s*;\s*/i, '');
}

export const pool = mysqlPool;

export function getDatabaseMode() {
  return memoryMode ? 'memory' : 'mysql';
}

export async function testConnection() {
  if (memoryMode) {
    await executeMemory('SELECT 1 AS ok');
    return true;
  }
  await mysqlPool.query('SELECT 1');
  return true;
}

export async function waitForDatabase(maxAttempts = Number(process.env.DB_CONNECT_ATTEMPTS || 30)) {
  if (memoryMode) return testConnection();
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await testConnection();
      return true;
    } catch (error) {
      lastError = error;
      console.log(`Esperando a MySQL (${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

export async function initializeDatabaseIfEnabled() {
  const enabled = String(process.env.DB_INIT_ON_START || '').toLowerCase() === 'true';
  if (memoryMode || !enabled) return false;

  const [schema, seed] = await Promise.all([
    fs.readFile(path.join(projectRoot, 'database', 'init.sql'), 'utf8'),
    fs.readFile(path.join(projectRoot, 'database', 'seed.sql'), 'utf8')
  ]);
  const connection = await mysql.createConnection({ ...mysqlConfig, multipleStatements: true });
  try {
    await connection.query(stripDatabaseSelection(schema));
    await connection.query(stripDatabaseSelection(seed));
    console.log('Esquema y datos de demostración inicializados correctamente.');
  } finally {
    await connection.end();
  }
  return true;
}

export async function query(sql, params = []) {
  if (memoryMode) return executeMemory(sql, params);
  const [rows] = await mysqlPool.execute(sql, params);
  return rows;
}

export async function getConnection() {
  if (!memoryMode) return mysqlPool.getConnection();
  return {
    execute: async (sql, params = []) => [await executeMemory(sql, params)],
    beginTransaction: async () => (await memoryDb()).run('BEGIN TRANSACTION'),
    commit: async () => (await memoryDb()).run('COMMIT'),
    rollback: async () => (await memoryDb()).run('ROLLBACK'),
    release: () => {}
  };
}

export async function withTransaction(work) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
