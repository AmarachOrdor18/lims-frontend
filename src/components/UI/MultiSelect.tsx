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
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    <div
      style={{ position: 'relative', minWidth: 160 }}
      ref={containerRef}
      id={id}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%',
          height: 36,
          padding: '0 36px 0 10px', /* right padding for chevron */
          background: 'var(--bg-elevated)',
          border: `1px solid ${isOpen || hasSelection ? 'var(--accent-green)' : 'var(--border-default)'}`,
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
          position: 'relative',
        }}
      >
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: hasSelection ? 'var(--text-primary)' : 'var(--text-muted)',
          flex: 1,
          textAlign: 'left',
        }}>
          {getLabel()}
        </span>
        {/* Chevron always on right with proper spacing */}
        <span style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
          transition: 'transform 150ms ease',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}>
          <ChevronDown size={13} />
        </span>
      </button>

      {/* Dropdown — always below, fixed max height, scrollable */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          bottom: 'auto',          /* always open downward */
          left: 0,
          minWidth: '100%',
          maxHeight: 240,          /* fixed height */
          overflowY: 'auto',       /* scrollable */
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,            /* always on top */
        }}>
          <div style={{ padding: 4 }}>
            {options.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
                No options available
              </div>
            )}
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
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isSelected ? 'rgba(var(--accent-green-rgb, 34,197,94),0.08)' : 'transparent',
                    transition: 'background 0.1s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isSelected
                      ? 'rgba(34,197,94,0.08)' : 'transparent';
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
                    transition: 'all 0.15s',
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
