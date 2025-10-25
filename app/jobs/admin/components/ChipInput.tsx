'use client';

import { useState, KeyboardEvent, ClipboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ChipInput({ values, onChange, placeholder, className }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addChip = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      return true;
    }
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (addChip(inputValue)) {
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      // Remove last chip on backspace if input is empty
      onChange(values.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Check if pasted text contains commas or newlines (multiple items)
    const separator = pastedText.includes(',') ? ',' : pastedText.includes('\n') ? '\n' : null;

    if (separator) {
      // Multiple items - split and add all
      const items = pastedText
        .split(separator)
        .map(item => item.trim())
        .filter(item => item && !values.includes(item));

      if (items.length > 0) {
        onChange([...values, ...items]);
      }
      // Clear input after adding multiple items
      setInputValue('');
    } else {
      // Single item - set as input value so user can press Tab
      const trimmedText = pastedText.trim();
      setInputValue(trimmedText);
    }
  };

  const removeChip = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className={`border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-[#682A53] focus-within:border-[#682A53] ${className}`}>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2 py-1 rounded text-sm"
          >
            <span>{value}</span>
            <button
              type="button"
              onClick={() => removeChip(index)}
              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-7 text-sm"
        />
      </div>
    </div>
  );
}
