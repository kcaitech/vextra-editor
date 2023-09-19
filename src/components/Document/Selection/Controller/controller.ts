import { Shape, ShapeType, GroupShape, TextShape } from '@kcdesign/data';
import { onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, EffectType } from "@/utils/wheel";
import { get_speed, keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { groupPassthrough } from "@/utils/scout";
import { WorkSpace } from "@/context/workspace";
import { Action } from "@/context/tool";
import { AsyncTransfer } from "@kcdesign/data";
import { debounce } from "lodash";
import { paster_short } from '@/utils/clipboard';
import { sort_by_layer } from '@/utils/group_ungroup';
import { Comment } from '@/context/comment';
import { useI18n } from 'vue-i18n';
import { map_from_shapes, permIsEdit } from '@/utils/content';
import { distance2apex, distance2apex2, get_frame, get_pg_by_frame, gen_match_points, PointsOffset } from '@/utils/assist';
import { Asssit } from '@/context/assist';
import { Menu } from '@/context/menu';
import { TaskType } from '@/context/escstack';

export function useControllerCustom(context: Context, i18nT: Function) {
    const matrix = new Matrix();
    const dragActiveDis = 3;
    let timer: any;
    const duration: number = 250; // 双击判定时长 ms 
    let isDragging = false;
    let startPosition: ClientXY = { x: 0, y: 0 };
    let startPositionOnPage: PageXY = { x: 0, y: 0 };
    let root: ClientXY = { x: 0, y: 0 };
    let wheel: Wheel | undefined = undefined;
    let editing: boolean = false;
    let shapes: Shape[] = [];
    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let need_update_comment: boolean = false;
    let stickedX: boolean = false;
    let stickedY: boolean = false;
    let t_e: MouseEvent | undefined;
    let speed: number = 0;
    const selection = context.selection;
    const workspace = context.workspace;
    let offset_map: PointsOffset | undefined;
    function gen_offset_map(shape: Shape, down: PageXY) {
        const m = shape.matrix2Root(), f = shape.frame;
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
    function _migrate(shapes: Shape[], start: ClientXY, end: ClientXY) {
        if (shapes.length) {
            const pe: PageXY = matrix.computeCoord3(end);
            const map = map_from_shapes(shapes);
            const targetParent = selection.getClosetArtboard(pe, map);
            const emit_migrate = getCloesetContainer(shapes[0]).id !== targetParent.id;
            if (emit_migrate && asyncTransfer) {
                shapes = sort_by_layer(context, shapes);
                asyncTransfer.migrate(targetParent as GroupShape);
                context.assist.set_collect_target([targetParent as GroupShape], true);
            }
        }
    }
    const migrate: (shapes: Shape[], start: ClientXY, end: ClientXY) => void = debounce(_migrate, 100);
    function getCloesetContainer(shape: Shape): Shape {
        let result = selection.selectedPage!
        let p = shape.parent;
        while (p) {
            if (p.type === ShapeType.Artboard) {
                result = p as any;
                break;
            }
            p = p.parent;
        }
        return result
    }
    function pre2do(e: MouseEvent) { // 移动之前做的准备
        const action = context.tool.action;
        if (!permIsEdit(context) || action === Action.AddComment) return;
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            setPosition(e);
            context.cursor.cursor_freeze(true);
            context.menu.menuMount(); // 取消右键事件
            context.menu.notify(Menu.SHUTDOWN_POPOVER);
            root = workspace.root;
            shapes = selection.selectedShapes;
            if (!shapes.length) return;
            if (action == Action.AutoV || action == Action.AutoK) {
                workspace.setCtrl('controller');
                wheel = fourWayWheel(context, undefined, startPositionOnPage);
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
            }
        }
    }
    function handleDblClick() {
        const selected = selection.selectedShapes;
        if (selected.length !== 1) return;
        const shape = selected[0];
        if ([ShapeType.Group, ShapeType.FlattenShape].includes(shape.type)) {
            const scope = (shape as GroupShape).childs;
            const scout = selection.scout;
            if (!scout) return;
            const target = groupPassthrough(scout, scope, startPositionOnPage);
            if (target) selection.selectShape(target);
        } else {
            editing = !editing;
            workspace.contentEdit(editing);
        }
    }
    function isMouseOnContent(e: MouseEvent): boolean {
        return (e.target as Element)?.closest(`#content`) ? true : false;
    }
    function mousedown(e: MouseEvent) {
        if (workspace.isEditing) {
            if (isMouseOnContent(e)) {
                shapes = selection.selectedShapes;
                if (shapes.length === 1 && shapes[0].type === ShapeType.Text) {
                    const len = (shapes[0] as TextShape).text.length;
                    const t = (shapes[0] as TextShape).text.getText(0, len).replaceAll('\n', '');
                    if (t.length) {
                        const save = shapes.slice(0, 1);
                        selection.resetSelectShapes();
                        selection.rangeSelectShape(save);
                    } else {
                        const editor = context.editor4Shape(shapes[0]);
                        editor.delete();
                        selection.resetSelectShapes();
                    }
                    return;
                }
            }
        }
        if (workspace.isPageDragging) return;
        if (isElement(e)) {
            if (timer) handleDblClick();
            initTimer();
            pre2do(e);
        } else if (isMouseOnContent(e)) {
            const h = selection.hoveredShape;
            if (h) {
                selection.selectShape(h);
                pre2do(e);
            } else {
                selection.resetSelectShapes();
            }
        }
    }
    function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
        if (isDragging && !editing && wheel && asyncTransfer) {
            speed = get_speed(t_e || e, e), t_e = e;
            let update_type = 0;
            const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
            if (!isOut) update_type = transform(startPosition, mousePosition);
            if (update_type === 3) startPosition = { ...mousePosition };
            else if (update_type === 2) startPosition.y = mousePosition.y;
            else if (update_type === 1) startPosition.x = mousePosition.x;
        } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis && !editing) {
            if (e.altKey) shapes = paster_short(context, shapes);
            asyncTransfer = context.editor.controller().asyncTransfer(shapes, selection.selectedPage!);
            selection.unHoverShape();
            workspace.setSelectionViewUpdater(false);
            workspace.translating(true);
            context.assist.set_trans_target(shapes);
            isDragging = true;
            const pe = matrix.computeCoord3(startPosition);
            offset_map = gen_offset_map(shapes[0], pe);
        }
    }
    function transform(start: ClientXY, end: ClientXY) {
        const ps: PageXY = matrix.computeCoord3(start);
        const pe: PageXY = matrix.computeCoord3(end);
        let update_type = 0;
        if (asyncTransfer) {
            update_type = trans(asyncTransfer, ps, pe);
            migrate(shapes, start, end);
        }
        return update_type;
    }
    let pre_target_x: number, pre_target_y: number;
    function trans(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
        // const s1 = Date.now();
        if (speed > 5) {
            asyncTransfer.trans(ps, pe);
            context.assist.notify(Asssit.CLEAR);
            return 3;
        }
        if (!offset_map) return 3;
        let need_multi = 0;
        let update_type = 3;
        const stick = { dx: 0, dy: 0, sticked_x: false, sticked_y: false };
        const stickness = context.assist.stickness;
        const len = shapes.length;
        const shape = shapes[0];
        const target = len === 1 ? context.assist.trans_match(offset_map, pe) : context.assist.trans_match_multi(shapes);
        let inverse_matrix: Matrix | undefined;
        if (!target) return update_type;
        if (stickedX) {
            if (Math.abs(pe.x - ps.x) >= stickness) stickedX = false;
            else {
                if (pre_target_x === target.x) {
                    pe.x = ps.x, update_type -= 1, need_multi += 1;
                } else {
                    modify_fix_x(target);
                }
            }
        } else if (target.sticked_by_x) {
            modify_fix_x(target);
        }
        if (stickedY) {
            if (Math.abs(pe.y - ps.y) >= stickness) { // 没有挣脱吸附
                stickedY = false;
            } else {
                if (pre_target_y === target.y) { // 还是原先的吸附点
                    pe.y = ps.y, stick.dy = 0, update_type -= 2, need_multi += 2;
                } else { // 需要转移到另一个吸附点
                    modify_fix_y(target);
                }
            }
        } else if (target.sticked_by_y) {
            modify_fix_y(target);
        }

        if (stick.sticked_x || stick.sticked_y) {
            asyncTransfer.stick(stick.dx, stick.dy);
        } else {
            asyncTransfer.trans(ps, pe);
        }

        if (need_multi) {
            if (len === 1) {
                context.assist.setCPG(gen_match_points(shape, true));
            } else {
                const fs = get_frame(shapes);
                workspace.setCFrame(fs);
                context.assist.setCPG(get_pg_by_frame(fs, true));
            }
            context.assist.notify(Asssit.UPDATE_ASSIST, need_multi);
            context.assist.notify(Asssit.UPDATE_MAIN_LINE);
        }
        // console.log('一次辅助线从计算到渲染总共用时', Date.now() - s1); // < 3ms
        return update_type;
        function modify_fix_x(target: any) {
            pre_target_x = target.x;
            const distance = len === 1 ? distance2apex(shape, target.alignX) : distance2apex2(workspace.controllerFrame, target.alignX);
            const trans_x = target.x - distance;
            stick.dx = trans_x, stick.sticked_x = true, stick.dy = pe.y - ps.y;
            pe.x = ps.x + trans_x;
            if (!inverse_matrix) {
                inverse_matrix = new Matrix(matrix.inverse);
            }
            const t = inverse_matrix.computeCoord3(pe);
            startPosition.x = t.x;
            update_type -= 1;
            stickedX = true;
            need_multi += 1;
        }
        function modify_fix_y(target: any) {
            pre_target_y = target.y;
            const distance = len === 1 ? distance2apex(shape, target.alignY) : distance2apex2(workspace.controllerFrame, target.alignY);
            const trans_y = target.y - distance;
            stick.dy = trans_y, stick.sticked_y = true;
            pe.y = ps.y + trans_y;
            if (!stick.sticked_x) stick.dx = pe.x - ps.x;
            if (!inverse_matrix) {
                inverse_matrix = new Matrix(matrix.inverse);
            }
            const t = inverse_matrix.computeCoord3(pe);
            startPosition.y = t.y;
            update_type -= 2;
            stickedY = true;
            need_multi += 2;
        }
    }
    function mouseup(e: MouseEvent) {
        if (e.button === 0) {
            if (isDragging) {
                if (asyncTransfer) {
                    const { clientX, clientY } = e;
                    const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
                    console.log('startPosition', JSON.parse(JSON.stringify(startPosition)));
                    console.log('mousePosition', JSON.parse(JSON.stringify(mousePosition)));
                    _migrate(shapes, startPosition, mousePosition);
                    asyncTransfer = asyncTransfer.close();
                }
                workspace.translating(false);
                workspace.setSelectionViewUpdater(true);
                workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
                context.assist.reset();
                isDragging = false;
            } else {
                pickerFromSelectedShapes(e);
            }
            if (wheel) wheel = wheel.remove();
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        if (need_update_comment) {
            context.comment.notify(Comment.UPDATE_COMMENT_POS);
            need_update_comment = false;
        }
        context.cursor.cursor_freeze(false);
        workspace.setCtrl('page');
    }
    function pickerFromSelectedShapes(e: MouseEvent) {
        const selected = selection.selectedShapes;
        const hoveredShape = selection.hoveredShape;
        if (hoveredShape) {
            e.shiftKey ? selection.rangeSelectShape([...selected, hoveredShape]) : selection.selectShape(hoveredShape);
        } else {
            if (!selection.getShapesByXY(startPositionOnPage, e.metaKey || e.ctrlKey, selected).length) selection.resetSelectShapes();
        }
    }
    function checkStatus() {
        if (workspace.isPreToTranslating) {
            const start = workspace.startPoint;
            if (!start) return;
            pre2do(start);
            workspace.preToTranslating(false);
            need_update_comment = true;
        }
    }
    function setPosition(e: MouseEvent) {
        const { clientX, clientY } = e;
        matrix.reset(workspace.matrix.inverse);
        root = workspace.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        startPositionOnPage = matrix.computeCoord(startPosition.x, startPosition.y);
    }
    function initController() {
        initTimer();
    }
    function initTimer() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
        }, duration)
    }
    function timerClear() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    function isDblClick(): boolean {
        return timer ? true : false;
    }
    function isEditing() {
        return editing;
    }
    function isDrag() {
        return isDragging;
    }
    function isElement(e: MouseEvent): boolean {
        const root = workspace.root;
        const selected = selection.selectedShapes;
        if (selected.length === 1 && selected[0].type === ShapeType.Line) {
            return Boolean(selection.scout?.isPointInStroke(workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
        } else {
            return Boolean(selection.scout?.isPointInPath(workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
        }
    }
    function exit() {
        const len = context.selection.selectedShapes.length;
        context.selection.resetSelectShapes();
        return Boolean(len);
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, i18nT);
    }
    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            const selected = selection.selectedShapes;
            if (selected.length === 1) {
                const type = selected[0].type;
                if (type === ShapeType.Table || type === ShapeType.Contact) return dispose();
            }
            initController();
            editing = false;
            workspace.contentEdit(false);
        }
    }
    function workspace_watcher(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) checkStatus();
    }
    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            workspace.translating(false);
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove();
        workspace.setCtrl('page');
        timerClear();
        context.cursor.cursor_freeze(false);
    }
    function init() {
        shapes = selection.selectedShapes;
        workspace.watch(workspace_watcher);
        selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        workspace.contentEdit(false);
        context.esctask.save(TaskType.SELECTION, exit);
    }
    function dispose() {
        workspace.unwatch(workspace_watcher);
        selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    }
    return { isDblClick, isEditing, isDrag, init, dispose };
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