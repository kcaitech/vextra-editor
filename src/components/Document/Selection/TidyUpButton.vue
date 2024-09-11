<script setup lang="ts">
import { Context } from '@/context';
import { permIsEdit } from '@/utils/common';
import { getSelectedWidthHeight, layoutSpacing, tidyUpShapesOrder } from '@/utils/tidy_up';
import { onMounted, onUnmounted, ref } from 'vue';
import { Point } from './SelectionView.vue';
import { Selection } from '@/context/selection';
interface Props {
    context: Context
    controllerFrame: Point[];
}
const props = defineProps<Props>();
const isHover = ref(false);
const isTidyUp = ref(true);

const tidyUp = () => {
    const selected = props.context.selection.selectedShapes;
    const { width, height } = getSelectedWidthHeight(props.context, selected);

    const shapes = tidyUpShapesOrder(selected, height > width);
    const frame = layoutSpacing(shapes);

    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.tidyUpShapesLayout(shapes, frame.hor, frame.ver);
}


const mousemove = () => {
    if (props.context.workspace.transforming || !permIsEdit(props.context) || props.context.tool.isLable) {
        return isHover.value = false;
    }

    isHover.value = true;
}

const tidyUpControl = () => {
    isTidyUp.value = props.context.selection.isTidyUp;
}
const selectedWatcher = (t: string | number) => {
    if (t === Selection.NEED_TIDY_UP) {
        tidyUpControl();
    }
}

onMounted(() => {
    props.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.context.selection.watch(selectedWatcher);
})
</script>

<template>
    <div class="button" v-if="isHover && isTidyUp"
        :style="{ transform: `translate(${controllerFrame[2].x - 32}px, ${controllerFrame[2].y - 32}px)` }">
        <svg-icon icon-class="white-tidy-up"></svg-icon>
    </div>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="100"
        height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <path @mousemove="mousemove" @mouseleave="isHover = false"
            :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
            fill="transparent" />
        <rect v-if="isHover && isTidyUp" :x="controllerFrame[2].x - 32" :y="controllerFrame[2].y - 32" width="24" height="24"
            fill="transparent" @mousemove="mousemove" @mousedown.stop @mouseup.stop="tidyUp"></rect>
    </svg>
</template>

<style scoped lang="scss">
.button {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: #1878F5;
    display: flex;
    align-items: center;
    justify-content: center;

    >svg {
        width: 14px;
        height: 14px;
    }
}
</style>