/** Normative v0 boundary types. No runtime/DOM/Spine imports. */
export type Id = string;
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface Transform { x: number; y: number; rotation: number; scaleX: number; scaleY: number }
export interface Asset {
  id: Id; name: string; path: string; mimeType: 'image/png'; sha256: string;
  pixelWidth: number; pixelHeight: number;
  originalWidth: number; originalHeight: number;
  /** Top-left pixel offset of trimmed image within original image. */
  trimX: number; trimY: number;
}
export interface Bone { id: Id; name: string; parentId: Id | null; setup: Transform }
export interface Region {
  id: Id; type: 'region'; assetId: Id; transform: Transform;
  /** Size of UNTRIMMED art in logical units; pivot from bottom-left. */
  width: number; height: number; pivotX: number; pivotY: number;
}
export interface Slot { id: Id; name: string; boneId: Id; attachmentId: Id | null }
export type Curve = { type: 'linear' } | { type: 'stepped' } |
  { type: 'bezier'; x1: number; y1: number; x2: number; y2: number };
export interface Keyframe { time: number; value: number; curve: Curve }
export interface Channel { boneId: Id; property: keyof Transform; keys: Keyframe[] }
export interface Animation { id: Id; name: string; duration: number; loop: boolean; channels: Channel[] }
export interface Project {
  formatVersion: 0; projectId: Id; revision: number; requiredCapabilities: ['region-v0'];
  metadata: { name: string; notes?: string };
  assets: Asset[]; bones: Bone[]; slots: Slot[]; attachments: Region[]; animations: Animation[];
}
export type ErrorCode = 'INVALID_INPUT' | 'MISSING_REFERENCE' | 'PARENT_CYCLE' |
  'UNSUPPORTED_VERSION' | 'UNSUPPORTED_CAPABILITY' | 'REVISION_CONFLICT' |
  'REQUEST_ID_REUSED' | 'NOTHING_TO_UNDO' | 'NOTHING_TO_REDO' | 'CHECKPOINT_NOT_FOUND' |
  'JOB_NOT_FOUND' | 'CANCELLED' | 'ASSET_HASH_MISMATCH' | 'ASSET_DECODE_FAILED' |
  'UNSAFE_PATH' | 'LIMIT_EXCEEDED' | 'STORAGE_FAILED' | 'RENDER_FAILED';
export interface Problem { code: ErrorCode; path: string; message: string; ids?: Id[] }
export type Result<T> = { ok: true; value: T; warnings: Problem[] } |
  { ok: false; error: Problem; revision?: number };
export type Operation =
  | { kind: 'putAsset'; value: Asset }
  | { kind: 'putBone'; value: Bone }
  | { kind: 'putSlot'; value: Slot }
  | { kind: 'putRegion'; value: Region }
  | { kind: 'putAnimation'; value: Animation }
  | { kind: 'remove'; collection: 'assets' | 'bones' | 'slots' | 'attachments' | 'animations'; id: Id }
  | { kind: 'setSlotOrder'; ids: Id[] };
