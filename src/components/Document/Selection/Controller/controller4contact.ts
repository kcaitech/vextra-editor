import { Shape, ShapeType, GroupShape, TextShape } from '@kcdesign/data';
import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel } from "@/utils/wheel";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { groupPassthrough } from "@/utils/scout";
import { WorkSpace } from "@/context/workspace";
import { Action } from "@/context/tool";
import { AsyncTransfer } from "@kcdesign/data";
import { Comment } from '@/context/comment';
import { useI18n } from 'vue-i18n';
import { permIsEdit } from '@/utils/content';
import { Menu } from '@/context/menu';

export function useControllerCustom(context: Context, i18nT: Function) {
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
    let t_e: MouseEvent | undefined;
    let speed: number = 0;

    function preTodo(e: MouseEvent) { // 移动之前做的准备
        const action = context.tool.action;
        if (!permIsEdit(context) || action === Action.AddComment) return;
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            context.cursor.cursor_freeze(true);
            context.menu.menuMount(); // 取消右键事件
            context.menu.notify(Menu.SHUTDOWN_POPOVER);
            root = context.workspace.root;
            shapes = context.selection.selectedShapes;
            if (!shapes.length) return;
            if (action == Action.AutoV || action == Action.AutoK) {
                workspace.value.setCtrl('controller');
                wheel = fourWayWheel(context, undefined, startPositionOnPage);
                document.addEventListener('mouseup', mouseup);
            }
        }
    }
    function handleDblClick() {
        const selected = context.selection.selectedShapes;
        if (selected.length !== 1) return;
        const shape = selected[0];
        if ([ShapeType.Group, ShapeType.FlattenShape].includes(shape.type)) {
            const scope = (shape as GroupShape).childs;
            const scout = context.selection.scout;
            if (!scout) return;
            const target = groupPassthrough(scout, scope, startPositionOnPage);
            if (target) context.selection.selectShape(target);
        } else {
            editing = !editing;
            context.workspace.contentEdit(editing);
            if (editing) {
                console.log('进入编辑状态！');
            } else {
                console.log('取消编辑状态！');
            }
        }
    }
    function isMouseOnContent(e: MouseEvent): boolean {
        return (e.target as Element)?.closest(`#content`) ? true : false;
    }
    function mousedown(e: MouseEvent) {
        if (context.workspace.isEditing) {
            if (isMouseOnContent(e)) {
                shapes = context.selection.selectedShapes;
                if (shapes.length === 1 && shapes[0].type === ShapeType.Text) {
                    const len = (shapes[0] as TextShape).text.length;
                    const t = (shapes[0] as TextShape).text.getText(0, len).replaceAll('\n', '');
                    if (t.length) {
                        const save = shapes.slice(0, 1);
                        context.selection.resetSelectShapes();
                        context.selection.rangeSelectShape(save);
                    } else {
                        const editor = context.editor4Shape(shapes[0]);
                        editor.delete();
                        context.selection.resetSelectShapes();
                    }
                    return;
                }
            }
        }
        if (context.workspace.isPageDragging) return;
        if (isElement(e)) {
            matrix.reset(workspace.value.matrix.inverse);
            setPosition(e);
            if (timer) handleDblClick();
            initTimer();
            preTodo(e);
        } else if (isMouseOnContent(e)) {
            const selection = context.selection;
            const h = selection.hoveredShape;
            if (!h) selection.resetSelectShapes();
        }
    }

    function mouseup(e: MouseEvent) {
        if (e.button === 0) {
            if (isDragging) {
                workspace.value.translating(false);
                workspace.value.setSelectionViewUpdater(true);
                workspace.value.notify(WorkSpace.SELECTION_VIEW_UPDATE);
                context.assist.reset();
                isDragging = false;
            } else {
                pickerFromSelectedShapes(e);
            }
            if (wheel) wheel = wheel.remove();
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
            e.shiftKey ? selection.rangeSelectShape([...selected, hoveredShape]) : selection.selectShape(hoveredShape);
        } else {
            if (!selection.getShapesByXY(startPositionOnPage, e.metaKey || e.ctrlKey, selected).length) selection.resetSelectShapes();
        }
    }
    function checkStatus() {
        if (workspace.value.isPreToTranslating) {
            const start = workspace.value.startPoint;
            if (!start) return;
            setPosition(start);
            preTodo(start);
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
        const root = context.workspace.root;
        const selected = context.selection.selectedShapes;
        if (selected.length === 1 && selected[0].type === ShapeType.Line) {
            return Boolean(context.selection.scout?.isPointInStroke(context.workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
        } else {
            return Boolean(context.selection.scout?.isPointInPath(context.workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
        }
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, i18nT);
    }
    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            const selected = context.selection.selectedShapes;
            if (selected.length === 1 && selected[0].type === ShapeType.Table) return dispose();
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
            document.removeEventListener('mouseup', mouseup);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove();
        workspace.value.setCtrl('page');
        timerClear();
        context.cursor.cursor_freeze(false);
    }
    function init() {
        shapes = context.selection.selectedShapes;
        context.workspace.watch(workspace_watcher);
        context.selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        context.workspace.contentEdit(false);
    }
    function dispose() {
        context.workspace.unwatch(workspace_watcher);
        context.selection.unwatch(selection_watcher);
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