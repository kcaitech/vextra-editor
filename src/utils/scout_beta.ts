/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

// 方案暂时弃用
// import { PageXY } from "@/context/selection";
// import CanvasKitInit, { Path } from "@kcdesign/canvaskit-wasm";

// // 蜘蛛侦探🕷 ver.canvaskit-wasm，基于canvaskit-wasm实现的图形检索
// interface CanvasKitScout {
//     isPointInShape: (d: string, point: PageXY) => boolean;
// }
// async function loadCanvasKit() {
//     const init = await CanvasKitInit({
//         locateFile: (file: string) => `/${file}`
//     });
//     return init;
// }

// async function canvasKitScout(): Promise<CanvasKitScout> {
//     const init = await loadCanvasKit();

//     function isPointInShape(d: string, point: PageXY): boolean {
//         const path: Path | null = init.Path.MakeFromSVGString(d);
//         if (path) {
//             const { x, y } = point;
//             const isContains = path.contains(x, y);
//             path.delete();
//             return isContains;
//         } else {
//             return false;
//         }
//     }
//     return { isPointInShape };
// }

// export { canvasKitScout, CanvasKitScout }