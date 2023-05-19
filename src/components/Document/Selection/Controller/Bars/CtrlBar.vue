<script lang="ts" setup>
import { Context } from '@/context';
import { defineProps, defineEmits, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { CtrlElementType } from '@/context/workspace';
import { XY } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { getBarStyle } from '@/utils/rectFn'
interface Props {
    context: Context,
    ctrlType: CtrlElementType,
    rotate: number,
    width: number,
    height: number
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'transform', type: CtrlElementType, p1: XY, p2: XY): void
}>();
const matrix = new Matrix();
const workspace = computed(() => props.context.workspace);
const dragActiveDis = 3;
let isDragging = false;
let startPosition = { x: 0, y: 0 };
let root = { x: 0, y: 0 };
let scaling: boolean = false;
let barStyle: string = '';

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
        workspace.value.setCtrl('controller');
        event.stopPropagation();
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
    const mouseOnPage = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        emit('transform', props.ctrlType, startPosition, mouseOnPage);
        props.context.repo.transactCtx.fireNotify();
        startPosition = { ...mouseOnPage };
    } else {
        if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            props.context.repo.start('transform', {});
        }
    }
}
function onMouseUp(event: MouseEvent) {
    if (event.button === 0) {
        workspace.value.setCtrl('page');
        if (isDragging) {
            props.context.repo.commit({});
        }
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setStatus(false);
        workspace.value.resetCursor();
    }
}
function mouseleave() {
    if (scaling) return;
    workspace.value.resetCursor();
}
function mousemove() {
    if (scaling) return;
    workspace.value.setCursor(props.ctrlType, props.rotate);
}
function windowBlur() {
    if (isDragging) {
        setStatus(false);
        props.context.repo.commit({});
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        workspace.value.resetCursor();
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
        border-bottom: 1px solid #2561D9;
        top: 7px;
        box-sizing: border-box;
    }
}
</style>
