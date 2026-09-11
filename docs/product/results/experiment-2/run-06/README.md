# Region corner seam coverage
Source8ca453a; unchanged IK ZIP run03/source75ac03a. One test passed.
Twelve region corners use canonical Pose.regions.world and public render.corners,
with the original diagnostic h/times and max(.5,5% sampled peak) velocity policy.
Positive fixture passes. Command-authored rotation-only negative control keeps all
bone origins fixed but deliberately fails all four foot corners. This control was
not exported to the deliverable ZIP. No fixture/threshold/performance change.
