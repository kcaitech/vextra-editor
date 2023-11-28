<script setup lang="ts">
import Rect from "@/components/Document/Toolbar/Buttons/Rect.vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { __round_curve_point } from "@/utils/pathedit";
import { Path } from "@/context/path";
import { WorkSpace } from "@/context/workspace";

interface Props {
    context: Context
}

const props = defineProps<Props>();

const previous = ref<boolean>(false);
const previous_from = ref<boolean>(false);
const previous_to = ref<boolean>(false);
const previous_apex_location_from = reactive({ x: -10, y: -10 });
const previous_apex_location_to = reactive({ x: -10, y: -10 });
const previous_site = reactive({ x: -10, y: -10 });

const current = ref<boolean>(false);
const current_from = ref<boolean>(false);
const current_to = ref<boolean>(false);
const apex_location_from = reactive({ x: -10, y: -10 });
const apex_location_to = reactive({ x: -10, y: -10 });
const site = reactive({ x: -10, y: -10 });

const next = ref<boolean>(false);
const next_from = ref<boolean>(false);
const next_to = ref<boolean>(false);
const next_apex_location_from = reactive({ x: -10, y: -10 });
const next_apex_location_to = reactive({ x: -10, y: -10 });
const next_site = reactive({ x: -10, y: -10 });
function reset() {
    previous.value = false;
    previous_from.value = false;
    previous_to.value = false;

    current.value = false;
    current_from.value = false;
    current_to.value = false;

    next.value = false;
    next_from.value = false;
    next_to.value = false;
}

function update() {
    reset();
    const path_shape = props.context.selection.pathshape;
    const m = props.context.path.matrix_unit_to_root;
    if (!path_shape || !m) {
        return;
    }
    const __points = path_shape.points;
    const selected = props.context.path.selectedPoints;
    if (selected.length !== 1) {
        return;
    }

    // current
    const index = selected[0];
    const current_point = __points[index];
    if (!current_point) {
        return;
    }
    current.value = true;
    const _p = m.computeCoord3(current_point.point);
    site.x = _p.x;
    site.y = _p.y;
    if (current_point.hasCurveFrom) {
        current_from.value = true;
        const _cf  = m.computeCoord3(current_point.curveFrom);
        apex_location_from.x = _cf.x;
        apex_location_from.y = _cf.y;
    }
    if (current_point.hasCurveTo) {
        current_to.value = true;
        const _ct  = m.computeCoord3(current_point.curveTo);
        apex_location_to.x = _ct.x;
        apex_location_to.y = _ct.y;
    }

    const {previous: __pre, next: __next} = __round_curve_point(path_shape, index);
    
    if (__pre && __pre.id !== current_point.id) {
        previous.value = true;
        const __p = m.computeCoord3(__pre.point);
        previous_site.x = __p.x;
        previous_site.y = __p.y;
        if (__pre.hasCurveFrom) {
            previous_from.value = true;
            const __p = m.computeCoord3(__pre.curveFrom);
            previous_apex_location_from.x = __p.x;
            previous_apex_location_from.y = __p.y;
        }
    }    
    if (__next && __next.id !== current_point.id) {
        next.value = true;
        const __p = m.computeCoord3(__next.point);
        next_site.x = __p.x;
        next_site.y = __p.y;
        if (__next.hasCurveTo) {
            next_to.value = true;
            const __p = m.computeCoord3(__next.curveTo);
            next_apex_location_to.x = __p.x;
            next_apex_location_to.y = __p.y;
        }
    }
}

function down(e: MouseEvent, side: 'alpha' | 'beta') {
    e.stopPropagation();
    e.preventDefault();
    console.log("side:", side);
}

function path_selection_watcher(t: number) {
    if (t === Path.SELECTION_CHANGE) {
        update();
    }
}

function shape_watcher(t: any) {
    update();
}

function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

onMounted(() => {
    props.context.path.watch(path_selection_watcher);
    props.context.selection.pathshape?.watch(shape_watcher);
    props.context.workspace.watch(matrix_watcher);
    update();
})
onUnmounted(() => {
    props.context.path.unwatch(path_selection_watcher);
    props.context.selection.pathshape?.unwatch(shape_watcher);
    props.context.workspace.unwatch(matrix_watcher);
})
</script>
<template>
    <!-- 前一个点 -->
    <g v-if="previous">
        <g v-if="previous_from">
            <line :x1="previous_site.x" :y1="previous_site.y" :x2="previous_apex_location_from.x" :y2="previous_apex_location_from.y" class="line"></line>
            <rect :x="previous_apex_location_from.x - 4" :y="previous_apex_location_from.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'alpha') }"></rect>
        </g>
        <g v-if="previous_to">
            <line :x1="previous_site.x" :y1="previous_site.y" :x2="previous_apex_location_to.x" :y2="previous_apex_location_to.y" class="line"></line>
            <rect :x="previous_apex_location_to.x - 4" :y="previous_apex_location_to.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'beta') }"></rect>
        </g>
    </g>
    <!--  当前点  -->
    <g v-if="current">
        <g v-if="current_from">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_from.x" :y2="apex_location_from.y" class="line"></line>
            <rect :x="apex_location_from.x - 4" :y="apex_location_from.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'alpha') }"></rect>
        </g>
        <g v-if="current_to">
            <line :x1="site.x" :y1="site.y" :x2="apex_location_to.x" :y2="apex_location_to.y" class="line"></line>
            <rect :x="apex_location_to.x - 4" :y="apex_location_to.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'beta') }"></rect>
        </g>
    </g>
    <!-- 后一个点 -->
    <g v-if="next">
        <g v-if="next_from">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_from.x" :y2="next_apex_location_from.y" class="line"></line>
            <rect :x="next_apex_location_from.x - 4" :y="next_apex_location_from.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'alpha') }"></rect>
        </g>
        <g v-if="next_to">
            <line :x1="next_site.x" :y1="next_site.y" :x2="next_apex_location_to.x" :y2="next_apex_location_to.y" class="line"></line>
            <rect :x="next_apex_location_to.x - 4" :y="next_apex_location_to.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'beta') }"></rect>
        </g>
    </g>
</template>
<style scoped lang="scss">
.line {
    stroke: #ccc;
    stroke-width: 2px;
    fill: none;
}

.point {
    fill: #fff;
    stroke: var(--theme-color);
    stroke-width: 1px;
}
</style>