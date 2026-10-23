import { request } from './api.service';
import { IAccount, IAccountsResponse } from '../interfaces';

export const AccountService = {
  async getAccounts(search = '', page = 1, limit = 15): Promise<IAccountsResponse> {
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: String(limit),
    });
    return request(`/api/accounts?${params.toString()}`);
  },

  async getAccountDetails(id: number): Promise<IAccount> {
    return request(`/api/accounts/${id}`);
  },
};
