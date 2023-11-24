<script setup lang="ts">
import {XY} from "@/context/selection";
import {CurvePoint} from "@kcdesign/data";
import Rect from "@/components/Document/Toolbar/Buttons/Rect.vue";
import {onMounted, reactive, watchEffect} from "vue";

interface Props {
    site: XY
    curvePoint: CurvePoint
    index: number
}

const props = defineProps<Props>();
const apex_location_alpha = reactive({x: 0, y: 0});
const apex_location_beta = reactive({x: 0, y: 0});

function update() {
    apex_location_alpha.x = props.site.x + 50;
    apex_location_alpha.y = props.site.y + 50;
    apex_location_beta.x = props.site.x - 50;
    apex_location_beta.y = props.site.y - 50;
}

function down(e: MouseEvent, side: 'alpha' | 'beta') {
    e.stopPropagation();
    e.preventDefault();
    console.log("side:", side);
}

onMounted(() => {
    update();
})
watchEffect(update);
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