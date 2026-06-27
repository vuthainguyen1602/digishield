import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees and clear the DOM after every test.
afterEach(() => {
  cleanup();
});
