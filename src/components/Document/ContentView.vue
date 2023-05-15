<script setup lang="ts">
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { reactive, defineProps, onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import { XY } from '@/context/selection';
import { init as renderinit } from '@/render';
import { Action, KeyboardKeys, ResultByAction, WorkSpace } from '@/context/workspace';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from '@/components/Document/Menu/PageViewContextMenuItems.vue';
import Selector, { SelectorFrame } from './Selection/Selector.vue';
import { GroupShape, ShapeType } from '@kcdesign/data/data/typesdefine';
import { Shape } from "@kcdesign/data/data/shape";
import { ShapeFrame } from '@kcdesign/data/data/baseclasses';
import { useI18n } from 'vue-i18n';
import { expandTo, translateTo } from "@kcdesign/data/editor/frame";
import { styleSheetController, StyleSheetController } from "@/utils/cursor";
import { v4 as uuid } from "uuid";
import { landFinderOnPage, scrollToContentView } from '@/utils/artboardFn';
import { fourWayWheel, Wheel, forNewShape } from '@/utils/wheel';
import { compare } from '@/utils/performance';
type ContextMenuEl = InstanceType<typeof ContextMenu>;
const { t } = useI18n();
const props = defineProps<{
    context: Context,
    page: Page,
}>();
const STATE_NONE = 0;
const STATE_CHECKMOVE = 1;
const STATE_MOVEING = 2;
const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const workspace = computed(() => props.context.workspace);
let scale_delta = 1.06;
let scale_delta_ = 1 / scale_delta;
const wheel_step = 50;
const spacePressed = ref<boolean>(false);
const contextMenu = ref<boolean>(false);
const contextMenuPosition: XY = reactive({ x: 0, y: 0 });
let state = STATE_NONE;
const dragActiveDis = 4; // 拖动 3px 后开始触发移动
const prePt: { x: number, y: number } = { x: 0, y: 0 };
const matrix = reactive(props.context.workspace.matrix); // 一切图形可视变换的根源！！！
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnClientXY: XY = { x: 0, y: 0 }; // 鼠标在可视区中的坐标
const mousedownOnPageXY: XY = { x: 0, y: 0 }; // 鼠标在page中的坐标
let shapesContainsMousedownOnPageXY: Shape[] = [];
let contextMenuItems: string[] = [];
let isMouseLeftDown: boolean = false;
const selectionIsCtrl = computed(() => !spacePressed.value);
let newShape: Shape | undefined;
const contextMenuEl = ref<ContextMenuEl>();
const surplusY = ref<number>(0);
const site: { x: number, y: number } = { x: 0, y: 0 };
const selector = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0 });
const cursorClass = ref<string>('');
const styler = ref<StyleSheetController>(styleSheetController());
const rootId = ref<string>('content');
let wheel: Wheel | undefined;

function offset2Root() { // === props.context.workspace.root
    let el = root.value as HTMLElement;
    let x = el.offsetLeft
    let y = el.offsetTop
    el = el.offsetParent as HTMLElement;
    while (el) {
        x += el.offsetLeft
        y += el.offsetTop
        el = el.offsetParent as HTMLElement;
    }
    return { x, y }
}

function rootRegister(mount: boolean) {
    if (mount) {
        const id = (uuid().split('-').at(-1)) || 'content';
        rootId.value = id;
    } else {
        rootId.value = 'content';
    }
    workspace.value.setRootId(rootId.value);
}

function setMousedownOnPageXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x; //页面坐标系上的点
    mousedownOnPageXY.y = xy.y;
    mousedownOnClientXY.x = clientX - x; // 用户端可视区上的点
    mousedownOnClientXY.y = clientY - y;
}

function getMouseOnPageXY(e: MouseEvent): XY { // 获取鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    return matrix.inverseCoord(clientX - x, clientY - y);
}

