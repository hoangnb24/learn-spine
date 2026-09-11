import { describe, it, expect } from "vitest";
import { createSession, prepareBundle, type Session } from "../../src/commands";
import { createMeshProject } from "../../fixtures/mesh/synthetic";
import { createIKProject } from "../../fixtures/ik/leg";
import { createSyntheticProject } from "../../fixtures/model/synthetic";
import { evaluate } from "../../src/engine";
import { WebMCPBridge } from "../../src/adapters/webmcp";
import { ObservationService } from "../../src/observation";
import type { Project, Result, Storage, Operation } from "../../src/model";
const value = <T>(r: Result<T>): T => {
  if (!r.ok) throw Error(JSON.stringify(r));
  return r.value;
};
// Metadata fixture only: storage real PNG validation is covered by browser acceptance.
async function session(project: Project) {
  const bundle = {
    project,
    assets: new Map(project.assets.map((a) => [a.id, new Uint8Array([1])])),
  };
  return value(
    createSession(
      value(
        await prepareBundle(bundle, async () => ({
          ok: true,
          value: bundle,
          warnings: [],
        })),
      ),
    ),
  );
}
const req = (s: Session, requestId: string) => ({
  projectId: s.inspect().projectId,
  expectedRevision: s.inspect().revision,
  requestId,
});
const weights: Operation = {
  kind: "setVertexWeights",
  attachmentId: "triangle",
  vertices: [
    {
      vertex: 1,
      weights: [
        { boneId: "root", weight: 0.8 },
        { boneId: "child", weight: 0.2 },
      ],
    },
  ],
};
describe("v1 authoring transactions", () => {
  it("changes selected vertices only, retries once and restores geometry/data through history", async () => {
    const s = await session(createMeshProject()),
      before = s.inspect();
    const batch = { ...req(s, "weights"), operations: [weights] };
    const first = value(s.apply(batch));
    const after = s.inspect();
    expect(after.attachments[0]).toMatchObject({
      weights: [
        [{ boneId: "root", weight: 1 }],
        [
          { boneId: "root", weight: 0.8 },
          { boneId: "child", weight: 0.2 },
        ],
        [
          { boneId: "root", weight: 0.25 },
          { boneId: "child", weight: 0.75 },
        ],
      ],
    });
    expect(after.animations).toEqual(before.animations);
    expect(after.bones).toEqual(before.bones);
    const expected = structuredClone(before);
    if (expected.attachments[0].type === "mesh")
      expected.attachments[0].weights[1] = [
        { boneId: "root", weight: 0.8 },
        { boneId: "child", weight: 0.2 },
      ];
    expected.revision = 1;
    expect(after).toEqual(expected);
    value(s.undo(req(s, "undo")));
    expect(s.inspect()).toEqual({ ...before, revision: 2 });
    expect(value(s.apply(batch))).toEqual(first);
    expect(s.inspect().revision).toBe(2);
    value(s.redo(req(s, "redo")));
    expect(s.inspect()).toEqual({ ...after, revision: 3 });
    expect(
      value(evaluate(s.inspect(), { animationId: "bend", time: 0.5 })).meshes,
    ).not.toEqual(
      value(evaluate(before, { animationId: "bend", time: 0.5 })).meshes,
    );
  });
  it("rolls back mesh/deform/IK and history on invalid vertex, weight or bone", async () => {
    const s = await session(createMeshProject()),
      before = s.snapshot();
    for (const vertex of [-1, 3, 1.5])
      expect(
        s.apply({
          ...req(s, "bad"),
          operations: [
            weights,
            {
              kind: "setVertexWeights",
              attachmentId: "triangle",
              vertices: [{ vertex, weights: [{ boneId: "root", weight: 1 }] }],
            },
          ],
        }).ok,
      ).toBe(false);
    const invalid = s.apply({
      ...req(s, "bone"),
      operations: [
        weights,
        {
          kind: "setVertexWeights",
          attachmentId: "triangle",
          vertices: [
            { vertex: 0, weights: [{ boneId: "missing", weight: 1 }] },
          ],
        },
      ],
    });
    expect(invalid).toMatchObject({
      ok: false,
      error: { code: "MISSING_REFERENCE" },
    });
    expect(s.snapshot()).toEqual(before);
    expect(s.history().undo).toHaveLength(0);
    expect(
      s.apply({
        ...req(s, "duplicate"),
        operations: [
          {
            kind: "setVertexWeights",
            attachmentId: "triangle",
            vertices: [
              { vertex: 0, weights: [{ boneId: "root", weight: 1 }] },
              { vertex: 0, weights: [{ boneId: "root", weight: 1 }] },
            ],
          },
        ],
      }),
    ).toMatchObject({
      ok: false,
      error: { message: "Duplicate vertex index" },
    });
  });
  it("requires explicit migration; failed migration batch rolls back version and features; undo restores strict v0", async () => {
    const p = createSyntheticProject(),
      s = await session(p);
    const mesh = createMeshProject().attachments[0];
    expect(
      s.apply({
        ...req(s, "implicit"),
        operations: [{ kind: "putMesh", value: mesh }],
      }),
    ).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_VERSION" } });
    expect(
      s.apply({
        ...req(s, "failed"),
        operations: [
          { kind: "migrateProject", targetVersion: 1 },
          { kind: "putMesh", value: { ...mesh, assetId: "missing" } },
        ],
      }).ok,
    ).toBe(false);
    expect(s.inspect()).toEqual(p);
    value(
      s.apply({
        ...req(s, "explicit"),
        operations: [
          { kind: "migrateProject", targetVersion: 1 },
          { kind: "putMesh", value: mesh },
        ],
      }),
    );
    expect(s.inspect().requiredCapabilities).toContain("mesh-v1");
    value(s.undo(req(s, "undo")));
    expect(s.inspect()).toEqual({ ...p, revision: 2 });
    expect(
      s.apply({
        ...req(s, "deform-v0"),
        operations: [
          { kind: "putAnimation", value: createMeshProject().animations[0] },
        ],
      }),
    ).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_VERSION" } });
  });
  it("authors complete deform animations and IK in one undoable batch, with final-reference validation", async () => {
    const p = createMeshProject(),
      ik = createIKProject(),
      s = await session(p);
    const animation = structuredClone(p.animations[0]);
    animation.deforms![0].keys[1].offsets[0] = 4;
    value(
      s.apply({
        ...req(s, "combined"),
        operations: [
          { kind: "putIKConstraint", value: ik.ikConstraints![0] },
          ...ik.bones.map((value) => ({ kind: "putBone" as const, value })),
          { kind: "putAnimation", value: animation },
        ],
      }),
    );
    expect(s.inspect().requiredCapabilities).toEqual([
      "region-v0",
      "mesh-v1",
      "ik-v1",
    ]);
    expect(s.inspect().ikConstraints).toEqual(ik.ikConstraints);
    value(evaluate(s.inspect(), { animationId: "bend", time: 0.5 }));
    value(s.undo(req(s, "undo")));
    expect(s.inspect()).toEqual({ ...p, revision: 2 });
    value(s.redo(req(s, "redo")));
    value(
      s.apply({
        ...req(s, "remove"),
        operations: [
          { kind: "remove", collection: "ikConstraints", id: "leg" },
        ],
      }),
    );
    expect(s.inspect().ikConstraints).toEqual([]);
  });
  it("exposes bounded mesh/deform/IK/diagnostic reads and strict transport writes on the same session", async () => {
    const s = await session(createMeshProject());
    const bridge = new WebMCPBridge({
      getSession: () => s,
      observation: new ObservationService(),
      storage: {} as Storage,
    });
    const scope = { sessionId: s.sessionId, projectId: s.inspect().projectId };
    expect(await bridge.dispatch("get_capabilities", {})).toMatchObject({
      ok: true,
      value: {
        features: expect.arrayContaining([
          "mesh-v1",
          "ik-v1",
          "diagnostics-v1",
          "explicit-migration-v1",
        ]),
      },
    });
    const summary = value(
      await bridge.dispatch("inspect_project", {
        ...scope,
        collection: "attachments",
      }),
    );
    expect(JSON.stringify(summary)).not.toContain("weights");
    expect(
      await bridge.dispatch("inspect_mesh", {
        ...scope,
        attachmentId: "triangle",
        section: "vertices",
        offset: 1,
        limit: 1,
      }),
    ).toMatchObject({
      ok: true,
      value: { total: 3, nextOffset: 2, items: [{ vertex: 1 }] },
    });
    expect(
      await bridge.dispatch("inspect_deforms", {
        ...scope,
        animationId: "bend",
      }),
    ).toMatchObject({
      ok: true,
      value: { items: [{ attachmentId: "triangle", keyCount: 2 }] },
    });
    const batch = { ...scope, ...req(s, "tool"), operations: [weights] };
    expect(await bridge.dispatch("apply_batch", batch)).toMatchObject({
      ok: true,
      value: { revision: 1 },
    });
    expect(await bridge.dispatch("validate_project", scope)).toMatchObject({
      ok: true,
      value: { revision: 1, valid: true, passed: true },
    });
    const measured = await bridge.dispatch("measure_motion", {
      ...scope,
      animationId: "bend",
      anchors: [
        {
          id: "fixed",
          point: { kind: "vertex", slotId: "mesh-slot", vertex: 0 },
          target: [12, 20],
        },
      ],
      limit: 1,
    });
    expect(measured).toMatchObject({
      ok: true,
      value: {
        revision: 1,
        passed: false,
        items: expect.any(Array),
        nextOffset: 1,
      },
    });
    expect(
      await bridge.dispatch("measure_motion", {
        ...scope,
        animationId: "bend",
        anchors: [
          {
            id: "bad",
            point: { kind: "vertex", slotId: "mesh-slot", vertex: 999 },
            target: [0, 0],
          },
        ],
      }),
    ).toMatchObject({ ok: false });
    expect(
      await bridge.dispatch("apply_batch", { ...batch, extra: 1 }),
    ).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(
      await bridge.dispatch("measure_motion", {
        ...scope,
        animationId: "bend",
        limit: 51,
      }),
    ).toMatchObject({ ok: false });
    expect(s.inspect().revision).toBe(1);
  });
});

