/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Tool } from "@/context/tool";
import { ContactForm, ContactType } from "@kcdesign/data";
import { ClientXY, PageXY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
interface Props {
    context: Context
}
interface Emits {
    (e: 'contact-init', event: MouseEvent, apex?: ContactForm, p2?: PageXY): void;
    (e: 'contact-to', apex: ContactForm, p2: PageXY): void;
    (e: 'contact-reset'): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const contact = ref<boolean>(false);
const contact_points = ref<{ type: ContactType, point: ClientXY }[]>([]);
function update_contact_apex() {
    contact_points.value.length = 0;
    contact.value = false;

    const contact_apex = props.context.tool.contactApex;
    if (!contact_apex) {
        return;
    }

    const m2r = contact_apex.matrix2Root();
    m2r.multiAtLeft(props.context.workspace.matrix);

    const f = contact_apex.frame;
    const points: { type: ContactType, point: ClientXY }[] = [
        {type: ContactType.Top, point: {x: f.x + f.width / 2, y: f.y}},
        {type: ContactType.Right, point: {x: f.x + f.width, y: f.y + f.height / 2}},
        {type: ContactType.Bottom, point: {x: f.x + f.width / 2, y: f.y + f.height}},
        {type: ContactType.Left, point: {x: f.x, y: f.y + f.height / 2}},
    ]

    for (let i = 0; i < 4; i++) {
        points[i].point = m2r.computeCoord3(points[i].point);
    }

    contact_points.value = points;
    contact.value = true;
}
function contact_point_down(e: MouseEvent, type: ContactType) {
    const p = get_p(type);
    if (!p) return false;
    emits("contact-init", e, new ContactForm(type, props.context.tool.contactApex!.id), p);
    props.context.tool.setContactFrom(true);
    e.stopPropagation();
}
function enter(type: ContactType) {
    const p = get_p(type);
    if (!p) return false;
    emits("contact-to", new ContactForm(type, props.context.tool.contactApex!.id), p);
}
function leave() {
    emits("contact-reset");
}
function get_p(type: 'top' | 'right' | 'bottom' | 'left') {
    const contactApex = props.context.tool.contactApex;
    if (!contactApex) return false;
    const m2r = contactApex.matrix2Root(), f = contactApex.frame;
    switch (type) {
        case 'top':
            return m2r.computeCoord2(f.x + f.width / 2, f.y);
        case 'right':
            return m2r.computeCoord2(f.x + f.width, f.y + f.height / 2);
        case 'bottom':
            return m2r.computeCoord2(f.x + f.width / 2, f.y + f.height);
        case 'left':
            return m2r.computeCoord2(f.x, f.y + f.height / 2);
        default: return false;
    }
}
function tool_watcher(t: number) {
    if (t === Tool.CHANGE_CONTACT_APEX) {
        update_contact_apex();
    }
}
function workspace_watcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update_contact_apex();
    }
}
function window_blur() {
    reset_status();
}

function reset_status() {
    props.context.tool.resetContactApex();
}
// hooks
onMounted(() => {
    props.context.tool.watch(tool_watcher);
    props.context.workspace.watch(workspace_watcher);
    window.addEventListener('blur', window_blur)
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', window_blur);
    reset_status();
})
</script>
<template>
    <!-- 连接 -->
    <svg v-if="contact" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="10"
        height="10" viewBox="0 0 10 10" style=" position: absolute;">
        <rect v-for="(p, idx) in contact_points" @mousemove.stop :key="idx" class="contact-point" rx="5px" ry="5px"
            @mousedown="(e: MouseEvent) => contact_point_down(e, p.type)" :x="p.point.x - 5" :y="p.point.y - 5"
            @mouseenter="() => enter(p.type)" @mouseleave="leave"></rect>
    </svg>
</template>
<style lang="scss">
.contact-point {
    width: 10px;
    height: 10px;
    fill: #fff;
    stroke: var(--active-color);
    stroke-width: 2px;
}

.contact-point:hover {
    width: 10px;
    height: 10px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}
</style>