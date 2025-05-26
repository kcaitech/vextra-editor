/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Matrix } from "@kcdesign/data";
// 标注相对位置
enum Direction {
    TL = 'Top-Left',
    T = 'Top',
    L = 'Left',
    TR = 'Top-Right',
    C = 'Center',
    R = 'Right',
    BL = 'Bottom-Left',
    B = 'Bottom',
    BR = 'Bottom-Right'
}

//边
enum Sides {
    Top = 'top',
    Left = 'left',
    Bottom = 'bottom',
    Right = 'right'
}

/**
 *  @description 一个图形相对于另一个图形的位置
 *  @param
 * */
export function get_graph_relative_posi(sp: { x: number, y: number }[], hp: { x: number, y: number }[]) {
    if (sp.length === 0 || hp.length === 0) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;

    const relativeDirection = {
        horizontal: Direction.C,
        vertical: Direction.C,
    };

    if (sb <= ht || (sb > ht && st < ht && sb < hb)) relativeDirection.vertical = Direction.B;
    if ((st > ht && sb < hb) || (st < ht && sb > hb)) relativeDirection.vertical = Direction.C;
    if (st >= hb || (sb > hb && st < hb && st > ht)) relativeDirection.vertical = Direction.T;
    if (sl >= hr || (sl > hl && sl < hr && sr > hr)) relativeDirection.horizontal = Direction.L;
    if ((sl > hl && sr < hr) || (sl < hl && sr > hr)) relativeDirection.horizontal = Direction.C;
    if (sr <= hl || (sl < hl && sr < hr && sr > hl)) relativeDirection.horizontal = Direction.R;

    let result
    if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.C) {
        result = Direction.C;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.C) {
        result = Direction.L;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.C) {
        result = Direction.R;
    } else if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.T) {
        result = Direction.T;
    } else if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.B) {
        result = Direction.B;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.T) {
        result = Direction.TL;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.T) {
        result = Direction.TR;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.B) {
        result = Direction.BR;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.B) {
        result = Direction.BL;
    }
    return result;
}

/**
 *  @description 获取选中图层边的中心点
 * */

function get_select_sides_midpoint(posi: { x: number, y: number }[]) {
    if (posi.length === 0) return;
    const xc = +((posi[0].x + posi[1].x) / 2).toFixed(4);
    const yc = +((posi[0].y + posi[2].y) / 2).toFixed(4);
    return { xc, yc };
}
/**
 *  @description 获取hover图形相对方向上最近的边的位置
 * */

function get_hovered_sides_dir(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sides: { s1: Sides, s2: Sides } = { s1: Sides.Bottom, s2: Sides.Left };
    if (dir === Direction.TR) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.TL) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    } else if (dir === Direction.BL) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    } else if (dir === Direction.BR) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.T) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
    } else if (dir === Direction.R) {
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.B) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
    } else if (dir === Direction.L) {
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    }
    return sides;
}
/**
 *  @description 获取实线的点,四角方向，两条线的情况
 * */
export function get_solid_line_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sides = [];

    if (dir === Direction.TR) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.TL) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht;
        sieds2.x1 = sl; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BL) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
        sieds2.x1 = sl; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BR) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.C) {
        let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
        let sieds4 = { x1: 0, y1: 0, x2: 0, y2: 0 };
        let hc = +((ht + hb) / 2).toFixed(4);
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = ht;
        sieds2.x1 = sr; sieds2.y1 = hr < sr ? hc : midpoint.yc; sieds2.x2 = hr; sieds2.y2 = hr < sr ? hc : midpoint.yc;
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb;
        sieds4.x1 = sl; sieds4.y1 = hl > sl ? hc : midpoint.yc; sieds4.x2 = hl; sieds4.y2 = hl > sl ? hc : midpoint.yc;
        sides = [sieds1, sieds2, sieds3, sieds4];
    } else {
        sides = get_solid_line_sieds_point(sp, hp, dir) as any[];
    }
    return sides;
}
/**
 *  @description 获取实线的点,垂直水平方向，三条线的情况
 * */
