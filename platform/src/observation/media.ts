/** Browser/transport adapter; binary remains outside core JSON results. */
import { ObservationService } from "./index";
import type { Result } from "../model/types";
export async function imageContent(
  service: ObservationService,
  artifactId: string,
): Promise<
  Result<{
    type: "image";
    mimeType: "image/png";
    data: string;
    dataUrl: string;
  }>
> {
  const result = await service.readArtifact(artifactId);
  if (!result.ok) return result;
  const b = result.value;
  if (b.length > 8 * 1024 * 1024)
    return {
      ok: false,
      error: {
        code: "LIMIT_EXCEEDED",
        path: "",
        message: "Inline media limited to 8 MiB; use browser preview/download",
      },
    };
  if (b[0] !== 137 || b[1] !== 80 || b[2] !== 78 || b[3] !== 71)
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        path: "",
        message: "Artifact is not PNG",
      },
    };
  let binary = "";
  for (let i = 0; i < b.length; i += 8192)
    binary += String.fromCharCode(...b.subarray(i, i + 8192));
  const data = btoa(binary);
  return {
    ok: true,
    value: {
      type: "image",
      mimeType: "image/png",
      data,
      dataUrl: `data:image/png;base64,${data}`,
    },
    warnings: [],
  };
}
/** Visible PNG playback + timestamp/revision + ZIP download. Owner must dispose on unmount. */
export async function mountPreview(
  service: ObservationService,
  jobId: string,
  host: HTMLElement,
): Promise<Result<{ dispose(): void }>> {
  const job = service.get(jobId),
    manifest = service.getManifest(jobId);
  if (!job.ok) return job;
  if (!manifest.ok) return manifest;
  if (job.value.status !== "succeeded")
    return {
      ok: false,
      error: { code: "INVALID_INPUT", path: "", message: "Job not complete" },
    };
  const root = document.createElement("section"),
    label = document.createElement("p"),
    img = document.createElement("img"),
    button = document.createElement("button"),
    download = document.createElement("a");
  img.alt = "Animation observation";
  img.style.maxWidth = "100%";
  button.textContent = "Pause";
  download.textContent = "Download PNG sequence";
  download.download = "observation.zip";
  root.append(label, img, button, download);
  const urls: string[] = [];
  let disposed = false,
    timer: ReturnType<typeof setTimeout> | undefined,
    index = 0,
    playing = true;
  const dispose = () => {
    disposed = true;
    clearTimeout(timer);
    urls.forEach(URL.revokeObjectURL);
    root.remove();
    unsubscribe();
  };
  const unsubscribe = service.onRelease((id) => {
    if (id === jobId) dispose();
  });
  try {
    for (const a of job.value.artifacts) {
      const bytes = await service.readArtifact(a.id);
      if (!bytes.ok) {
        dispose();
        return bytes;
      }
      if (disposed)
        return {
          ok: false,
          error: { code: "JOB_NOT_FOUND", path: "", message: "Media expired" },
        };
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes.value)], { type: a.mimeType }),
      );
      urls.push(url);
      if (a.mimeType === "application/zip") download.href = url;
    }
    const frames = manifest.value.frames;
    const show = () => {
      if (disposed) return;
      img.src = urls[index];
      const f = frames[index];
      label.textContent = `Revision ${f.revision} · time ${f.time.toFixed(3)} s · ${index + 1}/${frames.length}`;
      root.dataset.frame = String(index);
      if (playing) {
        const next = (index + 1) % frames.length;
        const delay = manifest.value.fps
          ? 1000 / manifest.value.fps
          : Math.max(16, (frames[next].time - f.time) * 1000) || 100;
        timer = setTimeout(() => {
          index = next;
          show();
        }, delay);
      }
    };
    button.onclick = () => {
      playing = !playing;
      button.textContent = playing ? "Pause" : "Play";
      clearTimeout(timer);
      show();
    };
    host.append(root);
    show();
    return { ok: true, value: { dispose }, warnings: [] };
  } catch (e) {
    dispose();
    return {
      ok: false,
      error: { code: "RENDER_FAILED", path: "", message: String(e) },
    };
  }
}
