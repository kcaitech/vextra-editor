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
export { Root, updateRoot, getName }