describe("selected deform keys and large offset pages", () => {
  it("edits only selected offsets at existing/new times and restores full animation on undo/retry", async () => {
    const s = await session(createMeshProject()),
      before = s.inspect();
    const batch = {
      ...req(s, "local-deform"),
      operations: [
        {
          kind: "setVertexDeforms",
          animationId: "bend",
          attachmentId: "triangle",
          time: 1,
          curve: { type: "stepped" },
          vertices: [{ vertex: 1, offset: [5, 6] }],
        },
      ],
    };
    const first = value(s.apply(batch));
    const after = s.inspect();
    expect(after.animations[0].channels).toEqual(before.animations[0].channels);
    expect(after.animations[0].deforms![0].keys[0]).toEqual(
      before.animations[0].deforms![0].keys[0],
    );
    expect(after.animations[0].deforms![0].keys[1]).toEqual({
      time: 1,
      curve: { type: "stepped" },
      offsets: [2, 0, 5, 6, 2, 0],
    });
    expect(after.attachments).toEqual(before.attachments);
    value(s.undo(req(s, "undo-local")));
    expect(s.inspect()).toEqual({ ...before, revision: 2 });
    expect(value(s.apply(batch))).toEqual(first);
    expect(s.inspect().revision).toBe(2);
    value(
      s.apply({
        ...req(s, "new-key"),
        operations: [
          {
            kind: "setVertexDeforms",
            animationId: "bend",
            attachmentId: "triangle",
            time: 0.5,
            curve: { type: "linear" },
            vertices: [{ vertex: 2, offset: [3, 4] }],
          },
        ],
      }),
    );
    expect(
      s.inspect().animations[0].deforms![0].keys.map((k) => k.time),
    ).toEqual([0, 0.5, 1]);
    expect(s.inspect().animations[0].deforms![0].keys[1].offsets).toEqual([
      0, 0, 0, 0, 3, 4,
    ]);
    const snapshot = s.snapshot();
    for (const patch of [
      { time: 2 },
      { animationId: "missing" },
      { attachmentId: "missing" },
      { vertices: [{ vertex: 3, offset: [0, 0] }] },
      {
        vertices: [
          { vertex: 0, offset: [0, 0] },
          { vertex: 0, offset: [1, 1] },
        ],
      },
    ])
      expect(
        s.apply({
          ...req(s, "failed-local"),
          operations: [weights, { ...batch.operations[0], ...patch }],
        }).ok,
      ).toBe(false);
    expect(s.snapshot()).toEqual(snapshot);
  });
  it("reads and edits an 8000-vertex key through bounded pages without sending the whole animation", async () => {
    const p = createMeshProject(),
      mesh = p.attachments[0];
    mesh.vertices = Array(16000).fill(0.12345678901234567);
    mesh.uvs = Array(16000).fill(0);
    mesh.weights = Array.from({ length: 8000 }, () => [
      { boneId: "root", weight: 1 },
    ]);
    for (const key of p.animations[0].deforms![0].keys)
      key.offsets = Array(16000).fill(0.12345678901234567);
    const s = await session(p),
      bridge = new WebMCPBridge({
        getSession: () => s,
        observation: new ObservationService(),
        storage: {} as Storage,
      }),
      scope = { sessionId: s.sessionId, projectId: p.projectId };
    expect(
      await bridge.dispatch("inspect_deforms", {
        ...scope,
        animationId: "bend",
        attachmentId: "triangle",
        limit: 1,
      }),
    ).toMatchObject({
      ok: true,
      value: { items: [{ time: 0, vertexCount: 8000 }], nextOffset: 1 },
    });
    const read = {
      ...scope,
      animationId: "bend",
      attachmentId: "triangle",
      keyTime: 1,
      offset: 7999,
      limit: 1,
    };
    expect(await bridge.dispatch("inspect_deforms", read)).toMatchObject({
      ok: true,
      value: {
        total: 8000,
        nextOffset: null,
        items: [
          { vertex: 7999, offset: [0.12345678901234567, 0.12345678901234567] },
        ],
      },
    });
    expect(
      await bridge.dispatch("inspect_deforms", {
        ...scope,
        animationId: "bend",
        keyTime: 1,
      }),
    ).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(
      await bridge.dispatch("inspect_deforms", { ...read, keyTime: 0.25 }),
    ).toMatchObject({ ok: false, error: { code: "MISSING_REFERENCE" } });
    const request = {
      ...scope,
      ...req(s, "large-local"),
      operations: [
        {
          kind: "setVertexDeforms",
          animationId: "bend",
          attachmentId: "triangle",
          time: 1,
          curve: { type: "linear" },
          vertices: [{ vertex: 7999, offset: [1, 2] }],
        },
      ],
    };
    expect(await bridge.dispatch("apply_batch", request)).toMatchObject({
      ok: true,
      value: { revision: 1 },
    });
    expect(await bridge.dispatch("inspect_deforms", read)).toMatchObject({
      ok: true,
      value: { items: [{ vertex: 7999, offset: [1, 2] }] },
    });
    const expected = structuredClone(p);
    expected.revision = 1;
    expected.animations[0].deforms![0].keys[1].offsets.splice(15998, 2, 1, 2);
    expect(s.inspect()).toEqual(expected);
  });
});
