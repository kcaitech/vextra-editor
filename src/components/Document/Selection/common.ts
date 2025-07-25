/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ColVector3D } from "@kcaitech/vextra-core";

export function genRectPath(points: { x: number, y: number }[]): string {
    let path = ""
    for (let i = 0, len = points.length; (i + 3) < len; i = i + 4) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3];
        path += "M " + p0.x + " " + p0.y;
        path += "L " + p1.x + " " + p1.y;
        path += "L " + p2.x + " " + p2.y;
        path += "L " + p3.x + " " + p3.y;
        path += "Z"
    }
    return path;
}



export function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timerId: any = null;
    return function (...args: any[]) {
        if (!timerId) {
            timerId = setTimeout(() => {
                func();
                timerId = null;
            }, delay);
        }
    } as T;
}

export function cursorAngle(srcVector: ColVector3D, destVector: ColVector3D) { // 获取srcVector到的destVector夹角（-π ~ π）
    let angle = srcVector.angleTo(destVector); // srcVector与destVector的夹角（0 ~ π）
    if ((srcVector.cross(destVector) as ColVector3D).z < 0) angle = -angle; // 顺时针方向为负
    return angle
}