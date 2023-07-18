<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncMultiAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { Navi } from '@/context/navigate';
import { sort_by_layer } from '@/utils/group_ungroup';
import { update_dot } from './common';
interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    frame: Point[]
    axle: { x: number, y: number }
}
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { dots: { point: { x: number, y: number }, extra: { x: number, y: number }, r: { p: string, transform: string }, type: CtrlElementType, type2: CtrlElementType }[] } = reactive({ dots: [] });
const { dots } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncMultiAction: AsyncMultiAction | undefined = undefined;
const dragActiveDis = 3;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    const valve = props.context.workspace.shouldSelectionViewUpdate;
    if (!valve) return;
    dots.length = 0;
    dots.push(...update_dot(props.frame, 0, matrix));
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button === 0) {
        const workspace = props.context.workspace;
        event.stopPropagation();
        workspace.setCtrl('controller');
        const { clientX, clientY } = event;
        matrix.reset(workspace.matrix);
        const root = workspace.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        cur_ctrl_type = ele;
        document.addEventListener('mousemove', point_mousemove);
        document.addEventListener('mouseup', point_mouseup);
    }
}
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        if (asyncMultiAction) {
            workspace.scaling(true);
            matrix.reset(workspace.matrix);
            const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y);
            const p2Onpage: PageXY = matrix.inverseCoord(mouseOnClient.x, mouseOnClient.y);
            asyncMultiAction.execute(cur_ctrl_type, p1OnPage, p2Onpage, 0, 'scale');
        }
        props.context.workspace.setSelectionViewUpdater(true);
        props.context.workspace.selectionViewUpdate();
        startPosition = { ...mouseOnClient };
    } else {
        if (Math.hypot(mouseOnClient.x - startPosition.x, mouseOnClient.y - startPosition.y) > dragActiveDis) {
            const shapes: Shape[] = sort_by_layer(props.context, props.context.selection.selectedShapes);
            props.context.navi.set_sl_freeze(true);
            isDragging = true;
            asyncMultiAction = props.context.editor.controller().asyncMultiEditor(shapes, props.context.selection.selectedPage!);
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        const workspace = props.context.workspace;
        if (isDragging) {
            if (asyncMultiAction) {
                const shapes = asyncMultiAction.close();
                asyncMultiAction = undefined;
                if (shapes) {
                    props.context.selection.rangeSelectShape(shapes);
                }
                props.context.navi.set_sl_freeze(false);
                props.context.navi.notify(Navi.SHAPELIST_UPDATE);
            }
            isDragging = false;
        }
        document.removeEventListener('mousemove', point_mousemove);
        document.removeEventListener('mouseup', point_mouseup);
        workspace.scaling(false);
        workspace.setCtrl('page');
    }
}

function selection_watcher(t?: number) { }
watch(() => props.matrix, () => {
    update();
})
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    props.context.selection.watch(selection_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <g>
        <g v-for="(p, i) in dots" :key="i">
            <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
                :style="`transform: ${p.r.transform}; cursor: pointer`">
            </path>
            <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
                @mousedown.stop="(e) => point_mousedown(e, p.type)"></rect>
            <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#865dff'
                stroke-width="1.5px" @mousedown.stop="(e) => point_mousedown(e, p.type)"></rect>
        </g>
    </g>
</template>
<style lang='scss' scoped></style>