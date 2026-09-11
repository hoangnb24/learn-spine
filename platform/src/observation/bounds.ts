import type { Project } from "../model/types";
import type { Bounds } from "../render/geometry";
type I = [number, number];
const add = (a: I, b: I): I => [a[0] + b[0], a[1] + b[1]];
const mul = (a: I, b: I): I => {
  const p = [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];
  return [Math.min(...p), Math.max(...p)];
};
const trig = (r: I, cos = false): I => {
  const f = cos ? Math.cos : Math.sin;
  if (
    Math.max(Math.abs(r[0]), Math.abs(r[1])) > 1e12 ||
    r[1] - r[0] >= 2 * Math.PI
  )
    return [-1, 1];
  const v = [f(r[0]), f(r[1])];
  const offset = cos ? 0 : Math.PI / 2;
  for (
    let k = Math.ceil((r[0] - offset) / Math.PI);
    k <= (r[1] - offset) / Math.PI;
    k++
  )
    v.push(k % 2 === 0 ? 1 : -1);
  return [Math.min(...v), Math.max(...v)];
};
/** Conservative interval envelope: includes Bezier overshoot and continuous rotations,
 * even between output frames. Correlated channels may make this looser than a sampled fit. */
export function animationBounds(
  p: Project,
  animationId: string,
): Bounds | null {
  const animation = p.animations.find((a) => a.id === animationId)!;
  type M = [I, I, I, I, I, I];
  const worlds = new Map<string, M>();
  const range = (
    id: string,
    prop: "x" | "y" | "rotation" | "scaleX" | "scaleY",
    value: number,
  ): I => {
    const c = animation.channels.find(
      (c) => c.boneId === id && c.property === prop,
    );
    if (!c) return [value, value];
    const values = c.keys.map((k) => k.value);
    for (let i = 0; i < c.keys.length - 1; i++) {
      const k = c.keys[i],
        next = c.keys[i + 1];
      if (k.curve.type === "bezier")
        values.push(
          k.value + (next.value - k.value) * k.curve.y1,
          k.value + (next.value - k.value) * k.curve.y2,
        );
    }
    return [Math.min(...values), Math.max(...values)];
  };
  const remaining = [...p.bones];
  while (remaining.length) {
    const i = remaining.findIndex(
      (b) => b.parentId === null || worlds.has(b.parentId),
    );
    const bone = remaining.splice(i, 1)[0],
      t = bone.setup;
    const r = range(bone.id, "rotation", t.rotation),
      s = trig(r),
      c = trig(r, true),
      sx = range(bone.id, "scaleX", t.scaleX),
      sy = range(bone.id, "scaleY", t.scaleY);
    let m: M = [
      mul(c, sx),
      mul(s, sx),
      mul([-s[1], -s[0]], sy),
      mul(c, sy),
      range(bone.id, "x", t.x),
      range(bone.id, "y", t.y),
    ];
    const parent = bone.parentId && worlds.get(bone.parentId);
    if (parent) {
      const [a, b, c, d, x, y] = parent;
      const [e, f, g, h, u, v] = m;
      m = [
        add(mul(a, e), mul(c, f)),
        add(mul(b, e), mul(d, f)),
        add(mul(a, g), mul(c, h)),
        add(mul(b, g), mul(d, h)),
        add(add(mul(a, u), mul(c, v)), x),
        add(add(mul(b, u), mul(d, v)), y),
      ];
    }
    worlds.set(bone.id, m);
  }
  let bounds: Bounds | null = null;
  for (const slot of p.slots) {
    const region = p.attachments.find((r) => r.id === slot.attachmentId);
    if (!region) continue;
    const asset = p.assets.find((a) => a.id === region.assetId)!;
    const t = region.transform,
      c = Math.cos(t.rotation),
      s = Math.sin(t.rotation);
    const left =
      (asset.trimX * region.width) / asset.originalWidth - region.pivotX;
    const right =
      left + (asset.pixelWidth * region.width) / asset.originalWidth;
    const top =
      ((asset.originalHeight - asset.trimY) * region.height) /
        asset.originalHeight -
      region.pivotY;
    const bottom =
      top - (asset.pixelHeight * region.height) / asset.originalHeight;
    const [a, b, cw, d, x, y] = worlds.get(slot.boneId)!;
    for (const [u, v] of [
      [left, top],
      [right, top],
      [left, bottom],
      [right, bottom],
    ]) {
      const px = t.x + c * t.scaleX * u - s * t.scaleY * v,
        py = t.y + s * t.scaleX * u + c * t.scaleY * v;
      const wx = add(add(mul(a, [px, px]), mul(cw, [py, py])), x),
        wy = add(add(mul(b, [px, px]), mul(d, [py, py])), y);
      if (!bounds)
        bounds = { minX: wx[0], maxX: wx[1], minY: wy[0], maxY: wy[1] };
      else {
        bounds.minX = Math.min(bounds.minX, wx[0]);
        bounds.maxX = Math.max(bounds.maxX, wx[1]);
        bounds.minY = Math.min(bounds.minY, wy[0]);
        bounds.maxY = Math.max(bounds.maxY, wy[1]);
      }
    }
  }
  return bounds;
}
