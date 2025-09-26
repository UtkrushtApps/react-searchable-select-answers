// SearchableSelect.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import useDebouncedState from './useDebouncedState';
import useAsyncOptions from './useAsyncOptions';
import { useVirtual } from 'react-virtual';

// Utility for no-op function
const noop = () => {};

const ITEM_HEIGHT = 40;
const MAX_VISIBLE_ITEMS = 8;

function SearchableSelect({
  fetchOptions,
  value,
  onChange,
  placeholder = 'Search...',
  getOptionLabel = opt => opt.label,
  getOptionValue = opt => opt.value,
  noResultsText = 'No results',
  loadingText = 'Loading...',
  errorText = 'Error occurred',
  disabled = false,
  ...props
}) {
  const isControlled = value !== undefined && onChange !== undefined;
  const [internalValue, setInternalValue] = useState(null);
  const selectedValue = isControlled ? value : internalValue;
  const handleChange = isControlled ? onChange : setInternalValue;

  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebouncedState(inputValue, 300);
  const {
    options,
    loading,
    error,
    fetch: triggerFetch
  } = useAsyncOptions(fetchOptions, debouncedInput);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const scrollParentRef = useRef();

  // Virtualization setup
  const rowVirtualizer = useVirtual({
    size: options.length,
    parentRef: scrollParentRef,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 4,
  });

  // Open dropdown on input focus
  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(options.findIndex(o => getOptionValue(o) === getOptionValue(selectedValue)) || 0);
  };

  // Close dropdown on blur (with delay to allow click)
  const handleBlur = (e) => {
    // Small timeout allows option click before closing
    setTimeout(() => setIsOpen(false), 120);
  };

  // Option select
  const selectOption = option => {
    handleChange(option);
    setInputValue(getOptionLabel(option));
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && e.key === 'ArrowDown') {
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev => {
        if (prev == null) return 0;
        return Math.min(options.length - 1, prev + 1);
      });
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev => {
        if (prev == null) return 0;
        return Math.max(0, prev - 1);
      });
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (highlightedIndex !== null && options[highlightedIndex]) {
        selectOption(options[highlightedIndex]);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
    }
  };

  // Keep input value in sync with selection
  useEffect(() => {
    if (selectedValue && !isOpen) {
      setInputValue(getOptionLabel(selectedValue));
    }
    if (!selectedValue && !isOpen) {
      setInputValue('');
    }
    // eslint-disable-next-line
  }, [selectedValue, isOpen]);

  // Reset highlight on open/options
  useEffect(() => {
    if (!isOpen) return;
    // Highlight current selection or first
    let idx = options.findIndex(o =>
      selectedValue && getOptionValue(o) === getOptionValue(selectedValue)
    );
    if (idx === -1) idx = 0;
    setHighlightedIndex(idx);
  }, [isOpen, options, selectedValue, getOptionValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (
      isOpen &&
      highlightedIndex !== null &&
      typeof rowVirtualizer.scrollToIndex === 'function'
    ) {
      rowVirtualizer.scrollToIndex(highlightedIndex, { align: 'center' });
    }
  }, [highlightedIndex, isOpen, rowVirtualizer]);

  // Announce loading or errors
  useEffect(() => {
    if (loading) {
      // Announce loading
      if (inputRef.current) {
        inputRef.current.setAttribute('aria-busy', 'true');
      }
    } else {
      if (inputRef.current) {
        inputRef.current.removeAttribute('aria-busy');
      }
    }
  }, [loading]);

  // UI render
  return (
    <div className="searchable-select" style={{position:'relative', maxWidth:300}}>
      <div role="combobox" aria-expanded={isOpen}
           aria-haspopup="listbox"
           aria-owns="searchable-select-listbox"
           aria-controls="searchable-select-listbox"
           aria-activedescendant={
              isOpen && highlightedIndex !== null && options[highlightedIndex]
                ? `searchable-select-option-${getOptionValue(options[highlightedIndex])}`
                : undefined
           }
           >
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="searchable-select-listbox"
          aria-activedescendant={
            isOpen && highlightedIndex !== null && options[highlightedIndex]
              ? `searchable-select-option-${getOptionValue(options[highlightedIndex])}`
              : undefined
          }
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
            triggerFetch(e.target.value);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="searchbox"
          disabled={disabled}
          autoComplete="off"
          style={{width:'100%', boxSizing:'border-box', padding: '8px 12px'}}
        />
      </div>
      {isOpen && (
        <div
          ref={scrollParentRef}
          style={{
            maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS,
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid #ddd',
            borderTop: 'none',
            background: '#fff',
            position: 'absolute',
            width: '100%',
            zIndex: 1000,
          }}
          role="listbox"
          id="searchable-select-listbox"
          aria-labelledby="searchable-select-combobox"
        >
          {loading && (
            <div role="status" aria-live="polite" style={{padding:10, color:'#888'}}>{loadingText}</div>
          )}
          {error && (
            <div role="alert" aria-live="assertive" style={{color: 'red', padding:10}}>{errorText}</div>
          )}
          {!loading && !error && options.length === 0 && (
            <div style={{padding:10}}>{noResultsText}</div>
          )}
          {!loading && !error && options.length > 0 && (
            <div style={{position:'relative', height: rowVirtualizer.totalSize}}>
              {rowVirtualizer.virtualItems.map(virtualRow => {
                const opt = options[virtualRow.index];
                const isSelected =
                  selectedValue && getOptionValue(opt) === getOptionValue(selectedValue);
                const isHighlighted = highlightedIndex === virtualRow.index;
                return (
                  <div
                    key={getOptionValue(opt)}
                    id={`searchable-select-option-${getOptionValue(opt)}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(virtualRow.index)}
                    style={{
                      position:'absolute',
                      top:0,
                      left:0,
                      right:0,
                      transform: `translateY(${virtualRow.start}px)`,
                      background: isHighlighted
                        ? '#edf2fa'
                        : isSelected
                        ? '#f5f5f5'
                        : '#fff',
                      color: isHighlighted ? '#2264e6' : 'inherit',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      padding: '8px 12px',
                      lineHeight: '1.5',
                      cursor:'pointer',
                      height: ITEM_HEIGHT,
                      display:'flex',
                      alignItems:'center',
                      zIndex:10
                    }}
                  >
                    {getOptionLabel(opt)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SearchableSelect.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  noResultsText: PropTypes.string,
  loadingText: PropTypes.string,
  errorText: PropTypes.string,
  disabled: PropTypes.bool
};

export default SearchableSelect;
