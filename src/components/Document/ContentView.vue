<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { reactive, defineProps, onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import { AbsolutePosition } from '@/context/selection';
import { init as renderinit } from '@/render';
import { Action, CtrlElementType, CursorType, KeyboardKeys, ResultByAction, WorkSpace } from '@/context/workspace';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from './Selection/PageViewContextMenuItems.vue';
import { ShapeType } from '@kcdesign/data/data/typesdefine';
import { Shape } from "@kcdesign/data/data/shape";
import { ShapeFrame } from '@kcdesign/data/data/baseclasses';
import { useI18n } from 'vue-i18n';
import { cursorHandle } from "@/utils/common"

type ContextMenuEl = InstanceType<typeof ContextMenu>;

const { t } = useI18n();
const props = defineProps<{
    context: Context,
    page: Page,
}>();
const workspace = computed(() => props.context.workspace);
const scale_delta = 1.02;
const scale_delta_ = 1 / scale_delta;
const wheel_step = 10;
const spacePressed = ref<boolean>(false);
const STATE_NONE = 0;
const STATE_CHECKMOVE = 1;
const STATE_MOVEING = 2;
const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const contextMenu = ref<boolean>(false);
const contextMenuPosition: AbsolutePosition = reactive({ x: 0, y: 0 });
let state = STATE_NONE;
// 拖动 3px 后开始触发移动
const dragActiveDis = 3;
const prePt: { x: number, y: number } = { x: 0, y: 0 };
const matrix = reactive(props.context.workspace.matrix);
const matrixMap = new Map<string, { m: Matrix, x: number, y: number }>();
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const cursor = ref<string>(CursorType.Auto);
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnPageXY: AbsolutePosition = { x: 0, y: 0 }; // 鼠标在page中的坐标
let shapesContainsMousedownOnPageXY: Shape[] = [];
let contextMenuItems: string[] = [];
let isMouseDown: boolean = false;
const selectionIsCtrl = computed(() => !spacePressed.value);

const contextMenuEl = ref<ContextMenuEl>();
const surplusY = ref<number>(0)
function offset2Root() {
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
function setMousedownOnPageXY(e: MouseEvent) {
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x;
    mousedownOnPageXY.y = xy.y;
}
function getMouseOnPageXY(e: MouseEvent): AbsolutePosition {
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    return matrix.inverseCoord(clientX - x, clientY - y);
}
function addShape(frame: ShapeFrame) {
    const type = ResultByAction(workspace.value.action);
    if (type === ShapeType.Artboard) {
        frame.width = workspace.value.frameSize.width
        frame.height = workspace.value.frameSize.height
    }

    const page = props.context.selection.selectedPage;
    const parent = getCloestContainer();
    if (page && parent && type) {
        const editor = props.context.editor4Page(page);
        let name = t(`shape.${type}`);
        const repeats: number = parent.childs.filter(item => item.type === type).length;
        name = repeats ? `${name} ${repeats + 1}` : name;
        const shape = editor.create(type, name, frame);
        const insertSuccess = editor.insert(parent, 0, shape);
        if (insertSuccess) {
            props.context.selection.selectShape(shape);
            workspace.value.setAction(Action.AutoV);
            return shape;
        }
    }
}
function getCloestContainer() {
    return props.context.selection.getClosetContainer(mousedownOnPageXY);
}
function onMouseWheel(e: WheelEvent) {
    const xy = offset2Root();
    const offsetX = e.x - xy.x;
    const offsetY = e.y - xy.y;
    if (e.ctrlKey) {
        e.preventDefault();
        matrix.trans(-offsetX, -offsetY);
        matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
        matrix.trans(offsetX, offsetY);
    } else if (e.shiftKey) {
        matrix.trans(e.deltaY > 0 ? -wheel_step : wheel_step, 0);
    } else {
        matrix.trans(0, e.deltaY > 0 ? -wheel_step : wheel_step);
    }
    props.context.workspace.notify();
}

function onKeyDown(e: KeyboardEvent) {
    spacePressed.value = e.code === KeyboardKeys.Space;
    if (spacePressed.value && cursor.value === CursorType.Auto) {
        cursor.value = CursorType.Grab;
    }
}
function onKeyUp(e: KeyboardEvent) {
    if (spacePressed.value && e.code == KeyboardKeys.Space) {
        const action: Action = props.context.workspace.action;
        if (action.startsWith('add')) {
            cursor.value = CursorType.Crosshair
        } else {
            cursor.value = CursorType.Auto
        }
        spacePressed.value = false;
    }
}
function onMouseDown(e: MouseEvent) {
    if (workspace.value.transforming) return;
    e.preventDefault();
    isMouseDown = true;
    if (e.button === MOUSE_LEFT) { // 左键按下
        if (spacePressed.value) {
            pageViewDragStart(e);
        } else {
            setMousedownOnPageXY(e); // 记录鼠标点下的位置（相对于page）
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else if (e.button === MOUSE_RIGHT) { // 右键按下
        contextMenuMount(e);
    }
}
function onMouseMove(e: MouseEvent) {
    if (isMouseDown) {
        e.preventDefault();
        if (spacePressed.value) {
            pageViewDragging(e);
        } else {
            // pageEditOnMoving(e);
            workspace.value.translating(true);
        }
    } else {
        hoveredShape(e);
    }

}
function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    if (workspace.value.transforming && e.button) return;
    // 现有情况，不是拖动pageview，便是操作图层
    if (spacePressed.value) {
        pageViewDragEnd();
    } else {
        pageEditorOnMoveEnd(e);
        workspace.value.translating(false);
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    isMouseDown = false;
}
function onMouseLeave() {
    props.context.selection.unHoverShape();
}
function pageEditorOnMoveEnd(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    const deltaX = Math.abs(x - mousedownOnPageXY.x);
    const deltaY = Math.abs(y - mousedownOnPageXY.y);
    const shapeFrame = new ShapeFrame(x, y, deltaX, deltaY);

    const diff = Math.hypot(deltaX, deltaY);
    if (diff > dragActiveDis) {
        // todo 抬起之前存在拖动
        shapeFrame.height = deltaY;
        shapeFrame.width = deltaX;
        shapeFrame.x = mousedownOnPageXY.x;
        shapeFrame.y = mousedownOnPageXY.y;
        const action = workspace.value.action;
        if (action.startsWith('add')) {
            // todo 添加shape
            addShape(shapeFrame);
        }
    } else {
        // 抬起之前未存在拖动
        shapeFrame.height = 100;
        shapeFrame.width = 100;
        const action = workspace.value.action;
        if (action.startsWith('add')) {
            // todo 添加shape
            addShape(shapeFrame);
        } else if (action === Action.AutoV) {
            // 选择图层
            getShapesByXY(); // 获取与鼠标点击位置相交的所有图层，并选择最上层的图层
        }
    }
    cursor.value = CursorType.Auto;
}
function pageEditOnMoving(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    const deltaX = Math.abs(x - mousedownOnPageXY.x);
    const deltaY = Math.abs(y - mousedownOnPageXY.y);
    const diff = Math.hypot(deltaX, deltaY);
    if (diff > dragActiveDis) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        const shapeFrame = new ShapeFrame(x, y, 3, 3);
        const shape = addShape(shapeFrame);
        if (!shape) return;
        isMouseDown = false;
        props.context.workspace.relay({ shape, startPositon: { x, y }, systemPositon: { x: e.clientX, y: e.clientY } })
    }
}
async function workspaceUpdate(t?: number, ct?: CtrlElementType, rotate?: number) {
    if (t === WorkSpace.CURSOR_CHANGE && ct && rotate !== undefined) {
        cursor.value = await cursorHandle(ct, rotate);
        return;
    }
    if (t === WorkSpace.RESET_CURSOR) {
        cursor.value = CursorType.Auto;
        return;
    }
    if (t === WorkSpace.INSERT_FRAME) {
        const x = 600
        const y = 400
        const width = 100;
        const height = 100;
        const shapeFrame = new ShapeFrame(x, y, width, height);
        addShape(shapeFrame);
    }
    const action: Action = props.context.workspace.action;
    if (action.startsWith('add')) {
        cursor.value = CursorType.Crosshair
    } else {
        cursor.value = CursorType.Auto
    }
}
function hoveredShape(e: MouseEvent) {
    if (props.context.workspace.transforming) return; // shapes编辑过程中不再判断其他未选择的shape的hover状态
    const { clientX, clientY } = e;
    const { x, y } = offset2Root();
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    const shapes = props.context.selection.getShapesByXY(xy);
    const hoveredShape = shapes.reverse().find(s => s.type && s.type !== ShapeType.Artboard);
    if (hoveredShape) {
        props.context.selection.hoverShape(hoveredShape);
    } else {
        props.context.selection.unHoverShape();
    }
}
function pageViewDragStart(e: MouseEvent) {
    cursor.value = CursorType.Grabbing;
    state = STATE_CHECKMOVE;
    prePt.x = e.screenX;
    prePt.y = e.screenY;
}
function pageViewDragging(e: MouseEvent) {
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
function pageViewDragEnd() {
    cursor.value = CursorType.Grab;
    state = STATE_NONE;
}
function getShapesByXY() {
    const shapes = props.context.selection.getShapesByXY(mousedownOnPageXY);
    if (shapes.length) {
        props.context.selection.selectShape(shapes.at(-1));
    } else {
        props.context.selection.selectShape();
    }
}
let site: { x: number, y: number } = { x: 0, y: 0 };
function contextMenuMount(e: MouseEvent) {
    site.x = e.clientX
    site.y = e.clientY
    const { x, y } = offset2Root();
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    setMousedownOnPageXY(e); // 更新鼠标定位
    const shapes = props.context.selection.getShapesByXY(mousedownOnPageXY);
    contextMenuItems = ['paste', 'copy'];
    if (!shapes.length) {
        contextMenuItems = ['paste'];
    } else if (shapes.length === 1) {
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom'];
        props.context.selection.selectShape(shapes[shapes.length - 1]);
    } else if (shapes.length > 1) {
        const isCommon = hasCommon(props.context.selection.selectedShapes, shapes);
        if (!isCommon) {
            props.context.selection.selectShape(shapes[shapes.length - 1]);
        }
        shapesContainsMousedownOnPageXY.length = 0;
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems = ['paste', 'copy', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'layers'];
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
                    surplusY.value = document.documentElement.clientHeight - site.y - 30
                    el.style.top = contextMenuPosition.y + surplusY.value - height + 'px'
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
function contextMenuUnmount() {
    document.removeEventListener('keydown', esc);
    contextMenu.value = false;
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
onMounted(() => {
    initMatrix(props.page)
    props.context.workspace.watch(workspaceUpdate);
    props.page.watch(watcher);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.page.unwatch(watcher);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    stopWatch();
})
renderinit().then(() => {
    inited.value = true;
})
</script>

<template>
    <div v-if="inited" ref="root" :style="{ cursor }" :reflush="reflush !== 0 ? reflush : undefined" @wheel="onMouseWheel"
        @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toArray()" />
        <SelectionView :is-controller="selectionIsCtrl" :context="props.context" :matrix="matrix.toArray()" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @close="contextMenuUnmount"
            :site="site" ref="contextMenuEl">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenuUnmount" :site="site">
            </PageViewContextMenuItems>
        </ContextMenu>
    </div>
</template>

<style scoped lang="scss">
div {
    background-color: var(--center-content-bg-color);
}
</style>