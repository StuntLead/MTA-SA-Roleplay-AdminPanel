import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;
let isConnected = false;

// Mock accounts dataset for development/offline testing
const MOCK_ACCOUNTS = [
  {
    id: 1,
    username: "Admin_Jack",
    email: "jack@sanandreas.gov",
    admin: 6,
    registerdate: "2024-01-15 10:20:00",
    lastlogin: "2026-10-22 13:00:00",
    characters_count: 2,
    characters: [
      { id: 101, charactername: "Jack_Conrad", hoursplayed: 240, money: 55000, bankmoney: 420000, skin: 294, faction: "LSPD", job: 0 },
      { id: 102, charactername: "Marcus_Vance", hoursplayed: 35, money: 1200, bankmoney: 15400, skin: 101, faction: "Civilian", job: 1 }
    ]
  },
  {
    id: 2,
    username: "Officer_Miller",
    email: "miller@lspd.sa",
    admin: 3,
    registerdate: "2024-03-22 14:10:00",
    lastlogin: "2026-10-22 11:45:00",
    characters_count: 1,
    characters: [
      { id: 201, charactername: "Robert_Miller", hoursplayed: 180, money: 8200, bankmoney: 87000, skin: 280, faction: "LSPD", job: 0 }
    ]
  },
  {
    id: 3,
    username: "SpeedyGonzales",
    email: "speedy@gmail.com",
    admin: 0,
    registerdate: "2024-06-11 18:30:00",
    lastlogin: "2026-10-21 21:15:00",
    characters_count: 3,
    characters: [
      { id: 301, charactername: "Carlos_Santana", hoursplayed: 92, money: 3400, bankmoney: 22000, skin: 47, faction: "Rapid Towing", job: 2 },
      { id: 302, charactername: "Alejandro_Cruz", hoursplayed: 14, money: 600, bankmoney: 5000, skin: 48, faction: "Civilian", job: 0 }
    ]
  },
  {
    id: 4,
    username: "Doctor_Sarah",
    email: "sarah.chen@lses.org",
    admin: 2,
    registerdate: "2024-05-01 08:00:00",
    lastlogin: "2026-10-22 12:30:00",
    characters_count: 1,
    characters: [
      { id: 401, charactername: "Sarah_Chen", hoursplayed: 155, money: 14000, bankmoney: 190000, skin: 219, faction: "LSES", job: 0 }
    ]
  },
  {
    id: 5,
    username: "TruckerJoe",
    email: "joe.b@transport.com",
    admin: 0,
    registerdate: "2024-08-19 19:40:00",
    lastlogin: "2026-10-20 16:50:00",
    characters_count: 1,
    characters: [
      { id: 501, charactername: "Joseph_Barnes", hoursplayed: 68, money: 5100, bankmoney: 45000, skin: 133, faction: "Civilian", job: 4 }
    ]
  }
];

export async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'mta',
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
    console.warn('[DB] MySQL connection unavailable (' + err.message + '). Using fallback mock dataset.');
  }
}

export function isDbConnected() {
  return isConnected;
}

export async function getAccounts({ search = '', page = 1, limit = 20 } = {}) {
  if (!isConnected) {
    let filtered = MOCK_ACCOUNTS;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.username.toLowerCase().includes(q) || 
        a.email.toLowerCase().includes(q) ||
        a.characters.some(c => c.charactername.toLowerCase().includes(q))
      );
    }
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    return { accounts: paginated, total, page, totalPages: Math.ceil(total / limit), isMock: true };
  }

  try {
    let query = `
      SELECT a.id, a.username, a.email, a.admin, 
             ad.registerdate, ad.lastlogin, ad.ip,
             (SELECT COUNT(*) FROM characters c WHERE c.account = a.id) as characters_count
      FROM accounts a
      LEFT JOIN account_details ad ON ad.account_id = a.id
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

    // Count total
    let countQuery = `SELECT COUNT(*) as cnt FROM accounts a`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE a.username LIKE ? OR a.email LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0]?.cnt || 0;

    return { accounts: rows, total, page, totalPages: Math.ceil(total / limit), isMock: false };
  } catch (err) {
    console.warn('[DB] Error querying accounts (' + err.message + '). Returning mock accounts roster.');
    let filtered = MOCK_ACCOUNTS;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.username.toLowerCase().includes(q) || 
        a.email.toLowerCase().includes(q) ||
        a.characters.some(c => c.charactername.toLowerCase().includes(q))
      );
    }
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    return { accounts: paginated, total, page, totalPages: Math.ceil(total / limit), isMock: true, notice: err.message };
  }
}

export async function getAccountDetails(accountId) {
  if (!isConnected) {
    const acc = MOCK_ACCOUNTS.find(a => a.id === Number(accountId));
    if (!acc) return null;
    return { ...acc, isMock: true };
  }

  try {
    const [accRows] = await pool.query(`
      SELECT a.id, a.username, a.email, a.admin, 
             ad.registerdate, ad.lastlogin, ad.ip, ad.mtaserial
      FROM accounts a
      LEFT JOIN account_details ad ON ad.account_id = a.id
      WHERE a.id = ?
    `, [accountId]);

    if (!accRows.length) return null;
    const account = accRows[0];

    const [charRows] = await pool.query(`
      SELECT id, charactername, hoursplayed, money, bankmoney, skin, faction_id, lastarea
      FROM characters
      WHERE account = ?
    `, [accountId]);

    account.characters = charRows;
    account.characters_count = charRows.length;
    return { ...account, isMock: false };
  } catch (err) {
    console.warn('[DB] Error getting account details (' + err.message + '). Falling back to mock details.');
    const acc = MOCK_ACCOUNTS.find(a => a.id === Number(accountId));
    return acc ? { ...acc, isMock: true } : null;
  }
}