function addShape(frame: ShapeFrame) { // 根据当前编辑器的action新增图形
    const type = ResultByAction(workspace.value.action);
    if (type === ShapeType.Artboard) {
        frame.width = workspace.value.frameSize.width;
        frame.height = workspace.value.frameSize.height;
        const { x, y } = landFinderOnPage(matrix as Matrix, workspace.value.root.center, frame.width, frame.height, props.context.selection.selectedPage?.childs as Shape[]);
        frame.x = x;
        frame.y = y;
    }
    const page = props.context.selection.selectedPage;
    const parent = props.context.selection.getClosetArtboard(mousedownOnPageXY);
    if (page && parent && type) {
        const editor = props.context.editor4Page(page);
        let name = t(`shape.${type}`);
        const brothers = parent.childs.filter((item: Shape) => item.type === type)
        const repeats: number = brothers.length;
        name = (repeats && brothers[0]) ? `${name} ${repeats + 1}` : name;
        const shape = editor.create(type, name, frame);
        const s = editor.insert((parent as any), parent.childs.length, shape);
        props.context.selection.selectShape(shape)
        if (s) {
            return s;
        }
    }
}
function onMouseWheel(e: WheelEvent) {
    const xy = offset2Root();
    const { ctrlKey, metaKey, shiftKey, deltaMode } = e;
    const offsetX = e.x - xy.x;
    const offsetY = e.y - xy.y;
    e.preventDefault();
    if (deltaMode === 0) {
        if (ctrlKey || metaKey) { // 缩放
            if (Number((props.context.workspace.matrix.toArray()[0] * 100).toFixed(0)) <= 2) {
                scale_delta_ = 1
            } else {
                scale_delta_ = 1 / scale_delta;
            }
            matrix.trans(-offsetX, -offsetY);
            matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
            matrix.trans(offsetX, offsetY);
        } else {
            const delta = e.deltaY > 0 ? -wheel_step : wheel_step;
            if (shiftKey) {
                matrix.trans(delta, 0);
            } else {
                matrix.trans(0, delta);
            }
        }
    }
    workspace.value.matrixTransformation();
}

function onKeyDown(e: KeyboardEvent) {
    if (e.code === KeyboardKeys.Space) {
        spacePressed.value = true;
        props.context.workspace.setCtrl('page');
    }

}
function onKeyUp(e: KeyboardEvent) {
    if (spacePressed.value && e.code == KeyboardKeys.Space) {
        const action: Action = props.context.workspace.action;
        if (action.startsWith('add')) {
            setClass('cross-0');
        } else {
            setClass('auto-0');
        }
        spacePressed.value = false;
        props.context.workspace.setCtrl('controller');
    }
}

