/** Run in the documented Browser host after art-input.zip is opened in Editor.
 * `tools` MUST be returned by tab.capabilities.get('webmcp').fetchTools().
 * onImage receives real native image content; review before accepting correction.
 * Never substitute in-page dispatch and call it native.
 */
export async function createRobot(tools, recipe, correctedWave, onImage) {
  const transcript = [];
  const call = async (name, input) => {
    const start = Date.now();
    const result = await tools.call(name, input);
    transcript.push({ name, input, durationMs: Date.now() - start, result });
    const parsed = JSON.parse(
      result.content.find((c) => c.type === "text").text,
    );
    if (!parsed.ok) throw Error(JSON.stringify(parsed));
    return { parsed, result };
  };
  const { parsed: caps } = await call("get_capabilities", {});
  if (
    caps.value.transport !== "webmcp-document" &&
    caps.value.transport !== "webmcp-navigator"
  )
    throw Error("Not native WebMCP");
  const identity = {
    sessionId: caps.value.sessionId,
    projectId: caps.value.projectId,
  };
  let revision = caps.value.revision;
  const edit = async (name, data) => {
    const r = await call(name, {
      ...identity,
      expectedRevision: revision,
      requestId: `gate1-${transcript.length}`,
      ...data,
    });
    revision = r.parsed.value.revision;
  };
  await call("list_assets", { ...identity, limit: 50 });
  await edit("create_bones", { bones: recipe.bones });
  await edit("attach_images", {
    attachments: recipe.attachments,
    slots: recipe.slots,
  });
  await edit("create_animation", { animation: recipe.idle });
  await edit("create_animation", { animation: recipe.wave });
  const viewport = {
    width: 640,
    height: 480,
    centerX: 0,
    centerY: 300,
    zoom: 0.6,
    devicePixelRatio: 1,
    background: "#253542",
  };
  const before = await call("render_pose", {
    ...identity,
    animationId: "wave",
    time: 1.6,
    viewport,
  });
  await onImage(
    "before",
    before.result.content.find((c) => c.type === "image"),
  );
  // Fixed brief: two wave excursions. Original draft has an extra oscillation.
  await edit("set_keyframes", { animation: correctedWave });
  const after = await call("render_pose", {
    ...identity,
    animationId: "wave",
    time: 2,
    viewport,
  });
  await onImage(
    "after",
    after.result.content.find((c) => c.type === "image"),
  );
  await call("save_project", identity);
  return { identity, revision, transcript };
}
