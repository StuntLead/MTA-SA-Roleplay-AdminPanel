export type ResourceStateType = 'running' | 'loaded' | 'failed to start' | 'starting' | 'stopping';
export type ResourceActionType = 'start' | 'stop' | 'restart';

export interface IResource {
  name: string;
  state: ResourceStateType;
  type?: string;
  author?: string;
  version?: string;
  description?: string;
  group?: string;
}

export interface IResourceActionResponse {
  success: boolean;
  message: string;
  newState?: ResourceStateType;
}
