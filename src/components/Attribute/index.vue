<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/shape';
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ShapeAttr from './ShapeAttr.vue';
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

</script>

<template>
<div>
    <ShapeAttr v-if="shape" :shape="shape"
    :context="props.context"></ShapeAttr>
</div>
</template>

<style scoped>

</style>