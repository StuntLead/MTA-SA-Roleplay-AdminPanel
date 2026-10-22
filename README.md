# MTA:SA Roleplay — Web Admin Panel

A modern, high-performance web dashboard for Multi Theft Auto: San Andreas (MTA:SA) roleplay servers.

---

## 🌟 Key Features

1. **Active In-Game Players**:
   - Live roster of currently connected players with Ping, Health, Armor, Admin Rank, and current map location.
   - Real-time search and filter by character or account name.
   - **Inspect Player Modal**: Full details including in-game ID, DB ID, IP, coordinates, wallet cash, bank balance, and hours played.
   - **Quick Moderation**: In-game player kick action with custom reason.

2. **Accounts & Character Roster**:
   - Searchable account list directly synced with your roleplay MySQL database (`accounts` & `account_details`).
   - Detailed user profiles displaying registered date, last login, and admin rank.
   - Character explorer displaying all characters belonging to each account, wealth, hours played, and faction.

3. **Resource Control Center**:
   - Real-time state monitoring of all MTA resources (`Running`, `Stopped`, `Loaded`, `Failed to start`).
   - Filter by status (`All`, `Running`, `Stopped`) with fast text search.
   - One-click **Start**, **Stop**, and **Restart** controls with immediate toast notifications and loading state feedback.

4. **Telemetry & Health**:
   - Connection indicators for MTA HTTP API and MySQL database.
   - Server stats: Player count / capacity, active resources count, FPS limit, and server uptime.
   - Graceful fallback mode: Fully functional simulated demo data when MTA or MySQL is offline.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Lucide React icons, Vanilla CSS design system with dark glassmorphism aesthetic.
- **Backend**: Node.js & Express API proxying MTA HTTP calls and querying MySQL.
- **Bridge**: `admin-api` resource in MTA (`resources/admin-api`) with exported HTTP functions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` and fill in your server credentials:
```ini
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
```

### 3. Ensure `admin-api` is started in MTA
In your MTA server console or `mtaserver.conf`:
```text
start admin-api
```

### 4. Run the Application

#### Production Mode (Single command):
```bash
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

#### Development Mode:
In terminal 1 (backend):
```bash
npm run server
```
In terminal 2 (Vite hot-reloading frontend):
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📦 Pushing to a Separate GitHub Repository

This `admin-panel` folder is already ignored by the parent `MTA-SA-Roleplay` repository.

To push this admin panel to its own dedicated repository on GitHub:

```bash
git init -b main
git add .
git commit -m "feat: initial commit for MTA:SA web admin panel"
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_ADMIN_PANEL_REPO>.git
git push -u origin main
```
