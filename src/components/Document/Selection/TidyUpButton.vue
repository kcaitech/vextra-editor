<script setup lang="ts">
import { Context } from '@/context';
import { permIsEdit } from '@/utils/common';
import { getSelectedWidthHeight, layoutSpacing, tidyUpShapesOrder } from '@/utils/tidy_up';
import { onMounted, onUnmounted, ref } from 'vue';
import { Point } from './SelectionView.vue';
import { Selection } from '@/context/selection';
import { ColVector3D, makeShapeTransform2By1, Matrix, ShapeView } from '@kcdesign/data';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
    controllerFrame: Point[];
}
const props = defineProps<Props>();
const isHover = ref(false);
const isTidyUp = ref(true);
const dots = ref<{ x: number, y: number, dot: boolean }[]>([]);
const horLines = ref<Point[]>([]);
const verLines = ref<Point[]>([]);

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

const tidyUpDot = () => {
    const shapes = props.context.selection.selectedShapes;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const matrix = new Matrix();
        const matrix2 = new Matrix(props.context.workspace.matrix);
        matrix.reset(matrix2);
        const shape_root_m = shape.matrix2Root();
        const m = makeShapeTransform2By1(shape_root_m).clone();
        const clientTransform = makeShapeTransform2By1(matrix2);
        m.addTransform(clientTransform); //root到视图
        const { x, y, width, height } = shape.frame;
        const { col0, col1, col2 } = m.transform([
            ColVector3D.FromXY((x + width) / 2, (y + height) / 2),
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY((x + width), (y + height)),
        ]);
        dots.value.push({ x: col0.x, y: col0.y, dot: (col2.x - col1.x) < 45 || (col2.y - col1.y) < 45 });
    }
}

const tidyUpLine = () => {
    const selected = props.context.selection.selectedShapes;
    const { width, height } = getSelectedWidthHeight(props.context, selected);
    const shape_rows = tidyUpShapesOrder(selected, height > width);
}
const tidyUpHorLine = (shapes: ShapeView[][]) => {

}
const tidyUpVerLine = (shapes: ShapeView[][]) => {

}

const update = () => {
    horLines.value = [];
    verLines.value = [];
    dots.value = [];
    if (props.context.workspace.transforming || !permIsEdit(props.context) || props.context.tool.isLable) {
        return;
    }
    tidyUpDot();
    tidyUpLine();
}

const tidyUpControl = () => {
    isTidyUp.value = props.context.selection.isTidyUp;
    tidyUpDot();
}
const selectedWatcher = (t: string | number) => {
    if (t === Selection.NEED_TIDY_UP) {
        tidyUpControl();
    }
}

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    } else if (t === WorkSpace.TRANSLATING) {
        update();
    }
}

onMounted(() => {
    props.context.selection.watch(selectedWatcher);
    props.context.workspace.watch(workspaceWatcher);
})
onUnmounted(() => {
    props.context.selection.watch(selectedWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
    <div class="button" v-if="isHover && isTidyUp"
        :style="{ transform: `translate(${controllerFrame[2].x - 32}px, ${controllerFrame[2].y - 32}px)` }">
        <svg-icon icon-class="white-tidy-up"></svg-icon>
    </div>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="1"
        fill="none" height="1" viewBox="0 0 1 1" style="transform: translate(0px, 0px); position: absolute;"
        @mousemove="mousemove" @mouseleave="isHover = false">
        <path
            :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
            fill="transparent" />
        <g v-if="!isTidyUp && !isHover">
            <circle v-for="(dot, index) in dots" :key="index" :cx="dot.x" :cy="dot.y" r="2.5" fill="#D13BCD"
                stroke="#FFFFFF" stroke-width="1" />
        </g>
        <g v-if="!isTidyUp && isHover">
            <g v-for="(dot, index) in dots" :key="index">
                <circle v-if="dot.dot" :cx="dot.x" :cy="dot.y" r="2.5" fill="#D13BCD" stroke="#FFFFFF"
                    stroke-width="1" />
                <g v-else>
                    <circle :cx="dot.x" :cy="dot.y" r="6" fill="transparent" stroke="#FFFFFF" stroke-width="1" />
                    <circle :cx="dot.x" :cy="dot.y" r="4" fill="transparent" stroke="#FFFFFF" stroke-width="1" />
                    <circle class="hovered" :cx="dot.x" :cy="dot.y" r="5" fill="transparent" stroke="#D13BCD"
                        stroke-width="1" />
                </g>
            </g>
        </g>

        <rect v-if="isHover && isTidyUp" :x="controllerFrame[2].x - 32" :y="controllerFrame[2].y - 32" width="24"
            height="24" fill="transparent" @mousemove="mousemove" @mousedown.stop @mouseup.stop="tidyUp"></rect>
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

.hovered {
    &:hover {
        fill: #D13BCD;
    }
}
</style>