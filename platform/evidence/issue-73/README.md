# Composition core #73 — evidence

Date: 2026-09-12. Implementation started from accepted discovery main
`a25dc95cc6588de5c5a3389fff207a6d9131e0a1`. Final source is the commit containing
this evidence, with exact reviewed head and CI URL recorded in the PR handoff.
Rebased onto planning-only main `56224a01c21a514e81708ee46861b245fa3e6481` before
PR publication. No UI, native, motion-quality, performance or gate claim.

## Reproduce and results

Environment: macOS arm64, Node v22.22.3, npm 10.9.8. Dependencies from committed
platform lockfile via `npm ci --prefix platform` (70 packages, zero reported
vulnerabilities). From repository root:

| Command | Actual result | Log |
| --- | --- | --- |
| `npm run typecheck --prefix platform` | exit 0 | [typecheck.txt](typecheck.txt) |
| `npm test --prefix platform` | 184 passed, 1 existing skipped test; 20 passed files, 1 skipped | [tests.txt](tests.txt) |
| `npm run build --prefix platform` | exit 0; existing large-chunk warning | [build.txt](build.txt) |
| `npm run test:browser --prefix platform` | 19 Chromium tests passed | [browser.txt](browser.txt) |

Browser checks cover existing editor/player, actual PNG/ZIP/IndexedDB behavior,
mesh/deform/IK authoring and legacy bridge regressions. They do **not** claim a
composition editor/native workflow. Those integrations are #74/#75. The browser
suite rewrites historical #12/#19 artifacts; only outputs of this run were restored
so earlier checked-in evidence remains untouched.

## Durable fixtures and checks

- [Canonical contract](../../src/model/COMPOSITION.md): schema, target/provenance,
  descriptor-to-primitive mapping, source edits and compatibility boundaries.
- [Independent numeric fixture](../../tests/engine/composition-fixture.ts): native
  Project/Composition sources, authored walk/wave/stop and contact entry.
- [Engine tests](../../tests/engine/composition.test.ts): overwrite .9 / additive
  1.2 at alpha .5; endpoints alpha 0/1; mask absence; direct radians and 4π winding;
  additive scale through zero; ordered/shuffled seeks, clamp/wrap/hold/removal,
  source speed 0 and 2; correct target ID/revision/time; frozen source edit changes
  values at new revision. Crossfade 1.2 → hip −2, arm .36; 1.4−1e−9 → arm
  .2400000008; 1.4 → .24. The authored stop checks 101 final foot positions
  (120,−100), coordinate precision 1e−10 and residual <1e−8. Wrong-phase control
  differs by 10 in X; removing IK differs by >10. Source-only composition matches
  legacy region/mesh final geometry; legacy deform animation path remains exact.
- [Model tests](../../tests/model/composition.test.ts): strict unknown nested
  fields; capabilities/version, mask/order/ID/reference/timing/finite errors;
  every missing keyed+masked incoming crossfade property is reported. Strict
  parse/serialize handles null-prototype parser values and roundtrips source IDs.
- [Session tests](../../tests/commands/composition.test.ts): put/edit/remove,
  revisions/retry/conflicts, undo/redo/checkpoints and namespaced events; rejected
  batches leave project/history/events unchanged. Source delete, source channel
  coverage changes, missing refs and introducing deforms through both putAnimation
  and setVertexDeforms fail atomically. Explicit migration and joint dependent
  removal are tested. Frozen source edits and undo update/restore pose.
- [ZIP test](../../tests/storage/composition.test.ts): real existing ZIP pack/unpack
  roundtrips all composition data and revision, then matches final poses at eight
  absolute times. This art-independent fixture has no image bytes; real PNG and
  mesh ZIP coverage comes from existing browser tests.
- Narrow [bridge](../../tests/adapters/bridge.test.ts) and
  [observation](../../tests/observation/jobs.test.ts) regressions: core-only
  composition is not advertised by transport; unsupported canonical/hybrid requests
  cannot silently select an animation. These guards are handed to #74 for removal
  only when its actual canonical target integration is complete.

## Failure history and limits

The first new Session/parser/ZIP run exposed five failures: AJV `uniqueItems`
compared object mask entries via `fast-deep-equal`, which throws `a.valueOf is not
a function` for the existing null-prototype JSON copies. Mask uniqueness now uses
a semantic bone/property Set after strict schema checking, preserving rejection
without changing the parser or relaxing uniqueness. The committed roundtrip and
Session tests cover those failure paths. One intermediate typecheck also caught
an unused test import; it was removed. All final commands above passed.

Transform-only capability rejects nonempty source deforms even when weight is zero
or mask empty. No nested compositions, reverse playback, event dispatch/audio,
automatic phase controller, root motion extraction or exporter. The authored stop
oracle is one reachable rig/phase fixture, not generic automatic stopping or motion
quality. Continuous observation bounds and actual UI/native composition workflow
remain downstream work.
