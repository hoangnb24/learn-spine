/** Compile-only recipes for downstream modules before dependencies are merged. */
import type { Model, Commands, Evaluator, Renderer, Storage, Observation, Transport, Result, Project, Pose, ProjectBundle } from '../../../platform/src/model/types.js';
const pass = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
export function mocks(project: Project, pose: Pose, bundle: ProjectBundle) {
  const unsupported = <T>(): Result<T> => ({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY', path: '/', message: 'Contract mock; implementation pending' } });
  const model: Model = { validate: () => pass(structuredClone(project)), migrate: () => unsupported() };
  const commands: Commands = { inspect: () => structuredClone(project), apply: () => unsupported(), undo: () => unsupported(), redo: () => unsupported(), checkpoint: () => unsupported(), restore: () => unsupported() };
  const evaluator: Evaluator = { evaluate: () => pass(structuredClone(pose)) };
  const renderer: Renderer = { prepare: async () => pass(undefined), draw: () => pass(undefined), capture: async () => unsupported(), dispose: () => {} };
  const storage: Storage = { pack: async () => unsupported(), unpack: async () => pass(bundle), autosave: async () => pass({ revision: project.revision }), recover: async () => pass(bundle) };
  const observation: Observation = { renderPose: async () => unsupported(), submit: () => unsupported(), get: () => unsupported(), cancel: () => unsupported(), readArtifact: async () => unsupported() };
  const transport: Transport = { register: async () => unsupported(), dispose: () => {} };
  return { model, commands, evaluator, renderer, storage, observation, transport };
}
