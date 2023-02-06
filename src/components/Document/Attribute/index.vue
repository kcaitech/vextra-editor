<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/shape';
import { defineProps, onMounted, onUnmounted, shallowRef, ref, computed, defineEmits } from 'vue';
import ShapeAttr from './ShapeAttr.vue';
import Sash from "@/components/common/Sash.vue"
const props = defineProps<{ context: Context, width: number, minWidth: number, maxWidth: number }>();
const emit = defineEmits<{
    (e: 'dragWidth', width: number): void;
}>();

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
const userOffset = ref(0);
// const minWidth = 80;
let curOffset = 0;

function onDragStart() {
    const w = userOffset.value + props.width;
    const wFix =  Math.min(Math.max(w, props.minWidth), props.maxWidth);
    curOffset = wFix - props.width;
}
function onDragOffset(offset: number) {
    // console.log('offset', offset)
    const w = curOffset + props.width - offset;
    const wFix = Math.min(Math.max(w, props.minWidth), props.maxWidth);
    emit("dragWidth", wFix);
    userOffset.value = wFix - props.width;
}

const fixedWidth = computed(() => {
    const w = userOffset.value + props.width;
    return Math.min(Math.max(w, props.minWidth), props.maxWidth);
})
</script>

<template>
<section :style="`width:${fixedWidth}px; minWidth:${fixedWidth}px`">
    <ShapeAttr v-if="shape" :shape="shape" :context="props.context"></ShapeAttr>
    <Sash side="left" @dragStart="onDragStart" @offset="onDragOffset" />
</section>
</template>

<style scoped>
section {
    position: relative;
}
</style>