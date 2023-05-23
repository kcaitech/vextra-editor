import { debounce } from "lodash";
import { Context } from "@/context";
import { ClientXY } from "@/context/selection";
import { Shape, ShapeType } from "@kcdesign/data";
interface Root {
  init: boolean
  x: number
  y: number
  bottom: number
  right: number
  element: any
  center: ClientXY
}
const updateRootTime = 600;
function _updateRoot(context: Context, element: HTMLElement) {
  const { x, y, right, bottom } = element.getBoundingClientRect();
  const root: Root = {
    init: true, x, y, right, bottom, element,
    center: { x: (right - x) / 2, y: (bottom - y) / 2 }
  }
  context.workspace.updateRoot(root);
}
const updateRoot = debounce(_updateRoot, updateRootTime);

// 根据类型给图形命名
function getName(type: ShapeType, brothers: Shape[], t: Function): string {
  const name = t(`shape.${type}`);
  const renamebrothers = brothers.filter((item: Shape) => item.type === type);
  const repeats: number = renamebrothers.length;
  return (repeats && brothers[0]) ? `${name} ${repeats + 1}` : name;
}
// 判断图形是否在可视区域内
function isInner(context: Context, shape: Shape) {
  const pMatrix = context.workspace.matrix;
  const { x: rx, y: ry, bottom, right } = context.workspace.root;
  const s2pMatirx = shape.matrix2Page();
  const { width, height } = shape.frame;
  let point = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height]
  ]
  point = point.map(p => {
    const _s = s2pMatirx.computeCoord(p[0], p[1])
    const _p = pMatrix.computeCoord(_s.x, _s.y);
    return [_p.x, _p.y];
  })
  const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
  const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
  const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
  const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);

  if ((l + rx) > right - 20 || r < 0 + 20) {
    return false;
  } else if (b < 0 + 20 || (t + ry) > bottom - 20) {
    return false
  } else {
    return true;
  }
}
export { Root, updateRoot, getName, isInner }