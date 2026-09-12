import { useEffect, useRef, useState } from "react";
import { evaluate, evaluateTarget } from "../../src/engine";
import { PixiRenderer, fitCamera, screenPoint } from "../../src/render";
import { targetBounds } from "../../src/observation/bounds";
import { validateViewport } from "../../src/render/geometry";
import type {
  Pose,
  RenderablePose,
  EvaluationTarget,
  ProjectBundle,
  Viewport,
} from "../../src/model/types";

export function Stage({
  bundle,
  animationId = null,
  target,
  time,
  selected,
  onSelect,
  meshSelection,
}: {
  bundle: ProjectBundle;
  animationId?: string | null;
  target?: EvaluationTarget;
  time: number;
  selected?: string;
  onSelect?: (id: string) => void;
  meshSelection?: {
    attachmentId: string;
    vertices: number[];
    weightBoneId: string;
    onSelect(vertex: number): void;
  };
}) {
  const host = useRef<HTMLDivElement>(null),
    renderer = useRef<PixiRenderer | null>(null);
  const [ready, setReady] = useState(0),
    [error, setError] = useState("");
  const [size, setSize] = useState({ width: 640, height: 420 }),
    [zoom, setZoom] = useState(1);
  const [camera, setCamera] = useState<{
      viewport: Viewport;
      bundle: ProjectBundle;
      targetKey: string;
    } | null>(null),
    [pose, setPose] = useState<RenderablePose | null>(null);
  useEffect(() => {
    let stopped = false;
    void PixiRenderer.create().then((result) => {
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      if (stopped) {
        result.value.dispose();
        return;
      }
      renderer.current = result.value;
      host.current?.prepend(result.value.canvas);
      setReady((n) => n + 1);
    });
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (rect.width > 0 && rect.height > 0)
        setSize({ width: rect.width, height: rect.height });
    });
    if (host.current) observer.observe(host.current);
    return () => {
      stopped = true;
      observer.disconnect();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);
  const [prepared, setPrepared] = useState<ProjectBundle | null>(null);
  const targetKey = JSON.stringify(
    target ?? { kind: "animation", animationId },
  );
  const view =
    camera?.bundle === prepared && camera?.targetKey === targetKey
      ? camera.viewport
      : null;
  const setView = (viewport: Viewport | null) =>
    setCamera(
      viewport && prepared ? { viewport, bundle: prepared, targetKey } : null,
    );
  useEffect(() => {
    if (!renderer.current) return;
    const controller = new AbortController();
    setPrepared(null);
    setPose(null);
    setView(null);
    void renderer.current.prepare(bundle, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setPrepared(bundle);
        setError("");
      } else setError(result.error.message);
    });
    return () => controller.abort();
  }, [bundle, ready]);
  useEffect(() => {
    if (!prepared || prepared !== bundle || !renderer.current) return;
    const p = prepared.project;
    if (target) {
      setView(null);
      setPose(null);
      const bounds = targetBounds(p, target);
      if (!bounds.ok) {
        setError(bounds.error.message);
        return;
      }
      const box = bounds.value,
        padding = Math.min(32, Math.min(size.width, size.height) / 4);
      const viewport: Viewport = {
        ...size,
        centerX: box ? box.minX / 2 + box.maxX / 2 : 0,
        centerY: box ? box.minY / 2 + box.maxY / 2 : 0,
        zoom:
          (box
            ? Math.min(
                (size.width - padding * 2) / Math.max(1, box.maxX - box.minX),
                (size.height - padding * 2) / Math.max(1, box.maxY - box.minY),
              )
            : 1) * zoom,
        devicePixelRatio: devicePixelRatio || 1,
        background: "#253542",
      };
      const valid = validateViewport(viewport);
      if (!valid.ok) {
        setError(valid.error.message);
        return;
      }
      setError("");
      setView(viewport);
      return;
    }
    const animation = p.animations.find((a) => a.id === animationId);
    const poses: Pose[] = [];
    // A stable sampled union avoids camera pumping during playback.
    for (let i = 0; i <= (animation ? 60 : 0); i++) {
      const result = evaluate(p, {
        animationId,
        time: animation ? (i * animation.duration) / 60 : 0,
      });
      if (result.ok) poses.push(result.value);
    }
    const fitted = fitCamera(
      p,
      poses,
      {
        ...size,
        centerX: 0,
        centerY: 0,
        zoom: 1,
        devicePixelRatio: devicePixelRatio || 1,
        background: "#253542",
      },
      32,
    );
    if (fitted.ok)
      setView({
        ...fitted.value.viewport,
        zoom: fitted.value.viewport.zoom * zoom,
      });
  }, [prepared, bundle, animationId, target, size, zoom]);
  useEffect(() => {
    if (!prepared || prepared !== bundle || !view || !renderer.current) return;
    const result = target
      ? evaluateTarget(prepared.project, { target, time })
      : evaluate(prepared.project, { animationId, time });
    if (!result.ok) {
      setPose(null);
      setError(result.error.message);
      return;
    }
    renderer.current.setOverlay(
      meshSelection
        ? {
            wireframe: true,
            weightBoneId: meshSelection.weightBoneId || undefined,
          }
        : {},
    );
    const drawn = renderer.current.draw(result.value, view);
    if (!drawn.ok) {
      setPose(null);
      setError(drawn.error.message);
    } else {
      setPose(result.value);
      setError("");
    }
  }, [prepared, bundle, view, animationId, target, time, meshSelection]);
  const rendered =
    prepared === bundle &&
    pose &&
    (target
      ? "target" in pose &&
        JSON.stringify(pose.target) === JSON.stringify(target)
      : "animationId" in pose && pose.animationId === animationId)
      ? pose
      : null;
  return (
    <div
      className="stage"
      ref={host}
      data-frame-ready={!!rendered && !error}
      data-rendered-revision={rendered?.revision}
      data-rendered-time={rendered?.sampledTime}
      data-rendered-target={
        rendered &&
        ("target" in rendered
          ? JSON.stringify(rendered.target)
          : JSON.stringify({
              kind: "animation",
              animationId: rendered.animationId,
            }))
      }
    >
      {onSelect && rendered && pose && view && (
        <svg
          className="bone-overlay"
          width={size.width}
          height={size.height}
          aria-label="Xương trên canvas"
        >
          {meshSelection &&
            pose.meshes
              .filter((m) => m.attachmentId === meshSelection.attachmentId)
              .flatMap((m) =>
                Array.from({ length: m.vertices.length / 2 }, (_, vertex) => {
                  const [x, y] = screenPoint(
                    m.vertices[vertex * 2],
                    m.vertices[vertex * 2 + 1],
                    view,
                  );
                  return (
                    <circle
                      key={`${m.slotId}:${vertex}`}
                      role="button"
                      aria-label={`Chọn đỉnh ${vertex} trên hình`}
                      tabIndex={0}
                      cx={x}
                      cy={y}
                      r={meshSelection.vertices.includes(vertex) ? 7 : 5}
                      fill={
                        meshSelection.vertices.includes(vertex)
                          ? "#ffdd44"
                          : "#20313e"
                      }
                      stroke="#fff"
                      onClick={() => meshSelection.onSelect(vertex)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          meshSelection.onSelect(vertex);
                      }}
                    />
                  );
                }),
              )}
          {bundle.project.bones.map((bone) => {
            const m = pose.bones[bone.id];
            if (!m) return null;
            const [x, y] = screenPoint(m[4], m[5], view),
              parent = bone.parentId ? pose.bones[bone.parentId] : null;
            const end = parent
              ? screenPoint(parent[4], parent[5], view)
              : [x + 24, y];
            return (
              <g key={bone.id}>
                <line
                  x1={x}
                  y1={y}
                  x2={end[0]}
                  y2={end[1]}
                  stroke={selected === bone.id ? "#71eee3" : "#9db4c4"}
                  strokeWidth="2"
                />
                <circle
                  role="button"
                  aria-label={`Chọn xương ${bone.name}`}
                  tabIndex={0}
                  cx={x}
                  cy={y}
                  r={selected === bone.id ? 7 : 5}
                  fill="#20313e"
                  stroke={selected === bone.id ? "#71eee3" : "#9db4c4"}
                  strokeWidth="2"
                  onClick={() => onSelect(bone.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(bone.id);
                  }}
                />
              </g>
            );
          })}
        </svg>
      )}
      <div className="stage-tools">
        <button onClick={() => setZoom(1)}>Vừa khung</button>
        <label>
          Thu phóng{" "}
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          >
            <option value={0.5}>50%</option>
            <option value={1}>100%</option>
            <option value={2}>200%</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="stage-error">
          Không vẽ được: {error}
        </p>
      )}
    </div>
  );
}

export function usePlayback(duration: number, loop: boolean) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || duration <= 0) return;
    let frame = 0,
      previous: number | null = null;
    const tick = (now: number) => {
      const delta = previous === null ? 0 : (now - previous) / 1000;
      previous = now;
      setTime((value) => {
        const next = value + delta;
        if (next >= duration && !loop) {
          setPlaying(false);
          return duration;
        }
        return loop ? next % duration : next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration, loop]);
  return { time, setTime, playing, setPlaying };
}
