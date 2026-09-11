# Lifecycle amendment before robot-2

Recorded 2026-09-11. Authorized by root Orchestrator after independent reviewer
`review_issue21` assessment, before robot-2 starts. Applies to all remaining eight
runs. The original locked protocol and prompts at
`57eed3122782fe1c8b2d5eb536bc1e27a4ebc360` remain unchanged and available.

Robot-1 remains a counted **FAIL_ENVIRONMENT**, with no replacement. Its raw collector
has setup/start and no stop. Root-reported stop remains separate; no stop is backfilled.
No ZIP or solution is reconstructed. See [robot-1 audit](runs/robot-1/audit.json).

The issue exposed process/connection lifetime across turns rather than a reason to
change tasks or thresholds. The investigator's later check found no listener on
4210 or 4211; exact termination time is unknown. Fresh bootstrap after final-to-followup
also lost IAB access. These findings do not establish when either service stopped.

For remaining runs:

1. Root launches and keeps Vite port 4210 and collector port 4211 in its continuing
   orchestration turn. Check both listeners and fresh collector setup receipt before
   every start. The implementation agent does not own or restart these services.
2. Fresh subject performs the same restricted preflight, then sends READY to root
   with `send_message` and remains active waiting for its brief. It must not finish
   with `final` between preflight and timed work.
3. After a wait/message boundary, root requests a read-only `tabs.list()` metadata
   check using the existing binding. This confirms whether the IAB binding remains
   live; it does not inspect any target project, native schema or brief. Only after
   this check and service/setup readiness does root click start and deliver the
   unchanged common and assigned brief with the target tab ID.
4. Once timer starts, ordinary run timing, call accounting and failure rules remain
   in force. Connection trouble still counts; there is no hidden timer pause or
   fresh replacement attempt. Bootstrap/lifecycle overhead is recorded separately.

This changes orchestration lifetime only. No production or harness code, initial
ZIP, creative brief, rubric, call/time budget, model/effort or browser is changed.
No proxy, browser substitution, answer hint or file rescue is introduced. Keeping
an active binding is a recovery hypothesis until its preflight check actually passes;
this amendment itself does not claim that native access or Gate 3 has passed.
