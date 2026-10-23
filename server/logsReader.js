import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to resources/logs/logs
const LOGS_DIR = path.resolve(__dirname, '../../logs/logs');

export const ACTION_NAMES = {
  1: 'Admin /h',
  2: 'Admin /l',
  3: 'Admin /a',
  4: 'Admin Command',
  5: 'Anticheat Alert',
  6: 'Vehicle Event',
  7: 'Chat /say',
  8: 'OOC /b',
  9: 'Radio /r',
  10: 'Dept /d',
  11: 'Faction /f',
  12: 'Action /me',
  13: 'District /dist',
  14: 'Emote /do',
  15: 'Private /pm',
  16: 'Gov Notice',
  17: 'Donator Chat',
  18: 'OOC /o',
  19: 'Shout /s',
  20: 'Megaphone /m',
  21: 'Whisper /w',
  22: 'Close /c',
  23: 'Newbie /n',
  24: 'Gamemaster /g',
  25: 'Cash Transfer',
  26: 'GameCoins',
  27: 'Connection / Spawn',
  28: 'Roadblock',
  29: 'Phone Call',
  30: 'SMS Message',
  31: 'Lock / Ignition',
  32: 'UCP Action',
  33: 'Stat Transfer',
  34: 'Kill / Damage',
  35: 'Faction Management',
  36: 'Ammunition',
  37: 'Interior Event',
  38: 'Admin Report',
  39: 'Item Movement',
  40: 'Detail /ame /ado',
  41: 'Business Chat',
  42: 'Stat Transfer'
};

/**
 * Get list of available log files
 */
export function getLogFiles() {
  try {
    if (!fs.existsSync(LOGS_DIR)) return [];
    return fs.readdirSync(LOGS_DIR)
      .filter(f => f.endsWith('.log'))
      .map(f => {
        const stats = fs.statSync(path.join(LOGS_DIR, f));
        return {
          filename: f,
          size: stats.size,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
  } catch (err) {
    console.error('[LOGS] Error reading log files:', err.message);
    return [];
  }
}

/**
 * Fetch and filter logs across files
 */
export function getGameLogs({
  file = 'all',
  search = '',
  action = 'all',
  page = 1,
  limit = 25
} = {}) {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      return { logs: [], total: 0, page: 1, totalPages: 1, files: [], actions: [] };
    }

    const availableFiles = getLogFiles();
    const filesToRead = file && file !== 'all'
      ? availableFiles.filter(f => f.filename === file)
      : availableFiles;

    const allEntries = [];

    for (const f of filesToRead) {
      const filePath = path.join(LOGS_DIR, f.filename);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const entry = JSON.parse(line);
            allEntries.push({
              id: `${f.filename}-${i + 1}`,
              file: f.filename,
              date: entry.date,
              action: entry.action,
              action_name: ACTION_NAMES[entry.action] || `Action #${entry.action}`,
              origin: entry.origin || 'SYSTEM',
              content: entry.content || '',
              accounts: entry.accounts || [],
              characters: entry.characters || [],
              vehicles: entry.vehicles || [],
              interiors: entry.interiors || [],
            });
          } catch (_) {
            // ignore malformed line
          }
        }
      } catch (readErr) {
        console.error(`[LOGS] Error reading file ${f.filename}:`, readErr.message);
      }
    }

    // Sort descending by date (most recent first)
    allEntries.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });

    // Apply Filters
    let filtered = allEntries;

    if (action && action !== 'all') {
      const actionNum = parseInt(action, 10);
      filtered = filtered.filter(e => e.action === actionNum);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(e => 
        (e.content && e.content.toLowerCase().includes(q)) ||
        (e.origin && e.origin.toLowerCase().includes(q)) ||
        (e.action_name && e.action_name.toLowerCase().includes(q)) ||
        (e.date && e.date.toLowerCase().includes(q))
      );
    }

    // Pagination
    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLogs = filtered.slice(startIndex, startIndex + limitNum);

    // Collect unique action types for frontend dropdown
    const actionTypes = Object.entries(ACTION_NAMES).map(([id, label]) => ({
      id: Number(id),
      label
    }));

    return {
      logs: paginatedLogs,
      total,
      page: pageNum,
      totalPages,
      files: availableFiles.map(f => f.filename),
      actionTypes
    };
  } catch (err) {
    console.error('[LOGS] Error fetching logs:', err.message);
    return { logs: [], total: 0, page: 1, totalPages: 1, files: [], actionTypes: [] };
  }
}
