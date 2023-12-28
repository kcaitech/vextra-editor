import { Matrix, PathShape, PathShapeView, RectShape, Shape, ShapeType, ShapeView, adapt2Shape } from "@kcdesign/data";
import { PositonAdjust, ConstrainerProportionsAction, FrameAdjust, RotateAdjust, FlipAction } from "@kcdesign/data";
import { getHorizontalAngle } from "@/utils/common"
import { Context } from "@/context";
import { is_equal } from "./assist";

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
    type: boolean | string,
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
    if (type_line !== result.type) result.type = 'mixed';
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
export function get_actions_constrainer_proportions(shapes: ShapeView[], value: boolean): ConstrainerProportionsAction[] {
  const actions: ConstrainerProportionsAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    actions.push({ target: adapt2Shape(shape), value })
  }
  return actions;
}
export function get_actions_frame_x(shapes: ShapeView[], value: number) {
  const actions: PositonAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame2Root();
    actions.push({ target: adapt2Shape(shape), transX: value - frame.x, transY: 0 });
  }
  return actions;
}
export function get_actions_frame_y(shapes: ShapeView[], value: number) {
  const actions: PositonAdjust[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const frame = shape.frame2Root();
    actions.push({ target: adapt2Shape(shape), transX: 0, transY: value - frame.y });
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
export function get_actions_flip_v(shapes: ShapeView[]) {
  const actions: FlipAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if (shape.type === ShapeType.Cutout) continue;
    actions.push({ target: adapt2Shape(shape), direction: 'vertical' });
  }
  return actions;
}
export function get_actions_flip_h(shapes: ShapeView[]) {
  const actions: FlipAction[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if (shape.type === ShapeType.Cutout) continue;
    actions.push({ target: adapt2Shape(shape), direction: 'horizontal' });
  }
  return actions;
}

export function get_rotation(shape: ShapeView) {
  let rotation: number = Number((shape.rotation || 0).toFixed(2));
  if (is_straight(shape)) {
    rotation = get_rotate_for_straight(shape as PathShapeView);
  }
  return rotation;
}
export function get_straight_line_length(shape: ShapeView) {
  const points = (shape as PathShapeView).points;

  const f = shape.frame, m = shape.matrix2Root();
  m.preScale(f.width, f.height);
  const p1 = points[0];
  const p2 = points[1];

  if (!p1 || !p2) {
    return 0;
  }

  const lt = m.computeCoord2(p1.x, p1.y);
  const rb = m.computeCoord2(p2.x, p2.y);
  return Math.hypot(rb.x - lt.x, rb.y - lt.y);
}
export function is_straight(shape: ShapeView) {
  if (!(shape instanceof PathShapeView)) {
    return false;
  }
  if (shape.type === ShapeType.Contact) {
    return false;
  }
  const points = shape.points;
  if (points.length !== 2) {
    return false;
  }
  return !points[0].hasFrom && !points[1].hasTo;
}
export function get_rotate_for_straight(shape: PathShapeView) {
  const points = shape.points;
  const p1 = points[0];
  const p2 = points[1];
  const m = new Matrix(shape.matrix2Parent());
  m.preScale(shape.frame.width, shape.frame.height);
  const lt = m.computeCoord2(p1.x, p1.y);
  const rb = m.computeCoord2(p2.x, p2.y);
  return Number(getHorizontalAngle(lt, rb).toFixed(2)) % 360;
}

export function get_indexes(shape: PathShape, type: 'rt' | 'lt' | 'rb' | 'lb' | 'all') {
  let result: number[] = [];
  if (type === 'all') {
    result = shape.points.map((_, index) => index);
  }
  switch (type) {
    case 'rt':
      result.push(1);
      break;
    case 'lt':
      result.push(0);
      break;
    case 'rb':
      result.push(2);
      break;
    case 'lb':
      result.push(3);
      break;
    default:
      break;
  }
  return result;
}
export function get_indexes2(type: 'rt' | 'lt' | 'rb' | 'lb') {
  let result: number[] = [];
  switch (type) {
    case 'rt':
      result.push(1);
      break;
    case 'lt':
      result.push(0);
      break;
    case 'rb':
      result.push(2);
      break;
    case 'lb':
      result.push(3);
      break;
    default:
      break;
  }
  return result;
}
export function is_rect(shape: ShapeView) {
  return (shape instanceof PathShape)
    && shape.isClosed
    && shape.points.length === 4
    && [ShapeType.Rectangle, ShapeType.Artboard, ShapeType.Image].includes(shape.type);
}

export function get_xy(shapes: ShapeView[], mixed: string) {
  const first_shape = shapes[0];

  const box = first_shape.boundingBox();

  let fx: number | string = box.x;
  let fy: number | string = box.y;

  for (let i = 1, l = shapes.length; i < l; i++) {
    const shape = shapes[i];
    const { x, y } = shape.boundingBox();
    if (typeof fx === 'number' && !is_equal(x, fx)) {
      fx = mixed;
    }
    if (typeof fy === 'number' && !is_equal(y, fy)) {
      fy = mixed;
    }

    if (fy === mixed && fx === mixed) {
      break;
    }
  }
  return { x: fx, y: fy };
}
export function get_width(shapes: ShapeView[], mixed: string) {
  const first_shape = shapes[0];
  const vs: any[] = [];

  let first_width: number | string = shapes[0].frame.width;

  if (is_straight(first_shape)) {
    first_width = get_straight_line_length(first_shape);
  }

  for (let i = 1, l = shapes.length; i < l; i++) {
    const shape = shapes[i];

    if (is_straight(shape)) {
      if (!is_equal(get_straight_line_length(shape), first_width)) {
        first_width = mixed;
        break;
      }

      continue;
    }
    if (shape.frame.width !== first_width) {
      first_width = mixed;
      break;
    }
  }
  return first_width;
}
export function get_height(shapes: ShapeView[], mixed: string) {
  const first_shape = shapes[0];

  let first_height: number | string = first_shape.frame.height;

  if (is_straight(first_shape)) {
    first_height = 0;
  }
  for (let i = 1, l = shapes.length; i < l; i++) {
    const shape = shapes[i];
    if (is_straight(shape)) {
      if (first_height !== 0) {
        first_height = mixed;
        break;
      }

      continue;
    }
    if (!is_equal(shape.frame.height, first_height)) {
      first_height = mixed;
      break;
    }
  }
  return first_height;
}

export function get_constrainer_proportions(shapes: ShapeView[]) {
  let constrainer_proportions = true;
  for (let i = 0, l = shapes.length; i < l; i++) {
    const s = shapes[i];

    if (!s.constrainerProportions) {
      constrainer_proportions = false;
      break;
    }
  }
  return constrainer_proportions;
}

export function get_shapes_rotation(shapes: ShapeView[], mixed: string) {
  const first_shape = shapes[0];
  let first_rotation: number | string = get_rotation(first_shape);

  for (let i = 1, l = shapes.length; i < l; i++) {
    if (!is_equal(get_rotation(shapes[i]), first_rotation)) {
      first_rotation = mixed;
      break;
    }
  }

  return first_rotation;
}