import { ObservationService } from "../../src/observation";
import { WebMCPBridge, registerWebMCP } from "../../src/adapters/webmcp";
import { editorRuntime } from "./runtime";
type Download = { url: string; filename: string; revision: number };
let download: Download | null = null;
const listeners = new Set<() => void>();
const publish = (value: Download | null) => {
  download = value;
  for (const listener of listeners) listener();
};
export const getToolDownload = () => download;
export const subscribeToolDownload = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
/** Application lifetime: exactly the mounted editor's Session and Storage. */
export const editorObservation = new ObservationService();
export const editorBridge = new WebMCPBridge({
  getSession: () => editorRuntime.session,
  storage: editorRuntime.storage,
  observation: editorObservation,
  onDownload: publish,
});
let sessionId: number | null = null;
const unsubscribe = editorRuntime.subscribe(() => {
  editorBridge.refresh();
  const next = editorRuntime.session?.sessionId ?? null;
  if (next !== sessionId) {
    sessionId = next;
    publish(null);
  }
});
export const editorRegistration = registerWebMCP(editorBridge);
export async function disposeEditorTools() {
  unsubscribe();
  publish(null);
  const result = await editorRegistration;
  if (result.ok) await result.value.dispose();
  else editorBridge.dispose();
}
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) void disposeEditorTools();
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    void disposeEditorTools();
  });
