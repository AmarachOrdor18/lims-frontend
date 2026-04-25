import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  id?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length) return 'All Selected';
    if (selectedValues.length > 2) return `${selectedValues.length} selected`;
    return options
      .filter(o => selectedValues.includes(o.value))
      .map(o => o.label)
      .join(', ');
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <div style={{ position: 'relative', minWidth: 160 }} ref={containerRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: 36,
          padding: '0 10px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${isOpen ? 'var(--accent-green)' : hasSelection ? 'var(--accent-green)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 150ms ease',
          outline: 'none',
        }}
      >
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: hasSelection ? 'var(--text-primary)' : 'var(--text-muted)',
        }}>
          {getLabel()}
        </span>
        <ChevronDown
          size={13}
          style={{
            flexShrink: 0,
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          minWidth: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ padding: 4, maxHeight: 240, overflowY: 'auto' }}>
            {options.map(option => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isSelected ? 'rgba(225,29,72,0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isSelected ? 'rgba(225,29,72,0.08)' : 'transparent';
                  }}
                >
                  <div style={{
                    width: 15,
                    height: 15,
                    borderRadius: 4,
                    border: `2px solid ${isSelected ? 'var(--accent-green)' : 'var(--border-default)'}`,
                    background: isSelected ? 'var(--accent-green)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    color: 'white',
                  }}>
                    {isSelected && <Check size={9} strokeWidth={3.5} />}
                  </div>
                  <span>{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
