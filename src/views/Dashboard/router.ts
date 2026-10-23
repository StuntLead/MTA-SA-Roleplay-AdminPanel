import { Activity } from 'lucide-react';
import { IViewRoute } from '../../interfaces';
import { DashboardView } from './DashboardView';

export const dashboardRoute: IViewRoute = {
  id: 'dashboard',
  path: '/',
  title: 'Dashboard',
  description: 'Server overview, telemetry metrics, and platform health',
  icon: Activity,
  component: DashboardView,
};
