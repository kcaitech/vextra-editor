<script setup lang="ts">
import {XY} from "@/context/selection";
import {CurvePoint} from "@kcdesign/data";
import Rect from "@/components/Document/Toolbar/Buttons/Rect.vue";
import {onMounted, reactive, watchEffect} from "vue";
import {Context} from "@/context";

interface Props {
    context: Context
    index: number
}

const props = defineProps<Props>();
const apex_location_alpha = reactive({x: -10, y: -10});
const apex_location_beta = reactive({x: -10, y: -10});
const site = reactive({x: -10, y: -10});

function update() {
    const path_shape = props.context.selection.pathshape;
    const m = props.context.path.matrix_unit_to_root;
    if (!path_shape || !m) return;
    const __points = path_shape.points;
    const current_point = __points[props.index];
    if (!current_point) return;
    const _p = m.computeCoord3(current_point.point);
    site.x = _p.x;
    site.y = _p.y;
    apex_location_alpha.x = site.x + 50;
    apex_location_alpha.y = site.y + 50;
    apex_location_beta.x = site.x - 50;
    apex_location_beta.y = site.y - 50;
}

function down(e: MouseEvent, side: 'alpha' | 'beta') {
    e.stopPropagation();
    e.preventDefault();
    console.log("side:", side);
}

onMounted(() => {
    update();
})
</script>
<template>
    <g>
        <line :x1="site.x" :y1="site.y" :x2="apex_location_alpha.x" :y2="apex_location_alpha.y" class="line"></line>
        <rect :x="apex_location_alpha.x - 4" :y="apex_location_alpha.y - 4" width="8" height="8" class="point"
              @mousedown="(e) => {down(e, 'alpha')}"></rect>
    </g>
    <g>
        <line :x1="site.x" :y1="site.y" :x2="apex_location_beta.x" :y2="apex_location_beta.y" class="line"></line>
        <rect :x="apex_location_beta.x - 4" :y="apex_location_beta.y - 4" width="8" height="8" class="point"
              @mousedown="(e) => {down(e, 'beta')}"></rect>
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