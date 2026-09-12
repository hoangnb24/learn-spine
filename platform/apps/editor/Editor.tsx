import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import type {
  Bone,
  Curve,
  Operation,
  Transform,
  EvaluationTarget,
} from "../../src/model/types";
import { sampledTime } from "../../src/engine/timeline";
import { EmptyState, Header, Panel } from "../shared/Shell";
import { Stage, usePlayback } from "../shared/Stage";
import { editorRuntime, identity, id, type EditorRuntime } from "./runtime";

import { CompositionControls } from "./CompositionControls";
import { MeshControls } from "./mesh-controls";

const labels: Record<keyof Transform, string> = {
  x: "Vị trí X",
  y: "Vị trí Y",
  rotation: "Góc xoay (radian)",
  scaleX: "Tỉ lệ X",
  scaleY: "Tỉ lệ Y",
};
/** Parent-first presentation only; the canonical collection order is left intact. */
function boneRows(bones: Bone[]) {
  const children = new Map<string | null, Bone[]>();
  for (const bone of bones) {
    const siblings = children.get(bone.parentId) ?? [];
    siblings.push(bone);
    children.set(bone.parentId, siblings);
  }
  const pending = (children.get(null) ?? [])
    .slice()
    .reverse()
    .map((bone) => ({ bone, depth: 0 }));
  const rows: { bone: Bone; depth: number }[] = [];
  while (pending.length) {
    const row = pending.pop()!;
    rows.push(row);
    for (const child of (children.get(row.bone.id) ?? []).slice().reverse())
      pending.push({ bone: child, depth: row.depth + 1 });
  }
  return rows;
}
function BoneForm({
  bone,
  runtime,
  revision,
  sessionId,
}: {
  bone: Bone;
  runtime: EditorRuntime;
  revision: number;
  sessionId: number;
}) {
  const [draft, setDraft] = useState(bone);
  return (
    <form
      className="fields"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        runtime.apply([{ kind: "putBone", value: draft }], revision, sessionId);
      }}
    >
      <label>
        Tên xương
        <input
          aria-label="Tên xương"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </label>
      <label>
        Xương cha
        <select
          aria-label="Xương cha"
          value={draft.parentId ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, parentId: e.target.value || null })
          }
        >
          <option value="">Không có</option>
          {runtime
            .session!.inspect()
            .bones.filter((b) => b.id !== bone.id)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </label>
      {(Object.keys(labels) as (keyof Transform)[]).map((property) => (
        <label key={property}>
          {labels[property]}
          <input
            aria-label={labels[property]}
            type="number"
            step="any"
            value={
              Number.isNaN(draft.setup[property]) ? "" : draft.setup[property]
            }
            onChange={(e) =>
              setDraft({
                ...draft,
                setup: {
                  ...draft.setup,
                  [property]:
                    e.target.value === "" ? NaN : Number(e.target.value),
                },
              })
            }
          />
        </label>
      ))}
      <button type="submit" className="primary">
        Áp dụng thuộc tính
      </button>
    </form>
  );
}
export function Editor({
  runtime = editorRuntime,
  agentStatus = "Agent chưa kết nối",
}: {
  runtime?: EditorRuntime;
  agentStatus?: string;
}) {
  useSyncExternalStore(
    runtime.subscribe,
    runtime.getVersion,
    runtime.getVersion,
  );
  const session = runtime.session;
  const sessionId = session?.sessionId,
    revision = session?.inspect().revision;
  const bundle = useMemo(
    () => session?.snapshot() ?? null,
    [session, sessionId, revision],
  );
  const p = bundle?.project;
  const apply = (operations: Operation[]) =>
    runtime.apply(operations, p?.revision, sessionId);
  const [selected, select] = useState("root"),
    [mode, setMode] = useState<"setup" | "animate">("setup"),
    [animationId, chooseAnimation] = useState(""),
    [compositionId, chooseComposition] = useState("");
  const animation =
    p?.animations.find((a) => a.id === animationId) ?? p?.animations[0];
  const composition = p?.compositions?.find((c) => c.id === compositionId);
  const motion = composition ?? animation;
  const target = useMemo<EvaluationTarget>(
    () =>
      mode === "setup"
        ? { kind: "animation", animationId: null }
        : composition
          ? { kind: "composition", compositionId: composition.id }
          : { kind: "animation", animationId: animation?.id ?? null },
    [mode, composition?.id, animation?.id],
  );
  const playback = usePlayback(motion?.duration ?? 0, motion?.loop ?? true);
  useEffect(() => {
    if (composition)
      playback.setTime((t) =>
        sampledTime(t, composition.duration, composition.loop),
      );
  }, [composition?.duration, composition?.loop]);
  useEffect(() => {
    playback.setTime(0);
    playback.setPlaying(false);
  }, [
    target.kind,
    target.kind === "composition" ? target.compositionId : target.animationId,
  ]);
  useEffect(() => {
    if (compositionId && !composition) chooseComposition("");
  }, [compositionId, composition]);
  useEffect(() => {
    select("root");
    chooseAnimation("");
    chooseComposition("");
    playback.setTime(0);
    playback.setPlaying(false);
    setMode("setup");
    setProperty("rotation");
    setKeyValue("0");
    setCurve({ type: "linear" });
  }, [sessionId]);
  const [meshId, selectMesh] = useState("");
  const [vertices, selectVertices] = useState<number[]>([]);
  const [weightBoneId, selectWeightBone] = useState("");
  useEffect(() => {
    selectMesh("");
    selectVertices([]);
    selectWeightBone("");
  }, [sessionId]);
  const [panel, setPanel] = useState("properties"),
    [newBone, setNewBone] = useState("Xương mới"),
    [newAnimation, setNewAnimation] = useState("wave");
  const [property, setProperty] = useState<keyof Transform>("rotation"),
    [keyValue, setKeyValue] = useState("0"),
    [curve, setCurve] = useState<Curve>({ type: "linear" });
  const [keySource, setKeySource] = useState({ revision, sessionId });
  const activeKey = animation?.channels
    .find(
      (channel) => channel.boneId === selected && channel.property === property,
    )
    ?.keys.find((key) => key.time === playback.time);
  useEffect(() => {
    setKeySource({ revision, sessionId });
    if (activeKey) {
      setKeyValue(String(activeKey.value));
      setCurve(structuredClone(activeKey.curve));
    }
  }, [
    sessionId,
    revision,
    animation?.id,
    selected,
    property,
    playback.time,
    activeKey,
  ]);
  const bone = p?.bones.find((b) => b.id === selected);
  const history = session?.history();
  const mutation = (kind: "undo" | "redo") => {
    if (session) runtime.report(session[kind](runtime.request()));
  };
  function addKey(e: FormEvent) {
    e.preventDefault();
    if (!animation || !bone) return;
    const updated = structuredClone(animation);
    let channel = updated.channels.find(
      (c) => c.boneId === bone.id && c.property === property,
    );
    if (!channel) {
      channel = { boneId: bone.id, property, keys: [] };
      updated.channels.push(channel);
    }
    channel.keys = channel.keys.filter((k) => k.time !== playback.time);
    channel.keys.push({
      time: playback.time,
      value: keyValue.trim() === "" ? NaN : Number(keyValue),
      curve: structuredClone(curve),
    });
    channel.keys.sort((a, b) => a.time - b.time);
    runtime.apply(
      [{ kind: "putAnimation", value: updated }],
      keySource.revision,
      keySource.sessionId,
    );
  }
  return (
    <div className="application" data-workspace-state={p ? "open" : "empty"}>
      <Header app="editor" />
      <div className="file-bar">
        <button
          onClick={() => {
            playback.setPlaying(false);
            void runtime.newProject();
          }}
        >
          Project mới
        </button>
        <label className="file-button">
          Mở gói
          <input
            aria-label="Mở gói project"
            type="file"
            accept=".zip"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                playback.setPlaying(false);
                void runtime.openFile(f);
              }
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={() => {
            playback.setPlaying(false);
            void runtime.recover();
          }}
        >
          Khôi phục bản lưu
        </button>
        <span className="project-name">
          {p?.metadata.name ?? "Chưa mở project"}
        </span>
        <button
          disabled={!history?.undo.length}
          onClick={() => mutation("undo")}
        >
          Hoàn tác
        </button>
        <button
          disabled={!history?.redo.length}
          onClick={() => mutation("redo")}
        >
          Làm lại
        </button>
        <button
          disabled={!p || !!runtime.busy}
          onClick={() => void runtime.save()}
        >
          Lưu trình duyệt
        </button>
        <button
          disabled={!p || !!runtime.busy}
          onClick={() => void runtime.exportFile()}
        >
          Tải gói project
        </button>
      </div>
      <div className="mode-bar">
        <button
          aria-pressed={mode === "setup"}
          onClick={() => {
            setMode("setup");
            playback.setPlaying(false);
          }}
        >
          Setup
        </button>
        <button
          aria-pressed={mode === "animate"}
          onClick={() => setMode("animate")}
        >
          Animate
        </button>
        <p>
          {mode === "setup"
            ? "Bố trí xương và gắn ảnh"
            : composition
              ? "Phối nhiều nguồn · Sửa lớp, mức trộn và chuyển tiếp"
              : "Chỉnh key theo thời gian · Giá trị tuyệt đối, góc radian"}
        </p>
      </div>
      {(runtime.error || runtime.busy || runtime.notice) && (
        <div className={`message ${runtime.error ? "error" : ""}`}>
          <span role={runtime.error ? "alert" : "status"}>
            {runtime.error || runtime.busy || runtime.notice}
          </span>
          {runtime.busy && (
            <button onClick={() => runtime.cancel()}>
              Hủy tác vụ đang chờ
            </button>
          )}
        </div>
      )}
      <main
        className={`editor-workspace${composition ? " composing" : ""}`}
        aria-label="Editor"
      >
        <Panel title="Cấu trúc / Ảnh" className="structure-panel">
          {p ? (
            <div className="panel-content">
              <div role="tree" aria-label="Cây xương">
                {boneRows(p.bones).map(({ bone: b, depth }) => {
                  return (
                    <button
                      role="treeitem"
                      aria-selected={selected === b.id}
                      aria-level={depth + 1}
                      className="tree-row"
                      key={b.id}
                      style={{ paddingLeft: 12 + depth * 12 }}
                      onClick={() => select(b.id)}
                    >
                      ◇ {b.name}
                    </button>
                  );
                })}
              </div>
              <form
                className="inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const boneId = id();
                  if (
                    apply([
                      {
                        kind: "putBone",
                        value: {
                          id: boneId,
                          name: newBone,
                          parentId: bone?.id ?? p.bones[0].id,
                          setup: identity(),
                        },
                      },
                    ])
                  )
                    select(boneId);
                }}
              >
                <input
                  aria-label="Tên xương mới"
                  value={newBone}
                  onChange={(e) => setNewBone(e.target.value)}
                />
                <button>Thêm xương</button>
              </form>
              <h3>Ảnh gắn xương</h3>
              <p className="hint">
                PNG mới gắn vào xương đang chọn, tâm ảnh tại gốc xương. Chỉnh bố
                trí trong Thuộc tính.
              </p>
              <label className="file-button">
                Nạp PNG
                <input
                  aria-label="Nạp PNG"
                  type="file"
                  accept="image/png"
                  multiple
                  disabled={!bone}
                  onChange={(e) => {
                    if (e.target.files && bone)
                      void runtime.importPng([...e.target.files], bone.id);
                    e.target.value = "";
                  }}
                />
              </label>
              {p.slots.map((slot) => (
                <label className="asset-row" key={slot.id}>
                  {slot.name}
                  <select
                    aria-label={`Xương của ${slot.name}`}
                    value={slot.boneId}
                    onChange={(e) =>
                      apply([
                        {
                          kind: "putSlot",
                          value: { ...slot, boneId: e.target.value },
                        },
                      ])
                    }
                  >
                    {p.bones.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có đối tượng" kind="folder" />
          )}
        </Panel>
        <section className="canvas-area" aria-label="Vùng làm việc">
          {bundle ? (
            <Stage
              bundle={bundle}
              target={target}
              time={playback.time}
              selected={selected}
              onSelect={select}
              meshSelection={
                panel === "mesh"
                  ? {
                      attachmentId: meshId,
                      vertices,
                      weightBoneId,
                      onSelect: (vertex: number) =>
                        selectVertices(
                          vertices.includes(vertex)
                            ? vertices.filter((v) => v !== vertex)
                            : [...vertices, vertex],
                        ),
                    }
                  : undefined
              }
            />
          ) : (
            <EmptyState
              title="Chưa mở project"
              description="Tạo project để nạp PNG, hoặc mở gói đã lưu"
              large
            />
          )}
        </section>
        <Panel title="Thuộc tính" className="inspector-panel">
          <div className="panel-tabs">
            <button
              aria-pressed={panel === "properties"}
              onClick={() => setPanel("properties")}
            >
              Thuộc tính
            </button>
            <button
              aria-pressed={panel === "composition"}
              onClick={() => setPanel("composition")}
            >
              Phối chuyển động
            </button>
            <button
              aria-pressed={panel === "mesh"}
              onClick={() => setPanel("mesh")}
            >
              Lưới / IK
            </button>
            <button
              aria-pressed={panel === "history"}
              onClick={() => setPanel("history")}
            >
              Lịch sử
            </button>
          </div>
          <div className="panel-content">
            {panel === "composition" && p ? (
              composition ? (
                <CompositionControls
                  key={`${sessionId}:${composition.id}`}
                  composition={composition}
                  project={p}
                  runtime={runtime}
                />
              ) : (
                <p className="hint">
                  Chọn hoặc tạo phối chuyển động ở thanh Chuyển động.
                </p>
              )
            ) : panel === "mesh" && p ? (
              <MeshControls
                key={`${sessionId}:${revision}:${meshId}:${vertices.join(",")}`}
                project={p}
                runtime={runtime}
                meshId={meshId}
                selectMesh={selectMesh}
                vertices={vertices}
                selectVertices={selectVertices}
                weightBoneId={weightBoneId}
                selectWeightBone={selectWeightBone}
                animationId={composition ? null : (animation?.id ?? null)}
                time={playback.time}
              />
            ) : panel === "history" ? (
              <>
                <p className="hint">Lịch sử và mốc chỉ giữ trong phiên này.</p>
                {session && (
                  <button
                    onClick={() =>
                      runtime.report(
                        session.checkpoint({
                          ...runtime.request(),
                          label: `Mốc bản ${p!.revision}`,
                        }),
                      )
                    }
                  >
                    Tạo mốc khôi phục
                  </button>
                )}
                {history?.checkpoints.map((c) => (
                  <div className="history-row" key={c.id}>
                    {c.label}
                    <button
                      onClick={() =>
                        runtime.report(
                          session!.restore({
                            ...runtime.request(),
                            checkpointId: c.id,
                          }),
                        )
                      }
                    >
                      Khôi phục
                    </button>
                  </div>
                ))}
                {history?.undo
                  .slice()
                  .reverse()
                  .map((h) => (
                    <p className="history-row" key={h.requestId}>
                      Bản {h.sourceRevision + 1} · {h.changed.length} đối tượng
                    </p>
                  ))}
              </>
            ) : bone ? (
              <>
                <h3>{bone.name}</h3>
                <BoneForm
                  key={`${session?.sessionId}:${p?.revision}:${bone.id}`}
                  bone={bone}
                  revision={p!.revision}
                  sessionId={sessionId!}
                  runtime={runtime}
                />
                <p className="hint">
                  Thuộc tính sửa tư thế Setup. Animate thêm key ở thanh thời
                  gian.
                </p>
              </>
            ) : (
              <EmptyState title="Chưa chọn đối tượng" kind="file" />
            )}
          </div>
        </Panel>
        <Panel title="Chuyển động" className="motion-panel">
          {p ? (
            <div className="timeline">
              <div className="animation-list">
                {p.animations.map((a) => (
                  <button
                    aria-pressed={!composition && animation?.id === a.id}
                    key={a.id}
                    onClick={() => {
                      chooseComposition("");
                      chooseAnimation(a.id);
                      setMode("animate");
                      playback.setTime(0);
                      playback.setPlaying(false);
                    }}
                  >
                    {a.name}
                  </button>
                ))}
                {p.compositions?.map((c) => (
                  <button
                    key={`composition:${c.id}`}
                    aria-pressed={composition?.id === c.id}
                    onClick={() => {
                      chooseComposition(c.id);
                      setMode("animate");
                      setPanel("composition");
                      playback.setTime(0);
                      playback.setPlaying(false);
                    }}
                  >
                    Phối · {c.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const compositionId = id();
                    if (
                      apply([
                        ...(p.formatVersion === 0
                          ? [
                              {
                                kind: "migrateProject" as const,
                                targetVersion: 1 as const,
                              },
                            ]
                          : []),
                        {
                          kind: "putComposition",
                          value: {
                            id: compositionId,
                            name: "Phối mới",
                            duration: 2,
                            loop: true,
                            tracks: [],
                          },
                        },
                      ])
                    ) {
                      chooseComposition(compositionId);
                      setMode("animate");
                      setPanel("composition");
                    }
                  }}
                >
                  Tạo phối chuyển động
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const animationId = id();
                    if (
                      apply([
                        {
                          kind: "putAnimation",
                          value: {
                            id: animationId,
                            name: newAnimation,
                            duration: 2,
                            loop: true,
                            channels: [],
                          },
                        },
                      ])
                    ) {
                      chooseComposition("");
                      chooseAnimation(animationId);
                      setMode("animate");
                      playback.setTime(0);
                    }
                  }}
                >
                  <input
                    aria-label="Tên chuyển động mới"
                    value={newAnimation}
                    onChange={(e) => setNewAnimation(e.target.value)}
                  />
                  <button>Thêm chuyển động</button>
                </form>
              </div>
              <div className="timeline-main">
                {motion ? (
                  <>
                    <div className="transport">
                      <button
                        onClick={() => {
                          setMode("animate");
                          playback.setPlaying(!playback.playing);
                        }}
                      >
                        {playback.playing ? "Tạm dừng" : "Phát"}
                      </button>
                      <label>
                        Thời gian (giây)
                        <input
                          aria-label="Thời gian (giây)"
                          type="number"
                          min="0"
                          max={motion.duration}
                          step="0.01"
                          value={playback.time.toFixed(2)}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (
                              Number.isFinite(n) &&
                              n >= 0 &&
                              n <= motion.duration
                            ) {
                              playback.setTime(
                                composition
                                  ? sampledTime(
                                      n,
                                      composition.duration,
                                      composition.loop,
                                    )
                                  : n,
                              );
                              playback.setPlaying(false);
                              setMode("animate");
                            }
                          }}
                        />
                      </label>
                      <span>
                        {motion.duration.toFixed(2)} s ·{" "}
                        {motion.loop ? "Lặp" : "Một lần"}
                      </span>
                    </div>
                    <input
                      className="scrubber"
                      aria-label="Thanh thời gian"
                      type="range"
                      min="0"
                      max={motion.duration}
                      step="0.01"
                      value={playback.time}
                      onChange={(e) => {
                        playback.setTime(
                          composition
                            ? sampledTime(
                                Number(e.target.value),
                                composition.duration,
                                composition.loop,
                              )
                            : Number(e.target.value),
                        );
                        playback.setPlaying(false);
                        setMode("animate");
                      }}
                    />
                    {!composition && animation && (
                      <>
                        <div className="key-tracks">
                          {animation.channels.map((c) => (
                            <div
                              className="key-track"
                              key={`${c.boneId}:${c.property}`}
                            >
                              <span>
                                {p.bones.find((b) => b.id === c.boneId)?.name} /{" "}
                                {labels[c.property]}
                              </span>
                              <div>
                                {c.keys.map((k) => (
                                  <button
                                    key={k.time}
                                    style={{
                                      left: `${(k.time / animation.duration) * 100}%`,
                                    }}
                                    aria-label={`Key ${k.time} ${labels[c.property]}`}
                                    onClick={() => {
                                      select(c.boneId);
                                      playback.setTime(k.time);
                                      playback.setPlaying(false);
                                      setMode("animate");
                                      setProperty(c.property);
                                      setKeyValue(String(k.value));
                                      setCurve(structuredClone(k.curve));
                                    }}
                                  >
                                    ◆
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <form className="key-form" noValidate onSubmit={addKey}>
                          <select
                            aria-label="Thuộc tính key"
                            value={property}
                            onChange={(e) =>
                              setProperty(e.target.value as keyof Transform)
                            }
                          >
                            {Object.entries(labels).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <input
                            aria-label="Giá trị key"
                            type="number"
                            step="any"
                            value={keyValue}
                            onChange={(e) => setKeyValue(e.target.value)}
                          />
                          <select
                            aria-label="Nội suy key"
                            value={curve.type}
                            onChange={(e) => {
                              const type = e.target.value;
                              if (type === "linear" || type === "stepped")
                                setCurve({ type });
                            }}
                          >
                            <option value="linear">Thẳng</option>
                            <option value="stepped">Giữ bước</option>
                            {curve.type === "bezier" && (
                              <option value="bezier">
                                Bezier (giữ đường cong)
                              </option>
                            )}
                          </select>
                          <button disabled={!bone}>Đặt key</button>
                        </form>
                      </>
                    )}
                    {composition && (
                      <p className="hint">
                        {composition.tracks.length} lớp · Sửa lớp và chuyển tiếp
                        trong bảng Phối chuyển động.
                      </p>
                    )}
                  </>
                ) : (
                  <EmptyState title="Chưa có chuyển động" kind="motion" />
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="Chưa có chuyển động" kind="motion" />
          )}
        </Panel>
      </main>
      <footer className="status-bar">
        <span>
          {p ? `Bản ${p.revision}` : "Workspace trống"} ·{" "}
          {runtime.savedRevision === p?.revision
            ? "Đã lưu trên trình duyệt"
            : p
              ? "Chưa lưu bản hiện tại"
              : "Chưa mở project"}
        </span>
        <span>{agentStatus} · Tải gói để mở trong Player</span>
      </footer>
    </div>
  );
}
