<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, shallowRef, ref, computed, watchEffect } from 'vue';
import { ShapeType, Shape, TextShape } from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import PageBackgorund from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import { throttle } from 'lodash';
import TableStyle from './Table/TableStyle.vue'
const props = defineProps<{ context: Context }>();
const shapes = shallowRef<Shape[]>([]);
const len = computed<number>(() => shapes.value.length);
const WITH_FILL = [ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon, ShapeType.Path, ShapeType.Artboard, ShapeType.Group, ShapeType.Path2];
const WITH_TEXT = [ShapeType.Text];
const WITH_BORDER = [ShapeType.Image, ShapeType.Rectangle, ShapeType.Oval, ShapeType.Star, ShapeType.Polygon, ShapeType.Path, ShapeType.Artboard, ShapeType.Group, ShapeType.Path2];
const shapeType = ref();
function _change(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shapes.value = [];
    } else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shapes.value = [props.context.selection.selectedShapes[0]];
            shapeType.value = shapes.value[0].type;
        } else if (props.context.selection.selectedShapes.length > 1) {
            shapes.value = [...props.context.selection.selectedShapes];
        } else {
            shapes.value = [];
        }
    }
}
const change = throttle(_change, 200);
function selectionChange(t: number) {
    change(t);
}
watchEffect(() => {
    if (props.context.selection.selectedShapes.length === 1) {
        shapes.value = [props.context.selection.selectedShapes[0]];
        shapeType.value = shapes.value[0].type;
    } else if (props.context.selection.selectedShapes.length > 1) {
        shapes.value = [...props.context.selection.selectedShapes];
    } else {
        shapes.value = [];
    }
})
onMounted(() => {
    props.context.selection.watch(selectionChange);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionChange);
})
</script>
<template>
    <section>
        <div v-if="len === 0">
            <PageBackgorund :context="props.context" v-if="props.context.selection.selectedPage" :page="props.context.selection.selectedPage"></PageBackgorund>
        </div>
        <Arrange v-if="len > 1" :context="props.context" :shapes="shapes"></Arrange>
        <div v-if="len">
            <ShapeBaseAttr :context="props.context"></ShapeBaseAttr>
            <Text v-if="WITH_TEXT.includes(shapeType)" :shape="(shapes[0] as TextShape)" :context="props.context"></Text>
            <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
            <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
            <TableStyle :shapes="shapes" :context="props.context"></TableStyle>
        </div>
    </section>
</template>

<style scoped lang="scss">
section {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);
}
</style>