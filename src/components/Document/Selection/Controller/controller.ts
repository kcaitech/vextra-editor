import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, forCtrlRect } from "@/utils/wheel";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { ShapeType, Shape, GroupShape } from "@kcdesign/data";
import { forGroupHover } from "@/utils/scout";
import { translate, adjustLT2, adjustLB2, adjustRT2, adjustRB2, translateTo } from "@kcdesign/data/editor/frame";
import { Action, CtrlElementType, WorkSpace } from "@/context/workspace";

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

    function updater(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
        }
    }
    function preTodo(e: MouseEvent) { // 移动之前做的准备
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            workspace.value.menuMount(false); // 取消右键事件
            root = context.workspace.root;
            shapes = context.selection.selectedShapes;
            if (!shapes.length) return;
            const action = workspace.value.action;
            const isController = workspace.value.controller === 'controller';
            if (action == Action.AutoV && isController) {
                wheel = fourWayWheel(context, { rolling: forCtrlRect });
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
            }
        }
    }
    function handleDblClick() {
        const selected = context.selection.selectedShapes;
        if (selected.length === 1) {
            const item = selected[0];
            if (item.type != ShapeType.Group) {
                editing = !editing;
            }
        }
    }
    function mousedown(e: MouseEvent) {
        matrix.reset(workspace.value.matrix);
        setPosition(e);
        if (timer) { // 双击预定时间还没过，再次mousedown，则判定为双击
            handleDblClick();
        }
        initTimer(); // 每次点击都应该开始预定下一次可以形成双击的点击
        preTodo(e);
    }

    function mousemove(e: MouseEvent) {
        if (e.button === 0) { //只处理鼠标左键按下时的移动
            const { clientX, clientY } = e;
            if (wheel) {
                wheel.moving(e);
            }
            const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
            if (isDragging) {
                workspace.value.translating(true); // 编辑器开始处于transforming状态 ---start transforming---
                context.selection.unHoverShape(); // 当编辑器处于transforming状态时, 此时的编辑器焦点为选中的图层, 应该取消被hover图层的hover状态, 同时不再给其他图层赋予hover状态
                if (!editing) { // 处于编辑状态时，不拖动图形
                    transform(shapes, startPosition, mousePosition);
                }
                startPosition = { ...mousePosition };
            } else {
                if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 是否开始移动的判定条件
                    isDragging = true;
                    context.repo.start('transform', {});
                }
            }
        }
    }
    function mouseup(e: MouseEvent) {
        if (e.button === 0) { // 只处理鼠标左键按下时的抬起
            if (isDragging) {
                context.repo.commit({});
                isDragging = false;
                workspace.value.translating(false); // 编辑器关闭transforming状态  ---end transforming---
            } else {
                pickerFromSelectedShapes();
            }
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if (wheel) wheel = wheel.remove(); // 卸载滚轮
            if (workspace.value.isPreToTranslating) workspace.value.preToTranslating(); // 取消移动准备
        }
    }
    function transform(shapes: Shape[], start: ClientXY, end: ClientXY) {
        const ps = matrix.inverseCoord(start.x, start.y);
        const pe = matrix.inverseCoord(end.x, end.y);
        const selection = context.selection;
        let targetParent;
        const artboardOnStart = selection.getClosetArtboard(ps, undefined, shapes); // 点击位置存在容器
        if (artboardOnStart && artboardOnStart.type != ShapeType.Page) {
            targetParent = context.selection.getClosetArtboard(pe, artboardOnStart);
        } else {
            targetParent = context.selection.getClosetArtboard(pe);
        }
        // 对选中的每个图层进行变换
        for (let i = 0; i < shapes.length; i++) {
            if (shapes[i].isLocked) continue; // 🔒住不让动
            translate(shapes[i], pe.x - ps.x, pe.y - ps.y);
            if (shapes[i].parent?.id !== targetParent.id) {
                shapeMoveNoTransaction(shapes[i], targetParent);
            }
        }
        context.repo.transactCtx.fireNotify(); // 通常情况下,当事务结束(commit),系统会根据事务中的改动更新视图. 而移动的过程中,整个移动(transform)的事务并未结束,即尚未commit,此时视图无法得到更新, 可以用此方法更新事务过程中的视图 ---before end transaction---
    }
    function shapeMoveNoTransaction(shape: Shape, targetParent: Shape) {
        const origin: GroupShape = ((shape.parent || context.selection.selectedPage) as GroupShape);
        origin.removeChild(shape);
        const { x, y } = shape.frame2Page();
        targetParent.addChild(shape);
        translateTo(shape, x, y);
    }
    function pickerFromSelectedShapes() {
        const selected = context.selection.selectedShapes;
        if (selected.length > 1) {
            const target: Shape | undefined = context.selection.getShapesByXY_beta(startPositionOnPage, false, selected).reverse()[0];
            context.selection.selectShape(target);
        } else if (selected.length === 1 && selected[0].type === ShapeType.Group) {
            const isHasTarget = forGroupHover(context.selection.scout!, (selected[0] as GroupShape).childs, startPositionOnPage);
            if (!isHasTarget) context.selection.selectShape();
        }
        if (context.selection.hoveredShape) {
            context.selection.selectShape(context.selection.hoveredShape);
        }
    }
    function checkStatus() { // 检查是否可以直接开始移动
        if (workspace.value.isPreToTranslating) { // 可以开始移动，该状态开启之后将跳过mousedown事件
            const start = workspace.value.startPoint;
            setPosition(start!);
            preTodo(start!);
        }
    }
    function setPosition(e: MouseEvent) {
        const { clientX, clientY } = e;
        matrix.reset(workspace.value.matrix);
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        startPositionOnPage = matrix.inverseCoord(startPosition.x, startPosition.y);
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context);
    }
    function handlePointAction(type: CtrlElementType, p1: ClientXY, p2: ClientXY, deg?: number, aType?: 'rotate' | 'scale') {
        matrix.reset(workspace.value.matrix);
        const shapes = context.selection.selectedShapes;
        for (let i = 0; i < shapes.length; i++) {
            let item = shapes[i];
            if (item.isLocked) continue; // 🔒住不让动
            if (aType === 'rotate') {
                const newDeg = (item.rotation || 0) + (deg || 0);
                item.rotate(newDeg);
            } else {
                const p1OnPage = matrix.inverseCoord(p1.x, p1.y); // page
                const p2Onpage = matrix.inverseCoord(p2.x, p2.y);
                if (type === CtrlElementType.RectLT) {
                    adjustLT2(item, p2Onpage.x, p2Onpage.y);
                } else if (type === CtrlElementType.RectRT) {
                    adjustRT2(item, p2Onpage.x, p2Onpage.y);
                } else if (type === CtrlElementType.RectRB) {
                    adjustRB2(item, p2Onpage.x, p2Onpage.y);
                } else if (type === CtrlElementType.RectLB) {
                    adjustLB2(item, p2Onpage.x, p2Onpage.y);
                } else if (type === CtrlElementType.RectTop) {
                    const m = item.matrix2Page();
                    const p1 = m.inverseCoord(p1OnPage.x, p1OnPage.y);
                    const p2 = m.inverseCoord(p2Onpage.x, p2Onpage.y);
                    const dy = p2.y - p1.y;
                    const { x, y } = m.computeCoord(0, dy);
                    adjustLT2(item, x, y);
                } else if (type === CtrlElementType.RectRight) {
                    const m = item.matrix2Page();
                    const p1 = m.inverseCoord(p1OnPage.x, p1OnPage.y);
                    const p2 = m.inverseCoord(p2Onpage.x, p2Onpage.y);
                    const dx = p2.x - p1.x;
                    const { x, y } = m.computeCoord(item.frame.width + dx, 0);
                    adjustRT2(item, x, y);
                } else if (type === CtrlElementType.RectBottom) {
                    const m = item.matrix2Page();
                    const p1 = m.inverseCoord(p1OnPage.x, p1OnPage.y);
                    const p2 = m.inverseCoord(p2Onpage.x, p2Onpage.y);
                    const dy = p2.y - p1.y;
                    const { x, y } = m.computeCoord(item.frame.width, item.frame.height + dy);
                    adjustRB2(item, x, y);
                } else if (type === CtrlElementType.RectLeft) {
                    const m = item.matrix2Page();
                    const p1 = m.inverseCoord(p1OnPage.x, p1OnPage.y);
                    const p2 = m.inverseCoord(p2Onpage.x, p2Onpage.y);
                    const dx = p2.x - p1.x;
                    const { x, y } = m.computeCoord(dx, item.frame.height);
                    adjustLB2(item, x, y);
                }
            }
        }
    }
    function workspaceUpdate(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) {
            checkStatus();
        }
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
    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            workspace.value.translating(false);
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            isDragging = false;
            context.repo.commit({});
        }
        if (wheel) wheel = wheel.remove(); // 卸载滚轮
        if (workspace.value.isPreToTranslating) workspace.value.preToTranslating();  // 取消移动准备
        timerClear();
    }
    function isDblClick() {
        return timer;
    }
    function isEditing() {
        return editing;
    }
    function isDrag() {
        return isDragging;
    }
    onMounted(() => {
        context.workspace.watch(workspaceUpdate);
        context.selection.watch(updater);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
    })

    onUnmounted(() => {
        context.workspace.unwatch(workspaceUpdate);
        context.selection.unwatch(updater);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    })

    return { isDblClick, handlePointAction, isEditing, isDrag, startPosition, startPositionOnPage }
}