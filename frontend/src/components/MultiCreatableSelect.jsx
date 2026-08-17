import React, { useState, useEffect, useRef } from 'react';
import './MultiCreatableSelect.css';

export default function MultiCreatableSelect({
  options = [], // array of { value, label }
  value = [], // array of strings (values)
  onChange,
  placeholder = 'Select or type...',
  label,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Filter options based on search, excluding already selected ones
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) && !value.includes(opt.value)
  );

  // Check if search perfectly matches an existing option (case-insensitive)
  const isExactMatch = options.some(opt => opt.label.toLowerCase() === search.toLowerCase());

  const handleSelect = (val) => {
    if (!value.includes(val)) {
      onChange([...value, val]);
    }
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleCreate = () => {
    const trimmed = search.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (e, valToRemove) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== valToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (search.trim() !== '') {
        // If there's an exact match in filtered options, select it, otherwise create
        const exactMatchOpt = filteredOptions.find(o => o.label.toLowerCase() === search.toLowerCase());
        if (exactMatchOpt) {
          handleSelect(exactMatchOpt.value);
        } else {
          handleCreate();
        }
      }
    } else if (e.key === 'Backspace' && search === '' && value.length > 0) {
      // Remove last item if backspace is pressed on empty input
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="multi-select-wrapper" ref={wrapperRef}>
      {label && <label className="multi-select-label">{label}</label>}
      
      <div 
        className={`multi-select-container ${isOpen ? 'open' : ''}`}
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
      >
        <div className="multi-select-pills">
          {value.map(val => {
            const opt = options.find(o => o.value === val);
            const displayLabel = opt ? opt.label : val;
            return (
              <span key={val} className="multi-select-pill">
                {displayLabel}
                <button type="button" onClick={(e) => handleRemove(e, val)} className="multi-select-remove">×</button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            className="multi-select-input"
            placeholder={value.length === 0 ? placeholder : ''}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            required={required && value.length === 0}
          />
        </div>
        <span className="multi-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          {search.trim() !== '' && !isExactMatch && !value.includes(search.trim()) && (
            <div className="multi-select-option create-option" onClick={handleCreate}>
              Create "{search}"
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="multi-select-option"
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            search.trim() === '' && <div className="multi-select-no-options">No options</div>
          )}
        </div>
      )}
    </div>
  );
}
