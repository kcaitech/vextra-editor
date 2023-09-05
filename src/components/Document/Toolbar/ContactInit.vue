<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Tool } from "@/context/tool";
import { ContactForm, ContactType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import { ClientXY, PageXY } from "@/context/selection";
interface Props {
    context: Context
}
interface Emits {
    (e: 'contact-init', event: MouseEvent, apex?: ContactForm, p2?: PageXY): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const t = useI18n().t;
const contact = ref<boolean>(false);
const contact_points = ref<{ type: ContactType, point: ClientXY }[]>([]);
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
function contact_point_down(e: MouseEvent, type: ContactType) {
    const p = get_p(type);
    if (!p) return false;
    const page = props.context.selection.selectedPage;
    if (!page) return;
    emits("contact-init", e, new ContactForm(type, props.context.tool.contactApex!.id), p);
    e.stopPropagation();
}
function get_p(type: 'top' | 'right' | 'bottom' | 'left') {
    const contactApex = props.context.tool.contactApex;
    if (!contactApex) return false;
    const m2r = contactApex.matrix2Root(), f = contactApex.frame;
    switch (type) {
        case 'top':
            return m2r.computeCoord2(f.width / 2, 0);
        case 'right':
            return m2r.computeCoord2(f.width, f.height / 2);
        case 'bottom':
            return m2r.computeCoord2(f.width / 2, f.height);
        case 'left':
            return m2r.computeCoord2(0, f.height / 2);
        default: return false;
    }
}
function tool_watcher(t: number) {
    if (t === Tool.CHANGE_CONTACT_APEX) update_contact_apex();
}

function window_blur() { }
// hooks
onMounted(() => {
    props.context.tool.watch(tool_watcher);
    window.addEventListener('blur', window_blur)
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <!-- 连接 -->
    <svg v-if="contact" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="10"
        height="10" viewBox="0 0 10 10" style=" position: absolute;">
        <rect v-for="(p, idx) in contact_points" @mousemove.stop :key="idx" class="contact-point" rx="8px" ry="8px"
            @mousedown="(e: MouseEvent) => contact_point_down(e, p.type)" :x="p.point.x - 8" :y="p.point.y - 8"></rect>
    </svg>
</template>
<style lang="scss">
.contact-point {
    width: 16px;
    height: 16px;
    fill: #fff;
    stroke: var(--active-color);
    stroke-width: 2px;
}

.contact-point:hover {
    width: 16px;
    height: 16px;
    fill: var(--active-color);
    stroke: #fff;
    stroke-width: 2px;
}
</style>