import { Context } from "@/context";
import { map_from_shapes, permIsEdit } from "./content";
import { Action } from "@/context/tool";
import { AsyncTransfer, GroupShape, Shape, ShapeType, ShapeView, adapt2Shape } from "@kcdesign/data";
import { PageXY } from "@/context/selection";
import { debounce } from "lodash";
import { WorkSpace } from "@/context/workspace";
import { compare_layer_3 } from "./group_ungroup";
import { get_symbolref_by_layer } from "./symbol";
import { UserConfig } from "@/context/user"

export function keyboardHandle(e: KeyboardEvent, context: Context) {
    if (!permIsEdit(context) || context.tool.isLable) {
        return;
    }
    const { target, shiftKey } = e;
    if (target instanceof HTMLInputElement) {
        return;
    }
    const shapes = context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }
    const step = shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0;
        dy = -step;
        transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0;
        dy = step;
        transform = true;
    }

    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape((shapes[i]));
            editor.translate(dx, dy);
        }
    }
}

export function d(s: { x: number, y: number }, e: { x: number, y: number }): number {
    const is2r = e.x - s.x;
    const is2b = e.y - s.y;
    let d = 0;
    if (is2r > 0) {
        d = d ^ 2;
    } else if (is2r < 0) {
        d = d ^ 1;
    }
    if (is2b > 0) {
        d = d ^ 8
    } else if (is2b < 0) {
        d = d ^ 4;
    }
    return d;
}

// export function getDelta(s: ShapeView, p: PageXY) {
//     const f2r = s.frame2Root();
//     return { dx: p.x - f2r.x, dy: p.y - f2r.y };
// }

export function get_speed(e1: MouseEvent, e2: MouseEvent) {
    return Math.hypot(Math.abs(e2.clientX - e1.clientX), Math.abs(e2.clientY - e1.clientY));
}

export function get_range(index1: { row: number, col: number }, index2: { row: number, col: number }) {
    const t1 = index1.row > index2.row;
    const t2 = index1.col > index2.col;
    return {
        rows: t1 ? index2.row : index1.row,
        rowe: t1 ? index1.row : index2.row,
        cols: t2 ? index2.col : index1.col,
        cole: t2 ? index1.col : index2.col,
    }
}

/**
 *          7
 *      6        8
 *  5       .        1
 *      4        2
 *          3
 */
export type ActionDirection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function get_direction(rotation: number) {
    if (rotation >= 0 && rotation < 22) return 0;
    else if (rotation >= 22 && rotation < 77) return 45;
    else if (rotation >= 77 && rotation < 113) return 90;
    else if (rotation >= 113 && rotation < 157) return 135;
    else if (rotation >= 157 && rotation < 200) return 180;
    else if (rotation >= 200 && rotation < 245) return 225;
    else if (rotation >= 245 && rotation < 293) return 270;
    else if (rotation >= 293 && rotation < 338) return 315;
    else if (rotation >= 338 && rotation <= 360) return 0;
    else return 0;
}

export function gen_offset_map(shape: ShapeView, down: PageXY) {
    const m = shape.matrix2Root()
    const f = shape.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);
    return {
        lt: { x: lt.x - down.x, y: lt.y - down.y },
        rb: { x: rb.x - down.x, y: rb.y - down.y },
        pivot: { x: pivot.x - down.x, y: pivot.y - down.y },
        rt: { x: rt.x - down.x, y: rt.y - down.y },
        lb: { x: lb.x - down.x, y: lb.y - down.y }
    }
}

export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: ShapeView[], shape: ShapeView) {
    if (!shapes.length) return;
    const p = shape.matrix2Root().computeCoord2(4, 4);
    const map = map_from_shapes(shapes);
    const targetParent = context.selection.getClosestContainer(p, map);
    if (targetParent.id === shape.id) return;
    const m = getCloesetContainer(context, shape).id !== targetParent.id;
    if (m && asyncTransfer) {
        asyncTransfer.migrate(adapt2Shape(targetParent) as GroupShape, compare_layer_3(shapes).map(s => adapt2Shape(s)), context.workspace.t('compos.dlt'));
    }
}

