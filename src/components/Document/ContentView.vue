<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { reactive, defineProps, onMounted, onUnmounted, watchEffect, computed, ref, watch } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import { AbsolutePosition } from '@/context/selection';
import { init as renderinit } from '@/render';
import { Action, CursorType, KeyboardKeys, ResultByAction } from '@/context/workspace';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from './Selection/PageViewContextMenuItems.vue';
import { ShapeType } from '@kcdesign/data/data/typesdefine';
import { Shape } from "@kcdesign/data/data/shape";
import { ShapeFrame } from '@kcdesign/data/data/baseclasses';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
    context: Context,
    page: Page,
}>();
const workspace = computed(() => props.context.workspace);
const scale_delta = 1.2;
const scale_delta_ = 1 / scale_delta;
const wheel_step = 10;
let spacePressed = false;
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
const matrix = reactive(new Matrix());
const matrixMap = new Map<string, {m: Matrix, x: number, y: number}>();
// let savePageId: string = "";
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const cursor = ref<CursorType>(CursorType.Auto);
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnPageXY: AbsolutePosition = { x: 0, y: 0 }; // 鼠标在page中的坐标
let shapesContainsMousedownOnPageXY: Shape[] = [];
let contextMenuItems: string[] = [];
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
    const page = props.context.selection.selectedPage;
    if (page && type) {
        const editor = props.context.editor4Page(page);
        let name = t(`shape.${ShapeType.Rectangle}`);
        const repeats: number = page.childs.filter(item => item.type === ShapeType.Rectangle).length;
        name = repeats ? `${name} ${repeats + 1}` : name;
        const shape = editor.create(type, name, frame);
        const insertSuccess = editor.insert(page, 0, shape);
        if (insertSuccess) {
            props.context.selection.selectShape(shape);
            workspace.value.setAction(Action.Auto);
        }
    }
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
}

function onKeyDown(e: KeyboardEvent) {
    spacePressed = e.code === KeyboardKeys.Space;
    if (spacePressed && cursor.value === CursorType.Auto) {
        cursor.value = CursorType.Grab;
    }
}
function onKeyUp(e: KeyboardEvent) {
    if (spacePressed && e.code == KeyboardKeys.Space) {
        cursor.value = CursorType.Auto;
        spacePressed = false;
    }
}
function onMouseDown(e: MouseEvent) {
    e.preventDefault();
    if (e.button === MOUSE_LEFT) { // 左键按下
        if (spacePressed) {
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
    e.preventDefault();
    if (spacePressed) {
        pageViewDragging(e);
    }
}
function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    // 现有情况，不是拖动pageview，便是操作图层
    if (spacePressed) {
        pageViewDragEnd();
    } else {
        pageEditorOnMoveEnd(e);
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}
function pageEditorOnMoveEnd(e: MouseEvent) {
    const { x, y } = getMouseOnPageXY(e);
    const deltaX = Math.abs(x - mousedownOnPageXY.x);
    const deltaY = Math.abs(y - mousedownOnPageXY.y);
    const shapeFrame = new ShapeFrame(x, y, deltaX, deltaY);

    const diff = Math.hypot(deltaX, deltaY);
    if (diff > dragActiveDis) {
        // todo 抬起之前存在拖动
    } else {
        // 抬起之前未存在拖动
        shapeFrame.height = 100;
        shapeFrame.width = 100;
        const action = workspace.value.action;
        if (action.startsWith('add')) {
            // todo 添加shape
            addShape(shapeFrame);
        } else if (action === Action.Auto) {
            // 选择图层
            getShapesByXY(); // 获取与鼠标点击位置相交的所有图层，并选择最上层的图层
        }
    }
    cursor.value = CursorType.Auto;
}
function workspaceUpdate() {
    const action: Action = props.context.workspace.action;
    if (action.startsWith('add')) {
        cursor.value = CursorType.Crosshair
    } else {
        cursor.value = CursorType.Auto
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
    if (shapes.length) props.context.selection.selectShape(shapes[shapes.length - 1]);
}
function contextMenuMount(e: MouseEvent) {
    const { x, y } = offset2Root();
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    const shapes = props.context.selection.getShapesByXY(mousedownOnPageXY);
    contextMenuItems = ['paste', 'copy'];
    if (shapes.length > 1) {
        shapesContainsMousedownOnPageXY.length = 0;
        shapesContainsMousedownOnPageXY = shapes;
        contextMenuItems.push('layers');
    }
    contextMenu.value = true;
}

// hooks
function initMatrix(cur: Page) {
    let info = matrixMap.get(cur.id)
    if (!info) {
        const m = new Matrix();
        m.trans(-cur.frame.x, -cur.frame.y)
        info = {m, x: cur.frame.x, y: cur.frame.y}
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
        @mousedown="onMouseDown">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toArray()" />
        <SelectionView :context="props.context" :matrix="matrix.toArray()" />
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @close="contextMenu = false;">
            <PageViewContextMenuItems :items="contextMenuItems" :layers="shapesContainsMousedownOnPageXY"
                :context="props.context" @close="contextMenu = false;">
            </PageViewContextMenuItems>
        </ContextMenu>
    </div>
</template>

<style scoped lang="scss">
div {
    background-color: var(--center-content-bg-color);
    position: relative;
}
</style>