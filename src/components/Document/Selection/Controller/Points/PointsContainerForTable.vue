<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncBaseAction, CtrlElementType, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { Action } from '@/context/tool';
import { PointType } from '@/context/assist';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    axle: { x: number, y: number }
    cFrame: Point[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let asyncBaseAction: AsyncBaseAction | undefined = undefined;
let pointType: PointType = 'lt';
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
const scale_btn_transform = ref<string>('translate(0, 0)');
const trans_btn_transform = ref<string>('translate(0, 0)');

const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_transform();
}
function update_transform() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    const frame = props.shape.frame;
    let lt = matrix.computeCoord(0, 0);
    let rb = matrix.computeCoord(frame.width, frame.height);
    trans_btn_transform.value = `translate(${lt.x - 20}, ${lt.y - 20})`
    scale_btn_transform.value = `translate(${rb.x + 1}, ${rb.y + 1})`;
}

function point_mousedown(event: MouseEvent) {
    if (event.button !== 0) return;
    //todo
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
}
function point_mousemove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: clientX - root.x, y: clientY - root.y };
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = mouseOnClient;
    if (isDragging && asyncBaseAction) {
        const action = props.context.tool.action;
        const p1: PageXY = submatrix.computeCoord(startPosition.x, startPosition.y);
        let p2: PageXY = submatrix.computeCoord(mouseOnClient.x, mouseOnClient.y);
        if (event.shiftKey || props.shape.constrainerProportions || action === Action.AutoK) {
            p2 = get_t(p1, p2);
            asyncBaseAction.executeScale(CtrlElementType.RectRB, p2);
        } else {
            scale(asyncBaseAction, p2);
        }
        startPosition = { ...mouseOnClient };
    } else {
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            submatrix.reset(workspace.matrix.inverse);
            asyncBaseAction = props.context.editor.controller().asyncRectEditor(props.shape, props.context.selection.selectedPage!);
            props.context.assist.setTransTarget([props.shape]);
            isDragging = true;
        }
    }
}
function get_t(p1: PageXY, p2: PageXY): PageXY {
    const m = props.shape.matrix2Root();
    p1 = m.inverseCoord(p1.x, p1.y), p2 = m.inverseCoord(p2.x, p2.y);
    const pre_delta = { x: p2.x - p1.x, y: p2.y - p1.y }, f = props.shape.frame, r = f.width / f.height;
    return m.computeCoord(f.width + pre_delta.x, f.height + pre_delta.x * (1 / r));
}
function scale(asyncBaseAction: AsyncBaseAction, p2: PageXY) {
    const stickness = props.context.assist.stickness;
    const target = props.context.assist.point_match(props.shape, pointType);
    if (target) {
        if (stickedX) {
            if (Math.abs(p2.x - sticked_x_v) > stickness) stickedX = false;
            else p2.x = sticked_x_v;
        } else if (target.sticked_by_x) {
            p2.x = target.x;
            sticked_x_v = p2.x;
            stickedX = true;
        }
        if (stickedY) {
            if (Math.abs(p2.y - sticked_y_v) > stickness) stickedY = false;
            else p2.y = sticked_y_v;
        } else if (target.sticked_by_y) {
            p2.y = target.y;
            sticked_y_v = p2.y;
            stickedY = true;
        }
    }
    asyncBaseAction.executeScale(CtrlElementType.RectRB, p2);
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
}
function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        props.context.assist.reset();
        isDragging = false;
    }
    if (asyncBaseAction) asyncBaseAction = asyncBaseAction.close();
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
    document.removeEventListener('mousemove', point_mousemove);
    document.removeEventListener('mouseup', point_mouseup);
}
watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g :transform="trans_btn_transform" @mousedown.stop>
        <rect x="0" y="0" width="18px" height="18px" rx="2" ry="2" fill="#865dff" fill-opacity="0.25" stroke="none"></rect>
        <svg t="1692178735834" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10180"
            width="12" height="12" x="3px" y="3px">
            <path
                d="M0 0h256v256H0V0z m384 0h256v256h-256V0zM768 0H1024v256h-256V0zM0 768h256V1024H0v-256z m384 0h256V1024h-256v-256z m384 0H1024V1024h-256v-256zM0 384h256v256H0v-256z m384 0h256v256h-256v-256z m384 0H1024v256h-256v-256z"
                fill="#865dff" p-id="10181"></path>
        </svg>
    </g>
    <g :transform="scale_btn_transform" @mousedown.stop>
        <rect x="0" y="0" width="18px" height="18px" rx="2" ry="2" fill="#865dff" fill-opacity="0.25" stroke="none"></rect>
        <svg t="1692177601146" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4010"
            width="12" height="12" x="3px" y="3px">
            <path fill="#865dff"
                d="M927.232 689.664a25.6 25.6 0 0 0-29.184 5.888l-64.512 64.256-244.736-245.76 246.016-245.504L898.304 332.8c5.888 5.888 11.776 5.888 23.296 5.888h5.888c11.776 0 17.664-11.776 17.664-23.296l64.512-269.056a52.736 52.736 0 0 0-5.888-29.184C998.4 5.376 986.368 5.376 974.592 11.264l-269.056 64c-11.776 0-17.664 11.776-23.296 17.408a43.776 43.776 0 0 0 5.888 29.184l64.256 64.512-246.016 245.504-222.208-222.464 58.624-46.848a37.888 37.888 0 0 0 11.776-29.184c0-11.776-11.776-17.664-17.408-23.296L73.728 22.272c-11.776-5.888-17.664 0-29.184 5.888a44.8 44.8 0 0 0-11.776 29.184L73.472 332.8c0 11.776 5.888 17.664 17.408 23.296H102.4a21.504 21.504 0 0 0 17.664-5.888l76.8-64.256 227.84 228.352-222.976 221.696-46.592-58.624A44.8 44.8 0 0 0 125.696 665.6c-11.776 0-17.664 11.776-23.296 17.408L14.336 947.2c-5.888 11.776 0 17.664 5.888 29.184a30.464 30.464 0 0 0 23.296 11.776h5.888L324.352 947.2c11.776 0 17.664-5.888 23.296-17.408a25.6 25.6 0 0 0-5.888-29.184l-64.256-76.8 228.352-227.84 245.504 246.016-64.512 64.256a25.6 25.6 0 0 0-5.888 29.184c5.888 11.776 11.776 17.664 23.296 17.664L972.8 1017.344h5.888c5.888 0 17.664-5.888 23.296-5.888a25.6 25.6 0 0 0 5.888-29.184L944.64 713.216c0-11.776-11.776-17.664-17.408-23.296z"
                p-id="4011">
            </path>
        </svg>
    </g>
</template>
<style lang='scss' scoped></style>