export interface RevisionRequest { projectId: Id; expectedRevision: number; requestId: Id }
export interface Batch extends RevisionRequest { operations: Operation[] }
export interface Commit { projectId: Id; revision: number; changedIds: Id[] }
export interface Checkpoint { id: Id; projectId: Id; sourceRevision: number; label: string }
export interface Capabilities {
  formatVersions: number[]; features: string[];
  transport: 'webmcp-document' | 'webmcp-navigator' | 'bridge' | 'none';
  limits: { dedupRequests: number; undoBatches: number; checkpoints: number; jobs: number;
    packageBytes: number; assetBytes: number; maxImageDimension: number };
}
/** #6: validates without mutation; returns a defensive copy. */
export interface Model {
  validate(input: unknown): Result<Project>;
  migrate(input: unknown, targetVersion: 0): Result<Project>;
}
/** #7: single synchronous owner of active project and history. */
export interface Commands {
  inspect(): Project;
  apply(input: Batch): Result<Commit>;
  undo(input: RevisionRequest): Result<Commit>;
  redo(input: RevisionRequest): Result<Commit>;
  checkpoint(input: RevisionRequest & { label: string }): Result<Checkpoint>;
  restore(input: RevisionRequest & { checkpointId: Id }): Result<Commit>;
}
/** Column vector affine matrix: x'=a*x+c*y+tx, y'=b*x+d*y+ty. */
export type Matrix = readonly [a: number, b: number, c: number, d: number, tx: number, ty: number];
export interface PoseRequest { animationId: Id | null; time: number }
export interface DrawRegion { slotId: Id; attachmentId: Id; assetId: Id; world: Matrix }
export interface Pose {
  projectId: Id; revision: number; animationId: Id | null; sampledTime: number;
  bones: Record<Id, Matrix>; regions: DrawRegion[];
}
/** #8: pure, deterministic; no frame delta, DOM or renderer dependency. */
export interface Evaluator { evaluate(project: Project, request: PoseRequest): Result<Pose> }
/** Bytes remain outside JSON; keys are asset IDs. Treat byte buffers as immutable. */
export type AssetBytes = ReadonlyMap<Id, Uint8Array>;
export interface ProjectBundle { project: Project; assets: AssetBytes }
export interface Viewport { width: number; height: number; centerX: number; centerY: number; zoom: number; devicePixelRatio: number; background: string }
/** #9: renderer owns decoding/GPU resources; outputs copied PNG bytes. */
export interface Renderer {
  prepare(bundle: ProjectBundle, signal?: AbortSignal): Promise<Result<void>>;
  draw(pose: Pose, viewport: Viewport): Result<void>;
  capture(pose: Pose, viewport: Viewport, signal?: AbortSignal): Promise<Result<Uint8Array>>;
  dispose(): void;
}
/** #10: fully validate before handing an imported bundle to the editor. */
export interface Storage {
  pack(bundle: ProjectBundle, signal?: AbortSignal): Promise<Result<Uint8Array>>;
  unpack(bytes: Uint8Array, signal?: AbortSignal): Promise<Result<ProjectBundle>>;
  autosave(bundle: ProjectBundle, signal?: AbortSignal): Promise<Result<{ revision: number }>>;
  recover(projectId: Id, signal?: AbortSignal): Promise<Result<ProjectBundle | null>>;
}
export interface ObservationRequest extends PoseRequest { viewport: Viewport }
export type JobRequest =
  | { kind: 'sequence'; animationId: Id; times: number[]; viewport: Viewport }
  | { kind: 'preview'; animationId: Id; fps: number; loops: number; viewport: Viewport };
export interface Artifact { id: Id; mimeType: 'image/png' | 'application/zip'; byteLength: number; sha256: string }
export interface JobBase { id: Id; projectId: Id; revision: number; progress: number }
export type Job = JobBase & (
  | { status: 'queued' | 'running' }
  | { status: 'succeeded'; artifacts: Artifact[] }
  | { status: 'failed'; error: Problem }
  | { status: 'cancelled' }
);
/** #11: takes a snapshot at submission, never re-reads live editor state. */
export interface Observation {
  renderPose(bundle: ProjectBundle, input: ObservationRequest, signal?: AbortSignal): Promise<Result<{ revision: number; png: Uint8Array }>>;
  submit(bundle: ProjectBundle, input: JobRequest): Result<Job>;
  get(id: Id): Result<Job>;
  cancel(id: Id): Result<Job>;
  readArtifact(id: Id): Promise<Result<Uint8Array>>;
}
/** #13: validate unknown transport input before dispatch; never cast it to Batch. */
export interface ToolDefinition { name: string; description: string; inputSchema: Json; readOnly: boolean }
export interface Transport {
  register(tools: ToolDefinition[], dispatch: (name: string, input: unknown, signal?: AbortSignal) => Promise<Result<Json>>): Promise<Result<Capabilities>>;
  dispose(): void;
}

/** Ephemeral UI state, deliberately outside Project and player serialization. */
export interface EditorState {
  selection: { collection: 'bones' | 'slots' | 'attachments' | 'assets' | 'animations'; id: Id } | null;
  camera: { centerX: number; centerY: number; zoom: number };
  timeline: { animationId: Id | null; time: number; playing: boolean };
}
