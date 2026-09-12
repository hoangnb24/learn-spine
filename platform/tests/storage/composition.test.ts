import { expect, it } from 'vitest';
import { createStorage } from '../../src/storage';
import { evaluateTarget } from '../../src/engine';
import { fixture, composition, crossfade, track, value } from '../engine/composition-fixture';
it('ZIP roundtrip preserves named sources, frozen transition, revision and evaluated final pose', async () => {
  const project = fixture(); project.revision = 17; project.compositions = [composition([track('walk', 0, { end: 1 }), crossfade()])];
  const bundle = { project, assets: new Map<string, Uint8Array>() }, storage = createStorage();
  const bytes = value(await storage.pack(bundle)); const restored = value(await storage.unpack(bytes));
  expect(restored).toEqual(bundle);
  for (const time of [0, .5, 1, 1.2, 1.4, 2, -.5, 20]) {
    const request = { target: { kind: 'composition' as const, compositionId: 'motion' }, time };
    expect(evaluateTarget(restored.project, request)).toEqual(evaluateTarget(project, request));
  }
});
