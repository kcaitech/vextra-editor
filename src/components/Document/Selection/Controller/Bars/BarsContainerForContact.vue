<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncContactEditor, ContactType, Matrix, Shape, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    cFrame: Point[]
}
interface Slice {
    type: 'hor' | 'ver'
    apex1: { x: number, y: number }
    apex2: { x: number, y: number }
    bar: { x: number, y: number }
    sliceIndex: number
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const show = ref<boolean>(false);
const contact = ref<boolean>(false);
const data: { slices: Slice[] } = reactive({ slices: [] });
let slices = data.slices;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let contactEditor: AsyncContactEditor | undefined;
let move: any;
let search: boolean = false;

const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_slice_path();
}
function update_slice_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    show.value = false;
    if (props.shape.type !== ShapeType.Contact) return;
    const points = props.shape.getPoints();
    for (let i = 0, len = points.length; i < len; i++) {
        
    }
    const m = new Matrix(matrix), f = props.shape.frame;
    m.preScale(f.width, f.height);
}

function update_contact_bar() {
    contact.value = false;
    const contact_apex = props.context.tool.contactApex;
    if (contact_apex) {

        contact.value = true;
    }
}
function point_mousedown(event: MouseEvent) {
    if (event.button !== 0) return;
    event.stopPropagation();
    props.context.menu.menuMount();
    const workspace = props.context.workspace;
    workspace.setCtrl('controller');
    const root = workspace.root;
    startPosition = { x: event.clientX - root.x, y: event.clientY - root.y };
    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove;
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && contactEditor) {
        startPosition.x = mouseOnClient.x, startPosition.y = mouseOnClient.y;
        const p = submatrix.computeCoord2(mouseOnClient.x, mouseOnClient.y);

    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
            const page = props.context.selection.selectedPage;
            contactEditor = props.context.editor.controller().asyncContactEditor(props.shape, page!);
        }
    }
}
function point_mouseup(event: MouseEvent) {
    if (event.button !== 0) return;
    if (isDragging) {
        isDragging = false;
    }
    if (search) {
        search = false;
    }
    if (contactEditor) {
        contactEditor.close();
        contactEditor = undefined;
    }
    if (contact.value) {
        contact.value = false;
    }
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', point_mouseup);
    const workspace = props.context.workspace;
    workspace.scaling(false);
    workspace.rotating(false);
    workspace.setCtrl('page');
}


function window_blur() {
    const workspace = props.context.workspace;
    if (isDragging) {
        isDragging = false;
    }
    if (search) {
        search = false;
    }
    if (contactEditor) {
        contactEditor.close();
        contactEditor = undefined;
    }
    if (contact.value) {
        contact.value = false;
    }
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
<template></template>
<style lang='scss' scoped></style>