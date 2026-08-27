import React, { useRef, useEffect } from 'react';

interface PinInputProps {
  value: string;
  onChange: (pin: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
  mask?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  error = false,
  mask = false
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const lastChar = val.slice(-1);

    if (lastChar && !/^\d$/.test(lastChar)) return;

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newPin = newDigits.join('');
    onChange(newPin);

    // Auto advance to next box
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const cleanNumbers = pastedData.replace(/\D/g, '').slice(0, length);
    if (cleanNumbers) {
      onChange(cleanNumbers);
      const nextIndex = Math.min(cleanNumbers.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => (inputRefs.current[index] = el)}
          type={mask ? 'password' : 'text'}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index] || ''}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none select-none ${
            error
              ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-4 focus:ring-rose-500/20'
              : digits[index]
              ? 'border-blue-600 bg-blue-50/40 text-slate-900 shadow-sm'
              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
        />
      ))}
    </div>
  );
};
