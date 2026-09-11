import { useState } from "react";
import type { Project, Mesh, TwoBoneIK } from "../../../src/model";
import type { EditorRuntime } from "../runtime";

/** Drafts are remounted on revision by the parent: no stale full-entity overwrite. */
export function MeshControls({
  project,
  runtime,
  meshId,
  selectMesh,
  vertices,
  selectVertices,
  weightBoneId,
  selectWeightBone,
  animationId,
  time,
}: {
  project: Project;
  runtime: EditorRuntime;
  meshId: string;
  selectMesh(id: string): void;
  vertices: number[];
  selectVertices(vertices: number[]): void;
  weightBoneId: string;
  selectWeightBone(id: string): void;
  animationId: string | null;
  time: number;
}) {
  const mesh = project.attachments.find(
    (a): a is Mesh => a.id === meshId && a.type === "mesh",
  );
  const [weights, setWeights] = useState<Record<string, string>>(
    Object.fromEntries(
      (mesh?.bindPose ?? []).map((b) => [
        b.boneId,
        String(
          mesh && vertices.length
            ? (mesh.weights[vertices[0]]?.find((w) => w.boneId === b.boneId)
                ?.weight ?? 0)
            : 0,
        ),
      ]),
    ),
  );
  const [offsetX, setOffsetX] = useState("0"),
    [offsetY, setOffsetY] = useState("0");
  const [constraintId, setConstraintId] = useState(
    project.ikConstraints?.[0]?.id ?? "",
  );
  const constraint = project.ikConstraints?.find((c) => c.id === constraintId);
  const [draft, setDraft] = useState<TwoBoneIK | undefined>(constraint);
  const apply = (operations: Parameters<EditorRuntime["apply"]>[0]) =>
    runtime.apply(operations, project.revision, runtime.session?.sessionId);
  if (project.formatVersion === 0)
    return (
      <div>
        <p>
          Project này dùng định dạng cũ. Nâng lên v1 để chỉnh lưới, biến dạng và
          IK. Có thể hoàn tác bước nâng cấp.
        </p>
        <button
          onClick={() => apply([{ kind: "migrateProject", targetVersion: 1 }])}
        >
          Nâng project lên v1
        </button>
      </div>
    );
  return (
    <div className="fields">
      <label>
        Lưới
        <select
          aria-label="Chọn lưới"
          value={meshId}
          onChange={(e) => {
            selectMesh(e.target.value);
            selectVertices([]);
          }}
        >
          <option value="">Chọn lưới</option>
          {project.attachments
            .filter((a) => a.type === "mesh")
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}
              </option>
            ))}
        </select>
      </label>
      {mesh && (
        <>
          <p>
            Chọn các đỉnh trên hình hoặc trong danh sách. Màu xanh = 0, đỏ = 1
            cho xương đang xem.
          </p>
          <label>
            Xương xem weights
            <select
              aria-label="Xương xem weights"
              value={weightBoneId}
              onChange={(e) => selectWeightBone(e.target.value)}
            >
              <option value="">Không tô weights</option>
              {mesh.bindPose.map((b) => (
                <option key={b.boneId} value={b.boneId}>
                  {b.boneId}
                </option>
              ))}
            </select>
          </label>
          <div
            style={{ maxHeight: 140, overflow: "auto" }}
            aria-label="Các đỉnh lưới"
          >
            {mesh.weights.map((_, vertex) => (
              <label key={vertex}>
                <input
                  type="checkbox"
                  aria-label={`Đỉnh ${vertex}`}
                  checked={vertices.includes(vertex)}
                  onChange={() =>
                    selectVertices(
                      vertices.includes(vertex)
                        ? vertices.filter((v) => v !== vertex)
                        : [...vertices, vertex],
                    )
                  }
                />
                Đỉnh {vertex}
              </label>
            ))}
          </div>
          <p data-testid="selected-vertices">
            Đã chọn: {vertices.join(", ") || "chưa có"}
          </p>
          <h3>Weights cho vùng chọn</h3>
          {mesh.bindPose.map((b) => (
            <label key={b.boneId}>
              {b.boneId}
              <input
                aria-label={`Weight ${b.boneId}`}
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={weights[b.boneId] ?? "0"}
                onChange={(e) =>
                  setWeights({ ...weights, [b.boneId]: e.target.value })
                }
              />
            </label>
          ))}
          <p className="hint">
            Tổng phải bằng 1. Áp dụng cùng bộ weights này cho các đỉnh đã chọn;
            không đổi đỉnh khác.
          </p>
          <button
            disabled={!vertices.length}
            onClick={() =>
              apply([
                {
                  kind: "setVertexWeights",
                  attachmentId: mesh.id,
                  vertices: vertices.map((vertex) => ({
                    vertex,
                    weights: Object.entries(weights).map(
                      ([boneId, weight]) => ({
                        boneId,
                        weight: weight.trim() ? Number(weight) : NaN,
                      }),
                    ),
                  })),
                },
              ])
            }
          >
            Áp dụng weights vùng chọn
          </button>
          {animationId && (
            <>
              <p>
                Đặt offset tuyệt đối cho vùng chọn tại {time.toFixed(3)} giây.
                Giữ offsets của đỉnh khác tại key đã có; key mới bắt đầu từ 0.
              </p>
              <label>
                Offset X
                <input
                  aria-label="Deform X"
                  type="number"
                  value={offsetX}
                  onChange={(e) => setOffsetX(e.target.value)}
                />
              </label>
              <label>
                Offset Y
                <input
                  aria-label="Deform Y"
                  type="number"
                  value={offsetY}
                  onChange={(e) => setOffsetY(e.target.value)}
                />
              </label>
              <button
                disabled={!vertices.length}
                onClick={() => {
                  const animation = structuredClone(
                    project.animations.find((a) => a.id === animationId)!,
                  );
                  animation.deforms ??= [];
                  let channel = animation.deforms.find(
                    (d) => d.attachmentId === mesh.id,
                  );
                  if (!channel) {
                    channel = { attachmentId: mesh.id, keys: [] };
                    animation.deforms.push(channel);
                  }
                  let key = channel.keys.find((k) => k.time === time);
                  if (!key) {
                    key = {
                      time,
                      offsets: mesh.vertices.map(() => 0),
                      curve: { type: "linear" },
                    };
                    channel.keys.push(key);
                  }
                  for (const vertex of vertices) {
                    key.offsets[vertex * 2] = offsetX.trim()
                      ? Number(offsetX)
                      : NaN;
                    key.offsets[vertex * 2 + 1] = offsetY.trim()
                      ? Number(offsetY)
                      : NaN;
                  }
                  channel.keys.sort((a, b) => a.time - b.time);
                  apply([{ kind: "putAnimation", value: animation }]);
                }}
              >
                Đặt key biến dạng vùng chọn
              </button>
            </>
          )}
        </>
      )}
      <h3>IK hai xương</h3>
      <label>
        Ràng buộc
        <select
          aria-label="Chọn IK"
          value={constraintId}
          onChange={(e) => {
            setConstraintId(e.target.value);
            setDraft(
              project.ikConstraints?.find((c) => c.id === e.target.value),
            );
          }}
        >
          <option value="">Chọn IK</option>
          {project.ikConstraints?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
      </label>
      {draft && (
        <>
          <p>
            {draft.rootBoneId} → {draft.childBoneId} · đích {draft.targetBoneId}
          </p>
          <label>
            Mức IK
            <input
              aria-label="Mức IK"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={draft.mix}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  mix: e.target.value === "" ? NaN : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Hướng gập
            <select
              aria-label="Hướng gập"
              value={draft.bend}
              onChange={(e) =>
                setDraft({ ...draft, bend: Number(e.target.value) as 1 | -1 })
              }
            >
              <option value={1}>+1</option>
              <option value={-1}>−1</option>
            </select>
          </label>
          <label>
            Thứ tự IK
            <input
              aria-label="Thứ tự IK"
              type="number"
              min="0"
              value={draft.order}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  order: e.target.value === "" ? NaN : Number(e.target.value),
                })
              }
            />
          </label>
          <button
            onClick={() => apply([{ kind: "putIKConstraint", value: draft }])}
          >
            Áp dụng IK
          </button>
        </>
      )}
    </div>
  );
}
