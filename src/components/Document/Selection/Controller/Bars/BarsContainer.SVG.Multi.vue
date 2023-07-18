<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncMultiAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { sort_by_layer } from '@/utils/group_ungroup';
import { Navi } from '@/context/navigate';
interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    frame: Point[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const paths = ref<string[]>([]);
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncMultiAction | undefined = undefined;
let cur_ctrl_type: CtrlElementType = CtrlElementType.RectLT;
const dragActiveDis = 3;

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    const valve = props.context.workspace.shouldSelectionViewUpdate;
    if (!valve) return;
    paths.value.length = 0;
    let apex = props.frame.map(p => { return { x: p.x, y: p.y } });
    apex.push(apex[0]);
    for (let i = 0; i < apex.length - 1; i++) {
        paths.value.push(get_bar_path(apex[i], apex[i + 1]));
    }
}
function get_bar_path(s: { x: number, y: number }, e: { x: number, y: number }): string {
    return `M ${s.x} ${s.y} L ${e.x} ${e.y} z`;
}
function selection_watcher(t?: number) { }
// mouse event flow: down -> move -> up
function bar_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button === 0) {
        event.stopPropagation();
        cur_ctrl_type = ele;
        const workspace = props.context.workspace;
        workspace.setCtrl('controller');
        const { clientX, clientY } = event;
        matrix.reset(workspace.matrix);
        const root = workspace.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y }
        document.addEventListener('mousemove', bar_mousemove);
        document.addEventListener('mouseup', bar_mouseup);
    }
}
function bar_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const { clientX, clientY } = event;
    const mouseOnPage: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        if (asyncBaseAction) {
            matrix.reset(workspace.matrix);
            const p1OnPage: PageXY = matrix.inverseCoord(startPosition.x, startPosition.y); // page
            const p2Onpage: PageXY = matrix.inverseCoord(mouseOnPage.x, mouseOnPage.y);
            asyncBaseAction.execute(cur_ctrl_type, p1OnPage, p2Onpage);
        }
        startPosition = { ...mouseOnPage };
    } else {
        if (Math.hypot(mouseOnPage.x - startPosition.x, mouseOnPage.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            const shapes: Shape[] = sort_by_layer(props.context, props.context.selection.selectedShapes);
            props.context.navi.set_sl_freeze(true);
            asyncBaseAction = props.context.editor.controller().asyncMultiEditor(shapes, props.context.selection.selectedPage!);
        }
    }
}
function bar_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        const workspace = props.context.workspace;
        workspace.setCtrl('page');
        if (isDragging) {
            if (asyncBaseAction) {
                const s = asyncBaseAction.close();
                asyncBaseAction = undefined;
                if (s) {
                    props.context.selection.rangeSelectShape(s);
                }
                props.context.navi.set_sl_freeze(false);
                props.context.navi.notify(Navi.SHAPELIST_UPDATE);
            }
            isDragging = false;
        }
        document.removeEventListener('mousemove', bar_mousemove);
        document.removeEventListener('mouseup', bar_mouseup);
    }
}
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
        <path :d="paths[0]" fill="none" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectTop)">
        </path>
        <path :d="paths[0]" fill="none" stroke='transparent' style="cursor: ns-resize;" stroke-width="14px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectTop)">
        </path>
        <path :d="paths[1]" fill="none" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectRight)">
        </path>
        <path :d="paths[1]" fill="none" stroke='transparent' style="cursor: ew-resize;" stroke-width="14px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectRight)">
        </path>
        <path :d="paths[2]" fill="none" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectBottom)">
        </path>
        <path :d="paths[2]" fill="none" stroke='transparent' style="cursor: ns-resize;" stroke-width="14px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectBottom)">
        </path>
        <path :d="paths[3]" fill="none" stroke='#865dff' stroke-width="1.5px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectLeft)">
        </path>
        <path :d="paths[3]" fill="none" stroke='transparent' style="cursor: ew-resize;" stroke-width="14px"
            @mousedown.stop="(e) => bar_mousedown(e, CtrlElementType.RectLeft)">
        </path>
    </g>
</template>
<style lang='scss' scoped></style>