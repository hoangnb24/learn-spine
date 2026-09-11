# Lifecycle amendment 2 — participant-owned browser tab

Recorded 2026-09-11, before robot-2 starts. Authorized by root Orchestrator following
independent reviewer acceptance. This supplements the first
[lifecycle amendment](lifecycle-amendment.md); it changes orchestration only.

IAB context is isolated per agent. A tab created in root's browser context cannot
be assumed accessible through a participant's connection. For each remaining run:

1. The participant retains the live IAB binding from restricted preflight and stays
   in the same active turn. Root provides only the fixed run URL and start procedure,
   not the creative brief or project contents.
2. The participant creates its own tab, navigates to the fixed URL and clicks
   **Bắt đầu lượt** in one Node call. It does not read DOM, project, schema or native
   tools before Start. The start control is the fixed harness control declared by
   this procedure; no scene investigation is permitted during this step.
3. The participant reports STARTED with its browser/session and tab mapping, then
   remains active. Root checks the collector's setup hash against locked input and
   verifies the raw start before delivering the unchanged common + assigned brief.
   All delay after the click, including root verification and delivery, counts
   toward the existing timer. No native discovery occurs before Start.
4. All work proceeds through the actual participant's native WebMCP connection.
   The participant clicks **Kết thúc lượt** while still active, before its final
   response. Root preserves the mapping in each run's controller record and checks
   raw stop receipt; a reported stop is never substituted for missing telemetry.

The earlier root-created robot-2 setup has not been started and is retained as
unused setup history. Audit separates that setup from the participant-created,
started session by recorded timestamps and browser/tab mapping. It is not an
extra scored attempt, a solution reset, or evidence of participant native access.
Robot-1 remains a counted FAIL_ENVIRONMENT with missing raw stop and no replacement.

Source remains frozen at `57eed3122782fe1c8b2d5eb536bc1e27a4ebc360`. Initial ZIPs,
model/effort, browser family, briefs, rubric, 900-second limit, 100-call limit and
failure accounting remain unchanged. No source or harness edit, HMR, proxy, hint,
file rescue or cross-agent tool invocation is introduced by this amendment.
