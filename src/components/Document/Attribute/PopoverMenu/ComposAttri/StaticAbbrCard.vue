<script setup lang="ts">
import {Shape, ShapeType} from "../../../../../../../kcdesign-data/src";
import {static_coms_map} from "../../../ContentStatic/static_coms_map";

interface Props {
    data: Shape
}
const props = defineProps<Props>();
function gen_view_box() {
    if (props.data.type === ShapeType.Table) return `0 0 16 16`;
    const frame = props.data.boundingBox();
    return `0 0 ${frame.width} ${frame.height}`;
}
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" width="26" height="26"
         :viewBox='gen_view_box()' overflow="visible" class="render-wrap">
        <component :is="static_coms_map.get(props.data.type) ?? static_coms_map.get(ShapeType.Rectangle)" :data="props.data" />
    </svg>
</template>
<style scoped lang="scss">
</style>