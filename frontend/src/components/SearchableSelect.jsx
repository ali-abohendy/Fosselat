import React, { useState, useEffect, useRef } from 'react';
import './MultiCreatableSelect.css';

export default function SearchableSelect({
  options = [], // array of { value, label }
  value = '', // single string value
  onChange,
  placeholder = 'Search or select...',
  label,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const selectedOption = options.find(o => o.value === value);

  // Sync search text with the selected option when not open
  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedOption ? selectedOption.label : '');
    } else {
      setSearch(''); // Clear search when opening to see all options
    }
  }, [isOpen, selectedOption, value]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="multi-select-wrapper" ref={wrapperRef}>
      {label && <label className="multi-select-label">{label}</label>}
      <div 
        className={`multi-select-container ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="multi-select-pills" style={{ display: 'flex', flex: 1, padding: 0 }}>
          <input
            type="text"
            className="multi-select-input"
            style={{ flex: 1, width: '100%', padding: '0', background: 'transparent' }}
            placeholder={placeholder}
            value={isOpen ? search : (selectedOption ? selectedOption.label : search)}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
              if (e.target.value === '') onChange(''); // Clear value if input is cleared manually
            }}
            onFocus={() => setIsOpen(true)}
            required={required && !value}
          />
        </div>
        <span className="multi-select-arrow" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} style={{ paddingLeft: '8px', cursor: 'pointer' }}>▼</span>
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`multi-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
                style={{ 
                  background: value === opt.value ? 'rgba(200,167,99,0.2)' : 'transparent',
                  color: value === opt.value ? 'var(--color-gold)' : 'inherit'
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="multi-select-no-options">No options</div>
          )}
        </div>
      )}
    </div>
  );
}
