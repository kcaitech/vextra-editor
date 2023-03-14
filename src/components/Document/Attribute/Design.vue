<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { Shape } from '@/data/data/shape';
import { ShapeType } from "@/data/types"
import { defineProps, onMounted, onUnmounted, shallowRef, ref } from 'vue';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill.vue';
import Border from './Border.vue';
const props = defineProps<{ context: Context }>();

const shape = shallowRef<Shape>();

const WITH_FILL = [ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon];
const shapeType = ref();

function selectionChange(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shape.value = undefined;
    }
    else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shape.value = props.context.selection.selectedShapes[0];
            shapeType.value = shape.value.type
            console.log('-shape-type-', shapeType.value);
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
        <Fill v-if="WITH_FILL.includes(shapeType)" :shape="shape" :context="props.context"></Fill>
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