/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { ClientXY, PageXY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { Matrix } from "@kcdesign/data";
export enum EffectType {
    NEW_SHAPE = 'new shape',
    TRANS = 'trans'
}

export interface MoveEffect {
    type: EffectType,
    effect: Function
}
interface Wheel {
    remove: () => undefined
    moving: (event: MouseEvent, effects?: MoveEffect) => boolean;
    is_inner: (event: MouseEvent) => boolean;
}
interface Area {
    top: number
    right: number
    bottom: number
    left: number
}
interface Effects {
    before?: (context: Context) => void;
    rolling?: (context: Context, dx: number, dy: number, setupPint?: PageXY, curPoint?: PageXY) => void;
    tail?: (context: Context) => void;
}
// return一个轮子，在该滚动的时候滚动(目前指鼠标脱离innerArea时)，滚动时可以根据传入的effects干一些调用处想要处理的的事情...
function fourWayWheel(context: Context, effects?: Effects, setupPoint?: PageXY): Wheel {
    const workspace = context.workspace;
    const innerArea: Area = { top: 0, right: 0, bottom: 0, left: 0 };

    let op = 'inner'; // 原先所处的区域
    let np = 'inner'; // 现在所处的区域

    let timer: any = null;

    const period: number = 20; // 帧率 = 1000 / period; (这里的帧率指fireNotify调用的频率)

    const step: number = 5; // 每秒滚动的距离为 (1000 / period) * step * 单位

    const startPoint: PageXY = { x: 0, y: 0 }; // 安装轮子的位置（坐标系：Page）
    let curPoint: PageXY = { x: 0, y: 0 }; // 鼠标当前的位置（坐标系：Page）

    function setup() {
        // 根据contentView的Dom bounding生成一个内圈区域（这个内圈区域有一个宽度为padding的内圈缩减），在这内圈区域内，不会触发page滚动;
        const { x, y, bottom, right } = workspace.root
        const padding = 5;

        innerArea.top = y + padding;
        innerArea.right = right - padding;
        innerArea.bottom = bottom - padding;
        innerArea.left = x + padding;

        if (setupPoint) {
            startPoint.x = setupPoint.x, startPoint.y = setupPoint.y;
        }

        effects?.before && effects.before(context);
        // console.log('-wheel setup-');
    }
    function modify_np(event: MouseEvent) {
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = innerArea;
        let hp: string = ''; // 水平方位
        let vp: string = ''; // 垂直方位

        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
            np = 'inner';
            return false;
        }

        if (clientX <= left) {
            hp = 'left';
        } else if (clientX >= right) {
            hp = 'right';
        }
        if (clientY <= top) {
            vp = 'top';
        } else if (clientY >= bottom) {
            vp = 'bottom';
        }

        np = `${hp}-${vp}`;

        return true;
    }

    function is_inner(event: MouseEvent) {
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = innerArea;

        return (clientX > left && clientX < right && clientY > top && clientY < bottom);
    }

    function moving(event: MouseEvent, m_effects?: MoveEffect): boolean { // 鼠标移动触发
        let isOut: boolean = modify_np(event);

        const { clientX, clientY } = event;

        const { x: wx, y: wy } = workspace.root;

        const inverse_wm = new Matrix(workspace.matrix.inverse);

        curPoint = inverse_wm.computeCoord2(clientX - wx, clientY - wy);

        if (np !== op) {
            clearInterval(timer);
            timer = null;

            if (np !== 'inner') {
                const { dx, dy } = getTxybyNp(np, step);

                const scale = context.workspace.matrix.toArray()[0];

                timer = setInterval(() => {
                    workspace.matrix.trans(dx * scale, dy * scale);
                    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);

                    curPoint = inverse_wm.computeCoord2(clientX - wx, clientY - wy);

                    if (m_effects) {
                        const { type, effect: f } = m_effects;

                        if (type === EffectType.NEW_SHAPE) {
                            f(curPoint);
                        } else if (type === EffectType.TRANS) {
                            f(-dx, -dy);
                        }
                    } else if (effects?.rolling) {
                        effects.rolling(context, dx, dy, startPoint, curPoint);
                    }
                }, period)
            } else {
                workspace.notify(WorkSpace.NEW_ENV_MATRIX_CHANGE, event);
            }
            // console.log('所处区域发生变化了', `${op} -> ${np}`);
            op = np;
        }
        return isOut;
    }

    function remove() {
        clearInterval(timer);
        timer = null;
        effects?.tail && effects.tail(context);
        return undefined;
    }
    setup();
    return { remove, moving, is_inner }
}

function getTxybyNp(np: string, step: number): { dx: number, dy: number } {
    let dx = 0, dy = 0;
    if (np.includes('right')) {
        dx = -step;
    } else if (np.includes('left')) {
        dx = step;
    }
    if (np.includes('bottom')) {
        dy = -step;
    } else if (np.includes('top')) {
        dy = step;
    }
    return { dx, dy };
}
function isDrag(n: ClientXY, o: ClientXY, threshold: number = 3) {
    const dx = n.x - o.x;
    const dy = n.y - o.y;
    const diff = Math.hypot(dx, dy);
    return diff > threshold;
}
export { Wheel, fourWayWheel, isDrag }