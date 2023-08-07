import { Shape, ShapeType, GroupShape, TextShape } from '@kcdesign/data';
import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, EffectType } from "@/utils/wheel";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { groupPassthrough } from "@/utils/scout";
import { WorkSpace } from "@/context/workspace";
import { Action } from "@/context/tool";
import { AsyncTransfer } from "@kcdesign/data";
import { debounce } from "lodash";
import { paster_short } from '@/utils/clipaboard';
import { sort_by_layer } from '@/utils/group_ungroup';
import { Comment } from '@/context/comment';
import { useI18n } from 'vue-i18n';
import { permIsEdit } from '@/utils/content';
import { distance2apex } from '@/utils/assist';
export function useController(context: Context) {
    const workspace = computed(() => context.workspace);
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
    const { t } = useI18n();
    function _migrate(shapes: Shape[], start: ClientXY, end: ClientXY) { // 立马判断环境并迁移
        if (shapes.length) {
            const ps: PageXY = matrix.computeCoord(start.x, start.y);
            const pe: PageXY = matrix.computeCoord(end.x, end.y);
            const selection = context.selection;
            let targetParent;
            const artboardOnStart = selection.getClosetArtboard(ps, undefined, shapes); // 点击位置处的容器
            if (artboardOnStart && artboardOnStart.type !== ShapeType.Page) {
                targetParent = selection.getClosetArtboard(pe, artboardOnStart);
            } else {
                targetParent = selection.getClosetArtboard(pe);
            }
            const m = getCloesetContainer(shapes[0]).id !== targetParent.id;
            if (m && asyncTransfer) {
                shapes = sort_by_layer(context, shapes);
                asyncTransfer.migrate(targetParent as GroupShape);
            }
        }
    }
    const migrate: (shapes: Shape[], start: ClientXY, end: ClientXY) => void = debounce(_migrate, 100); // 停留100ms之后做环境判断和迁移
    function downpoint() {
        return startPosition;
    }
    function downpoint_page() {
        return startPositionOnPage;
    }
    function getCloesetContainer(shape: Shape): Shape {
        let result = context.selection.selectedPage!
        let p = shape?.parent;
        while (p) {
            if (p.type == ShapeType.Artboard) {
                result = p as any;
                break;
            }
            p = p.parent;
        }
        return result
    }
    function preTodo(e: MouseEvent) { // 移动之前做的准备
        if (!permIsEdit(context) || context.workspace.action === Action.AddComment) return;
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            context.cursor.cursor_freeze(true);
            context.menu.menuMount(); // 取消右键事件
            root = context.workspace.root;
            shapes = context.selection.selectedShapes;
            if (!shapes.length) return;
            const action = context.tool.action;
            if (action == Action.AutoV || action == Action.AutoK) {
                workspace.value.setCtrl('controller');
                wheel = fourWayWheel(context, undefined, startPositionOnPage);
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
            }
        }
    }
    function handleDblClick() {
        const selected = context.selection.selectedShapes;
        if (selected.length === 1) {
            const item = selected[0];
            if ([ShapeType.Group, ShapeType.FlattenShape].includes(item.type)) {
                const scope = (item as GroupShape).childs;
                const scout = context.selection.scout;
                const target = groupPassthrough(scout!, scope, startPositionOnPage);
                if (target) context.selection.selectShape(target);
            } else {
                editing = !editing;
            }
        }
    }
    function isMouseOnContent(e: MouseEvent): boolean {
        return (e.target as Element)?.closest(`#content`) ? true : false;
    }
    function mousedown(e: MouseEvent) {
        if (context.workspace.isEditing) {
            if (isMouseOnContent(e)) {
                const selected = context.selection.selectedShapes;
                if (selected.length === 1 && selected[0].type === ShapeType.Text) {
                    const len = (selected[0] as TextShape).text.length;
                    const t = (selected[0] as TextShape).text.getText(0, len).replaceAll('\n', '');
                    if (t.length) {
                        const save = selected.slice(0, 1);
                        context.selection.resetSelectShapes();
                        context.selection.rangeSelectShape(save);
                    } else {
                        const editor = context.editor4Shape(selected[0]);
                        editor.delete();
                        context.selection.resetSelectShapes();
                    }
                }
            }
            return;
        }
        if (context.workspace.isPageDragging) return;
        if (isElement(e)) {
            matrix.reset(workspace.value.matrix.inverse);
            setPosition(e);
            if (timer) handleDblClick();
            initTimer();
            preTodo(e);
        } else {
            if (isMouseOnContent(e)) {
                if (!context.selection.hoveredShape) context.selection.resetSelectShapes();
            }
        }
    }
    function mousemove(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
        if (isDragging && !editing && wheel && asyncTransfer) {
            let update_type = 0;
            const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
            if (!isOut) update_type = transform(startPosition, mousePosition);
            if (update_type === 3) startPosition = { ...mousePosition };
            else if (update_type === 2) startPosition.y = mousePosition.y;
            else if (update_type === 1) startPosition.x = mousePosition.x;
        } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis && !editing) {
            if (e.altKey) shapes = paster_short(context, shapes);
            asyncTransfer = context.editor.controller().asyncTransfer(shapes, context.selection.selectedPage!);
            context.selection.unHoverShape();
            workspace.value.setSelectionViewUpdater(false);
            workspace.value.translating(true);
            context.assist.setTransTarget(shapes);
            isDragging = true;
        }
    }
    function transform(start: ClientXY, end: ClientXY) {
        const ps: PageXY = matrix.computeCoord(start.x, start.y);
        const pe: PageXY = matrix.computeCoord(end.x, end.y);
        let update_type = 0;
        if (asyncTransfer) {
            update_type = trans(asyncTransfer, ps, pe);
            migrate(shapes, start, end);
        }
        return update_type;
    }
    function trans(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
        let update_type = 3;
        const stick = { dx: 0, dy: 0, sticked_x: false, sticked_y: false };
        const stickness = context.assist.stickness;
        if (shapes.length === 1) {
            const shape = shapes[0];
            const target = context.assist.trans_match(shape);
            if (!target) return update_type;
            if (stickedX) {
                if (Math.abs(pe.x - ps.x) > stickness) {
                    stickedX = false;
                } else {
                    pe.x = ps.x;
                    update_type = update_type - 1;
                }
            } else if (target.sticked_by_x) {
                const distance = distance2apex(shape, target.alignX), trans_x = target.x - distance;
                stick.dx = trans_x, stick.sticked_x = true;
                if (!stickedY) stick.dy = pe.y - ps.y;
                pe.x = ps.x + trans_x;
                const t = matrix.inverseCoord(pe);
                startPosition.x = t.x;
                update_type = update_type - 1;
                stickedX = true;
            }
            if (stickedY) {
                if (Math.abs(pe.y - ps.y) > stickness) {
                    stickedY = false;
                } else {
                    pe.y = ps.y;
                    update_type = update_type - 2;
                }
            } else if (target.sticked_by_y) {
                const distance = distance2apex(shape, target.alignY), trans_y = target.y - distance;
                stick.dy = trans_y, stick.sticked_y = true;
                if (!stick.sticked_x) stick.dx = pe.x - ps.x;
                pe.y = ps.y + trans_y;
                const t = matrix.inverseCoord(pe);
                startPosition.y = t.y;
                update_type = update_type - 2;
                stickedY = true;
            }
            if (stick.sticked_x || stick.sticked_y) {
                asyncTransfer.stick(stick.dx, stick.dy);
            } else asyncTransfer.trans(ps, pe);
        } else {
            asyncTransfer.trans(ps, pe);
        }
        return update_type;
    }
    function mouseup(e: MouseEvent) {
        if (e.button === 0) { // 只处理鼠标左键按下时的抬起
            if (isDragging) {
                if (asyncTransfer) {
                    const { clientX, clientY } = e;
                    const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
                    _migrate(shapes, startPosition, mousePosition);
                    asyncTransfer = asyncTransfer.close();
                }
                workspace.value.translating(false);
                workspace.value.setSelectionViewUpdater(true);
                workspace.value.selectionViewUpdate();
                context.assist.reset();
                isDragging = false;
            } else {
                pickerFromSelectedShapes(e);
            }
            if (wheel) wheel = wheel.remove(); // 卸载滚轮
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        if (need_update_comment) {
            context.comment.notify(Comment.UPDATE_COMMENT_POS);
            need_update_comment = false;
        }
        context.cursor.cursor_freeze(false);
        workspace.value.setCtrl('page');
    }
    function pickerFromSelectedShapes(e: MouseEvent) {
        const selection = context.selection;
        const selected = selection.selectedShapes;
        const hoveredShape = selection.hoveredShape;
        if (hoveredShape) {
            if (e.shiftKey) {
                selection.rangeSelectShape([...selected, hoveredShape]);
            } else {
                selection.selectShape(hoveredShape);
            }
        } else {
            if (!selection.getShapesByXY(startPositionOnPage, e.metaKey || e.ctrlKey, selected).length) selection.resetSelectShapes();
        }
    }
    function checkStatus() { // 检查是否可以直接开始移动
        if (workspace.value.isPreToTranslating) { // 可以开始移动，该状态开启之后将跳过mousedown事件
            const start = workspace.value.startPoint;
            setPosition(start!);
            preTodo(start!);
            workspace.value.preToTranslating(false);
            need_update_comment = true;
        }
    }
    function setPosition(e: MouseEvent) {
        const { clientX, clientY } = e;
        matrix.reset(workspace.value.matrix.inverse);
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        startPositionOnPage = matrix.computeCoord(startPosition.x, startPosition.y);
    }
    function initController() {
        initTimer(); // 控件生成之后立马开始进行双击预定，该预定将在duration(ms)之后取消
    }
    function initTimer() {
        clearTimeout(timer); // 先取消原有的预定
        timer = setTimeout(() => { // 设置新的预定
            clearTimeout(timer); // 取消预定
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
        const root = context.workspace.root;
        return Boolean(context.selection.scout?.isPointInPath(context.workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, t);
    }
    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
            editing = false;
            context.workspace.contentEdit(false);
        }
    }
    function workspace_watcher(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) checkStatus();
    }
    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            workspace.value.translating(false);
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove();
        workspace.value.setCtrl('page');
        timerClear();
        context.cursor.cursor_freeze(false);
    }
    onMounted(() => {
        context.workspace.watch(workspace_watcher);
        context.selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        context.workspace.contentEdit(false);
    })
    onUnmounted(() => {
        context.workspace.unwatch(workspace_watcher);
        context.selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    })
    return { isDblClick, isEditing, isDrag, downpoint, downpoint_page };
}