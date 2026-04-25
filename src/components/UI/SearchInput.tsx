import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  id,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync if parent resets the value externally (e.g. clearing filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce: only call parent onChange after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  return (
    <div className="search-wrap">
      <Search size={14} className="search-icon" />
      <input
        id={id}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};