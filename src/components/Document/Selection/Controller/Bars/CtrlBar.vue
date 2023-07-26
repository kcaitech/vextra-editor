<script lang="ts" setup>
import { Context } from '@/context';
import { computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { Matrix } from '@kcdesign/data';
import { getBarStyle } from '@/utils/rectFn';
import { AsyncBaseAction, CtrlElementType } from "@kcdesign/data";
import { Shape } from '@kcdesign/data';
import { PageXY, ClientXY } from '@/context/selection';
interface Props {
    context: Context,
    ctrlType: CtrlElementType,
    rotate: number,
    width: number,
    height: number
}
const props = defineProps<Props>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
let isDragging = false;
let startPosition: ClientXY = { x: 0, y: 0 };
let root = { x: 0, y: 0 };
let scaling: boolean = false;
let barStyle: string = '';
let asyncBaseAction: AsyncBaseAction | undefined = undefined;

function setStatus(s: boolean) {
    scaling = s;
    if (scaling) {
        props.context.selection.unHoverShape();
    }
    workspace.value.scaling(scaling);
}

// mouse event flow: down -> move -> up
function onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
        props.context.menu.menuMount()
        event.stopPropagation();
        workspace.value.setCtrl('controller');
        const { clientX, clientY } = event;
        setStatus(true);
        matrix.reset(workspace.value.matrix);
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}
function onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const mouseOnPage: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        if (asyncBaseAction) {
            matrix.reset(workspace.value.matrix);
            const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y); // page
            const p2Onpage: PageXY = matrix.inverseCoord(mouseOnPage.x, mouseOnPage.y);
            asyncBaseAction.execute(props.ctrlType, p1OnPage, p2Onpage);
        }
        startPosition = { ...mouseOnPage };
    } else {
        if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            const shapes: Shape[] = props.context.selection.selectedShapes;
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(shapes, props.context.selection.selectedPage!);
        }
    }
}
function onMouseUp(event: MouseEvent) {
    if (event.button === 0) {
        workspace.value.setCtrl('page');
        if (isDragging) {
            if (asyncBaseAction) {
                asyncBaseAction = asyncBaseAction.close();
            }
            isDragging = false;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setStatus(false);
    }
}
function mouseleave() {
    if (scaling) return;
}
function mousemove() {
    if (scaling) return;
}
function windowBlur() {
    if (isDragging) {
        if (asyncBaseAction) {
            asyncBaseAction = asyncBaseAction.close();
        }
        setStatus(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        isDragging = false;
    }
}
onMounted(() => {
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    window.removeEventListener('blur', windowBlur);
})
watchEffect(() => {
    barStyle = getBarStyle(props.ctrlType, props.width, props.height);
})
</script>
<template>
    <div ref="barContainer" class="bar-container" :style="barStyle" @mousedown="onMouseDown" @mousemove="mousemove"
        @mouseleave="mouseleave">
        <div class="bar"></div>
    </div>
</template>
<style scoped lang="scss">
.bar-container {
    position: absolute;
    height: 15px;
    transform-origin: left 50%;

    .bar {
        width: 100%;
        position: absolute;
        height: 1px;
        border-bottom: 1.5px solid #2561D9;
        top: 7px;
        box-sizing: border-box;
    }
}
</style>
