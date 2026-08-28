import { useRef } from 'react';
import './OtpInput.css';

/**
 * OtpInput — a row of N single-digit boxes.
 * Props:
 *   length   – number of boxes (default 6)
 *   value    – string of entered digits
 *   onChange – called with the new full string
 *   hasError – boolean, turns boxes red
 */
export default function OtpInput({ length = 6, value = '', onChange, hasError = false }) {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const update = (arr) => onChange(arr.join(''));

  const handleChange = (e, i) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    update(next);
    if (char && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits];
        next[i] = '';
        update(next);
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && i > 0)           inputsRef.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = Array.from({ length }, (_, i) => text[i] || '');
    update(next);
    inputsRef.current[Math.min(text.length, length - 1)]?.focus();
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div className="otp-row" role="group" aria-label="One-time passcode">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          className={[
            'otp-box',
            d          ? 'otp-box--filled' : '',
            hasError   ? 'otp-box--error'  : '',
          ].join(' ')}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
