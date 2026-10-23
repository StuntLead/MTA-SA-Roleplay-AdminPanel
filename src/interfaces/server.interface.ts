export interface IServerOverview {
  online?: boolean;
  server_name: string;
  game_type?: string;
  map_name?: string;
  server_port: number;
  mta_version: string;
  players_online: number;
  max_players: number;
  fps_limit: number;
  resources_total: number;
  resources_running: number;
  resources_stopped: number;
  uptime: number;
  isMock?: boolean;
  db_connected?: boolean;
  notice?: string;
}

export interface IServerStatus {
  status: string;
  timestamp: string;
  db_connected: boolean;
  mta_host: string;
  mta_http_port: number;
}
