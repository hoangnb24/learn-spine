# Run04 — observation pass, seek harness correction still required
Sourceb75e4f7, input command-authored ZIPs fromrun03/source75ac03a. All3 actual
bridge validate/measure/render_pose cases passed and their PNGs/timings are valid.
All3 seek rechecks failed at the first Editor readback: Editor displays time rounded
to2decimal places after its handler receives the precise input (e.g.0.7334 becomes
text0.73), while the actual drawn pose correctly retains0.7334. Reading the displayed
value after rerender therefore made a false oracle. The next harness reads native
input.value immediately after assigning it, before dispatching the real input/change
events, which captures browser sanitization without confusing presentation rounding.
No production change;20seeks and1e-5 retained. No new performance window completed.
