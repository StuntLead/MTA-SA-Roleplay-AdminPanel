import dotenv from 'dotenv';
dotenv.config();

const MTA_HOST = process.env.MTA_HOST || '127.0.0.1';
const MTA_HTTP_PORT = process.env.MTA_HTTP_PORT || 22005;
const MTA_API_USER = process.env.MTA_API_USER || 'admin';
const MTA_API_PASS = process.env.MTA_API_PASS || 'admin';

// Fallback Mock Players
let MOCK_PLAYERS = [
  {
    id: 1,
    account_id: 1,
    account_name: "Admin_Jack",
    character_id: 101,
    character_name: "Jack Conrad",
    raw_name: "Jack_Conrad",
    ping: 28,
    ip: "127.0.0.1",
    health: 100,
    armor: 100,
    admin_level: 6,
    hours_played: 240,
    location: "Pershing Square, Los Santos",
    coordinates: { x: 1481.2, y: -1768.4, z: 18.7 },
    cash: 55000,
    bank: 420000
  },
  {
    id: 2,
    account_id: 2,
    account_name: "Officer_Miller",
    character_id: 201,
    character_name: "Robert Miller",
    raw_name: "Robert_Miller",
    ping: 45,
    ip: "192.168.1.15",
    health: 85,
    armor: 50,
    admin_level: 3,
    hours_played: 180,
    location: "Commerce, Los Santos",
    coordinates: { x: 1530.0, y: -1680.1, z: 13.5 },
    cash: 8200,
    bank: 87000
  },
  {
    id: 3,
    account_id: 3,
    account_name: "SpeedyGonzales",
    character_id: 301,
    character_name: "Carlos Santana",
    raw_name: "Carlos_Santana",
    ping: 72,
    ip: "10.0.0.42",
    health: 98,
    armor: 0,
    admin_level: 0,
    hours_played: 92,
    location: "Idlewood, Los Santos",
    coordinates: { x: 1950.5, y: -1800.2, z: 13.2 },
    cash: 3400,
    bank: 22000
  }
];

// Fallback Mock Resources
let MOCK_RESOURCES = [
  { name: "admin-api", state: "running", type: "script", author: "StuntLead", version: "1.0.0", description: "Admin API Bridge" },
  { name: "global", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Global utility functions" },
  { name: "mysql", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "MySQL connection module" },
  { name: "account", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Account & character system" },
  { name: "chat-system", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Chat & radio system" },
  { name: "item-system", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Item and inventory manager" },
  { name: "camera-system", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Speed cameras and surveillance" },
  { name: "mdc", state: "running", type: "script", author: "OwlGaming", version: "1.0.0", description: "Mobile Data Computer (Police)" },
  { name: "dynamic_lighting", state: "running", type: "script", author: "Community", version: "1.0.0", description: "Dynamic vehicle and street lights" },
  { name: "shader_car_paint", state: "running", type: "script", author: "Community", version: "1.0.0", description: "Reflective car paint shader" },
  { name: "modloader", state: "running", type: "script", author: "Community", version: "1.0.0", description: "Client model loader" },
  { name: "xmas", state: "loaded", type: "script", author: "OwlGaming", version: "1.0.0", description: "Christmas seasonal events" },
  { name: "snow", state: "loaded", type: "script", author: "OwlGaming", version: "1.0.0", description: "Winter snow shader" },
  { name: "fakevideo", state: "loaded", type: "script", author: "Community", version: "1.0.0", description: "Fake video renderer" },
  { name: "dancer-system", state: "loaded", type: "script", author: "OwlGaming", version: "1.0.0", description: "Club dancer animations" },
  { name: "cards", state: "loaded", type: "script", author: "Community", version: "1.0.0", description: "Playing cards mini-game" }
];

async function callMta(functionName, args = []) {
  const url = `http://${MTA_HOST}:${MTA_HTTP_PORT}/admin-api/call/${functionName}`;
  const authHeader = 'Basic ' + Buffer.from(`${MTA_API_USER}:${MTA_API_PASS}`).toString('base64');
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(2500)
    });

    if (!res.ok) {
      throw new Error(`MTA HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return { data, isMock: false };
  } catch (err) {
    return { error: err.message, isMock: true };
  }
}

export async function fetchOnlinePlayers() {
  const result = await callMta('getOnlinePlayers');
  if (!result.error && Array.isArray(result.data)) {
    return { players: result.data, isMock: false };
  }
  return { players: MOCK_PLAYERS, isMock: true };
}

export async function fetchResources() {
  const result = await callMta('getResourcesList');
  if (!result.error && Array.isArray(result.data)) {
    return { resources: result.data, isMock: false };
  }
  return { resources: MOCK_RESOURCES, isMock: true };
}

export async function executeResourceAction(name, action) {
  if (['start', 'stop', 'restart'].indexOf(action) === -1) {
    return { success: false, message: 'Invalid action: must be start, stop, or restart' };
  }

  const funcMap = {
    start: 'startServerResource',
    stop: 'stopServerResource',
    restart: 'restartServerResource'
  };

  const result = await callMta(funcMap[action], [name]);
  if (!result.error && result.data) {
    return { ...result.data, isMock: false };
  }

  // Handle mock update
  const res = MOCK_RESOURCES.find(r => r.name === name);
  if (res) {
    if (action === 'start') res.state = 'running';
    if (action === 'stop') res.state = 'loaded';
    if (action === 'restart') res.state = 'running';
    return { 
      success: true, 
      message: `[Simulated] Resource '${name}' ${action}ed successfully.`, 
      isMock: true,
      newState: res.state 
    };
  }

  return { success: false, message: `Resource '${name}' not found.`, isMock: true };
}

export async function kickPlayer(id, reason) {
  const result = await callMta('kickServerPlayer', [id, reason]);
  if (!result.error && result.data) {
    return { ...result.data, isMock: false };
  }

  const idx = MOCK_PLAYERS.findIndex(p => p.id === Number(id));
  if (idx !== -1) {
    const kicked = MOCK_PLAYERS.splice(idx, 1)[0];
    return {
      success: true,
      message: `[Simulated] Player '${kicked.character_name}' kicked: ${reason}`,
      isMock: true
    };
  }

  return { success: false, message: 'Player not found.', isMock: true };
}

export async function fetchServerOverview() {
  const result = await callMta('getServerOverview');
  if (!result.error && result.data) {
    return { ...result.data, isMock: false };
  }

  const total = MOCK_RESOURCES.length;
  const running = MOCK_RESOURCES.filter(r => r.state === 'running').length;

  return {
    server_name: "OwlGaming MTA:SA Roleplay [Dev]",
    server_port: 22003,
    mta_version: "1.5.9",
    players_online: MOCK_PLAYERS.length,
    max_players: 128,
    fps_limit: 60,
    resources_total: total,
    resources_running: running,
    resources_stopped: total - running,
    uptime: 14280,
    isMock: true
  };
}
