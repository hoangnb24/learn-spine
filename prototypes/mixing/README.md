# Mixing research prototype (#24)

Executable numeric semantics + a small live Canvas diagram, **not a product feature**.
Uses canonical platform Project/types/timeline and accepted FK/IK through a transient
setup adapter. No source/model/schema/evaluator change in `platform/`.

## Reproduce

From repository root, Node 22.22.3 (`platform/.nvmrc`), npm 10+:

```sh
npm ci --prefix platform
platform/node_modules/.bin/vitest run --config prototypes/mixing/vitest.config.ts
platform/node_modules/.bin/tsc --noEmit --ignoreConfig --module esnext --moduleResolution bundler --target es2022 --skipLibCheck prototypes/mixing/mixer.ts prototypes/mixing/fixtures.ts prototypes/mixing/demo.ts
platform/node_modules/.bin/vite --host 127.0.0.1 --port 4244
```

Open http://127.0.0.1:4244/prototypes/mixing/ and click **Phát lại**.
Watch the arm layer and moving target before 1s, the hip/arm transition at 1–1.4s,
and the fixed endpoint at (120,-100) throughout stop. Pause/resume controls the
composition clock. This synthetic single-leg diagram is for semantics inspection,
not character motion quality; knee is allowed below the reference ground line.

[Specification and implementation handoff](../../docs/product/research/mixing-events.md)
contains the API proposal, truth tables, supported limits and three staged work items.
`mixer.ts` exposes `compose`, `pose`, `weight`, `crossings`, `stopEntry`. Only Track /
Source / Marker are research types; Project/Animation/Channel/Transform stay canonical.
No nesting, exports, storage changes, audio or production WebMCP tool introduced.

## Evidence — 12 September 2026

Baseline main `5b692111cb99d0dbeb3fd70c6732500b9fbed726`. Exact tested source is the
commit containing this README; subsequent documentation-only commits do not change
that source. PR contains the final head and independent acceptance separately.
Environment: macOS arm64, Node/npm versions in [environment.txt](evidence/environment.txt).

- [tests.txt](evidence/tests.txt): 8 tests pass. Independent expected scalar vectors;
  immutable inputs; shuffled seeks; multi-turn/scale; stop with 101 final-foot samples;
  no-IK and wrong-phase negative controls; coverage snap negative; crossing partition
  invariant, wrap, seek/reset and validation.
- [typecheck.txt](evidence/typecheck.txt): exit 0, no diagnostics for three TS modules.
- Browser Chrome via installed extension; actual requestAnimationFrame playback
  inspected using successive browser captures at displayed times. `final-*.png`
  cover 0.23→2.18 seconds including both transition phases and endpoint hold.
  [final-045.png](evidence/final-045.png) shows transition at 1.10s;
  [final-060.png](evidence/final-060.png) at 1.35s;
  [final-075.png](evidence/final-075.png) at 1.60s. Foot stays at marker while hip/arm
  changes, as measured separately in numeric tests. Captures are evidence of live
  playback inspection, not a frame cadence benchmark or proof of all-frame quality.
- `frame-*.png` is the first short walk-only inspection, not full-stop evidence.
  `motion-*.png` is the initial 0.23→2.00s pass **before fixing missing arm coverage**.
  It exposed the arm snap on outgoing removal. Retained as failure history; final
  demo adds explicit stop arm keys and negative test preserves that failure mode.
- Initial test extension failed because it demanded two different time samples
  (1.4−1e−9 and 1.4) equal within 5e−11 despite a real slope. Fixed the oracle to the
  analytical .2400000008 and .24, keeping the original numeric tolerance unchanged.
  Initial tsc reported closure narrowing of Source.animationId; captured the ID
  in a local before find(). Neither issue was a product/gate result.

CI `Mixing prototype` explicitly executes the numeric suite on affected PRs. The
Platform workflow's path filter does not imply coverage of this folder. Browser
inspection is manual evidence, not a CI browser acceptance claim.

Not tested/claimed: native agent acceptance, product editor/Player integration,
mesh deform composition, continuous motion-quality rubric, generic stop-at-any-phase,
velocity continuity, event dispatch transport, sound/audio synchronization, performance,
full Spine parity, production readiness or MVP approval. Existing gate failures and
historical thresholds remain untouched; audio is Deferred #70.
