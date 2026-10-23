import { UserCheck } from 'lucide-react';
import { IViewRoute } from '../../interfaces';
import { AccountCharsView } from './AccountCharsView';

export const accountCharsRoute: IViewRoute = {
  id: 'account-chars',
  path: '/accounts',
  title: 'Accounts & Characters',
  description: 'Registered user database, administrative roles, and associated character profiles',
  icon: UserCheck,
  component: AccountCharsView,
};