function pageEditorOnMoveEnd(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    const deltaX = Math.abs(x - mousedownOnPageXY.x);
    const deltaY = Math.abs(y - mousedownOnPageXY.y);
    const shapeFrame = new ShapeFrame(x, y, deltaX, deltaY);

    const diff = Math.hypot(deltaX, deltaY);
    if (diff > dragActiveDis) {
        // 抬起之前存在拖动
        if (newShape) {
            props.context.repo.commit({});
            newShape = undefined;
            workspace.value.setAction(Action.AutoV);
            workspace.value.creating(false);
        } else {
            selector.value = false;
        }
    } else {
        // 抬起之前未存在拖动
        shapeFrame.height = 100;
        shapeFrame.width = 100;
        const action = workspace.value.action;
        if (action.startsWith('add')) { // 存在action
            // 添加shape
            addShape(shapeFrame);
            workspace.value.setAction(Action.AutoV);
        } else if (action === Action.AutoV) {
            // 选择图层
            // getShapesByXY(); // 获取与鼠标点击位置相交的所有图层，并选择最上层的图层  ---不再在这里选择图形了，改到selection
            if (!props.context.selection.hoveredShape) {
                props.context.selection.selectShape();
            }
        }
    }
    setClass('auto-0');
}
function pageEditOnMoving(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    if (newShape) {
        if (wheel) {
            const isOut = wheel.moving(e);
            if (!isOut) {
                newFrame(newShape, { x, y });
            }
        } else {
            newFrame(newShape, { x, y });
        }
    } else {
        const deltaX = x - mousedownOnPageXY.x;
        const deltaY = y - mousedownOnPageXY.y;
        const diff = Math.hypot(deltaX, deltaY);
        if (diff > dragActiveDis) {
            const shapeFrame = new ShapeFrame(x, y, 3, 3);
            newShape = addShape(shapeFrame);
            props.context.selection.selectShape(newShape);
            props.context.repo.start('customFrameInsert', {});
            workspace.value.creating(true);
        }
    }
}
function newFrame(shape: Shape, point: XY) {
    if (shape.type === ShapeType.Line) {
        const { x: sx, y: sy } = mousedownOnPageXY;
        const { x: px, y: py } = point;
        if (shape.isFlippedHorizontal) {
            if ((px - sx) > 0) {
                shape.flipHorizontal();
            }
        } else {
            if ((px - sx) < 0) {
                shape.flipHorizontal()
            }
        }
        if (shape.isFlippedVertical) {
            if ((py - sy) > 0) {
                shape.flipVertical();
            }
        } else {
            if ((py - sy) < 0) {
                shape.flipVertical();
            }
        }
        const height = Math.abs(py - sy);
        const width = Math.abs(px - sx);
        expandTo(shape, width, height);
    } else {
        const { x: sx, y: sy } = mousedownOnPageXY;
        const { x: px, y: py } = point;
        const x1 = { x: Math.min(sx, px), y: Math.min(sy, py) };
        const x2 = { x: Math.max(sx, px), y: Math.max(sy, py) };
        const height = x2.y - x1.y;
        const width = x2.x - x1.x;
        expandTo(shape, width, height);
        translateTo(shape, x1.x, x1.y);
    }

    props.context.repo.transactCtx.fireNotify();
}
function workspaceUpdate(t?: number, name?: string) { // 更新编辑器状态，包括光标状态、是否正在进行图形变换
    if (t === WorkSpace.CURSOR_CHANGE) {
        if (name !== undefined) {
            setClass(name);
        }
        return;
    } else if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        matrix.reset(workspace.value.matrix);
    } else if (t === WorkSpace.RESET_CURSOR) {
        setClass('auto-0');
    } else if (t === WorkSpace.INSERT_FRAME) {
        insertFrame();
    }
    const action: Action = props.context.workspace.action;
    if (action.startsWith('add')) {
        setClass('cross-0');
    } else {
        setClass('auto-0');
    }
}

async function setClass(name: string) {
    const _n = await styler.value.getClass(name);
    cursorClass.value = _n;
}

function insertFrame() {
    const x = 600
    const y = 400
    const width = 100;
    const height = 100;
    const shapeFrame = new ShapeFrame(x, y, width, height);
    const artboard = addShape(shapeFrame);
    // 新增容器之后使容器在可视区域
    if (artboard) nextTick(() => { scrollToContentView(artboard, props.context.selection, props.context.workspace) });
    workspace.value.setAction(Action.AutoV);
}

function hoveredShape(e: MouseEvent) {
    if (props.context.workspace.transforming) return; // shapes编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    const shapes = props.context.selection.getShapesByXY_beta(xy, false); // xy: PageXY
    const hoveredShape = shapes.reverse()[0]; // 确保shapes的长度等于0或者1，如果大于1说明在找到的情况下还继续遍历了
    if (hoveredShape) {
        // console.log('--', shapes.length);
        props.context.selection.hoverShape(hoveredShape);
    } else {
        props.context.selection.unHoverShape();
    }
}

function pageViewDragStart(e: MouseEvent) {
    // setClass('grabbing-0');
    state = STATE_CHECKMOVE;
    prePt.x = e.screenX;
    prePt.y = e.screenY;
}

function pageViewDragging(e: MouseEvent) {
    const isController = workspace.value.controller == 'page';
    if (isController) {
        const dx = e.screenX - prePt.x;
        const dy = e.screenY - prePt.y;
        if (state === STATE_MOVEING) {
            matrix.trans(dx, dy);
            prePt.x = e.screenX;
            prePt.y = e.screenY;
        } else {
            const diff = Math.hypot(dx, dy);
            if (diff > dragActiveDis) {
                state = STATE_MOVEING;
                matrix.trans(dx, dy);
                prePt.x = e.screenX;
                prePt.y = e.screenY;
            }
        }
    }
}

