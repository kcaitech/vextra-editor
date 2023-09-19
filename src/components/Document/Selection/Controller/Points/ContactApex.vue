<script setup lang='ts'>
import { Context } from '@/context';
import { AsyncContactEditor, ContactForm, ContactShape, ContactType, GroupShape, Matrix, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, reactive, ref } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { get_apexs } from './common';
import { Tool } from '@/context/tool';
import { get_contact_environment } from '@/utils/contact';

interface Props {
    matrix: number[]
    context: Context
    shape: Shape
    cFrame: Point[]
}
interface Apex {
    point: { x: number, y: number }
    type: 'from' | 'to'
}

const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = new Matrix();
const apex = ref<boolean>(false);
const contact = ref<boolean>(false);
const data: { apex1: Apex, apex2: Apex } = reactive({ apex1: { point: { x: 0, y: 0 }, type: 'from' }, apex2: { point: { x: 0, y: 0 }, type: 'to' } });
const contact_points = ref<{ type: ContactType, point: ClientXY }[]>([]);

let { apex1, apex2 } = data;
let startPosition: ClientXY = { x: 0, y: 0 };
let isDragging = false;
let contactEditor: AsyncContactEditor | undefined;
let move: any;
let search: boolean = false;
let move_type: 'from' | 'to' = 'to';
let clear_target: { apex: ContactForm, p: PageXY } | undefined;

const dragActiveDis = 3;
function update() {
    matrix.reset(props.matrix);
    update_dot_path();
}
function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) return;
    apex.value = false;
    const result = get_apexs(props.shape as ContactShape, matrix);
    if (!result) return;
    apex.value = true, apex1 = result.apex1, apex2 = result.apex2
}

function update_contact_apex() {
    const contact_apex = props.context.tool.contactApex;
    contact.value = false;
    if (contact_apex) {
        const m2r = contact_apex.matrix2Root(), wm = props.context.workspace.matrix, f = contact_apex.frame;
        m2r.multiAtLeft(wm);
        const points: { type: ContactType, point: ClientXY }[] = [
            { type: ContactType.Top, point: { x: f.width / 2, y: 0 } },
            { type: ContactType.Right, point: { x: f.width, y: f.height / 2 } },
            { type: ContactType.Bottom, point: { x: f.width / 2, y: f.height } },
            { type: ContactType.Left, point: { x: 0, y: f.height / 2 } },
        ]
        for (let i = 0; i < 4; i++) {
            points[i].point = m2r.computeCoord3(points[i].point);
        }
        contact_points.value = points;
        contact.value = true;
    }
}
function point_mousedown(event: MouseEvent, type: 'from' | 'to') {
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
    move_type = type;
}
function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;
    const root = workspace.root;
    const mouseOnClient: ClientXY = { x: event.clientX - root.x, y: event.clientY - root.y };
    if (isDragging && contactEditor) {
        startPosition.x = mouseOnClient.x, startPosition.y = mouseOnClient.y;
        if (search) search_apex(event);
        const p = submatrix.computeCoord2(mouseOnClient.x, mouseOnClient.y);
        if (move_type === 'from') {
            contactEditor.modify_contact_from(p, clear_target);
        } else if (move_type === 'to') {
            contactEditor.modify_contact_to(p, clear_target);
        }
        migrate(props.shape);
    } else {
        const { x: sx, y: sy } = startPosition;
        const { x: mx, y: my } = mouseOnClient;
        if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
            clear_target = undefined;
            isDragging = true;
            submatrix.reset(workspace.matrix.inverse);
            search = true;
            const page = props.context.selection.selectedPage;
            contactEditor = props.context.editor.controller().asyncContactEditor(props.shape, page!);
            contactEditor.pre();
        }
    }
}
function migrate(shape: Shape) {
    const points = shape.getPoints();
    const environment = get_contact_environment(props.context, shape, points);
    if (shape.parent?.id !== environment.id && contactEditor) {
        contactEditor.migrate(environment as GroupShape);
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
function search_apex(e: MouseEvent) {
    const { x, y } = props.context.workspace.root;
    const xy = submatrix.computeCoord2(e.clientX - x, e.clientY - y);
    const shapes = props.context.selection.getContactByXY(xy);
    if (shapes.length) {
        props.context.tool.setContactApex(shapes[0]);
    } else {
        props.context.tool.resetContactApex();
    }
}
function enter_new_node(contactType: ContactType, p: PageXY) {
    const contactApex = props.context.tool.contactApex;
    if (!contactApex) return;
    const cf = new ContactForm(contactType, contactApex.id);
    clear_target = { apex: cf, p };
    if (contactEditor) {
        if (move_type === 'from') {
            contactEditor.modify_contact_from(p, clear_target);
        } else if (move_type === 'to') {
            contactEditor.modify_contact_to(p, clear_target);
        }
    }
}
function leave_new_node(p: PageXY) {
    clear_target = undefined;
    if (contactEditor) {
        if (move_type === 'from') {
            contactEditor.modify_contact_from(p, undefined);
        } else if (move_type === 'to') {
            contactEditor.modify_contact_to(p, undefined);
        }
    }
}
function tool_watcher(t: number) {
    if (t === Tool.CHANGE_CONTACT_APEX) update_contact_apex();
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
    props.context.tool.watch(tool_watcher);
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    update();
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <g v-if="apex">
        <rect :x="apex1.point.x - 8" :y="apex1.point.y - 8" rx="8" ry="8" height="16" width="16"
            @mousedown.stop="(e) => point_mousedown(e, apex1.type)" class="point">
        </rect>
        <rect :x="apex2.point.x - 8" :y="apex2.point.y - 8" rx="8" ry="8" height="16" width="16"
            @mousedown.stop="(e) => point_mousedown(e, apex2.type)" class="point">
        </rect>
    </g>
    <g v-if="contact">
        <rect v-for="(p, idx) in contact_points" @mousemove.stop :key="idx" class="contact-point" rx="8px" ry="8px"
            :x="p.point.x - 8" :y="p.point.y - 8" @mouseenter="() => { enter_new_node(p.type, p.point) }"
            @mouseleave="() => { leave_new_node(p.point) }">
        </rect>
    </g>
</template>
<style lang='scss' scoped>
.point {
    width: 16px;
    height: 16px;
    fill: #fff;
    stroke: var(--active-color);
    stroke-width: 2px;
}

.point:hover {
    width: 16px;
    height: 16px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}
</style>