import { export_shape, import_shape, Shape, ShapeType, AsyncCreator, ShapeFrame, GroupShape } from '@kcdesign/data';
import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, EffectType } from "@/utils/wheel";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { forGroupHover, groupPassthrough } from "@/utils/scout";
import { Action, WorkSpace } from "@/context/workspace";
import { AsyncTransfer } from "@kcdesign/data";
import { debounce } from "lodash";
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
    const trans = { x: 0, y: 0 };
    function _migrate(shapes: Shape[], start: ClientXY, end: ClientXY) { // 立马判断环境并迁移
        if (shapes.length) {
            const ps: PageXY = matrix.inverseCoord(start.x, start.y);
            const pe: PageXY = matrix.inverseCoord(end.x, end.y);
            const selection = context.selection;
            let targetParent;
            const artboardOnStart = selection.getClosetArtboard(ps, undefined, shapes); // 点击位置处的容器

            if (artboardOnStart && artboardOnStart.type != ShapeType.Page) {
                targetParent = context.selection.getClosetArtboard(pe, artboardOnStart);
            } else {
                targetParent = context.selection.getClosetArtboard(pe);
            }
            const m = getCloesetContainer(shapes[0]).id != targetParent.id;
            if (m && asyncTransfer) {
                asyncTransfer.migrate(targetParent);
            }
        }
    }
    const migrate: (shapes: Shape[], start: ClientXY, end: ClientXY) => void = debounce(_migrate, 80); // 停留80ms之后做环境判断和迁移
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
    function updater(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
            editing = false;
            context.workspace.contentEdit(false);
        }
    }
    function preTodo(e: MouseEvent) { // 移动之前做的准备
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            workspace.value.menuMount(false); // 取消右键事件
            root = context.workspace.root;
            shapes = context.selection.selectedShapes;
            if (!shapes.length) return;
            const action = workspace.value.action;
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
            if (item.type === ShapeType.Group) {
                const scope = (item as GroupShape).childs;
                const scout = context.selection.scout;
                const target = groupPassthrough(scout!, scope, startPositionOnPage);
                if (target) {
                    context.selection.selectShape(target);
                }
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
            context.selection.selectShape(context.selection.hoveredShape);
        }
        const working = !context.workspace.isPageDragging && !context.workspace.isEditing;
        if (working) {
            if (isElement(e)) {
                matrix.reset(workspace.value.matrix);
                setPosition(e);
                if (timer) { // 双击预定时间还没过，再次mousedown，则判定为双击
                    handleDblClick();
                }
                initTimer(); // 每次点击都应该开始预定下一次可以形成双击的点击
                preTodo(e);
            } else {
                if (isMouseOnContent(e)) {
                    if (!context.selection.hoveredShape) {
                        context.selection.selectShape();
                    }
                }
            }
        }
    }
    function mousemove(e: MouseEvent) {
        if (e.buttons == 1) { //只处理鼠标左键按下时的移动
            const { clientX, clientY } = e;
            const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
            if (isDragging) {
                workspace.value.translating(true); // 编辑器开始处于transforming状态 ---start transforming---
                context.selection.unHoverShape(); // 当编辑器处于transforming状态时, 此时的编辑器焦点为选中的图层, 应该取消被hover图层的hover状态, 同时不再给其他图层赋予hover状态
                if (!editing) { // 处于编辑状态时，不拖动图形
                    if (wheel && asyncTransfer) {
                        const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
                        if (!isOut) {
                            transform(startPosition, mousePosition);
                        }
                    }
                }
                startPosition = { ...mousePosition };
            } else {
                if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 是否开始移动的判定条件
                    if (!editing) {
                        isDragging = true;
                        if (e.altKey) {
                            const source = export_shape(shapes);
                            const new_source = import_shape(source);
                            const page = context.selection.selectedPage;
                            const result: Shape[] = [];
                            if (page) {
                                for (let i = 0; i < new_source.length; i++) {
                                    const _s = new_source[i];
                                    const editor = context.editor4Page(page);
                                    const r = editor.insert(page, source[i].index + 1, _s, true);
                                    if (r) { result.push(r) }
                                }
                            }
                            if (result.length) {
                                shapes = result;
                                context.selection.rangeSelectShape(result);
                            }
                        }
                        asyncTransfer = context.editor.controller().asyncTransfer(shapes);
                        workspace.value.setSelectionViewUpdater(false);
                    }
                }
            }
        }
    }
    function mouseup(e: MouseEvent) {
        if (e.button === 0) { // 只处理鼠标左键按下时的抬起
            if (isDragging) {
                if (asyncTransfer) {
                    const { clientX, clientY } = e;
                    const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
                    _migrate(shapes, startPosition, mousePosition);
                    // const len = shapes.length;
                    // if (len > 1) {
                    //     const m = matrix.inverseCoord({ x: mousePosition.x, y: mousePosition.y });
                    //     asyncTransfer.trans(startPositionOnPage, m);
                    //     const tool = context.workspace.toolGroup;
                    //     if (tool) {
                    //         tool.removeAttribute('style');
                    //         trans.x = 0, trans.y = 0;
                    //     }
                    // }
                    asyncTransfer = asyncTransfer?.close();
                }
                isDragging = false;
                workspace.value.translating(false); // 编辑器关闭transforming状态  ---end transforming---
                workspace.value.setSelectionViewUpdater(true);
                workspace.value.selectionViewUpdate();
            } else {
                pickerFromSelectedShapes(e);
            }
            if (wheel) wheel = wheel.remove(); // 卸载滚轮
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        workspace.value.setCtrl('page');
    }
    function transform(start: ClientXY, end: ClientXY) {
        const ps: PageXY = matrix.inverseCoord(start.x, start.y);
        const pe: PageXY = matrix.inverseCoord(end.x, end.y);
        // if (shapes.length > 1) {
        //     const tool = context.workspace.toolGroup;
        //     if (tool) {
        //         const tx = ps.x - pe.x;
        //         const ty = ps.y - pe.y;
        //         trans.x -= tx;
        //         trans.y -= ty;
        //         tool.style.transform = `translate(${trans.x}px, ${trans.y}px)`;
        //     }
        // } else {
        //     if (asyncTransfer) {
        //         asyncTransfer.trans(ps, pe);
        //         migrate(shapes, start, end);
        //     }
        // }
        if (asyncTransfer) {
            asyncTransfer.trans(ps, pe);
            migrate(shapes, start, end);
        }
    }
    function pickerFromSelectedShapes(e: MouseEvent) {
        const selected = context.selection.selectedShapes;
        if (selected.length > 1) {
            if (!e.shiftKey) {
                const target: Shape | undefined = context.selection.getShapesByXY_beta(startPositionOnPage, false, e.metaKey || e.ctrlKey, selected).reverse()[0];
                context.selection.selectShape(target);
            }
        } else if (selected.length === 1) {
            if (selected[0].type === ShapeType.Group) {
                const isHasTarget = forGroupHover(context.selection.scout!, (selected[0] as GroupShape).childs, startPositionOnPage, selected[0], e.metaKey || e.ctrlKey);
                if (!isHasTarget) context.selection.resetSelectShapes();
            } else {
                const target: Shape | undefined = context.selection.getShapesByXY_beta(startPositionOnPage, false, e.metaKey || e.ctrlKey, selected)[0];
                if (!target) {
                    context.selection.resetSelectShapes();
                }
            }
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
            workspace.value.preToTranslating(false);
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
    function workspaceUpdate(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) {
            checkStatus();
        }
    }
    function initController() {
        trans.x = 0, trans.y = 0;
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
        if ((e.target as Element).closest('[data-area="controller"]')) {
            return true;
        } else {
            return false;
        }
    }
    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            workspace.value.translating(false);
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            asyncTransfer = asyncTransfer?.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove(); // 卸载滚轮
        workspace.value.setCtrl('page');
        timerClear();
    }
    onMounted(() => {
        context.workspace.watch(workspaceUpdate);
        context.selection.watch(updater);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        context.workspace.contentEdit(false);
    })
    onUnmounted(() => {
        context.workspace.unwatch(workspaceUpdate);
        context.selection.unwatch(updater);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    })
    return { isDblClick, isEditing, isDrag, downpoint, downpoint_page }
}