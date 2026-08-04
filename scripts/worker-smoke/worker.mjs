import { SeededRNG, VERSION, roll } from 'roll-parser';
import { createMockRng } from 'roll-parser/testing';

// ! Rolling per request, not at module scope: workerd evaluates the top level in
// ! a startup context that withholds I/O and some globals, so module-scope work
// ! would smoke a narrower environment than a real handler.
export default {
  fetch() {
    const pinned = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
    const seeded = roll('2d6', { rng: new SeededRNG('ci') });

    return Response.json({
      version: VERSION,
      pinned: pinned.total,
      seeded: seeded.total,
    });
  },
};
