import {Context} from "@/context";
import {permIsEdit} from "@/utils/content";
import {Action} from "@/context/tool";
import {Matrix, Shape, ShapeType} from "@kcdesign/data";
import {Menu} from "@/context/menu";

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
        const editor = context.editor4Shape(shapes[0]);
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
    const root = workspace.root;
    const selection = context.selection;
    const selected = selection.selectedShapes;
    if (selected.length === 1 && selected[0].type === ShapeType.Line) {
        return selection.scout.isPointInStroke(workspace.ctrlPath, {
            x: e.clientX - root.x,
            y: e.clientY - root.y
        })
    } else {
        return selection.scout.isPointInPath(workspace.ctrlPath, {
            x: e.clientX - root.x,
            y: e.clientY - root.y
        });
    }
}

/**
 * @description 固定光标、关闭已有菜单
 */
export function reset_trans_editor_status(e: MouseEvent, context: Context) {
    context.cursor.cursor_freeze(true);
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