<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { defineProps, onMounted, onUnmounted } from 'vue';
import ShapeAttr from './ShapeAttr.vue';
const props = defineProps<{ context: Context }>();

function selectionChange(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        //
    }
    else if (t === Selection.CHANGE_SHAPE) {
        //
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
    <ShapeAttr v-if="props.context.selection.selectedShapes.length === 1" :shape="props.context.selection.selectedShapes[0]"></ShapeAttr>
</div>
</template>

<style scoped>

</style>