import { Shape, ShapeType, GroupShape, TableShape, TableGridItem, TableCellType, TextShape, TableCell } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, EffectType } from "@/utils/wheel";
import { get_range, get_speed, keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection, TableArea } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { Action } from "@/context/tool";
import { AsyncTransfer } from "@kcdesign/data";
import { debounce } from "lodash";
import { Comment } from '@/context/comment';
import { useI18n } from 'vue-i18n';
import { permIsEdit } from '@/utils/content';
import { distance2apex, update_pg_2 } from '@/utils/assist';
import { Asssit } from '@/context/assist';
import { Menu } from '@/context/menu';
import { TableSelection } from '@/context/tableselection';
import { TextSelection } from '@/context/textselection';

function useControllerCustom(context: Context, i18nT: Function) {
    const workspace = computed(() => context.workspace);
    const workspace_matrix = ref<Matrix>(context.workspace.matrix);
    const matrix = new Matrix();
    const dragActiveDis = 3;
    const TIMER = 300; // 连续点击最大间隔时间
    let isDragging = false;
    let startPosition: ClientXY = { x: 0, y: 0 };
    let startPositionOnPage: PageXY = { x: 0, y: 0 };
    let root: ClientXY = { x: 0, y: 0 };
    let wheel: Wheel | undefined = undefined;
    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let need_update_comment: boolean = false;
    let stickedX: boolean = false;
    let stickedY: boolean = false;
    let t_e: MouseEvent | undefined;
    let speed: number = 0;
    let area: TableArea = 'invalid';
    let move: any, up: any;
    let matrix4table = new Matrix();
    let down_item: (TableGridItem & { cell: TableCell | undefined }) | undefined;
    let table: TableShape = context.selection.selectedShapes[0] as TableShape;
    let table_selection: TableSelection;
    let text_selection: TextSelection;
    let down_index: { index: number, before: boolean };
    let point_on_table: { x: number, y: number } = { x: 0, y: 0 };
    let down_type: number = 1; //针对主键 1 单击 2 双击 3 三次点击
    let down_timer: any = null;
    let shapes: Shape[] = [];

    function mousedown(e: MouseEvent) {
        if (context.workspace.isPageDragging) return;
        shapes = context.selection.selectedShapes;
        root = context.workspace.root;
        area = context.selection.getArea({ x: e.clientX - root.x, y: e.clientY - root.y });
        console.log('click-area', area);
        if (area === 'move') {
            matrix.reset(workspace.value.matrix.inverse);
            set_position(e);
            pre2trans(e);
            table_selection.setEditingCell();
            table_selection.resetSelection();
        } else if (area === 'body') {
            workspace.value.setCtrl('controller');
            down4body(e);
        } else if (area === 'content') {
            const selection = context.selection;
            const selected = selection.selectedShapes;
            const h = selection.hoveredShape;
            if (!h) selection.resetSelectShapes();
            else e.shiftKey ? selection.rangeSelectShape([...selected, h]) : selection.selectShape(h);
        } else {
            workspace.value.setCtrl('page');
        }
    }
    // #region 4trans
    function _migrate(start: ClientXY, end: ClientXY) {
        if (!shapes.length) return;
        const ps: PageXY = matrix.computeCoord(start.x, start.y);
        const pe: PageXY = matrix.computeCoord(end.x, end.y);
        const selection = context.selection;
        const artboardOnStart = selection.getClosetArtboard(ps, undefined, shapes);
        const targetParent = (artboardOnStart && artboardOnStart.type !== ShapeType.Page) ? selection.getClosetArtboard(pe, artboardOnStart) : selection.getClosetArtboard(pe);
        const m = getCloesetContainer(table).id !== targetParent.id;
        if (m && asyncTransfer) asyncTransfer.migrate(targetParent as GroupShape);
    }
    const migrate: (start: ClientXY, end: ClientXY) => void = debounce(_migrate, 100);
    function getCloesetContainer(shape: Shape): Shape {
        let result = context.selection.selectedPage!
        let p = shape.parent;
        while (p) {
            if (p.type == ShapeType.Artboard) {
                result = p as any;
                return result;
            }
            p = p.parent;
        }
        return result
    }
    function pre2trans(e: MouseEvent) { // 移动之前做的准备
        const action = context.tool.action;
        if (!permIsEdit(context) || action === Action.AddComment) return;
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            context.cursor.cursor_freeze(true);
            context.menu.menuMount(); // 取消右键事件
            context.menu.notify(Menu.SHUTDOWN_POPOVER);
            if (action == Action.AutoV || action == Action.AutoK) {
                workspace.value.setCtrl('controller');
                wheel = fourWayWheel(context, undefined, startPositionOnPage);
                document.addEventListener('mousemove', mousemove4trans);
                document.addEventListener('mouseup', mouseup4trans);
                move = mousemove4trans, up = mouseup4trans;
            }
        }
    }
    function mousemove4trans(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
        if (isDragging && wheel && asyncTransfer) {
            speed = get_speed(t_e || e, e), t_e = e;
            let update_type = 0;
            const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
            if (!isOut) update_type = transform(startPosition, mousePosition);
            if (update_type === 3) startPosition = { ...mousePosition };
            else if (update_type === 2) startPosition.y = mousePosition.y;
            else if (update_type === 1) startPosition.x = mousePosition.x;
        } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) {
            shapes = context.selection.selectedShapes;
            asyncTransfer = context.editor.controller().asyncTransfer(shapes, context.selection.selectedPage!);
            context.selection.unHoverShape();
            workspace.value.setSelectionViewUpdater(false);
            workspace.value.translating(true);
            context.assist.setTransTarget(shapes);
            isDragging = true;
        }
    }
    function transform(start: ClientXY, end: ClientXY) {
        const ps: PageXY = matrix.computeCoord2(start.x, start.y);
        const pe: PageXY = matrix.computeCoord2(end.x, end.y);
        let update_type = 0;
        if (asyncTransfer) {
            update_type = trans(asyncTransfer, ps, pe);
            migrate(start, end);
        }
        return update_type;
    }
    function trans(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
        if (speed > 5) {
            asyncTransfer.trans(ps, pe);
            context.assist.notify(Asssit.CLEAR);
            return 3;
        }
        const table = shapes[0];
        if (!table) return 3;
        let need_multi = 0;
        let update_type = 3;
        const stick = { dx: 0, dy: 0, sticked_x: false, sticked_y: false };
        const stickness = context.assist.stickness + 1;
        const target = context.assist.trans_match(table);
        if (!target) return update_type;
        if (stickedX) {
            if (Math.abs(pe.x - ps.x) > stickness) stickedX = false;
            else {
                pe.x = ps.x, update_type -= 1, need_multi += 1;
            }
        } else if (target.sticked_by_x) {
            const distance = distance2apex(table, target.alignX);
            const trans_x = target.x - distance;
            stick.dx = trans_x, stick.sticked_x = true, stick.dy = pe.y - ps.y, pe.x = ps.x + trans_x;
            const t = matrix.inverseCoord(pe);
            startPosition.x = t.x, update_type -= 1, stickedX = true, need_multi += 1;
        }
        if (stickedY) {
            if (Math.abs(pe.y - ps.y) > stickness) stickedY = false;
            else {
                pe.y = ps.y, stick.dy = 0, update_type -= 2, need_multi += 2;
            }
        } else if (target.sticked_by_y) {
            const distance = distance2apex(table, target.alignY);
            const trans_y = target.y - distance;
            stick.dy = trans_y, stick.sticked_y = true, pe.y = ps.y + trans_y;
            if (!stick.sticked_x) stick.dx = pe.x - ps.x;
            const t = matrix.inverseCoord(pe);
            startPosition.y = t.y, update_type -= 2, stickedY = true, need_multi += 2;
        }
        if (stick.sticked_x || stick.sticked_y) {
            asyncTransfer.stick(stick.dx, stick.dy);
        } else {
            asyncTransfer.trans(ps, pe);
        }
        if (need_multi) {
            context.assist.setCPG(update_pg_2(table, true));
            context.assist.notify(Asssit.UPDATE_ASSIST, need_multi);
            context.assist.notify(Asssit.UPDATE_MAIN_LINE);
        }
        return update_type;
    }
    function mouseup4trans(e: MouseEvent) {
        if (e.button === 0) {
            if (isDragging) {
                if (asyncTransfer) {
                    const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
                    _migrate(startPosition, mousePosition);
                    asyncTransfer = asyncTransfer.close();
                }
                workspace.value.translating(false);
                workspace.value.setSelectionViewUpdater(true);
                workspace.value.notify(WorkSpace.SELECTION_VIEW_UPDATE);
                context.assist.reset();
                isDragging = false;
            }
            if (wheel) wheel = wheel.remove();
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        }
        if (need_update_comment) {
            context.comment.notify(Comment.UPDATE_COMMENT_POS);
            need_update_comment = false;
        }
        context.cursor.cursor_freeze(false);
        workspace.value.setCtrl('page');
    }
    function checkStatus() {
        if (workspace.value.isPreToTranslating) {
            const start = workspace.value.startPoint;
            if (!start) return;
            matrix.reset(workspace.value.matrix.inverse);
            set_position(start);
            pre2trans(start);
            workspace.value.preToTranslating(false);
            need_update_comment = true;
        }
    }
    // #endregion

    // #region 4body action
    function check_cell_on_point(e: MouseEvent) {
        const root = workspace.value.root;
        const p = matrix4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
        return table.locateCell(p.x, p.y);
    }
    function check_coord_on_point2(e: MouseEvent) {
        const root = workspace.value.root;
        const p = matrix4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
        return table.locateCellIndex(p.x, p.y);
    }
    function get_matrix4table() {
        const m = table.matrix2Root();
        m.multiAtLeft(workspace.value.matrix);
        matrix4table = new Matrix(m.inverse);
    }
    function down4body(e: MouseEvent) {
        if (e.button !== 0) return;
        const new_down_item = check_cell_on_point(e);
        if (down_item && ((new_down_item?.index.col !== down_item.index.col) || (new_down_item?.index.row !== down_item.index.row))) init_down_timer();
        down_item = new_down_item;
        if (down_type === 1) down(e) // 单击
        else if (down_type === 2) dbldown();
        else if (down_type === 3) multidown();
        down_type++;
        set_timer();
    }
    function mousemove4body(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
        if (isDragging && down_item) {
            startPosition = { ...mousePosition };
            const editingCell = table_selection.editingCell;
            const m_item = check_cell_on_point(e);
            const coord = check_coord_on_point2(e);
            if (!m_item || !coord) return;
            if (editingCell && editingCell.cell && editingCell.cell.cellType === TableCellType.Text) {
                const { rows, rowe, cols, cole } = get_range(down_item.index, m_item.index);
                if (rows !== rowe || cols !== cole) {
                    table_selection.setEditingCell();
                } else {
                    const f = m_item.frame;
                    const point_on_table = matrix4table.computeCoord2(mousePosition.x, mousePosition.y);
                    const xy = { x: point_on_table.x - f.x, y: point_on_table.y - f.y };
                    const m_index = editingCell.cell.text!.locateText(xy.x, xy.y);
                    text_selection.selectText(down_index.index, m_index.index);
                }
            } else {
                if (m_item.cell?.id === down_item.cell?.id) {
                    table_selection.setEditingCell(down_item);
                } else {
                    const { rows, rowe, cols, cole } = get_range(down_item.index, coord);
                    table_selection.selectTableCellRange(rows, rowe, cols, cole);
                }
            }
        } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
        }
    }
    function mouseup4body() {
        if (isDragging) isDragging = false;
        workspace.value.setCtrl('page');
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
    function init_text_cell(cell: TableGridItem) {
        const editor = context.editor.editor4Table(table);
        editor.initTextCell(cell.index.row, cell.index.col)
    }
    function down(e: MouseEvent) {
        console.log('单击', down_item);
        table_selection.resetSelection();
        set_position(e);
        if (down_item) {
            if (down_item.cell) {
                if (down_item.cell.cellType === TableCellType.Text) {
                    const f = down_item.frame;
                    const xy = { x: point_on_table.x - f.x, y: point_on_table.y - f.y };
                    // console.log('点到textcell', xy);
                    table_selection.setEditingCell(down_item);
                    down_index = down_item.cell.text!.locateText(xy.x, xy.y);
                    text_selection = context.selection.getTextSelection(down_item.cell as TextShape);
                    text_selection.setCursor(down_index.index, down_index.before);
                } else if (down_item.cell.cellType === TableCellType.Image) {
                    // console.log('点到imagecell');
                    table_selection.setEditingCell();
                    table_selection.selectTableCell(down_item.index.row, down_item.index.col);
                } else {
                    // console.log('unexcept');
                    init_text_cell(down_item);
                    text_selection = context.selection.getTextSelection(down_item.cell as TextShape);
                    text_selection.setCursor(0, false);
                    table_selection.setEditingCell(down_item);
                }
            } else {
                // console.log('init cell');
                init_text_cell(down_item);
                down_item = check_cell_on_point(e);
                table_selection.setEditingCell(down_item);
                // @ts-ignore
                down_index = down_item.cell.text!.locateText(0, 0);
                // @ts-ignore
                text_selection = context.selection.getTextSelection(down_item.cell);
                text_selection.setCursor(down_index.index, down_index.before);
            }
        }
        document.addEventListener('mousemove', mousemove4body);
        document.addEventListener('mouseup', mouseup4body);
        move = mousemove4body, up = mouseup4body;
    }
    function dbldown() {
        console.log('双击');
        if (down_item && down_item.cell && down_item.cell.cellType === TableCellType.Text) {
            const text = down_item.cell.text, len: number = text?.length!;
            if (text && len !== 1) {
                text_selection.selectText(0, len);
            } else {
                table_selection.setEditingCell();
                table_selection.selectTableCell(down_item.index.row, down_item.index.col);
            }
        }
        document.addEventListener('mouseup', mouseup4body);
        up = mouseup4body;
    }
    function multidown() {
        init_down_timer();
        console.log('三次点击');
        if (down_item && down_item.cell && down_item.cell.cellType === TableCellType.Text) {
            table_selection.setEditingCell();
            table_selection.selectTableCell(down_item.index.row, down_item.index.col);
        }
        document.addEventListener('mouseup', mouseup4body);
        up = mouseup4body;
    }
    // #endregion
    function set_position(e: MouseEvent) {
        const { clientX, clientY } = e;
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        point_on_table = matrix4table.computeCoord2(startPosition.x, startPosition.y);
    }
    function initController() {
        const t: TableShape = context.selection.selectedShapes[0] as TableShape;
        if (t && t.type === ShapeType.Table) {
            table = t;
            get_matrix4table();
            init_down_timer();
            table_selection = context.tableSelection;
            table_selection.resetSelection();
            table_selection.setEditingCell();
        }
    }
    function init_down_timer() {
        clearTimeout(down_timer);
        down_timer = null, down_type = 1;
    }
    function set_timer() {
        clearTimeout(down_timer);
        down_timer = setTimeout(() => {
            clearTimeout(down_timer);
            down_type = 1, down_timer = null;
        }, TIMER)
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, i18nT);
    }
    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) initController();
    }
    function workspace_watcher(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) checkStatus();
    }
    function windowBlur() {
        if (isDragging) {
            workspace.value.translating(false);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove();
        workspace.value.setCtrl('page');
        context.cursor.cursor_freeze(false);
    }
    function init() {
        context.workspace.watch(workspace_watcher);
        context.selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        context.workspace.contentEdit(false);
        table.watch(get_matrix4table);
        shapes = context.selection.selectedShapes;
    }
    function dispose() {
        context.workspace.unwatch(workspace_watcher);
        context.selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        table.unwatch(get_matrix4table);
        console.log('dispose');
    }
    function m4table() {
        return matrix4table;
    }
    watch(() => workspace_matrix.value, get_matrix4table, { deep: true });
    return { m4table, init, dispose };
}

export function useController(context: Context) {
    const { t } = useI18n();
    const ctrl = useControllerCustom(context, t);
    onMounted(() => {
        ctrl.init();
    })
    onUnmounted(() => {
        ctrl.dispose();
    })
    return ctrl;
}