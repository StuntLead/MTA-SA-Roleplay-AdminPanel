export interface ICharacter {
  id: number;
  charactername: string;
  hoursplayed: number;
  money: number;
  bankmoney: number;
  skin: number;
  lastarea?: string;
  health?: number;
  armor?: number;
  faction_id?: number;
}

export interface IAccount {
  id: number;
  username: string;
  email?: string;
  admin: number;
  registerdate?: string;
  lastlogin?: string;
  ip?: string;
  characters_count?: number;
  characters?: ICharacter[];
}

export interface IAccountsResponse {
  accounts: IAccount[];
  total: number;
  page: number;
  totalPages: number;
  isMock?: boolean;
  error?: string;
}
