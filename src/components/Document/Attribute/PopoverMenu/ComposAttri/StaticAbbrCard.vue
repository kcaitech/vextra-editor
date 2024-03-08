<script setup lang="ts">
import {ShapeView, ShapeType, adapt2Shape} from "@kcdesign/data";
import {static_coms_map} from "../../../ContentStatic/static_coms_map";
import { toRaw } from "vue";

interface Props {
    data: ShapeView
}

const props = defineProps<Props>();

const renderItem = toRaw(props.data);
function gen_view_box() {
    if (renderItem.type === ShapeType.Table) {
        return `0 0 16 16`;
    }
    const frame = renderItem.boundingBox();
    return `0 0 ${frame.width} ${frame.height}`;
}
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" width="90%" height="90%"
         :viewBox='gen_view_box()' overflow="visible" class="render-wrap">
        <component :is="static_coms_map.get(renderItem.type) ?? static_coms_map.get(ShapeType.Rectangle)"
                   :data="adapt2Shape(renderItem)"/>
    </svg>
</template>
<style lang="scss" scoped>
.render-wrap {
    position: absolute;
    left: 5%;
    top: 5%;
}
</style>