import { ScrollText } from 'lucide-react';
import { IViewRoute } from '../../interfaces';
import { GameLogView } from './GameLogView';

export const gameLogRoute: IViewRoute = {
  id: 'game-logs',
  path: '/logs',
  title: 'Game Log',
  description: 'Server event records, chat, admin commands, and audit trail',
  icon: ScrollText,
  component: GameLogView,
};
