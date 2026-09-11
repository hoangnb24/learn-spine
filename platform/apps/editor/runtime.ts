import { createSession, prepareBundle, type Session } from "../../src/commands";
import { createStorage, validateBundle } from "../../src/storage";
import type {
  Operation,
  ProjectBundle,
  Result,
  Storage,
  Transform,
} from "../../src/model/types";

export const identity = (): Transform => ({
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
});
export const id = () => crypto.randomUUID();
const success = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
const cancelled = (): Result<never> => ({
  ok: false,
  error: {
    code: "CANCELLED",
    path: "",
    message: "Đã hủy tác vụ trước khi áp dụng.",
  },
});
export function explain(result: Result<unknown>): string {
  if (result.ok) return "";
  const messages: Partial<Record<typeof result.error.code, string>> = {
    INVALID_INPUT:
      `Dữ liệu chưa hợp lệ: ${result.error.message} (${result.error.path})`,
    REVISION_CONFLICT:
      "Project đã thay đổi. Đọc lại bản hiện tại trước khi thử lại.",
    STORAGE_FAILED:
      "Không lưu được trên trình duyệt. Thử lại hoặc tải gói project để giữ bản này.",
    CANCELLED: "Đã hủy tác vụ trước khi áp dụng.",
    ASSET_DECODE_FAILED: "Không đọc được ảnh PNG. Hãy chọn lại file.",
  };
  return (
    messages[result.error.code] ?? `Không hoàn tất: ${result.error.message}`
  );
}