function get_solid_line_sieds_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    if (dir === Direction.T) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; //垂直线
        sieds1.y2 = st === hb ? ((midpoint.xc > hl && midpoint.xc < hr) ? hb : ht) : (s.s1 === Sides.Bottom ? hb : ht);
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = hr; sieds2.y2 = midpoint.yc;//右侧线
        sieds3.x1 = sl; sieds3.y1 = midpoint.yc; sieds3.x2 = hl; sieds3.y2 = midpoint.yc;//左侧线
    } else if (dir === Direction.R) {
        sieds1.x1 = sr; sieds1.y1 = midpoint.yc;//右侧线
        sieds1.x2 = sr === hl ? ((midpoint.yc > ht && midpoint.yc < hb) ? hl : hr) : (s.s2 === Sides.Left ? hl : hr); sieds1.y2 = midpoint.yc;
        sieds2.x1 = midpoint.xc; sieds2.y1 = st; sieds2.x2 = midpoint.xc; sieds2.y2 = ht;// 上
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb;// 下
    } else if (dir === Direction.B) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc;//下线
        sieds1.y2 = sb === ht ? ((midpoint.xc > hl && midpoint.xc < hr) ? ht : hb) : (s.s1 === Sides.Bottom ? hb : ht);
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = hr; sieds2.y2 = midpoint.yc;// 右线
        sieds3.x1 = sl; sieds3.y1 = midpoint.yc; sieds3.x2 = hl; sieds3.y2 = midpoint.yc;// 左线
    } else if (dir === Direction.L) {
        sieds1.x1 = sl; sieds1.y1 = midpoint.yc;//左线
        sieds1.x2 = sl === hr ? ((midpoint.yc > ht && midpoint.yc < hb) ? hr : hl) : (s.s2 === Sides.Left ? hl : hr); sieds1.y2 = midpoint.yc;
        sieds2.x1 = midpoint.xc; sieds2.y1 = st; sieds2.x2 = midpoint.xc; sieds2.y2 = ht; // 上线
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb; // 下线
    }
    return [sieds1, sieds2, sieds3];
}

/**
 *  @description 获取虚线的点,四角方向 dotted line
 * */
export function get_dotted_line_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    if (!s) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sides = [];
    if (dir === Direction.TR) {
        sieds1.x1 = hl; sieds1.y1 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht; sieds1.x2 = sl; sieds1.y2 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y1 = hb; sieds2.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y2 = sb;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.TL) {
        sieds1.x1 = hr; sieds1.y1 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht; sieds1.x2 = sr; sieds1.y2 = s.s1 === Sides.Bottom ? st === hb ? ht : hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y1 = hb; sieds2.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y2 = sb;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BL) {
        sieds1.x1 = hr; sieds1.y1 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht; sieds1.x2 = sr; sieds1.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y1 = ht; sieds2.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds2.y2 = st;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BR) {
        sieds1.x1 = hl; sieds1.y1 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht; sieds1.x2 = sl; sieds1.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y1 = ht; sieds2.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds2.y2 = st;
        sides = [sieds1, sieds2];
    } else {
        sides = get_dotted_line_sieds_point(sp, hp, dir) as any[];
    }
    return sides;
}
/**
 *  @description 获取虚线的点,垂直水平方向
 * */
