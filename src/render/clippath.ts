import { Shape } from "@/data/data/shape";
// import { EL, h } from "./basic";

// let g_clippath_id = 0; // 要用稳定的id，避免不必要的dom更新
/**
 * return a clipPath el
 * @param shape 
 */
export function render(h: Function, shape: Shape, id: string, path?: string): any {
    return h("clipPath", {id}, [h("path", {d: path || shape.getPath(true)})]);
}