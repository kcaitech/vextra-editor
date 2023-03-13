<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/data/shape';
import { defineProps, onMounted, onUnmounted, shallowRef } from 'vue';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill.vue';
import Border from './Border.vue';
const props = defineProps<{ context: Context }>();

const shape = shallowRef<Shape>();

function selectionChange(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shape.value = undefined;
    }
    else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shape.value = props.context.selection.selectedShapes[0];
            // console.log('-cur shape-', shape.value?.name); 
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
    <div v-if="shape">
        <ShapeBaseAttr :shape="shape" :context="props.context"></ShapeBaseAttr>
        <Fill :shape="shape" :context="props.context"></Fill>
        <Border :shape="shape" :context="props.context"></Border>
    </div>
</section>
</template>

<style scoped>
section {
    width: 100%;
    height: 100%;
}
</style>