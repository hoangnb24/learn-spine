import { useEffect, useRef, useState } from "react";
import { evaluate } from "../../src/engine";
import { PixiRenderer, fitCamera, screenPoint } from "../../src/render";
import type { Pose, ProjectBundle, Viewport } from "../../src/model/types";

export function Stage({
  bundle,
  animationId,
  time,
  selected,
  onSelect,
}: {
  bundle: ProjectBundle;
  animationId: string | null;
  time: number;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    renderer = useRef<PixiRenderer | null>(null);
  const [ready, setReady] = useState(0),
    [error, setError] = useState("");
  const [size, setSize] = useState({ width: 640, height: 420 }),
    [zoom, setZoom] = useState(1);
  const [view, setView] = useState<Viewport | null>(null),
    [pose, setPose] = useState<Pose | null>(null);
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
  useEffect(() => {
    if (!renderer.current) return;
    const controller = new AbortController();
    setPrepared(null);
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
    if (!prepared || !renderer.current) return;
    const p = prepared.project,
      animation = p.animations.find((a) => a.id === animationId);
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
  }, [prepared, animationId, size, zoom]);
  useEffect(() => {
    if (!prepared || !view || !renderer.current) return;
    const result = evaluate(prepared.project, { animationId, time });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    const drawn = renderer.current.draw(result.value, view);
    if (!drawn.ok) setError(drawn.error.message);
    else {
      setPose(result.value);
      setError("");
    }
  }, [prepared, view, animationId, time]);
  return (
    <div
      className="stage"
      ref={host}
      data-rendered-revision={pose?.revision}
      data-rendered-time={pose?.sampledTime}
    >
      {onSelect && pose && view && (
        <svg
          className="bone-overlay"
          width={size.width}
          height={size.height}
          aria-label="Xương trên canvas"
        >
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
