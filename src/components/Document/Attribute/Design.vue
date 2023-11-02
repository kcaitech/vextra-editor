<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, shallowRef, ref, computed } from 'vue';
import { ShapeType, Shape, TextShape, TableShape } from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr/Index.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import PageBackgorund from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import { throttle } from 'lodash';
import TableText from './Table/TableText.vue'
import { TableSelection } from '@/context/tableselection';
import TableStyle from './Table/TableStyle.vue'
import { Tool } from '@/context/tool';
import Opacity from './Opacity/Opacity.vue';
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
    ShapeType.Table,
    ShapeType.TableCell,
    ShapeType.Text,
    ShapeType.Line,
    ShapeType.Contact
];
const WITH_TABLE = [ShapeType.Table];
const shapeType = ref();
const reflush = ref<number>(0);

const getShapeType = () => {
    if (props.context.selection.selectedShapes.length === 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
        shapeType.value = shapes.value[0].type;
    } else if (props.context.selection.selectedShapes.length > 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
    } else {
        shapes.value = new Array();
    }
}

function _change(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shapes.value = new Array();
    } else if (t === Selection.CHANGE_SHAPE) {
        getShapeType();
        baseAttr.value = true;
    }
}
const baseAttr = ref(true);
const baseAttrVisible = () => {
    const shape = props.context.selection.selectedShapes[0]
    if (props.context.selection.selectedShapes.length === 1 && shape.type === ShapeType.Table) {
        const table = props.context.tableSelection;
        const is_edting = props.context.tableSelection.editingCell;
        if (table.tableColStart === -1 && !is_edting) {
            baseAttr.value = true;
        } else {
            baseAttr.value = false;
        }
    } else {
        baseAttr.value = true;
    }
}

const change = throttle(_change, 100);
function tool_watcher(t: number) {
    if (t === Tool.CHANGE_ACTION) {
        getShapeType()
    }
}
function selection_watcher(t: number) { change(t) }
function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_TABLE_CELL) baseAttrVisible();
    else if (t === TableSelection.CHANGE_EDITING_CELL) baseAttrVisible();
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    _change(Selection.CHANGE_SHAPE);
    props.context.tool.watch(tool_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.tool.unwatch(tool_watcher);
})
</script>
<template>
    <section>
        <div v-if="len === 0">
            <PageBackgorund :context="props.context" v-if="props.context.selection.selectedPage"
                :page="props.context.selection.selectedPage"></PageBackgorund>
        </div>
        <Arrange v-if="len > 1" :context="props.context" :shapes="shapes"></Arrange>
        <div v-if="len" :reflush="reflush" @mousedown.stop>
            <ShapeBaseAttr v-if="baseAttr" :context="props.context"></ShapeBaseAttr>
            <Opacity :shapes="shapes" :context="props.context"></Opacity>
            <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
            <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
            <Text v-if="WITH_TEXT.includes(shapeType)" :shape="(shapes[0] as TextShape)" :context="props.context"></Text>
            <TableText v-if="WITH_TABLE.includes(shapeType)" :shape="(shapes[0] as TableShape)" :context="props.context">
            </TableText>
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