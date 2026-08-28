import '@testing-library/jest-dom';
import React from 'react';

// Silence React act() warnings
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock qrcode.react — avoids canvas/SVG issues in jsdom
// (JSX-free version so this file stays a plain .js)
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }) =>
    React.createElement('svg', { 'data-testid': 'qr-code', 'data-value': value }),
}));

// Clean up localStorage between tests
afterEach(() => {
  localStorage.clear();
});
