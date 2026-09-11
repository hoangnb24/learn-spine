import { useRef, useState } from "react";
import { createStorage } from "../../src/storage";
import type { ProjectBundle } from "../../src/model/types";
import { EmptyState, Header } from "../shared/Shell";
import { Stage, usePlayback } from "../shared/Stage";
export function Player() {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null),
    [animationId, setAnimationId] = useState<string | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const animation = bundle?.project.animations.find(
      (a) => a.id === animationId,
    ),
    playback = usePlayback(animation?.duration ?? 0, animation?.loop ?? true);
  async function open(file: File) {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    playback.setPlaying(false);
    try {
      const result = await createStorage().unpack(
        new Uint8Array(await file.arrayBuffer()),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result.ok) {
        setBundle(result.value);
        setAnimationId(result.value.project.animations[0]?.id ?? null);
        playback.setTime(0);
      } else
        setError("Không mở được gói project. Chọn file ZIP đã xuất từ Editor.");
    } catch {
      if (!controller.signal.aborted)
        setError("Không đọc được file. Hãy chọn lại gói project.");
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <div
      className="application player"
      data-workspace-state={bundle ? "open" : "empty"}
    >
      <Header app="player" />
      <div className="file-bar">
        <label className="file-button">
          Mở gói project
          <input
            aria-label="Mở gói project"
            type="file"
            accept=".zip"
            onChange={(e) => {
              if (e.target.files?.[0]) void open(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </label>
        <span>
          {bundle?.project.metadata.name ??
            "Chọn gói đã tải về; Player chạy độc lập"}
        </span>
        {busy && (
          <button
            onClick={() => {
              pending.current?.abort();
              pending.current = null;
              setBusy(false);
            }}
          >
            Hủy mở gói
          </button>
        )}
      </div>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      <main className="player-workspace" aria-label="Player">
        {bundle ? (
          <Stage
            bundle={bundle}
            animationId={animationId}
            time={playback.time}
          />
        ) : (
          <EmptyState
            title="Chưa mở project"
            description="Vùng xem riêng cho project của bạn"
            large
          />
        )}
      </main>
      {bundle && (
        <div className="player-controls">
          <select
            aria-label="Chọn chuyển động"
            value={animationId ?? ""}
            onChange={(e) => {
              setAnimationId(e.target.value || null);
              playback.setTime(0);
              playback.setPlaying(false);
            }}
          >
            <option value="">Tư thế Setup</option>
            {bundle.project.animations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            disabled={!animation}
            onClick={() => playback.setPlaying(!playback.playing)}
          >
            {playback.playing ? "Tạm dừng" : "Phát"}
          </button>
          <input
            aria-label="Thanh thời gian"
            type="range"
            min="0"
            max={animation?.duration ?? 1}
            step="0.01"
            value={playback.time}
            disabled={!animation}
            onChange={(e) => {
              playback.setTime(Number(e.target.value));
              playback.setPlaying(false);
            }}
          />
          <output>{playback.time.toFixed(2)} s</output>
        </div>
      )}
      <footer className="status-bar">
        <span>Player</span>
        <span>
          {bundle
            ? `Bản ${bundle.project.revision} · ${bundle.project.assets.length} ảnh trong gói`
            : "Chưa mở project"}
        </span>
      </footer>
    </div>
  );
}
