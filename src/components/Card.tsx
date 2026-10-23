import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', header, actions }) => {
  return (
    <div className={`card ${className}`}>
      {(header || actions) && (
        <div className="card-header">
          <div className="card-title">{header}</div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};