/** One session owner per mounted editor; adapters receive this same object. */
export class EditorRuntime {
  private activeSession: Session | null = null;
  get session(): Session | null {
    return this.activeSession;
  }
  private opening = false;
  error = "";
  notice = "";
  busy = "";
  savedRevision: number | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  private unsubscribe?: () => void;
  private operation?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private disposed = false;
  constructor(readonly storage: Storage = createStorage()) {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        /* A view observer cannot interrupt a committed command. */
      }
    }
  }
  report(result: Result<unknown>) {
    this.error = explain(result);
    this.emit();
    return result.ok;
  }
  request() {
    const p = this.session!.inspect();
    return {
      projectId: p.projectId,
      expectedRevision: p.revision,
      requestId: id(),
    };
  }
  apply(
    operations: Operation[],
    expectedRevision = this.session?.inspect().revision,
    sessionId = this.session?.sessionId,
  ) {
    if (!this.session) return false;
    if (sessionId !== this.session.sessionId)
      return this.report({
        ok: false,
        error: {
          code: "REVISION_CONFLICT",
          path: "",
          message: "Phiên project đã đổi.",
        },
      });
    return this.report(
      this.session.apply({ ...this.request(), expectedRevision, operations }),
    );
  }
  private changed() {
    this.emit();
    this.scheduleSave();
  }
  private scheduleSave() {
    clearTimeout(this.timer);
    if (this.session && this.savedRevision !== this.session.inspect().revision)
      this.timer = setTimeout(() => {
        if (this.busy) this.scheduleSave();
        else void this.save(false);
      }, 600);
  }
  private begin(label: string, clearError = true) {
    this.operation?.abort();
    const controller = new AbortController();
    this.operation = controller;
    this.busy = label;
    if (clearError) this.error = "";
    this.emit();
    return controller;
  }
  private current(controller: AbortController, sessionId?: number) {
    return (
      !this.disposed &&
      this.operation === controller &&
      !controller.signal.aborted &&
      (sessionId === undefined || this.session?.sessionId === sessionId)
    );
  }
  private finish(
    controller: AbortController,
    result: Result<unknown>,
    preserveError = false,
  ) {
    if (this.operation !== controller || this.disposed) return;
    this.busy = "";
    this.operation = undefined;
    if (preserveError && result.ok) this.emit();
    else this.report(result);
  }
  cancel() {
    this.operation?.abort();
    this.operation = undefined;
    this.busy = "";
    this.notice =
      "Đã dừng tác vụ đang chờ. Thay đổi đã áp dụng vẫn được giữ; dùng Hoàn tác nếu cần.";
    this.emit();
  }
  async openBundle(
    bundle: ProjectBundle,
    recovered = false,
  ): Promise<Result<void>> {
    const controller = this.begin("Đang mở project");
    const prepared = await prepareBundle(bundle, (input) =>
      validateBundle(input, controller.signal),
    );
    if (!this.current(controller)) return cancelled();
    if (!prepared.ok) {
      this.finish(controller, prepared);
      return prepared;
    }
    let result: Result<unknown>;
    if (this.session) {
      this.opening = true;
      try {
        result = this.session.open(prepared.value);
      } finally {
        this.opening = false;
      }
    } else {
      const created = createSession(prepared.value);
      result = created;
      if (created.ok) {
        this.activeSession = created.value;
        this.unsubscribe = created.value.subscribe((event) => {
          if (event.kind === "open") {
            this.savedRevision = null;
            if (!this.opening) {
              this.operation?.abort();
              this.operation = undefined;
              this.busy = "";
              this.error = "";
              this.notice = "Đã mở phiên project mới.";
            }
          }
          this.changed();
        });
      }
    }
    if (!result.ok) {
      this.finish(controller, result);
      return result;
    }
    this.savedRevision = recovered ? this.session!.inspect().revision : null;
    this.notice = recovered
      ? "Đã khôi phục bản lưu trên trình duyệt."
      : "Đã mở project.";
    this.finish(controller, success(undefined));
    this.changed();
    return success(undefined);
  }
  async newProject(name = "Project mới") {
    return this.openBundle({
      project: {
        formatVersion: 1,
        projectId: id(),
        revision: 0,
        requiredCapabilities: ["region-v0"],
        metadata: { name },
        assets: [],
        bones: [{ id: "root", name: "Gốc", parentId: null, setup: identity() }],
        slots: [],
        attachments: [],
        animations: [],
      },
      assets: new Map(),
    });
  }
  async openFile(file: File) {
    const controller = this.begin("Đang đọc gói project");
    try {
      if (file.size > 201 * 1024 * 1024) {
        this.finish(controller, {
          ok: false,
          error: {
            code: "LIMIT_EXCEEDED",
            path: "",
            message: "Gói vượt giới hạn 201 MiB.",
          },
        });
        return;
      }
      const result = await this.storage.unpack(
        new Uint8Array(await file.arrayBuffer()),
        controller.signal,
      );
      if (!this.current(controller)) return;
      if (!result.ok) {
        this.finish(controller, result);
        return;
      }
      await this.openBundle(result.value);
    } catch {
      if (this.current(controller))
        this.finish(controller, {
          ok: false,
          error: {
            code: "INVALID_INPUT",
            path: "",
            message: "Không đọc được file.",
          },
        });
    }
  }
  async recover() {
    let projectId: string | null = null;
    try {
      projectId = localStorage.getItem("learn-spine.last-project");
    } catch {
      /* Explicit recovery reports unavailable below. */
    }
    if (!projectId) {
      this.notice = "Chưa có bản lưu trên trình duyệt.";
      this.emit();
      return;
    }
    const controller = this.begin("Đang khôi phục");
    const result = await this.storage.recover(projectId, controller.signal);
    if (!this.current(controller)) return;
    if (!result.ok) {
      this.finish(controller, result);
      return;
    }
    if (result.value) await this.openBundle(result.value, true);
    else {
      this.notice = "Không tìm thấy bản lưu.";
      this.finish(controller, success(undefined));
    }
  }
  async importPng(files: File[], boneId: string) {
    if (!this.session || !files.length) return;
    const sessionId = this.session.sessionId,
      snapshot = this.session.snapshot(),
      request = this.request();
    const controller = this.begin("Đang nạp ảnh PNG");
    try {
      const operations: Operation[] = [],
        assets = new Map(snapshot.assets);
      if (snapshot.project.assets.length + files.length > 256)
        throw new Error("Quá nhiều ảnh.");
      for (const file of files) {
        if (file.size > 20 * 1024 * 1024)
          throw new Error("Ảnh vượt giới hạn 20 MiB.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!this.current(controller, sessionId)) return;
        // Header dimensions are only metadata. prepareBundle below performs the trusted real PNG decode.
        if (bytes.length < 24) throw new Error("PNG thiếu header.");
        const header = new DataView(
          bytes.buffer,
          bytes.byteOffset,
          bytes.byteLength,
        );
        const width = header.getUint32(16),
          height = header.getUint32(20);
        const assetId = id(),
          regionId = id(),
          slotId = id();
        const sha256 = [
          ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        ]
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("");
        const asset = {
          id: assetId,
          name: file.name,
          path: `assets/${assetId}.png`,
          mimeType: "image/png" as const,
          sha256,
          pixelWidth: width,
          pixelHeight: height,
          originalWidth: width,
          originalHeight: height,
          trimX: 0,
          trimY: 0,
        };
        const region = {
          id: regionId,
          type: "region" as const,
          assetId,
          transform: identity(),
          width,
          height,
          pivotX: width / 2,
          pivotY: height / 2,
        };
        const slot = {
          id: slotId,
          name: file.name,
          boneId,
          attachmentId: regionId,
        };
        snapshot.project.assets.push(asset);
        snapshot.project.attachments.push(region);
        snapshot.project.slots.push(slot);
        assets.set(assetId, bytes);
        operations.push(
          { kind: "putAsset", value: asset },
          { kind: "putRegion", value: region },
          { kind: "putSlot", value: slot },
        );
      }
      const prepared = await prepareBundle(
        { project: snapshot.project, assets },
        (input) => validateBundle(input, controller.signal),
      );
      if (!this.current(controller, sessionId)) return;
      if (!prepared.ok) {
        this.finish(controller, prepared);
        return;
      }
      this.finish(
        controller,
        this.session.apply({ ...request, operations }, prepared.value),
      );
    } catch {
      if (this.current(controller, sessionId))
        this.finish(controller, {
          ok: false,
          error: {
            code: "ASSET_DECODE_FAILED",
            path: "",
            message: "Không đọc được PNG.",
          },
        });
    }
  }
  async save(explicit = true) {
    if (!this.session || (!explicit && this.busy)) return;
    const snapshot = this.session.snapshot(),
      sessionId = this.session.sessionId;
    if (this.savedRevision === snapshot.project.revision) {
      if (explicit) {
        this.notice = "Bản hiện tại đã được lưu.";
        this.emit();
      }
      return;
    }
    const controller = this.begin("Đang lưu trên trình duyệt", explicit);
    let result = await this.storage.autosave(snapshot, controller.signal);
    if (!this.current(controller, sessionId)) return;
    if (!result.ok && result.error.code === "REVISION_CONFLICT") {
      // Reopening an exported copy can match the already committed browser record.
      // Only a fully validated identical record earns saved status; never overwrite a conflict.
      const stored = await this.storage.recover(
        snapshot.project.projectId,
        controller.signal,
      );
      if (!this.current(controller, sessionId)) return;
      if (
        stored.ok &&
        stored.value &&
        JSON.stringify(stored.value.project) ===
          JSON.stringify(snapshot.project)
      ) {
        result = success({ revision: snapshot.project.revision });
      }
    }
    if (result.ok) {
      this.savedRevision = result.value.revision;
      try {
        localStorage.setItem(
          "learn-spine.last-project",
          snapshot.project.projectId,
        );
      } catch {
        /* Bundle remains in IndexedDB; export is still available. */
      }
      this.notice = `Đã lưu bản ${result.value.revision} trên trình duyệt.`;
    }
    this.finish(controller, result, !explicit);
    if (result.ok && this.session.inspect().revision !== this.savedRevision)
      this.changed();
  }
  async exportFile() {
    if (!this.session) return;
    const snapshot = this.session.snapshot(),
      sessionId = this.session.sessionId,
      controller = this.begin("Đang đóng gói");
    const result = await this.storage.pack(snapshot, controller.signal);
    if (!this.current(controller, sessionId)) return;
    if (result.ok) {
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(result.value)], { type: "application/zip" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${snapshot.project.metadata.name.replace(/[^\p{L}\p{N}_.-]/gu, "-")}.zip`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.notice = `Đã tải gói bản ${snapshot.project.revision}.`;
    }
    this.finish(controller, result);
  }
  dispose() {
    this.disposed = true;
    this.operation?.abort();
    clearTimeout(this.timer);
    this.unsubscribe?.();
    this.listeners.clear();
  }
}
export const editorRuntime = new EditorRuntime();
