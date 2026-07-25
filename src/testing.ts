/**
 * Test utilities for roll-parser consumers.
 *
 * Import from `roll-parser/testing` for deterministic dice testing.
 *
 * @module testing
 */

// Direct value exports force the bundler to inline the code
import {
  createMockRng as _createMockRng,
  MockRNGExhaustedError as _MockRNGExhaustedError,
} from './rng/mock.js';

export const createMockRng = _createMockRng;
export const MockRNGExhaustedError = _MockRNGExhaustedError;
