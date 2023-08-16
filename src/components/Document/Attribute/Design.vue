<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, shallowRef, ref, computed } from 'vue';
import { ShapeType, Shape, TextShape } from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import PageBackgorund from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import { throttle } from 'lodash';
const props = defineProps<{ context: Context }>();
const shapes = shallowRef<Shape[]>([]);
const len = computed<number>(() => shapes.value.length);
const WITH_FILL = [
    ShapeType.Rectangle,
    ShapeType.Oval,
    ShapeType.Star,
    ShapeType.Polygon,
    ShapeType.Path,
    ShapeType.Artboard,
    ShapeType.Group,
    ShapeType.Path2,
    ShapeType.Text,
    ShapeType.Table,
    ShapeType.TableCell
];
const WITH_TEXT = [ShapeType.Text];
const WITH_BORDER = [
    ShapeType.Image,
    ShapeType.Rectangle,
    ShapeType.Oval,
    ShapeType.Star,
    ShapeType.Polygon,
    ShapeType.Path,
    ShapeType.Artboard,
    ShapeType.Group,
    ShapeType.Path2,
    ShapeType.Text,
    ShapeType.Line,
    ShapeType.Table,
    ShapeType.TableCell
];
const shapeType = ref();
const reflush = ref<number>(0);
function _change(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shapes.value = new Array();
    } else if (t === Selection.CHANGE_SHAPE) {
        if (props.context.selection.selectedShapes.length === 1) {
            shapes.value = new Array(...props.context.selection.selectedShapes);
            shapeType.value = shapes.value[0].type;
        } else if (props.context.selection.selectedShapes.length > 1) {
            shapes.value = new Array(...props.context.selection.selectedShapes);
        } else {
            shapes.value = new Array();
        }
    }
}
const change = throttle(_change, 200);
function selection_watcher(t: number) { change(t) }
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    _change(Selection.CHANGE_SHAPE);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <section>
        <div v-if="len === 0">
            <PageBackgorund :context="props.context" v-if="props.context.selection.selectedPage"
                :page="props.context.selection.selectedPage"></PageBackgorund>
        </div>
        <Arrange v-if="len > 1" :context="props.context" :shapes="shapes"></Arrange>
        <div v-if="len" :reflush="reflush">
            <ShapeBaseAttr :context="props.context"></ShapeBaseAttr>
            <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
            <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
            <Text v-if="WITH_TEXT.includes(shapeType)" :shape="(shapes[0] as TextShape)" :context="props.context"></Text>
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