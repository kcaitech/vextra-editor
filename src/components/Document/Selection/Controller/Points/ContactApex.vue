/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import {
    adapt2Shape,
    AsyncContactEditor,
    ContactForm,
    ContactLineView,
    ContactShape,
    ContactType,
    GroupShape,
    Matrix,
    Shape,
    ShapeType,
    ShapeView
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ClientXY, PageXY } from '@/context/selection';
import { Point } from "../../SelectionView.vue";
import { get_apexs } from './common';
import { Tool } from '@/context/tool';
import { get_contact_environment } from '@/utils/contact';

interface Props {
    matrix: number[]
    context: Context
    shape: ContactLineView
    cFrame: Point[]
}

interface Apex {
    point: { x: number, y: number }
    type: 'from' | 'to'
}

interface FAT {
    from: Shape | undefined,
    to: Shape | undefined
}

const props = defineProps<Props>();
const matrix = new Matrix();
const apex = ref<boolean>(false);
const contact = ref<boolean>(false);
const data: { apex1: Apex, apex2: Apex } = reactive({
    apex1: { point: { x: 0, y: 0 }, type: 'from' },
    apex2: { point: { x: 0, y: 0 }, type: 'to' }
});
const contact_points = ref<{ type: ContactType, point: ClientXY }[]>([]);
const fromOrTo = ref<FAT>()

let { apex1, apex2 } = data;
let isDragging = false;
let contactEditor: AsyncContactEditor | undefined;
let move: any;
let search: boolean = false;
let move_type: 'from' | 'to' = 'to';
let clear_target: { apex: ContactForm, p: PageXY } | undefined;

const dragActiveDis = 3;
let downXY = { x: 0, y: 0 };

function update() {
    matrix.reset(props.matrix);
    update_dot_path();
    fromOrTo.value = props.shape.apexes as FAT
}

function update_dot_path() {
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    apex.value = false;
    const result = get_apexs(props.shape as ContactLineView, matrix);
    if (!result) {
        return;
    }
    apex.value = true;
    apex1 = result.apex1;
    apex2 = result.apex2;
}

function update_contact_apex() {
    contact.value = false;
    contact_points.value.length = 0;

    const contact_apex = props.context.tool.contactApex;
    if (contact_apex) {
        const m2r = contact_apex.matrix2Root();
        const wm = props.context.workspace.matrix;
        const f = contact_apex.frame;

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
    if (event.button !== 0) {
        return;
    }

    if (props.shape.isLocked) {
        return;
    }

    event.stopPropagation();

    props.context.menu.menuMount();
    props.context.workspace.setCtrl('controller');
    props.context.tool.resetContactApex();

    downXY = { x: event.x, y: event.y };

    document.addEventListener('mousemove', point_mousemove);
    document.addEventListener('mouseup', point_mouseup);
    move = point_mousemove;
    move_type = type;
}

function point_mousemove(event: MouseEvent) {
    const workspace = props.context.workspace;

    if (isDragging && contactEditor) {
        if (search) {
            search_apex(event);
        }
        const p = workspace.getRootXY(event);
        if (move_type === 'from') {
            contactEditor.modify_contact_from(p, clear_target);
        } else if (move_type === 'to') {
            contactEditor.modify_contact_to(p, clear_target);
        }

        migrate(props.shape);
    } else {
        if (Math.hypot(event.x - downXY.x, event.y - downXY.y) > dragActiveDis) {
            clear_target = undefined;
            isDragging = true;
            search = true;
            workspace.scaling(true);
            const page = props.context.selection.selectedPage!;

            contactEditor = props.context
                .editor
                .controller()
                .asyncContactEditor(adapt2Shape(props.shape) as ContactShape, page);

            contactEditor.pre();
        }
    }
}

function migrate(shape: ContactLineView) {
    let existSliceShape = false;
    let __s: ShapeView | undefined = shape;

    while (__s) {
        if (__s.type === ShapeType.Artboard) {
            existSliceShape = true;
            break;
        }
        __s = __s.parent;
    }

    if (!existSliceShape) {
        return;
    }

    const points = shape.getPoints();
    const environment = get_contact_environment(props.context, shape, points);
    if (!environment) {
        return;
    }

    if (shape.parent?.id !== environment.id && contactEditor) {
        contactEditor.migrate(adapt2Shape(environment) as GroupShape);
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
    workspace.setCtrl('page');
}

function search_apex(e: MouseEvent) {
    const shapes = props.context
        .selection
        .getContactByXY(props.context.workspace.getRootXY(e));

    if (shapes.length) {
        props.context.tool.setContactApex(shapes[0]);
    } else {
        props.context.tool.resetContactApex();
    }
}

function enter_new_node(contactType: ContactType, p: PageXY) {
    const contactApex = props.context.tool.contactApex;
    if (!contactApex) {
        return;
    }

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
        <rect :x="apex1.point.x - 5" :y="apex1.point.y - 5" rx="5" ry="5" height="10" width="10"
              @mousedown.stop="(e) => point_mousedown(e, apex1.type)" class="point"
              :class="{ activation: fromOrTo?.from }">
        </rect>
        <rect :x="apex2.point.x - 5" :y="apex2.point.y - 5" rx="5" ry="5" height="10" width="10"
              @mousedown.stop="(e) => point_mousedown(e, apex2.type)" class="point"
              :class="{ activation: fromOrTo?.to }">
        </rect>
    </g>
    <g v-if="contact">
        <rect v-for="(p, idx) in contact_points" class="point" @mousemove.stop :key="idx" rx="5px" ry="5px"
              :x="p.point.x - 5" :y="p.point.y - 5" @mouseenter="() => { enter_new_node(p.type, p.point) }"
              @mouseleave="() => { leave_new_node(p.point) }">
        </rect>
    </g>
</template>

<style lang='scss' scoped>
.point {
    width: 10px;
    height: 10px;
    fill: #fff;
    stroke: var(--active-color);
    stroke-width: 2px;
}

.point:hover {
    width: 10px;
    height: 10px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}

.activation {
    width: 10px;
    height: 10px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}
</style>