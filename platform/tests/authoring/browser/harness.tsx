import { createRoot } from "react-dom/client";
import { useSyncExternalStore, useState, useEffect } from "react";
import "../../../apps/shared/styles.css";
import "../../render/browser/mesh-harness";
import { Editor } from "../../../apps/editor/Editor";
import { editorRuntime as runtime } from "../../../apps/editor/runtime";
import {
  editorBridge as bridge,
  editorRegistration,
  subscribeToolDownload,
  getToolDownload,
} from "../../../apps/editor/webmcp";
import { evaluate } from "../../../src/engine";
import { ikRenderProject } from "../../render/mesh/fixture";
import type { ProjectBundle } from "../../../src/model";
const fixture = (
  window as unknown as {
    meshHarness: { bundle(kind: "scarf" | "jelly"): Promise<ProjectBundle> };
  }
).meshHarness;
const events: unknown[] = [];
bridge.services.onResult = (name, input, result) => {
  const copy = structuredClone(result);
  if (
    copy.ok &&
    copy.value &&
    typeof copy.value === "object" &&
    !Array.isArray(copy.value) &&
    copy.value.image
  ) {
    const image = copy.value.image as { data: string };
    copy.value.image = {
      mimeType: "image/png",
      base64Length: image.data.length,
    };
  }
  events.push({ name, input, result: copy });
};
async function load(kind: "scarf" | "jelly" | "ik") {
  const b = await fixture.bundle(kind === "jelly" ? "jelly" : "scarf");
  if (kind === "ik") b.project = ikRenderProject(b.project.assets[0]);
  b.project.projectId += `-${crypto.randomUUID()}`;
  return runtime.openBundle(b);
}
function App() {
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const download = useSyncExternalStore(subscribeToolDownload, getToolDownload);
  const [connection, setConnection] = useState("Connecting");
  useEffect(() => {
    void editorRegistration.then((r) =>
      setConnection(r.ok ? r.value.transport : r.error.message),
    );
  }, []);
  return (
    <>
      <div>
        <button onClick={() => void load("scarf")}>Nạp mẫu khăn</button>
        <button onClick={() => void load("jelly")}>Nạp mẫu thạch</button>
        <button onClick={() => void load("ik")}>Nạp mẫu IK</button>
        <span>{connection}</span>
        {download && (
          <a href={download.url} download={download.filename}>
            Tải bản tool {download.revision}
          </a>
        )}
      </div>
      <Editor runtime={runtime} agentStatus={connection} />
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
Object.assign(window, { issue19: { runtime, bridge, events, evaluate, load } });
declare global {
  interface Window {
    issue19: {
      runtime: typeof runtime;
      bridge: typeof bridge;
      events: unknown[];
      evaluate: typeof evaluate;
      load: typeof load;
    };
  }
}
