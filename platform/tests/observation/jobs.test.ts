import { describe, it, expect } from "vitest";
import { ObservationService } from "../../src/observation";
import { animationBounds } from "../../src/observation/bounds";
import { evaluate } from "../../src/engine";
import { poseGeometry } from "../../src/render/geometry";
import { createSyntheticProject } from "../../fixtures/model/synthetic";
import type {
  Job,
  ProjectBundle,
  Renderer,
  Result,
} from "../../src/model/types";
const u = <T>(r: Result<T>): T => {
  if (!r.ok) throw Error(JSON.stringify(r.error));
  return r.value;
};
const viewport = {
  width: 64,
  height: 64,
  devicePixelRatio: 1,
  zoom: 1,
  centerX: 0,
  centerY: 0,
  background: "#000000",
};
const bundle = (): ProjectBundle => ({
  project: createSyntheticProject(),
  assets: new Map([["art", new Uint8Array([1, 2, 3])]]),
});
const request = {
  kind: "sequence" as const,
  animationId: "bounce",
  times: [0, 0.5, 1],
  viewport,
};
const done = async (s: ObservationService, id: string) => {
  for (let i = 0; i < 500; i++) {
    const j = u(s.get(id));
    if (!["queued", "running"].includes(j.status)) return j;
    await new Promise((r) => setTimeout(r, 2));
  }
  throw Error("Job hung");
};
function mock(options: { fail?: boolean; wait?: Promise<void> } = {}) {
  let disposed = 0;
  const seen: number[] = [];
  const renderer: Renderer = {
    prepare: async (b) => {
      seen.push(b.project.revision, b.assets.get("art")![0]);
      return { ok: true, value: undefined, warnings: [] };
    },
    draw: () => ({ ok: true, value: undefined, warnings: [] }),
    capture: async (p) => {
      await options.wait;
      if (options.fail) throw Error("encoder failure");
      return {
        ok: true,
        value: new Uint8Array([p.revision, p.sampledTime * 10]),
        warnings: [],
      };
    },
    dispose: () => {
      disposed++;
    },
  };
  return {
    factory: async () => ({ ok: true as const, value: renderer, warnings: [] }),
    seen,
    get disposed() {
      return disposed;
    },
  };
}
describe("Observation jobs (renderer mocks; browser verifies PNG)", () => {
  it("owns synchronous project, request and Buffer bytes snapshots; deterministic reads", async () => {
    const m = mock(),
      s = new ObservationService(m.factory),
      b = bundle();
    b.assets = new Map([["art", Buffer.from([1, 2, 3])]]);
    const r = structuredClone(request),
      id = u(s.submit(b, r)).id;
    b.project.revision = 9;
    b.assets.get("art")![0] = 99;
    r.times[0] = 999;
    const j = await done(s, id);
    expect(j.status).toBe("succeeded");
    expect(m.seen).toEqual([0, 1]);
    expect(m.disposed).toBe(1);
    const manifest = u(s.getManifest(id));
    expect(manifest.frames.map((f) => f.time)).toEqual([0, 0.5, 1]);
    expect(
      new Set(manifest.frames.map((f) => JSON.stringify(f.viewport))).size,
    ).toBe(1);
    if (j.status === "succeeded") {
      const bytes = u(await s.readArtifact(j.artifacts[0].id));
      bytes[0] = 44;
      expect(u(await s.readArtifact(j.artifacts[0].id))[0]).toBe(0);
      expect(u(s.cancel(id)).status).toBe("succeeded");
    }
    s.dispose();
    expect(s.get(id).ok).toBe(false);
  });
  it("cancels queued and running; reserves resources until running work settles", async () => {
    const m = mock(),
      s = new ObservationService(m.factory),
      id = u(s.submit(bundle(), request)).id;
    expect(u(s.cancel(id)).status).toBe("cancelled");
    await new Promise((r) => setTimeout(r, 10));
    expect(m.disposed).toBe(0);
    let release!: () => void;
    const blocked = mock({ wait: new Promise<void>((r) => (release = r)) }),
      t = new ObservationService(blocked.factory),
      a = u(t.submit(bundle(), request)).id;
    await new Promise((r) => setTimeout(r, 30));
    expect(u(t.get(a)).status).toBe("running");
    expect(u(t.cancel(a)).status).toBe("cancelled");
    u(t.submit(bundle(), request));
    expect(t.submit(bundle(), request).ok).toBe(false);
    release();
    await new Promise((r) => setTimeout(r, 30));
    expect(u(t.get(a)).status).toBe("cancelled");
    expect(t.getManifest(a).ok).toBe(false);
    expect(blocked.disposed).toBeGreaterThan(0);
    t.dispose();
  });
  it("encoder failure is terminal, exposes no partial media and disposes renderer", async () => {
    const m = mock({ fail: true }),
      s = new ObservationService(m.factory),
      j = await done(s, u(s.submit(bundle(), request)).id);
    expect(j.status).toBe("failed");
    if (j.status === "failed") expect(j.error.code).toBe("RENDER_FAILED");
    expect(s.getManifest(j.id).ok).toBe(false);
    expect(m.disposed).toBe(1);
  });
  it("validates quotas, invalid data, preview schedules, terminal eviction and cleanup", async () => {
    const m = mock(),
      s = new ObservationService(m.factory);
    expect(s.submit(bundle(), { ...request, times: [NaN] }).ok).toBe(false);
    expect(
      s.submit(bundle(), { ...request, viewport: { ...viewport, width: 4097 } })
        .ok,
    ).toBe(false);
    expect(
      s.submit(bundle(), {
        kind: "preview",
        animationId: "bounce",
        fps: 60,
        loops: 3,
        viewport,
      }).ok,
    ).toBe(false);
    const ids: string[] = [];
    let first: Job | undefined;
    for (let i = 0; i < 21; i++) {
      const j = await done(
        s,
        u(s.submit(bundle(), { ...request, times: [0] })).id,
      );
      ids.push(j.id);
      first ??= j;
    }
    expect(s.get(ids[0]).ok).toBe(false);
    if (first?.status === "succeeded")
      expect((await s.readArtifact(first.artifacts[0].id)).ok).toBe(false);
    const j = await done(
      s,
      u(
        s.submit(bundle(), {
          kind: "preview",
          animationId: "bounce",
          fps: 3,
          loops: 2,
          viewport,
        }),
      ).id,
    );
    expect(u(s.getManifest(j.id)).frames.map((f) => f.time)).toEqual(
      Array.from({ length: 12 }, (_, i) => i / 3),
    );
    s.dispose();
    expect(s.submit(bundle(), request).ok).toBe(false);
  });
  it("continuous envelope includes high rotations, negative scale and Bezier overshoot between frames", () => {
    const p = createSyntheticProject();
    p.animations[0].channels.push(
      {
        boneId: "root",
        property: "rotation",
        keys: [
          { time: 0, value: 0, curve: { type: "linear" } },
          { time: 2, value: 8 * Math.PI, curve: { type: "linear" } },
        ],
      },
      {
        boneId: "child",
        property: "scaleX",
        keys: [
          {
            time: 0,
            value: -2,
            curve: { type: "bezier", x1: 0.2, y1: 4, x2: 0.8, y2: -3 },
          },
          { time: 2, value: 3, curve: { type: "linear" } },
        ],
      },
    );
    const b = animationBounds(p, "bounce")!;
    for (let i = 0; i < 501; i++) {
      const geometry = u(
        poseGeometry(
          p,
          u(evaluate(p, { animationId: "bounce", time: i / 250 })),
        ),
      );
      for (const points of geometry)
        for (let j = 0; j < points.length; j += 2) {
          expect(points[j]).toBeGreaterThanOrEqual(b.minX - 1e-8);
          expect(points[j]).toBeLessThanOrEqual(b.maxX + 1e-8);
          expect(points[j + 1]).toBeGreaterThanOrEqual(b.minY - 1e-8);
          expect(points[j + 1]).toBeLessThanOrEqual(b.maxY + 1e-8);
        }
    }
  });
});
it("bounds has a hand-computed translation oracle, and huge finite angles terminate", () => {
  const p = createSyntheticProject();
  p.bones = [
    {
      id: "root",
      name: "root",
      parentId: null,
      setup: { x: 10, y: 20, rotation: 0, scaleX: 1, scaleY: 1 },
    },
  ];
  p.slots[0].boneId = "root";
  p.animations[0].channels = [
    {
      boneId: "root",
      property: "x",
      keys: [
        { time: 0, value: 10, curve: { type: "linear" } },
        { time: 2, value: 30, curve: { type: "linear" } },
      ],
    },
  ];
  // Trimmed corners [-80,40]..[40,120], translated by x=[10,30],y=20.
  expect(animationBounds(p, "bounce")).toEqual({
    minX: -70,
    maxX: 70,
    minY: 60,
    maxY: 140,
  });
  p.bones[0].setup.rotation = 1e308;
  expect(animationBounds(p, "bounce")).not.toBeNull();
});
it("renderPose snapshots before async prepare, returns metadata and handles abort", async () => {
  const m = mock(),
    s = new ObservationService(m.factory),
    b = bundle(),
    pending = s.renderPose(b, { animationId: "bounce", time: 0.5, viewport });
  b.project.revision = 8;
  b.assets.get("art")![0] = 99;
  const pose = u(await pending);
  expect(pose.revision).toBe(0);
  expect(pose.metadata.time).toBe(0.5);
  expect(pose.metadata.scale).toBe(1);
  expect(m.seen).toEqual([0, 1]);
  expect(m.disposed).toBe(1);
  const c = new AbortController();
  c.abort();
  const aborted = await s.renderPose(
    b,
    { animationId: "bounce", time: 0, viewport },
    c.signal,
  );
  expect(aborted.ok).toBe(false);
  if (!aborted.ok) expect(aborted.error.code).toBe("CANCELLED");
});
