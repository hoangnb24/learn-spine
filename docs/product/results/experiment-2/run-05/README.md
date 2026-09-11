# Successful seek/playback recheck
Source7155c1a, unchanged command-authored ZIPs fromrun03/source75ac03a.
Three tests passed:20 shuffled seeks + explicit near-duration boundary in both
Editor and isolated Player; reference poses are recorded forward/initial successful
draws. Browser-accepted input is captured before dispatch, before Editor display
rounding. No sample omitted; tolerance1e-5. Only missing jelly Player performance
was measured. Other valid windows and PNGs were not repeated.