function get_dotted_line_sieds_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sides: any[] = [];
    if (dir === Direction.T) {
        sieds1.x1 = hr; sieds1.y1 = hb; sieds1.x2 = hr; sieds1.y2 = sb;
        sieds2.x1 = hl; sieds2.y1 = hb; sieds2.x2 = hl; sieds2.y2 = sb;
        sides = [sieds1, sieds2];
        
        if (hl > midpoint.xc && hl !== midpoint.xc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = hl; sieds3.y1 = s.s1 === Sides.Bottom ? st === ht ? ht : hb : ht; sieds3.x2 = sl; sieds3.y2 = s.s1 === Sides.Bottom ? st === ht ? ht : hb : ht;
            sides.push(sieds3);
        }else if (hr < midpoint.xc && hr !== midpoint.xc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = hr; sieds3.y1 = s.s1 === Sides.Bottom ? st === ht ? ht : hb : ht; sieds3.x2 = sr; sieds3.y2 = s.s1 === Sides.Bottom ? st === ht ? ht : hb : ht;
            sides.push(sieds3);
        }
    } else if (dir === Direction.R) {
        sieds1.x1 = hl; sieds1.y1 = ht; sieds1.x2 = sl; sieds1.y2 = ht;
        sieds2.x1 = hl; sieds2.y1 = hb; sieds2.x2 = sl; sieds2.y2 = hb;
        sides = [sieds1, sieds2];
        if (ht > midpoint.yc && ht !== midpoint.yc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds3.y1 = ht; sieds3.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds3.y2 = st;
            sides.push(sieds3);
        }else if (hb < midpoint.yc && hb !== midpoint.yc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds3.y1 = hb; sieds3.x2 = s.s2 === Sides.Left ? sr === hl ? hr : hl : hr; sieds3.y2 = sb;
            sides.push(sieds3);
        }
    } else if (dir === Direction.B) {
        sieds1.x1 = hr; sieds1.y1 = ht; sieds1.x2 = hr; sieds1.y2 = st;
        sieds2.x1 = hl; sieds2.y1 = ht; sieds2.x2 = hl; sieds2.y2 = st;
        sides = [sieds1, sieds2];
        if (hl > midpoint.xc && hl !== midpoint.xc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = hl; sieds3.y1 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht; sieds3.x2 = sl; sieds3.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
            sides.push(sieds3);
        }else if (hr < midpoint.xc && hr !== midpoint.xc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = hr; sieds3.y1 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht; sieds3.x2 = sr; sieds3.y2 = s.s1 === Sides.Bottom ? hb : sb === ht ? hb : ht;
            sides.push(sieds3);
        }
    } else if (dir === Direction.L) {
        sieds1.x1 = hr; sieds1.y1 = ht; sieds1.x2 = sr; sieds1.y2 = ht;
        sieds2.x1 = hr; sieds2.y1 = hb; sieds2.x2 = sr; sieds2.y2 = hb;
        sides = [sieds1, sieds2];
        if (ht > midpoint.yc && ht !== midpoint.yc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds3.y1 = ht; sieds3.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds3.y2 = st;
            sides.push(sieds3);
        }else if (hb < midpoint.yc && hb !== midpoint.yc) {
            let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
            sieds3.x1 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds3.y1 = hb; sieds3.x2 = s.s2 === Sides.Left ? hl : sl === hr ? hl : hr; sieds3.y2 = sb;
            sides.push(sieds3);
        }
    }else if (dir === Direction.C) {
        if(ht > st || hb < sb) {
            if(hl >= midpoint.xc) {
                sieds1.x1 = hl; sieds1.y1 = ht; sieds1.x2 = ht === st ? hl : sl; sieds1.y2 = ht;
                sieds2.x1 = hl; sieds2.y1 = hb; sieds2.x2 = hb === sb ? hl : sl; sieds2.y2 = hb;
            }else if (hr <= midpoint.xc) {
                sieds1.x1 = hr; sieds1.y1 = ht; sieds1.x2 = ht === st ? hr : sr; sieds1.y2 = ht;
                sieds2.x1 = hr; sieds2.y1 = hb; sieds2.x2 = hb === sb ? hr : sr; sieds2.y2 = hb;
            }
            sides = [sieds1, sieds2];
        }
    }
    return sides;
}

/**
 * 
 *  @description 获取实线的中点
*/
export type LintPoint = {
    x1: number, y1: number, x2: number, y2: number
}
export type CenterPoint = {
    x: number,
    y: number,
    length: number,
    tran: { x: number, y: number }
}
export function get_solid_line_center_point(point: LintPoint[], context: Context) {
    let c_point: CenterPoint[] = [];
    for (let i = 0; i < point.length; i++) {
        const line_p = point[i];
        let length = solid_length(line_p, context)
        let x = (line_p.x1 + line_p.x2) / 2;
        let y = (line_p.y1 + line_p.y2) / 2;
        let tran = { x: 0, y: 0 }
        if (x === line_p.x1) {
            x = x + 5
            tran.y = 50
        }
        if (y === line_p.y1) {
            y = y + 5
            tran.x = 50
        }
        c_point.push({ x, y, length, tran });
    }
    return c_point;
}

function solid_length(p: LintPoint, context: Context) {
    const matrix = context.workspace.matrix;
    const inverse = new Matrix(matrix.inverse);
    const p1 = inverse.computeCoord2(p.x1, p.y1);
    const p2 = inverse.computeCoord2(p.x2, p.y2);
    if (p1.x === p2.x) {
        return Math.abs(p1.y - p2.y);
    } else {
        return Math.abs(p1.x - p2.x);
    }
}