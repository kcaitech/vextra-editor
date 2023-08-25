<script lang="ts" setup>
import { Context } from '@/context';
import { Matrix } from '@kcdesign/data';
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import Simple from './Simple.vue';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
    matrix: number[]
}
const props = defineProps<Props>();
const matrix = new Matrix();
const fix_x = ref<number>(0), fix_y = ref<number>(0), fix_w = ref<number>(0), fix_h = ref<number>(0);
const page_origin = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const container_origin = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const page_el = ref<HTMLDivElement>();
const container = ref<HTMLDivElement>();
const show_locate = ref<boolean>(false);
const locate = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const locate_xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const current_xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const reflush = ref<number>(0);
function init() {
    const selection = props.context.selection, workspace = props.context.workspace, root = workspace.root;
    const page = selection.selectedPage;
    if (!page) return;
    const f = page.frame, width = f.width, height = f.height;
    const max: number = width < height ? height : width;
    const max_side: 'h' | 'w' = width < height ? 'h' : 'w';
    const ratio = width / height;
    if (max_side === 'w') {
        fix_w.value = 300, fix_h.value = 300 / ratio;
        fix_y.value = (300 - fix_h.value) / 2, fix_x.value = 0;
    } else {
        fix_w.value = 300 * ratio, fix_h.value = 300;
        fix_x.value = (300 - fix_w.value) / 2, fix_y.value = 0;
    }
    const scale = 300 / max;
    matrix.trans(-f.x, -f.y);
    matrix.scale(scale);
    nextTick(() => {
        if (page_el.value) {
            const { x, y } = page_el.value.getBoundingClientRect();
            page_origin.value.x = x, page_origin.value.y = y;
        }
        if (container.value) {
            const { x, y } = container.value.getBoundingClientRect();
            container_origin.value.x = x, container_origin.value.y = y;
        }
        const m = new Matrix(workspace.matrix.inverse);
        m.multiAtLeft(matrix);
        const c_xy = m.computeCoord2(root.center.x, root.center.y);
        current_xy.value.x = c_xy.x - fix_x.value - 13.5, current_xy.value.y = c_xy.y + fix_y.value - 22;
        reflush.value++;
    })
}
function update_current() {
    const workspace = props.context.workspace, root = workspace.root;
    const m = new Matrix(workspace.matrix.inverse);
    m.multiAtLeft(matrix);
    const c_xy = m.computeCoord2(root.center.x, root.center.y);
    current_xy.value.x = c_xy.x - fix_x.value - 13.5, current_xy.value.y = c_xy.y + fix_y.value - 22;
}

function showL() {
    show_locate.value = true;
}
function hiddenL() {
    show_locate.value = false;
}
function updatelocate(e: MouseEvent) {
    const { clientX, clientY } = e;
    const xy = { x: clientX - container_origin.value.x, y: clientY - container_origin.value.y };
    locate_xy.value.x = Number((clientX - container_origin.value.x + 2).toFixed(2)), locate_xy.value.y = Number((clientY - container_origin.value.y + 2).toFixed(2));
    let m = new Matrix(matrix);
    m.trans(fix_x.value, fix_y.value);
    m = new Matrix(m.inverse);
    const xy2 = m.computeCoord2(xy.x, xy.y);
    locate.value.x = Math.ceil(xy2.x), locate.value.y = Math.ceil(xy2.y);
}
function trans(e: MouseEvent) {
    const xy = { x: e.clientX - container_origin.value.x, y: e.clientY - container_origin.value.y };
    let m = new Matrix(matrix);
    m.trans(fix_x.value, fix_y.value);
    const root = props.context.workspace.root, wm = props.context.workspace.matrix;
    m = new Matrix(m.inverse);
    m.multiAtLeft(wm);
    const xy2 = m.computeCoord2(xy.x, xy.y);
    const { x, y, bottom, right } = root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const dx = contentViewCenter.x - xy2.x, dy = contentViewCenter.y - xy2.y;
    wm.trans(dx, dy);
    props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}
watch(() => props.matrix, update_current, { deep: true });
onBeforeMount(init);
</script>
<template>
    <div ref="container" class="container" @mousedown.stop="trans" @mouseenter="showL" @mouseleave="hiddenL"
        @mousemove="updatelocate">
        <div class="name">{{ props.context.selection.selectedPage!.name || '' }}</div>
        <div class="page" ref="page_el"
            :style="{ left: fix_x + 'px', top: fix_y + 'px', width: fix_w + 'px', height: fix_h + 'px' }">
            <Simple v-for="(s, i) in props.context.selection.selectedPage!.childs" :key="i" :matrix="matrix" :shape="s">
            </Simple>
        </div>
        <div v-if="show_locate" class="locate" :style="{ left: locate_xy.x + 'px', top: locate_xy.y + 'px' }">{{
            `${locate.x}, ${locate.y}` }}</div>
        <svg t="1692954273763" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" class="current"
            :reflush="reflush" p-id="4031" width="24" height="24"
            :style="{ left: current_xy.x + 'px', top: current_xy.y + 'px' }">
            <path stroke="#fff" stroke-width="10px"
                d="M511.954463 250.971985c-73.709769 0-133.669372 58.877969-133.669372 131.23288 0 72.339562 59.959603 131.157155 133.669372 131.157155 73.707722 0 133.639696-58.817594 133.639696-131.157155C645.594159 309.84893 585.662185 250.971985 511.954463 250.971985M511.954463 455.252555c-40.97625 0-74.311473-32.779567-74.311473-73.078389 0-40.284495 33.334199-73.077366 74.311473-73.077366 40.945551 0 74.278727 32.79287 74.278727 73.077366C586.23319 422.472987 552.900014 455.252555 511.954463 455.252555"
                fill="#231F20" p-id="4032"></path>
            <path stroke="#fff" stroke-width="10px"
                d="M824.811914 401.684522c0-169.441087-140.347468-307.277362-312.857451-307.277362-172.479283 0-312.768423 137.836275-312.768423 307.277362 0 132.88552 192.606693 400.645866 275.461749 509.584997 8.724709 11.492752 22.683628 18.321274 37.305651 18.321274 14.5903 0 28.580942-6.828522 37.334303-18.321274C632.11517 802.331411 824.811914 534.602787 824.811914 401.684522M516.887822 864.759229l-4.933359 6.557346-4.934382-6.557346C350.606705 656.92881 253.370103 479.470119 253.370103 401.684522c0-140.062989 115.979478-254.012228 258.58436-254.012228 142.575206 0 258.552637 113.949238 258.552637 254.012228C770.537799 479.499795 673.36055 656.92881 516.887822 864.759229"
                fill="#231F20" p-id="4033"></path>
        </svg>
    </div>
</template>
<style scoped lang="scss">
.container {
    position: absolute;
    width: 300px;
    height: 300px;
    right: 15px;
    bottom: 15px;
    border: 2px solid var(--active-color);
    background-color: #fff;
    cursor: crosshair;
    overflow: hidden;

    .name {
        position: absolute;
        margin-left: 4px;
        color: var(--active-color);
        font-weight: 600;
        font-size: var(--font-default-fontsize);
    }

    .page {
        background-color: #efefef;
        position: absolute;
        box-sizing: border-box;
    }

    .locate {
        position: absolute;
        width: 60px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: var(--default-radius);
        font-size: var(--font-default-fontsize);
    }

    .current {
        position: absolute;
    }
}
</style>