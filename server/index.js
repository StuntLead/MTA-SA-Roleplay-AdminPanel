import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, isDbConnected, getAccounts, getAccountDetails } from './db.js';
import { 
  fetchOnlinePlayers, 
  fetchResources, 
  executeResourceAction, 
  kickPlayer, 
  fetchServerOverview 
} from './mtaBridge.js';

dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize Database Connection
initDb();


// Health & Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db_connected: isDbConnected(),
    mta_host: process.env.MTA_HOST || '127.0.0.1',
    mta_http_port: process.env.MTA_HTTP_PORT || 22005
  });
});

// Server Overview Metrics
app.get('/api/overview', async (req, res) => {
  try {
    const overview = await fetchServerOverview();
    const dbStatus = isDbConnected();
    res.json({
      ...overview,
      db_connected: dbStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Online Players
app.get('/api/players', async (req, res) => {
  try {
    const data = await fetchOnlinePlayers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kick Player
app.post('/api/players/kick', async (req, res) => {
  try {
    const { id, reason } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Player ID required' });
    }
    const result = await kickPlayer(id, reason || 'Kicked by Web Admin');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resources List
app.get('/api/resources', async (req, res) => {
  try {
    const data = await fetchResources();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resource Action (start, stop, restart)
app.post('/api/resources/action', async (req, res) => {
  try {
    const { name, action } = req.body;
    if (!name || !action) {
      return res.status(400).json({ success: false, message: 'Resource name and action are required' });
    }
    const result = await executeResourceAction(name, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Accounts List (Database)
app.get('/api/accounts', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 15 } = req.query;
    const data = await getAccounts({ 
      search: String(search), 
      page: Number(page) || 1, 
      limit: Number(limit) || 15 
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Account Details & Associated Characters
app.get('/api/accounts/:id', async (req, res) => {
  try {
    const account = await getAccountDetails(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] MTA Web Admin Backend running on http://localhost:${PORT}`);
});

