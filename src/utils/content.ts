import { debounce } from "lodash";
import { Context } from "@/context";
import { ClientXY } from "@/context/selection";
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
export { Root, updateRoot }