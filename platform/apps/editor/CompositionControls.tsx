import { useEffect, useState } from "react";
import type {
  Composition,
  CompositionMask,
  CompositionTrack,
  Project,
  Transform,
} from "../../src/model/types";
import { id, type EditorRuntime } from "./runtime";

const properties: Record<keyof Transform, string> = {
  x: "Vị trí X",
  y: "Vị trí Y",
  rotation: "Góc xoay",
  scaleX: "Tỉ lệ X",
  scaleY: "Tỉ lệ Y",
};
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        aria-label={label}
        type="number"
        step="any"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </label>
  );
}
function Mask({
  label,
  value,
  project,
  onChange,
}: {
  label: string;
  value: CompositionMask;
  project: Project;
  onChange: (m: CompositionMask) => void;
}) {
  return (
    <fieldset className="composition-mask">
      <legend>{label}</legend>
      <p className="hint">
        Chỉ các thuộc tính được chọn và có key ở nguồn mới tác động. Không tự
        chọn xương con.
      </p>
      {project.bones.map((b) => (
        <details key={b.id} open={value.some((m) => m.boneId === b.id)}>
          <summary>
            {b.name} · {value.filter((m) => m.boneId === b.id).length} thuộc
            tính
          </summary>
          <div className="mask-options">
            {(Object.keys(properties) as (keyof Transform)[]).map(
              (property) => (
                <label key={property}>
                  <input
                    type="checkbox"
                    aria-label={`${label} · ${b.name} · ${properties[property]}`}
                    checked={value.some(
                      (m) => m.boneId === b.id && m.property === property,
                    )}
                    onChange={(e) =>
                      onChange(
                        e.target.checked
                          ? [...value, { boneId: b.id, property }]
                          : value.filter(
                              (m) =>
                                m.boneId !== b.id || m.property !== property,
                            ),
                      )
                    }
                  />
                  {properties[property]}
                </label>
              ),
            )}
          </div>
        </details>
      ))}
    </fieldset>
  );
}
function AnimationSelect({
  label,
  value,
  project,
  onChange,
}: {
  label: string;
  value: string;
  project: Project;
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Chọn chuyển động</option>
        {project.animations.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
            {a.deforms?.length ? " (có biến dạng — chưa trộn được)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
function TrackForm({
  track: t,
  project,
  onChange,
}: {
  track: CompositionTrack;
  project: Project;
  onChange: (t: CompositionTrack) => void;
}) {
  return (
    <div className="fields">
      <NumberField
        label="Thứ tự lớp"
        value={t.order}
        onChange={(order) => onChange({ ...t, order })}
      />
      <NumberField
        label="Bắt đầu (giây)"
        value={t.start}
        onChange={(start) => onChange({ ...t, start })}
      />
      {t.kind === "track" ? (
        <>
          <AnimationSelect
            label="Chuyển động nguồn"
            value={t.source.animationId}
            project={project}
            onChange={(animationId) =>
              onChange({ ...t, source: { ...t.source, animationId } })
            }
          />
          <label>
            Cách chạy nguồn
            <select
              aria-label="Cách chạy nguồn"
              value={t.source.kind}
              onChange={(e) =>
                onChange({
                  ...t,
                  source:
                    e.target.value === "live"
                      ? {
                          kind: "live",
                          animationId: t.source.animationId,
                          offset: 0,
                          speed: 1,
                        }
                      : {
                          kind: "frozen",
                          animationId: t.source.animationId,
                          entryTime: 0,
                        },
                })
              }
            >
              <option value="live">Chạy theo thời gian</option>
              <option value="frozen">Giữ một thời điểm</option>
            </select>
          </label>
          {t.source.kind === "live" ? (
            <>
              <NumberField
                label="Thời điểm nguồn bắt đầu"
                value={t.source.offset}
                onChange={(offset) =>
                  onChange({
                    ...t,
                    source: {
                      ...t.source,
                      kind: "live",
                      offset,
                      speed: t.source.kind === "live" ? t.source.speed : 1,
                    },
                  })
                }
              />
              <NumberField
                label="Tốc độ nguồn"
                value={t.source.speed}
                onChange={(speed) =>
                  onChange({
                    ...t,
                    source: {
                      ...t.source,
                      kind: "live",
                      offset: t.source.kind === "live" ? t.source.offset : 0,
                      speed,
                    },
                  })
                }
              />
            </>
          ) : (
            <NumberField
              label="Thời điểm giữ"
              value={t.source.entryTime}
              onChange={(entryTime) =>
                onChange({
                  ...t,
                  source: {
                    kind: "frozen",
                    animationId: t.source.animationId,
                    entryTime,
                  },
                })
              }
            />
          )}
          <label>
            Cách trộn
            <select
              aria-label="Cách trộn"
              value={t.mode}
              onChange={(e) =>
                onChange({
                  ...t,
                  mode: e.target.value as "overwrite" | "additive",
                })
              }
            >
              <option value="overwrite">Thay thế theo mức trộn</option>
              <option value="additive">Cộng độ lệch so với Setup</option>
            </select>
          </label>
          <NumberField
            label="Mức trộn (0–1)"
            value={t.alpha}
            onChange={(alpha) => onChange({ ...t, alpha })}
          />
          <NumberField
            label="Tăng dần (giây)"
            value={t.fadeIn}
            onChange={(fadeIn) => onChange({ ...t, fadeIn })}
          />
          <label>
            Kết thúc lớp
            <input
              aria-label="Có thời điểm kết thúc"
              type="checkbox"
              checked={t.end !== undefined}
              onChange={(e) => {
                const copy = { ...t };
                if (e.target.checked) copy.end = t.start;
                else delete copy.end;
                onChange(copy);
              }}
            />
          </label>
          {t.end !== undefined && (
            <NumberField
              label="Kết thúc (giây)"
              value={t.end}
              onChange={(end) => onChange({ ...t, end })}
            />
          )}
          <NumberField
            label="Giảm dần (giây)"
            value={t.fadeOut}
            onChange={(fadeOut) => onChange({ ...t, fadeOut })}
          />
          <Mask
            label="Thuộc tính của lớp"
            value={t.mask}
            project={project}
            onChange={(mask) => onChange({ ...t, mask })}
          />
        </>
      ) : (
        <>
          <NumberField
            label="Độ dài chuyển tiếp"
            value={t.duration}
            onChange={(duration) => onChange({ ...t, duration })}
          />
          <AnimationSelect
            label="Nguồn đi ra"
            value={t.outgoing.animationId}
            project={project}
            onChange={(animationId) =>
              onChange({ ...t, outgoing: { ...t.outgoing, animationId } })
            }
          />
          <NumberField
            label="Thời điểm giữ nguồn đi ra"
            value={t.outgoing.entryTime}
            onChange={(entryTime) =>
              onChange({ ...t, outgoing: { ...t.outgoing, entryTime } })
            }
          />
          <Mask
            label="Thuộc tính đi ra"
            value={t.outgoing.mask}
            project={project}
            onChange={(mask) =>
              onChange({ ...t, outgoing: { ...t.outgoing, mask } })
            }
          />
          <AnimationSelect
            label="Nguồn đi vào"
            value={t.incoming.animationId}
            project={project}
            onChange={(animationId) =>
              onChange({ ...t, incoming: { ...t.incoming, animationId } })
            }
          />
          <NumberField
            label="Thời điểm nguồn đi vào"
            value={t.incoming.offset}
            onChange={(offset) =>
              onChange({ ...t, incoming: { ...t.incoming, offset } })
            }
          />
          <NumberField
            label="Tốc độ nguồn đi vào"
            value={t.incoming.speed}
            onChange={(speed) =>
              onChange({ ...t, incoming: { ...t.incoming, speed } })
            }
          />
          <Mask
            label="Thuộc tính đi vào"
            value={t.incoming.mask}
            project={project}
            onChange={(mask) =>
              onChange({ ...t, incoming: { ...t.incoming, mask } })
            }
          />
          <p className="hint">
            Nguồn đi vào phải có key và được chọn đủ các thuộc tính đi ra. Lớp
            chạy trước đó cần kết thúc tại lúc bắt đầu chuyển tiếp.
          </p>
        </>
      )}
    </div>
  );
}
export function CompositionControls({
  composition,
  project,
  runtime,
}: {
  composition: Composition;
  project: Project;
  runtime: EditorRuntime;
}) {
  const [draft, replaceDraft] = useState(() => structuredClone(composition));
  const [dirty, setDirty] = useState(false);
  const [baseRevision, setBaseRevision] = useState(project.revision);
  const stale = dirty && baseRevision !== project.revision;
  const setDraft = (next: Composition) => {
    replaceDraft(next);
    setDirty(true);
  };
  useEffect(() => {
    if (!dirty) {
      replaceDraft(structuredClone(composition));
      setBaseRevision(project.revision);
    }
  }, [composition, project.revision, dirty]);
  const [selected, select] = useState(composition.tracks[0]?.id ?? "");
  const active = draft.tracks.find((t) => t.id === selected);
  function add(kind: "track" | "crossfade") {
    const animationId = project.animations[0]?.id ?? "",
      order = Math.max(-1, ...draft.tracks.map((t) => t.order)) + 1;
    const common = { id: id(), order, start: 0 };
    const track: CompositionTrack =
      kind === "track"
        ? {
            ...common,
            kind,
            source: { kind: "live", animationId, offset: 0, speed: 1 },
            mask: [],
            mode: "overwrite",
            alpha: 1,
            fadeIn: 0,
            fadeOut: 0,
          }
        : {
            ...common,
            kind,
            duration: Math.min(0.3, draft.duration),
            outgoing: { animationId, entryTime: 0, mask: [] },
            incoming: { animationId, offset: 0, speed: 1, mask: [] },
          };
    setDraft({ ...draft, tracks: [...draft.tracks, track] });
    select(track.id);
  }
  return (
    <form
      className="composition-editor"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (
          runtime.apply(
            [{ kind: "putComposition", value: draft }],
            baseRevision,
            runtime.session?.sessionId,
          )
        )
          setDirty(false);
      }}
    >
      {stale && (
        <div role="alert" className="draft-conflict">
          Project vừa được sửa ở nơi khác. Bản nháp của bạn vẫn còn; tải bản mới
          trước khi áp dụng.
          <button
            type="button"
            onClick={() => {
              replaceDraft(structuredClone(composition));
              setBaseRevision(project.revision);
              setDirty(false);
            }}
          >
            Bỏ nháp và tải bản mới
          </button>
        </div>
      )}
      <h3>Phối chuyển động</h3>
      <p className="hint">
        Sửa bản nháp rồi áp dụng cùng lúc. Nguồn giữ thời điểm vẫn dùng dữ liệu
        nguồn mới nhất.
      </p>
      <div className="fields">
        <label>
          Tên phối chuyển động
          <input
            aria-label="Tên phối chuyển động"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <NumberField
          label="Độ dài phối (giây)"
          value={draft.duration}
          onChange={(duration) => setDraft({ ...draft, duration })}
        />
        <label>
          <input
            aria-label="Lặp phối chuyển động"
            type="checkbox"
            checked={draft.loop}
            onChange={(e) => setDraft({ ...draft, loop: e.target.checked })}
          />
          Lặp phối chuyển động
        </label>
      </div>
      <div className="composition-actions">
        <button type="button" onClick={() => add("track")}>
          Thêm lớp
        </button>
        <button type="button" onClick={() => add("crossfade")}>
          Thêm chuyển tiếp
        </button>
      </div>
      <label>
        Lớp đang sửa
        <select
          aria-label="Lớp đang sửa"
          value={selected}
          onChange={(e) => select(e.target.value)}
        >
          <option value="">Chọn lớp</option>
          {[...draft.tracks]
            .sort((a, b) => a.order - b.order)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.order} · {t.kind === "track" ? "Lớp" : "Chuyển tiếp"} ·{" "}
                {project.animations.find(
                  (a) =>
                    a.id ===
                    (t.kind === "track"
                      ? t.source.animationId
                      : t.incoming.animationId),
                )?.name ?? "Chưa chọn nguồn"}
              </option>
            ))}
        </select>
      </label>
      {active && (
        <>
          <TrackForm
            track={active}
            project={project}
            onChange={(track) =>
              setDraft({
                ...draft,
                tracks: draft.tracks.map((t) =>
                  t.id === track.id ? track : t,
                ),
              })
            }
          />
          <button
            type="button"
            onClick={() => {
              setDraft({
                ...draft,
                tracks: draft.tracks.filter((t) => t.id !== active.id),
              });
              select("");
            }}
          >
            Xóa lớp đang sửa
          </button>
        </>
      )}
      <button className="primary" type="submit" disabled={stale}>
        Áp dụng phối chuyển động
      </button>
    </form>
  );
}
