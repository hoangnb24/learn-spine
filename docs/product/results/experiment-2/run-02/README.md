# Interrupted harness run
Source 56829eb. Invoked npm exec from repository root instead of documented
platform directory; relative evidence output escaped the intended repo directory.
Interrupted during first scarf performance window, moved all raw output here.
No performance/player result claimed. Next harness uses import-relative output
location, independent of invocation cwd. Earlier scarf measurements and actual
playback are retained; source data/thresholds unchanged.
