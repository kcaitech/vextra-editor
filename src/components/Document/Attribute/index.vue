<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/shape';
import { defineProps, onMounted, onUnmounted, shallowRef, ref } from 'vue';
import ShapeAttr from './ShapeAttr.vue';
import Sash from "@/components/common/Sash.vue"
const props = defineProps<{ context: Context }>();

const shape = shallowRef<Shape>();

function selectionChange(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        //
        shape.value = undefined;
    }
    else if (t === Selection.CHANGE_SHAPE) {
        //
        if (props.context.selection.selectedShapes.length === 1) {
            shape.value = props.context.selection.selectedShapes[0];
        }
        else {
            shape.value = undefined;
        }
    }
}

onMounted(() => {
    props.context.selection.watch(selectionChange);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
})
const width = ref(100);
let saveWidth = 0;

function onDragStart() {
    saveWidth = width.value;
}
function onDragOffset(offset: number) {
    // console.log('offset', offset)
    width.value = saveWidth - offset;
}
</script>

<template>
<section :style="`width:${width}px; minWidth:${width}px`">
    <ShapeAttr v-if="shape" :shape="shape" :context="props.context"></ShapeAttr>
    <Sash side="left" @dragStart="onDragStart" @offset="onDragOffset" />
</section>
</template>

<style scoped>
section {
    position: relative;
}
</style>