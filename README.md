# MTA:SA Roleplay — Web Admin Panel

A modern, high-performance web dashboard for Multi Theft Auto: San Andreas (MTA:SA) roleplay servers.

---

## 🌟 Key Features

1. **Dashboard (`/dashboard`)**:
   - Server telemetry and status indicators (MTA Server & MySQL Database connection).
   - High-level metrics: Player count / capacity, running vs stopped resources, server FPS limit, and uptime.
   - Quick action shortcuts and recent activity feed.

2. **Active In-Game Players (`/players`)**:
   - Live roster of connected players with Ping, Health, Armor, Admin Rank, and current location.
   - Real-time search by character or account name.
   - **Inspect Player Modal**: Full stats including in-game ID, DB ID, IP, coordinates, wallet cash, bank balance, and hours played.
   - **Player Moderation**: In-game player kick action with custom kick reason.

3. **Accounts & Characters (`/accounts`)**:
   - Searchable account roster synced directly with MySQL database (`core.accounts` & `mta.characters`).
   - Detailed user profiles displaying registered date, last login IP, and admin status.
   - Character explorer displaying all characters belonging to each account, wealth, hours played, health, and location.

4. **Resource Control Center (`/resources`)**:
   - Real-time state monitoring of all MTA resources (`Running`, `Stopped`, `Loaded`).
   - Filter by status (`All`, `Running`, `Stopped`) and instant keyword search.
   - One-click **Start**, **Stop**, and **Restart** controls with immediate toast notifications.

5. **Game Log (`/logs`)**:
   - In-depth server game logs browser.
   - Filter by log source (`All Logs`, `Chat Logs`, `Admin Actions`, `Vehicle Logs`, `Economy Logs`, etc.) or action type.
   - Live search filter and pagination for inspecting server events and security audits.

6. **API Logging**:
   - All backend API requests are tracked with date, timestamp, and unique Trace ID saved to daily log files in `logs/api/`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router v7, Vite 8, Lucide React icons, Vanilla CSS design system with dark/light theme support.
- **Backend**: Node.js, Express, MySQL2 (`promise` connection pool).
- **MTA Bridge**: ASE UDP protocol querying + `admin-api` resource in MTA (`resources/admin-api`) with exported HTTP functions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file in the root of `admin-panel` (or copy from `.env.example`):
```ini
# Backend Port
PORT=3001

# MTA Server HTTP Connection
MTA_HOST=127.0.0.1
MTA_HTTP_PORT=22005
MTA_API_USER=admin
MTA_API_PASS=admin

# MySQL Database Connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=mta
DB_CORE_NAME=core
```

### 3. Ensure `admin-api` is Started in MTA
In your MTA server console or `mtaserver.conf`:
```text
start admin-api
```

---

## 💻 Running the Application

### Development Mode (Recommended)
You need both the backend API server and frontend Vite development server running:

1. **Terminal 1 — Backend Server:**
   ```bash
   npm run server
   ```
   Runs the Express API on **[http://localhost:3001](http://localhost:3001)**.

2. **Terminal 2 — Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   Runs Vite on **[http://localhost:5173](http://localhost:5173)** (automatically proxies `/api` requests to port `3001`).

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Production Mode
Build the frontend and run the production server:
```bash
npm run build
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.
