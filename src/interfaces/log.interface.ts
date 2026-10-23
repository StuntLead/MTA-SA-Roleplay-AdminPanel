export interface IGameLog {
  id: string;
  file: string;
  date: string;
  action: number;
  action_name: string;
  origin: string;
  content: string;
  accounts: number[];
  characters: number[];
  vehicles: number[];
  interiors: number[];
}

export interface IGameLogsResponse {
  logs: IGameLog[];
  total: number;
  page: number;
  totalPages: number;
  files: string[];
  actionTypes: { id: number; label: string }[];
}
