import { Context } from "@/context";
import { Matrix, ShapeType, ShapeView } from "@kcdesign/data";
import { Menu } from "@/context/menu";
import { ClientXY, PageXY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
// import { Comment } from "@/context/comment";
import { scout_once, XYsBounding } from "@/utils/common";
import { multi_select_shape } from "./listview";
import { is_straight } from "@/utils/attri_setting";

/**
 * @description 判断落点是否在content上
 */
export function is_mouse_on_content(e: MouseEvent): boolean {
    return Boolean((e.target as Element)?.closest(`#content`));
}

/**
 * @description 判断鼠标下落时，是否正进行文本编辑
 */
export function down_while_is_text_editing(e: MouseEvent, context: Context) {
    const selection = context.selection;
    const shapes = selection.selectedShapes;
    const textshape = selection.textshape;
    if (!textshape) return false;
    const len = textshape.text.length;
    if (textshape.text.getText(0, len).replaceAll('\n', '').length) {
        const save = shapes.slice(0, 1);
        selection.resetSelectShapes();
        selection.rangeSelectShape(save);
    } else {
        const editor = context.editor4Shape((shapes[0]));
        editor.delete();
        selection.resetSelectShapes();
    }
    return true;
}


/**
 * @description 动作落点是否在控件上
 */
export function is_ctrl_element(e: MouseEvent, context: Context) {
    const workspace = context.workspace;
    const selection = context.selection;
    const selected = selection.selectedShapes;
    if (selected.length === 1) {
        const shape = selected[0];
        const type = shape.type;
        if (type === ShapeType.Cutout) {
            return selection.scout.isPointInPath(workspace.ctrlPath, workspace.getContentXY(e));
        } else if ((type === ShapeType.Contact || is_straight(shape))) {
            return selection.scout.isPointInShape(shape, workspace.getRootXY(e));
        } else {
            return selection.scout.isPointInPath(workspace.ctrlPath, workspace.getContentXY(e));
        }
    } else {
        return selection.scout.isPointInPath(workspace.ctrlPath, workspace.getContentXY(e));
    }
}

/**
 * @description 固定光标、关闭已有菜单
 */
export function shutdown_menu(e: MouseEvent, context: Context) {
    context.menu.menuMount(); // 取消右键事件
    context.menu.notify(Menu.SHUTDOWN_POPOVER);
}

/**
 * @description 更新动作在client坐标系落点
 * @param root_p 除更新client坐标系上的落点之外还要更新动作在root坐标系上的落点，此参数必须和root坐标系matrix一起传递才起效果
 * @param martix root 坐标系
 */
export function modify_down_position(e: MouseEvent, context: Context, client_p: { x: number, y: number }, root_p?: {
    x: number,
    y: number
}, martix?: Matrix) {
    const root = context.workspace.root;
    client_p.x = e.clientX - root.x;
    client_p.y = e.clientY - root.y;

    if (root_p && martix) {
        const _p = martix.computeCoord3(client_p);
        root_p.x = _p.x;
        root_p.y = _p.y;
    }
}

/**
 * @description 给document对象挂载鼠标移动、抬起的监听
 */
export function add_move_and_up_for_document(move: (e: MouseEvent) => any, up: (e: MouseEvent) => any) {
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}

/**
 * @description 移除document对象上挂载的鼠标移动、抬起的监听
 */
export function remove_move_and_up_from_document(move: (e: MouseEvent) => any, up: (e: MouseEvent) => any) {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

/**
 * @description 给window对象挂载失焦监听
 */
export function add_blur_for_window(blur: () => any) {
    window.addEventListener('blur', blur);
}

/**
 * @description 移除window对象上的失焦监听
 */
export function remove_blur_from_window(blur: () => any) {
    window.removeEventListener('blur', blur);
}

/**
 * @description 更新鼠标在client坐标系上的位置
 */
export function modify_down_position_client(context: Context, e: MouseEvent, position: { x: number, y: number }) {
    const root = context.workspace.root;
    position.x = e.clientX - root.x;
    position.y = e.clientY - root.y;
}

/**
 * @description 获取鼠标在client坐标系上的当前位置
 */
export function get_current_position_client(context: Context, e: MouseEvent) {
    const root = context.workspace.root;
    return { x: e.clientX - root.x, y: e.clientY - root.y };
}

/**
 * @description 检查同一坐标系上的两个点之间的直线距离是否超过阈值dis。通常用于检查拖动动作判定
 * @param dis 默认4个单位
 */
export function check_drag_action(start: { x: number, y: number }, current: { x: number, y: number }, dis = 4) {
    return Math.hypot(current.x - start.x, current.y - start.y) > dis;
}

/**
 * @description 根据鼠标在client坐标系上的一点确定辅助对象的点图
 * @param down root坐标系上的一点
 */
export function gen_offset_points_map(shapes: ShapeView[], down: PageXY) {
    let lt: { x: number, y: number }, rb: { x: number, y: number }, pivot: { x: number, y: number },
        rt: { x: number, y: number }, lb: { x: number, y: number };
    if (shapes.length === 1) {
        const shape = shapes[0];
        const m = shape.matrix2Root();
        const f = shape.frame;

        lt = m.computeCoord2(0, 0);
        rb = m.computeCoord2(f.width, f.height);
        pivot = m.computeCoord2(f.width / 2, f.height / 2);
        rt = m.computeCoord2(f.width, 0);
        lb = m.computeCoord2(0, f.height);
    } else {
        const points: { x: number, y: number }[] = [];
        for (let i = 0, len = shapes.length; i < len; i++) {
            const s = shapes[i];
            const m = s.matrix2Root();
            const f = s.frame;
            const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, {
                x: 0,
                y: f.height
            }];

            for (let i = 0; i < 4; i++) {
                points.push(m.computeCoord3(ps[i]));
            }
        }
        const box = XYsBounding(points);
        lt = { x: box.left, y: box.top };
        rb = { x: box.right, y: box.bottom };
        pivot = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
        rt = { x: box.right, y: box.top };
        lb = { x: box.left, y: box.bottom };
    }
    return {
        lt: { x: lt.x - down.x, y: lt.y - down.y },
        rb: { x: rb.x - down.x, y: rb.y - down.y },
        pivot: { x: pivot.x - down.x, y: pivot.y - down.y },
        rt: { x: rt.x - down.x, y: rt.y - down.y },
        lb: { x: lb.x - down.x, y: lb.y - down.y }
    }
}

/**
 * @description 更新更新类型update_type更新鼠标在client坐标系上的落点
 */
export function modify_mouse_position_by_type(update_type: number, startPosition: ClientXY, mousePosition: ClientXY,) {
    if (update_type === 3) {
        startPosition.x = mousePosition.x;
        startPosition.y = mousePosition.y;
    } else if (update_type === 2) {
        startPosition.y = mousePosition.y;
    } else if (update_type === 1) {
        startPosition.x = mousePosition.x;
    }
}

/**
 * @description 获取当前图形的最近 父级容器
 */
export function get_closest_container(context: Context, shape: ShapeView): ShapeView {
    let result = context.selection.selectedPage!
    let p = shape.parent;
    while (p) {
        if (
            p.type === ShapeType.Artboard ||
            p.type === ShapeType.Symbol ||
            p.type === ShapeType.SymbolUnion
        ) {
            return p;
        }
        p = p.parent;
    }
    return result
}


/**
 * @description 结束图形拖动，开启控件更新机并立刻更新一次、重置辅助对象、控制权由控件转移到编辑器、解除光标固定
 */
export function end_transalte(context: Context) {
    context.workspace.translating(false);
    context.workspace.setSelectionViewUpdater(true);
    context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    context.assist.reset();
}

/**
 * @description 当移动图形上挂有评论时，需要更新评论位置信息
 */
export function update_comment(context: Context, need_update_comment: boolean) {
    return false;
}

/**
 * @description 动作抬起点在控件上时，在已选图形中选择图形
 * @p root坐标系上一点
 */
export function shapes_picker(e: MouseEvent, context: Context, p: { x: number, y: number }) {
    const selection = context.selection;
    const selected = selection.selectedShapes;
    const hoveredShape = selection.hoveredShape;

    if (hoveredShape) {
        if (e.shiftKey) {
            multi_select_shape(context, hoveredShape);
        } else {
            selection.selectShape(hoveredShape);
        }

        return;
    }

    if (selected.length > 1) {
        const shape = selection.getShapesByXY(p, e.metaKey || e.ctrlKey, selected);
        if (shape) {
            if (e.shiftKey) {
                const exist = selected.find(s => s.id === shape.id);
                if (exist) {
                    selection.unSelectShape(exist);
                    scout_once(context, e);
                }
            } else {
                selection.selectShape(shape);
            }
        } else {
            selection.resetSelectShapes();
        }
    }
}

/**
 * @description 是否摆脱辅助吸附
 */
export function is_rid_stick(context: Context, a: number, b: number) {
    return Math.abs(a - b) >= context.assist.stickness;
}

export function is_up_from_ctrl_element(e: MouseEvent) {
    return !!(e.target as Element)?.closest('[data-area="controller-element"]');
}