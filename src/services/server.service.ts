import { request } from './api.service';
import { IServerOverview, IServerStatus } from '../interfaces';

export const ServerService = {
  async getOverview(): Promise<IServerOverview> {
    return request('/api/overview');
  },

  async getStatus(): Promise<IServerStatus> {
    return request('/api/status');
  },
};
