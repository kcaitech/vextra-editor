import { RectShape, Shape, ShapeType } from "@kcdesign/data";
import { PositonAdjust, ConstrainerProportionsAction, FrameAdjust, RotateAdjust, FlipAction } from "@kcdesign/data";
import { getHorizontalAngle } from "@/utils/common"

export function is_mixed(shapes: Shape[]) {
  const frame0 = shapes[0].frame2Root();
  const frame = shapes[0].frame;
  const result: {
    x: number | string,
    y: number | string,
    w: number | string,
    h: number | string,
    rotate: number | string,
    constrainerProportions: boolean | string,
    type:  boolean | string,
  } = {
    x: frame0.x,
    y: frame0.y,
    w: frame.width,
    h: frame.height,
    rotate: shapes[0].rotation || 0,
    constrainerProportions: Boolean(shapes[0].constrainerProportions),
    type: shapes[0].type === ShapeType.Line,
  }
  for (let i = 1; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame_i = shape.frame2Root();
    const frame = shape.frame;
    const type_line = shape.type === ShapeType.Line;
    if (frame_i.x !== result.x) result.x = 'mixed';
    if (frame_i.y !== result.y) result.y = 'mixed';
    if (frame.width !== result.w) result.w = 'mixed';
    if (frame.height !== result.h) result.h = 'mixed';
    if ((shape.rotation || 0) !== result.rotate) result.rotate = 'mixed';
    if (shape.constrainerProportions !== result.constrainerProportions) result.constrainerProportions = 'mixed';
    if(type_line !== result.type) result.type = 'mixed';
    if (Object.values(result).every(v => v === 'mixed')) return result;
  }
  if (result.rotate !== 'mixed') result.rotate = Number((result.rotate as number).toFixed(2));
  return result;
}
export function is_mixed_for_radius(shapes: Shape[], cor: boolean) {
  shapes = shapes.filter(i => i instanceof RectShape);
  if (shapes.length === 1) {
    const s = shapes[0];
    const rs = Object.values((s as RectShape).getRadius());
    if (cor) {
      if (rs.every(v => v === rs[0])) return rs;
      else return 'mixed'
    } else {
      return rs;
    }
  } else if (shapes.length > 1) {
    const res: any[] = Object.values((shapes[0] as RectShape).getRadius());
    for (let i = 1; i < shapes.length; i++) {
      const s = shapes[i];
      const rs = Object.values((s as RectShape).getRadius());
      if (cor) {
        if (!rs.every(v => v === rs[0])) return 'mixed';
      } else {
        for (let i = 0; i < rs.length; i++) {
          if (rs[i] !== res[i]) res[i] = 'mixed';
        }
        return res;
      }
    }
  }
}
export function get_actions_constrainer_proportions(shapes: Shape[], value: boolean): ConstrainerProportionsAction[] {
  const actions: ConstrainerProportionsAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    actions.push({ target: shape, value })
  }
  return actions;
}
export function get_actions_frame_x(shapes: Shape[], value: number) {
  const actions: PositonAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame2Root();
    actions.push({ target: shape, transX: value - frame.x, transY: 0 });
  }
  return actions;
}
export function get_actions_frame_y(shapes: Shape[], value: number) {
  const actions: PositonAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame2Root();
    actions.push({ target: shape, transX: 0, transY: value - frame.y });
  }
  return actions;
}
export function get_actions_frame_w(shapes: Shape[], value: number, isLock: boolean) {
  const actions: FrameAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame;
    let effect_value = 0;
    if (isLock) {
      const ratio = frame.width / frame.height;
      effect_value = (value / ratio) - frame.height;
    }
    actions.push({ target: shape, widthExtend: value - frame.width, heightExtend: effect_value });
  }
  return actions;
}
export function get_actions_frame_h(shapes: Shape[], value: number, isLock: boolean) {
  const actions: FrameAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame;
    let effect_value = 0;
    if (isLock) {
      const ratio = frame.width / frame.height;
      effect_value = (value * ratio) - frame.width;
    }
    actions.push({ target: shape, widthExtend: effect_value, heightExtend: value - frame.height });
  }
  return actions;
}
export function get_actions_rotate(shapes: Shape[], value: number) {
  const actions: RotateAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    actions.push({ target: shape, value: value });
  }
  return actions;
}
export function get_actions_flip_v(shapes: Shape[]) {
  const actions: FlipAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if(shape.type === ShapeType.Cutout) continue;
    actions.push({ target: shape, direction: 'vertical' });
  }
  return actions;
}
export function get_actions_flip_h(shapes: Shape[]) {
  const actions: FlipAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if(shape.type === ShapeType.Cutout) continue;
    actions.push({ target: shape, direction: 'horizontal' });
  }
  return actions;
}

export function get_rotation(shape: Shape) {
  let rotation: number = Number(shape.rotation?.toFixed(2)) || 0;
  if (shape.type === ShapeType.Line) {
    const m = shape.matrix2Parent();
    const lt = m.computeCoord(0, 0);
    const rb = m.computeCoord(shape.frame.width, shape.frame.height);
    rotation = Number(getHorizontalAngle(lt, rb).toFixed(2)) % 360;
  }
  return rotation;
}
export function get_straight_line_length(shape: Shape) {
  const f = shape.frame, m = shape.matrix2Root();
  const lt = m.computeCoord2(0, 0), rb = m.computeCoord2(f.width, f.height);
  return Math.hypot(rb.x - lt.x, rb.y - lt.y);
}