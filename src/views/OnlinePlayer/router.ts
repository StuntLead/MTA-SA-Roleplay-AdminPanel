import { Users } from 'lucide-react';
import { IViewRoute } from '../../interfaces';
import { OnlinePlayerView } from './OnlinePlayerView';

export const onlinePlayerRoute: IViewRoute = {
  id: 'online-players',
  path: '/players',
  title: 'Online Players',
  description: 'Inspect live in-game sessions, health, telemetry, and moderation',
  icon: Users,
  component: OnlinePlayerView,
};
