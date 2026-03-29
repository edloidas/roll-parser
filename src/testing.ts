/**
 * Test utilities for roll-parser consumers.
 *
 * Import from `roll-parser/testing` for deterministic dice testing.
 *
 * @module testing
 */

// Direct value exports force the bundler to inline the code
import {
  MockRNGExhaustedError as _MockRNGExhaustedError,
  createMockRng as _createMockRng,
} from './rng/mock';

export const createMockRng = _createMockRng;
export const MockRNGExhaustedError = _MockRNGExhaustedError;
