import { request } from './api.service';
import { IPlayer, IKickPlayerResponse } from '../interfaces';

export const PlayerService = {
  async getOnlinePlayers(): Promise<{ players: IPlayer[]; isMock?: boolean; notice?: string }> {
    return request('/api/players');
  },

  async kickPlayer(id: number, reason: string): Promise<IKickPlayerResponse> {
    return request('/api/players/kick', {
      method: 'POST',
      body: JSON.stringify({ id, reason }),
    });
  },
};
