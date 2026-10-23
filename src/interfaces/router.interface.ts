import React from 'react';

export interface IViewRoute {
  id: string;
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeCount?: number;
  component: React.ComponentType<any>;
}
