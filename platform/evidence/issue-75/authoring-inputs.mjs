/** Public apply_batch operations for an opened fixtures/robot/native-project.zip.
 * Scope, expectedRevision and requestId must come from the active Session.
 * This fixture authors a stop; it is not an automatic stop controller. */
export function authoringOperations() {
  const channel = (boneId, property, values) => ({
    boneId,
    property,
    keys: values.map((value, i) => ({
      time: i / (values.length - 1 || 1),
      value,
      curve: { type: "linear" },
    })),
  });
  const walk = {
    id: "walk",
    name: "Đi bộ",
    duration: 1,
    loop: true,
    channels: [
      channel("body", "y", [310, 290, 310]),
      channel("root", "x", [0, 40, 0]),
    ],
  };
  const wave = {
    id: "wave",
    name: "Vẫy tay",
    duration: 1,
    loop: true,
    channels: [channel("upper-arm-right", "rotation", [0.2, 1.2, 0.2])],
  };
  const stop = {
    id: "stop",
    name: "Dừng đã dựng",
    duration: 1,
    loop: false,
    channels: [
      channel("body", "y", [290, 310, 310]),
      channel("root", "x", [40, 40, 40]),
    ],
  };
  return [
    { kind: "migrateProject", targetVersion: 1 },
    ...[walk, wave, stop].map((value) => ({ kind: "putAnimation", value })),
  ];
}
export function nativeComposition() {
  return {
    id: "native-motion",
    name: "Phối từ agent",
    duration: 2,
    loop: true,
    tracks: [
      {
        kind: "track",
        id: "base",
        order: 0,
        source: { kind: "live", animationId: "walk", offset: 0, speed: 1 },
        mask: [
          { boneId: "body", property: "y" },
          { boneId: "root", property: "x" },
        ],
        mode: "overwrite",
        alpha: 1,
        start: 0,
        fadeIn: 0,
        fadeOut: 0,
      },
      {
        kind: "track",
        id: "arm",
        order: 1,
        source: { kind: "live", animationId: "wave", offset: 0, speed: 1 },
        mask: [{ boneId: "upper-arm-right", property: "rotation" }],
        mode: "overwrite",
        alpha: 0.5,
        start: 0,
        fadeIn: 0,
        fadeOut: 0,
      },
    ],
  };
}
