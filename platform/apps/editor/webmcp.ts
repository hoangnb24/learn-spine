import { ObservationService } from '../../src/observation';
import { WebMCPBridge, registerWebMCP } from '../../src/adapters/webmcp';
import { editorRuntime } from './runtime';

/** Application lifetime: the bridge reads exactly the mounted editor's Session. */
export const editorObservation = new ObservationService();
export const editorBridge = new WebMCPBridge({
  getSession: () => editorRuntime.session,
  storage: editorRuntime.storage,
  observation: editorObservation,
});
const unsubscribe = editorRuntime.subscribe(() => editorBridge.refresh());
export const editorRegistration = registerWebMCP(editorBridge);
export async function disposeEditorTools() {
  unsubscribe();
  const result = await editorRegistration;
  if (result.ok) await result.value.dispose();
  else editorBridge.dispose();
}
window.addEventListener('pagehide', () => { void disposeEditorTools(); }, { once: true });
if (import.meta.hot) import.meta.hot.dispose(() => { void disposeEditorTools(); });
