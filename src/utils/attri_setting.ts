import { Shape } from "@kcdesign/data";

export function is_mixed(shapes: Shape[]) {
  const frame0 = shapes[0].frame2Page();
  const frame = shapes[0].frame;
  const result: {
    x: number | string,
    y: number | string,
    w: number | string,
    h: number | string,
    rotate: number | string
  } = {
    x: frame0.x,
    y: frame0.y,
    w: frame.width,
    h: frame.height,
    rotate: shapes[0].rotation || 0
  }
  for (let i = 1; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame_i = shape.frame2Page();
    const frame = shape.frame;
    if (frame_i.x !== result.x) result.x = 'mixed';
    if (frame_i.y !== result.y) result.y = 'mixed';
    if (frame.width !== result.w) result.w = 'mixed';
    if (frame.height !== result.h) result.h = 'mixed';
    if (shape.rotation !== result.rotate) result.rotate = 'mixed';
    if (Object.values(result).every(v => v === 'mixed')) return result;
  }
  return result;
}