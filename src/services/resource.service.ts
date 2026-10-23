import { request } from './api.service';
import { IResource, ResourceActionType, IResourceActionResponse } from '../interfaces';

export const ResourceService = {
  async getResources(): Promise<{ resources: IResource[]; isMock?: boolean; notice?: string }> {
    return request('/api/resources');
  },

  async executeAction(name: string, action: ResourceActionType): Promise<IResourceActionResponse> {
    return request('/api/resources/action', {
      method: 'POST',
      body: JSON.stringify({ name, action }),
    });
  },
};
