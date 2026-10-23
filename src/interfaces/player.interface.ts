export interface IPlayerCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface IPlayer {
  id: number;
  element_id: number;
  account_id: number;
  account_name: string;
  character_id: number;
  character_name: string;
  raw_name: string;
  ping: number;
  ip: string;
  health: number;
  armor: number;
  admin_level: number;
  hours_played: number;
  location: string;
  coordinates?: IPlayerCoordinates;
  cash: number;
  bank: number;
}

export interface IKickPlayerRequest {
  id: number;
  reason: string;
}

export interface IKickPlayerResponse {
  success: boolean;
  message: string;
}
