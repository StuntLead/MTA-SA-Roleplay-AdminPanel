import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
}) => {
  return (
    <div className={`search-wrap ${className}`}>
      <span className="search-icon">
        <Search size={15} />
      </span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', right: '4px' }}
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
