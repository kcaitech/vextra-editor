<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncMultiAction, CtrlElementType, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from '../../SelectionView.vue';
import { Navi } from '@/context/navigate';
import { update_dot } from './common';
import { getAngle } from '@/utils/common';
interface Props {
    matrix: number[]
    context: Context
    frame: Point[]
    axle: { x: number, y: number }
}
interface Dot {
    point: { x: number, y: number }
    extra: { x: number, y: number }
    r: { p: string, transform: string }
    type: CtrlElementType
    type2: CtrlElementType
}
const props = defineProps<Props>();
const matrix = new Matrix();
const data: { dots: Dot[] } = reactive({ dots: [] });
const { dots } = data;
const rotating = ref<boolean>(false);
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
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    dots.length = 0;
    dots.push(...update_dot(props.frame, 0, matrix));
}
function point_mousedown(event: MouseEvent, ele: CtrlElementType) {
    if (event.button !== 0) return;
    props.context.menu.menuMount()
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
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    if (isDragging) {
        rotating.value = true;
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        const { x: ax, y: ay } = props.axle;
        let deg = getAngle([ax, ay, sx, sy], [ax, ay, mx, my]) || 0;
        if (asyncMultiAction) {
            // workspace.scaling(true);
            // const m = new Matrix(workspace.matrix);
            // const p1OnPage: PageXY = m.inverseCoord(startPosition.x, startPosition.y);
            // const p2Onpage: PageXY = m.inverseCoord(mouseOnClient.x, mouseOnClient.y);
            if (cur_ctrl_type.endsWith('rotate')) {
                const mr = new Matrix(workspace.matrix);
                const root_axle = mr.inverseCoord(ax, ay); // 中心点在root的位置
                const r = new Matrix();
                r.rotate(deg * (Math.PI / 180), root_axle.x, root_axle.y); // 控件旋转矩阵
                asyncMultiAction.executeRotate(deg, r);
            } else {
                // asyncMultiAction.executeScale();
            }
        }
        startPosition = { ...mouseOnClient };
    } else {
        if (Math.hypot(mouseOnClient.x - startPosition.x, mouseOnClient.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
            const shapes = props.context.selection.selectedShapes;
            const page = props.context.selection.selectedPage;
            asyncMultiAction = props.context.editor.controller().asyncMultiEditor(shapes, page!);
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button === 0) {
        if (isDragging) {
            if (asyncMultiAction) {
                asyncMultiAction.close();
                asyncMultiAction = undefined;
            }
            isDragging = false;
            rotating.value = false;
        }
        document.removeEventListener('mousemove', point_mousemove);
        document.removeEventListener('mouseup', point_mouseup);
        const workspace = props.context.workspace;
        workspace.scaling(false);
        workspace.setCtrl('page');
        props.context.cursor.reset();
    }
}
function window_blur() {
    if (isDragging) isDragging = false;
    if (asyncMultiAction) {
        asyncMultiAction.close();
        asyncMultiAction = undefined;
        const navi = props.context.navi;
        navi.set_sl_freeze(false);
        navi.notify(Navi.SHAPELIST_UPDATE);
    }
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.setCtrl('page');
}
function setCursor(t: CtrlElementType, force?: boolean) {
    const cursor = props.context.cursor;
    let deg = 0;
    if (t === CtrlElementType.RectLT) {
        deg = deg + 45;
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectLTR) {
        deg = deg + 180;
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectRT) {
        deg = deg + 135;
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectRTR) {
        deg = deg + 270;
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectRB) {
        deg = deg + 45;
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectRBR) {
        deg = deg + 45;
        cursor.setType(`rotate-${deg}`, force);
    } else if (t === CtrlElementType.RectLB) {
        deg = deg + 135;
        cursor.setType(`scale-${deg}`, force);
    } else if (t === CtrlElementType.RectLBR) {
        deg = deg + 90;
        cursor.setType(`rotate-${deg}`, force);
    }
}
function point_mouseenter(t: CtrlElementType) {
    setCursor(t);
}
function point_mouseleave() {
    const cursor = props.context.cursor;
    cursor.setType('auto-0');
}
watch(() => props.matrix, update)

onMounted(() => {
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g>
        <g v-for="(p, i) in dots" :key="i" :style="`transform: ${p.r.transform};`">
            <path :d="p.r.p" fill="transparent" stroke="none" @mousedown.stop="(e) => point_mousedown(e, p.type2)"
                @mouseenter="() => point_mouseenter(p.type2)" @mouseleave="point_mouseleave">
            </path>
            <rect :x="p.extra.x" :y="p.extra.y" width="14px" height="14px" fill="transparent" stroke='transparent'
                @mousedown.stop="(e) => point_mousedown(e, p.type)" @mouseenter="() => point_mouseenter(p.type)"
                @mouseleave="point_mouseleave"></rect>
            <rect :x="p.point.x" :y="p.point.y" width="8px" height="8px" fill="#ffffff" stroke='#865dff'
                stroke-width="1.5px" @mousedown.stop="(e) => point_mousedown(e, p.type)"
                @mouseenter="() => point_mouseenter(p.type)" @mouseleave="point_mouseleave"></rect>
        </g>
    </g>
    <rect :style="`opacity: ${rotating ? 1 : 0};`" :x="props.axle.x" :y="props.axle.y" width="10px" height="10px"
        fill="pink" rx="5px" ry="5px" stroke='#fff' stroke-width="1.5px"></rect>
</template>