function pageViewDragEnd() {
    // setClass('grab-0');
    state = STATE_NONE;
}

function contextMenuMount(e: MouseEvent) {
    const workspace = props.context.workspace
    workspace.menuMount(false);
    site.x = e.clientX
    site.y = e.clientY
    const { x, y } = offset2Root();
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    setMousedownOnPageXY(e); // 更新鼠标定位
    const shapes = props.context.selection.getShapesByXY(mousedownOnPageXY);
    contextMenuItems = ['paste', 'copy'];
    if (!shapes.length) {
        contextMenuItems = ['all', 'copy', 'paste', 'half', 'hundred', 'double', 'canvas', 'cursor', 'comment', 'ruler', 'pixel', 'operation'];
    } else if (shapes.length === 1) {
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'un_group', 'component', 'instance', 'reset', 'edit'];
        props.context.selection.selectShape(shapes[shapes.length - 1]);
    } else if (shapes.length > 1) {
        const isCommon = hasCommon(props.context.selection.selectedShapes, shapes);
        if (!isCommon) {
            props.context.selection.selectShape(shapes[shapes.length - 1]);
        }
        shapesContainsMousedownOnPageXY.length = 0;
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'layers', 'groups', 'container', 'un_group', 'component', 'instance', 'reset', 'edit'];
    }
    contextMenu.value = true;
    document.addEventListener('keydown', esc);
    nextTick(() => {
        if (contextMenuEl.value) {
            const el = contextMenuEl.value.menu;
            surplusY.value = document.documentElement.clientHeight - site.y;
            if (el) {
                const height = el.offsetHeight;
                if (surplusY.value - 30 < height) {
                    surplusY.value = document.documentElement.clientHeight - site.y - 30;
                    el.style.top = contextMenuPosition.y + surplusY.value - height + 'px';
                }
            }

        }
    })

    function hasCommon(arr1: any[], arr2: any[]) {
        const arr = [];
        for (let i = 0; i < arr1.length; i++) {
            arr[i] = arr1[i].__uuid;
        }
        for (let i = 0; i < arr2.length; i++) {
            if (arr.includes(arr2[i].__uuid)) return true;
        }
        return false;
    }
}
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') contextMenuUnmount();
}
async function stylerForCursorMount() {
    await styler.value.setup();
    cursorClass.value = await styler.value.getClass('auto-0');
}
function contextMenuUnmount() {
    document.removeEventListener('keydown', esc);
    contextMenu.value = false;
}
function select(e: MouseEvent) {
    if (props.context.workspace.select) {
        createSelector(e);
    } else {
        const { clientX, clientY } = e;
        const root = offset2Root();
        const { x: cx, y: cy } = { x: clientX - root.x, y: clientY - root.y };
        const { x: sx, y: sy } = mousedownOnClientXY;
        const dx = cx - sx;
        const dy = cy - sy;
        const diff = Math.hypot(dx, dy);
        if (diff > 3 * dragActiveDis) {
            props.context.workspace.selecting(true);
        }
    }

}
function createSelector(e: MouseEvent) { // 创建一个selector框选器
    const { clientX, clientY } = e;
    const { x: rx, y: ry } = offset2Root();
    const { x: mx, y: my } = { x: clientX - rx, y: clientY - ry };
    const { x: sx, y: sy } = mousedownOnClientXY;
    const left = Math.min(sx, mx);
    const right = Math.max(mx, sx);
    const top = Math.min(my, sy);
    const bottom = Math.max(my, sy);
    selectorFrame.value.top = top;
    selectorFrame.value.left = left;
    selectorFrame.value.width = right - left;
    selectorFrame.value.height = bottom - top;
    selector.value = true;
}
// mouse event flow 
function onMouseDown(e: MouseEvent) {
    if (workspace.value.transforming) return; // 当图形变换过程中不再接收新的鼠标点击事件
    if (e.button === MOUSE_LEFT) { // 左键按下
        if (spacePressed.value) {
            pageViewDragStart(e);
        } else {
            setMousedownOnPageXY(e); // 记录鼠标点下的位置（相对于page）
            wheel = fourWayWheel(props.context, { rolling: forNewShape }, mousedownOnPageXY);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        isMouseLeftDown = true;
    } else if (e.button === MOUSE_RIGHT) { // 右键按下
        contextMenuMount(e);
        e.stopPropagation()
    }
}
function onMouseMove(e: MouseEvent) {
    if (e.button === MOUSE_LEFT) { // 这里应该有问题，后期观察，不用按下也会触发？
        if (isMouseLeftDown) {
            if (spacePressed.value) {
                pageViewDragging(e); // 拖拽页面
            } else {
                if (workspace.value.action !== Action.AutoV) {
                    pageEditOnMoving(e); // 新增图形、切片                    
                } else {
                    select(e); // 选区
                }
            }
        } else {
            hoveredShape(e);
        }
    }
}

function onMouseUp(e: MouseEvent) {
    if (e.button === MOUSE_LEFT) {
        if (spacePressed.value) {
            pageViewDragEnd();
        } else {
            pageEditorOnMoveEnd(e);
            if (props.context.workspace.select) {
                props.context.workspace.selecting(false);
                selector.value = false;
            }
            if (wheel) wheel = wheel.remove();
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        isMouseLeftDown = false;
    }
}
function onMouseLeave() {
    props.context.selection.unHoverShape();
}
function windowBlur() {
    if (isMouseLeftDown) {
        isMouseLeftDown = false;
    }
    if (newShape) { // 在造图形，被打断
        props.context.repo.commit({});
        newShape = undefined;
        workspace.value.setAction(Action.AutoV);
    }
    if (props.context.workspace.select) {
        props.context.workspace.selecting(false);
    }
    if (wheel) wheel = wheel.remove();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// hooks
function initMatrix(cur: Page) {
    let info = matrixMap.get(cur.id)
    if (!info) {
        const m = new Matrix();
        m.trans(-cur.frame.x, -cur.frame.y)
        info = { m, x: cur.frame.x, y: cur.frame.y }
        matrixMap.set(cur.id, info)
    }
    matrix.reset(info.m.toArray())
}
const stopWatch = watch(() => props.page, (cur, old) => {
    old.unwatch(watcher)
    cur.watch(watcher)

    let info = matrixMap.get(old.id);
    info!.m.reset(matrix.toArray())

    initMatrix(cur)
})
onMounted(async () => { // 身负重担的content view
    initMatrix(props.page);
    props.context.workspace.watch(workspaceUpdate);
    props.page.watch(watcher);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener('blur', windowBlur);
    stylerForCursorMount();
    rootRegister(true);
    props.context.selection.scoutMount(); // 用于hover判定
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.page.unwatch(watcher);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener('blur', windowBlur);
    styler.value.remove();
    rootRegister(false);
    stopWatch();
    props.context.selection.scout?.remove();
})
renderinit().then(() => {
    inited.value = true;
})
</script>

<template>
    <div v-if="inited" :class="cursorClass" :data-area="rootId" ref="root" :reflush="reflush !== 0 ? reflush : undefined"
        @wheel="onMouseWheel" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toArray()" />
        <SelectionView :is-controller="selectionIsCtrl" :context="props.context" :matrix="matrix.toArray()" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @mousedown.stop
            :context="props.context" @close="contextMenuUnmount" :site="site" ref="contextMenuEl">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenuUnmount" :site="site">
            </PageViewContextMenuItems>
        </ContextMenu>
        <Selector v-if="selector" :selector-frame="selectorFrame" :context="props.context"></Selector>
    </div>
</template>

<style scoped lang="scss">
div {
    background-color: var(--center-content-bg-color);
}
</style>