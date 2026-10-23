import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span className="theme-toggle-label">Dark</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span className="theme-toggle-label">Light</span>
        </>
      )}
    </button>
  );
};
