import React, { useState, useEffect, useRef } from 'react';
import './SearchableSelect.css';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Find the selected option's label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setSearch('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      {label && <label className="searchable-select-label">{label}</label>}
      <div 
        className={`searchable-select-input-container ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          className="searchable-select-input"
          placeholder={placeholder}
          value={isOpen ? search : displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          required={required && !value}
        />
        {value && (
          <button type="button" className="searchable-select-clear" onClick={handleClear}>
            ×
          </button>
        )}
        <span className="searchable-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`searchable-select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="searchable-select-no-options">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
