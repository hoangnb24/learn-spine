# Robot 1 — FAIL_ENVIRONMENT

This run counts as the first of three robot attempts. It has no replacement.
The controller started at 08:23:42 UTC and reported stopping at 08:28:01 UTC
(about 259 seconds). The raw collector currently contains setup and start only;
it does **not** contain a stop event. Controller timing is recorded separately.

The fresh subject `eval_robot_1` lost its IAB connection between preflight final
and follow-up brief. Bootstrap/list/troubleshooting found Chrome only. There were
zero product invocations in raw telemetry and zero discovery calls according to
the subject final relayed by root. No edits, output ZIP, media, reopen or transaction
scenario was completed. No manual project rescue occurred; native acceptance is
not met. Cost and tokens were not measured.

See [audit](audit.json), [controller record](controller.json), [raw events](events.jsonl)
and [independent connection investigation](connection-investigation.json).
`summary.json` is mechanically extracted and retains pending placeholders; audit.json
is the explicit run outcome and explains missing evidence. No source/brief/harness
was changed during this run.
