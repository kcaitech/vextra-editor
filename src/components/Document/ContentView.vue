<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { reactive, defineProps, onMounted, onUnmounted, watchEffect, computed, ref } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './Selection/SelectionView.vue';
import { AbsolutePosition } from '@/context/selection';
import { init as renderinit } from '@/render';
import { Action, CursorType, KeyboardKeys } from '@/context/workspace';
import ContextMenu from '../common/ContextMenu.vue';
import PageViewContextMenuItems from './Selection/PageViewContextMenuItems.vue';
import { Shape } from '@kcdesign/data/data/typesdefine';
const props = defineProps<{
    context: Context,
    page: Page,
}>();
const workspace = computed(() => props.context.workspace);
const width = 800;
const height = 600;
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
const matrixMap = new Map<string, Matrix>();
let savePageId: string = "";
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const cursor = ref<CursorType>(CursorType.Auto);
const inited = ref(false);
const root = ref<HTMLDivElement>();
const mousedownOnPageXY: AbsolutePosition = { x: 0, y: 0 }; // 鼠标在page中的坐标
const shapesContainsMousedownOnPageXY: Shape[] = [];
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
    const transX = matrix.toArray()[4];
    const transY = matrix.toArray()[5];
    mousedownOnPageXY.x = clientX - x - transX;
    mousedownOnPageXY.y = clientY - y - transY;
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

const viewBox = () => {
    const frame = props.page.frame;
    const expandBox = 0;
    const x = frame.x - expandBox;
    const y = frame.y - expandBox;
    const width = frame.width + 2 * expandBox;
    const height = frame.height + 2 * expandBox;
    return { x, y, width: Math.max(800, width), height: Math.max(600, height) };
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
    if (e.button === MOUSE_LEFT) {
        if (spacePressed) {
            pageViewDragStart(e);
        } else {
            setMousedownOnPageXY(e);
            getShapesByXY();
        }
    } else if (e.button === MOUSE_RIGHT) {
        contextMenuMount(e);
    }

}
function pageViewDragStart(e: MouseEvent) {
    cursor.value = CursorType.Grabbing;
    state = STATE_CHECKMOVE;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    prePt.x = e.screenX;
    prePt.y = e.screenY;
}
function getShapesByXY() {
    const shapes = props.context.selection.getShapesByXY(mousedownOnPageXY);
    if (shapes.length) props.context.selection.selectShape(shapes[shapes.length - 1]);
}
function contextMenuMount(e: MouseEvent) {
    const { x, y } = offset2Root();
    contextMenuPosition.x = e.clientX - x;
    contextMenuPosition.y = e.clientY - y;
    contextMenu.value = true;
}
function onMouseMove(e: MouseEvent) {
    e.preventDefault();
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
function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    if (spacePressed) {
        cursor.value = CursorType.Grab;
    } else {
        cursor.value = CursorType.Auto;
    }
    state = STATE_NONE;
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}
function workspaceUpdate() {
    const action: Action = props.context.workspace.action;
    if (action.startsWith('add')) {
        cursor.value = CursorType.Crosshair
    } else {
        cursor.value = CursorType.Auto
    }
}

// hooks
watchEffect(() => {
    const id = props.page.id;
    if (savePageId.length > 0 && id != savePageId) {
        let m = matrixMap.get(savePageId);
        if (m) m.reset(matrix.toArray());
    }
    savePageId = id;
    let m = matrixMap.get(id);
    if (!m) {
        m = new Matrix();
        matrixMap.set(id, m);
    }
    matrix.reset(m);
})
onMounted(() => {
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
})
renderinit().then(() => {
    inited.value = true;
})
</script>

<template>
    <div v-if="inited" ref="root" :style="{ cursor }" :reflush="reflush !== 0 ? reflush : undefined" @wheel="onMouseWheel"
        @mousedown="onMouseDown">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toString()" :viewbox="viewBox()"
            :width="width" :height="height"></PageView>
        <SelectionView :context="props.context" :matrix="matrix.toArray()" :viewbox="viewBox()" :width="width"
            :height="height"></SelectionView>
        <ContextMenu v-if="contextMenu" :x="contextMenuPosition.x" :y="contextMenuPosition.y" @close="contextMenu = false;">
            <PageViewContextMenuItems></PageViewContextMenuItems>
        </ContextMenu>
    </div>
</template>

<style scoped lang="scss">
div {
    background-color: var(--center-content-bg-color);
    position: relative;

    .menu-options {
        width: 100%;
    }
}
</style>