// 判断当前所处的wrap
function getCloesetContainer(context: Context, shape: ShapeView): ShapeView {
    let result = context.selection.selectedPage!
    let p = shape.parent;
    while (p) {
        if (p.type == ShapeType.Artboard) return p;
        p = p.parent;
    }
    return result
}

// 迁移
export const migrate = debounce(migrate_immediate, 100);

export function end_transalte(context: Context) {
    context.workspace.translating(false);
    context.workspace.setSelectionViewUpdater(true);
    context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    context.assist.reset();
    context.workspace.setCtrl('page');
    context.cursor.cursor_freeze(false);
}

export function check_status(context: Context) {
    context.menu.menuMount(); // 关闭可能已经打开的右键菜单
    const action = context.tool.action;
    return action === Action.AutoV || action === Action.AutoK;
}

/**
 * @description 整理选区，避免实例内部被控件修改
 * @param context
 * @param shapes
 * @returns
 */
export function modify_shapes(context: Context, shapes: ShapeView[]) {
    const shape_map = new Map<string, ShapeView>();
    let is_change = false;

    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        const symref = get_symbolref_by_layer(shape);
        if (symref) {
            shape_map.set(symref.id, symref);
            is_change = true;
        } else {
            shape_map.set(shape.id, shape);
        }
    }

    if (is_change) {
        context.selection.rangeSelectShape(Array.from(shape_map.values()));
    }

    return context.selection.selectedShapes;
}

export class DirectionCalc {
    static STEP = 1;
    static FASTER = 10;
    private m_up: boolean = false;
    private m_down: boolean = false;
    private m_left: boolean = false;
    private m_right: boolean = false;
    private m_faster: boolean = false;

    constructor() {

    }

    is_catfish(code: string) {
        return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code);
    }

    down(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                this.m_up = true;
                break;
            case 'ArrowDown':
                this.m_down = true;
                break;
            case 'ArrowLeft':
                this.m_left = true;
                break;
            case 'ArrowRight':
                this.m_right = true;
                break;
            default:
                break;
        }
        if (event.shiftKey) {
            this.m_faster = true;
        }
    }

    up(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                this.m_up = false;
                break;
            case 'ArrowDown':
                this.m_down = false;
                break;
            case 'ArrowLeft':
                this.m_left = false;
                break;
            case 'ArrowRight':
                this.m_right = false;
                break;
            case 'ShiftLeft':
                this.m_faster = false;
                break;
            case 'ShiftRight':
                this.m_faster = false;
                break;
            default:
                break;
        }

        return this.m_up || this.m_down || this.m_left || this.m_right;
    }

    reset() {
        this.m_up = false;
        this.m_down = false;
        this.m_left = false;
        this.m_right = false;
        this.m_faster = false;
    }

    calc() {
        let x = 0;
        let y = 0;

        const UserConfig: UserConfig = JSON.parse(localStorage.getItem('userConfig') as string)
        const step = this.m_faster ? (UserConfig?.fast || DirectionCalc.STEP * 10) : (UserConfig?.slow || DirectionCalc.STEP);

        if (this.m_up) {
            y -= step;
        }

        if (this.m_down) {
            y += step;
        }

        if (this.m_left) {
            x -= step;
        }

        if (this.m_right) {
            x += step;


        }

        return { x, y };
    }
}

export function is_symbol_class(shape: Shape | ShapeView) {
    return shape.isVirtualShape
        || [ShapeType.Symbol, ShapeType.SymbolRef, ShapeType.SymbolUnion].includes(shape.type)
        || (function (shape: Shape | ShapeView) {
            let p: Shape | ShapeView | undefined = shape;
            while (p) {
                if (ShapeType.Symbol === p.type) {
                    return true;
                }
                p = p.parent;
            }
            return false;
        }(shape));
}