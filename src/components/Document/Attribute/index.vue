<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/shape';
import { defineProps, onMounted, onUnmounted, shallowRef, ref, computed, defineEmits } from 'vue';
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

</script>

<template>
<section>
    <ShapeAttr v-if="shape" :shape="shape" :context="props.context"></ShapeAttr>
</section>
</template>

<style scoped>
section {
    width: 100%;
    height: 100%;
}
</style>