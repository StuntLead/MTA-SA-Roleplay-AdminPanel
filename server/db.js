import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;
let isConnected = false;

export async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log('[DB] Connected to MySQL database successfully.');
  } catch (err) {
    isConnected = false;
    console.warn('[DB] MySQL connection error: ' + err.message);
  }
}

export function isDbConnected() {
  return isConnected;
}

export async function getAccounts({ search = '', page = 1, limit = 20 } = {}) {
  if (!isConnected || !pool) {
    return { accounts: [], total: 0, page: 1, totalPages: 1, isMock: false, error: 'Database disconnected' };
  }

  try {
    let query = `
      SELECT a.id, a.username, a.email, a.admin, 
             a.registerdate, a.ucp_lastlogin as lastlogin, a.ip,
             (SELECT COUNT(*) FROM mta.characters c WHERE c.account = a.id) as characters_count
      FROM core.accounts a
    `;
    const params = [];
    if (search) {
      query += ` WHERE a.username LIKE ? OR a.email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ` ORDER BY a.id ASC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    // Count total accounts
    let countQuery = `SELECT COUNT(*) as cnt FROM core.accounts a`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE a.username LIKE ? OR a.email LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0]?.cnt || 0;

    return { accounts: rows, total, page, totalPages: Math.ceil(total / limit), isMock: false };
  } catch (err) {
    console.error('[DB] Error querying accounts:', err.message);
    return { accounts: [], total: 0, page: 1, totalPages: 1, isMock: false, error: err.message };
  }
}

export async function getAccountDetails(accountId) {
  if (!isConnected || !pool) return null;

  try {
    const [accRows] = await pool.query(`
      SELECT a.id, a.username, a.email, a.admin, 
             a.registerdate, a.ucp_lastlogin as lastlogin, a.ip
      FROM core.accounts a
      WHERE a.id = ?
    `, [accountId]);

    if (!accRows.length) return null;
    const account = accRows[0];

    // Fetch real characters belonging to this account from mta.characters
    const [charRows] = await pool.query(`
      SELECT id, charactername, hoursplayed, money, bankmoney, skin, lastarea, health, armor
      FROM mta.characters
      WHERE account = ?
    `, [accountId]);

    account.characters = charRows;
    account.characters_count = charRows.length;
    return { ...account, isMock: false };
  } catch (err) {
    console.error('[DB] Error getting account details:', err.message);
    return null;
  }
}
