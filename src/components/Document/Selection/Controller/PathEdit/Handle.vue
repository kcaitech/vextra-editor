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
const previous_apex_location_alpha = reactive({ x: -10, y: -10 });
const previous_apex_location_beta = reactive({ x: -10, y: -10 });
const previous_site = reactive({ x: -10, y: -10 });

const current = ref<boolean>(false);
const apex_location_alpha = reactive({ x: -10, y: -10 });
const apex_location_beta = reactive({ x: -10, y: -10 });
const site = reactive({ x: -10, y: -10 });

const next = ref<boolean>(false);
const next_apex_location_alpha = reactive({ x: -10, y: -10 });
const next_apex_location_beta = reactive({ x: -10, y: -10 });
const next_site = reactive({ x: -10, y: -10 });


function update() {
    previous.value = false;
    current.value = false;
    next.value = false;
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
    const index = selected[0];
    const current_point = __points[index];
    const __round = __round_curve_point(path_shape, index);
    console.log('round:', __round);
    if (!current_point) {
        return;
    }
    if (current_point.curveMode) {

    }
    const _p = m.computeCoord3(current_point.point);
    site.x = _p.x;
    site.y = _p.y;
    apex_location_alpha.x = site.x + 50;
    apex_location_alpha.y = site.y + 50;
    apex_location_beta.x = site.x - 50;
    apex_location_beta.y = site.y - 50;
    current.value = true;
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
    <!--  当前点  -->
    <g v-if="current">
        <g>
            <line :x1="site.x" :y1="site.y" :x2="apex_location_alpha.x" :y2="apex_location_alpha.y" class="line"></line>
            <rect :x="apex_location_alpha.x - 4" :y="apex_location_alpha.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'alpha') }"></rect>
        </g>
        <g>
            <line :x1="site.x" :y1="site.y" :x2="apex_location_beta.x" :y2="apex_location_beta.y" class="line"></line>
            <rect :x="apex_location_beta.x - 4" :y="apex_location_beta.y - 4" width="8" height="8" class="point"
                @mousedown="(e) => { down(e, 'beta') }"></rect>
        </g>
    </g>
</template>
<style scoped lang="scss">
.line {
    stroke: #ccc;
    stroke-width: 1px;
    fill: none;
}

.point {
    fill: #fff;
    stroke: var(--theme-color);
    stroke-width: 1px;
}
</style>