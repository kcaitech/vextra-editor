<script setup lang="ts">
import {Context} from '@/context';
import {Selection} from '@/context/selection';
import {WorkSpace} from "@/context/workspace";
import {onMounted, onUnmounted, shallowRef, ref, computed} from 'vue';
import {ShapeType, Shape, TextShape, TableShape} from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr/Index.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import Shadow from './Shadow/Shadows.vue';
import PageBackgorund from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import {throttle} from 'lodash';
import Module from './Module/Module.vue'
import TableText from './Table/TableText.vue'
import CutoutExport from './CutoutExport/index.vue'

import { Tool } from '@/context/tool';
import {TableSelection} from '@/context/tableselection';
import BaseForPathEdit from "@/components/Document/Attribute/BaseAttr/BaseForPathEdit.vue";
import Opacity from './Opacity/Opacity.vue';
import TableStyle from './Table/TableStyle.vue'

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
    ShapeType.TableCell,
    ShapeType.Symbol,
    ShapeType.SymbolUnion
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
    ShapeType.Contact,
    ShapeType.Symbol,
    ShapeType.SymbolUnion
];
const WITH_TABLE = [ShapeType.Table];
const WITH_SHADOW = [
    ShapeType.Rectangle,
    ShapeType.Oval,
    ShapeType.Path,
    ShapeType.Artboard,
    ShapeType.Image,
    ShapeType.Text,
    ShapeType.Path2,
    ShapeType.Group,
    ShapeType.Line,
    ShapeType.Symbol,
    ShapeType.SymbolUnion
]
const shapeType = ref();
const textShapes = ref<Shape[]>([]);
const symbol_attribute = ref<boolean>(true);
const getShapeType = () => {
    if (props.context.selection.selectedShapes.length === 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
        shapeType.value = shapes.value[0].type;
        if (shapeType.value === ShapeType.Text) {
            textShapes.value = shapes.value;
        }
    } else if (props.context.selection.selectedShapes.length > 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
        textShapes.value = shapes.value.filter(item => item.type === ShapeType.Text);
    } else {
        shapes.value = new Array();
        textShapes.value = new Array();
    }
}

function _change(t: number) {
    if (t === Selection.CHANGE_PAGE) {
        shapes.value = new Array();
        textShapes.value = new Array();
    } else if (t === Selection.CHANGE_SHAPE) {
        getShapeType();
        baseAttr.value = true;
        editAttr.value = false;
        symbol_attribute.value = props.context.selection.selectedShapes.length < 2;
    }
}

const baseAttr = ref(true);
const editAttr = ref<boolean>(false);
const baseAttrVisible = () => {
    const shape = props.context.selection.selectedShapes[0]
    if (props.context.selection.selectedShapes.length === 1 && shape.type === ShapeType.Table) {
        const table = props.context.tableSelection;
        const is_editing = props.context.tableSelection.editingCell;
        baseAttr.value = table.tableColStart === -1 && !is_editing;
    } else {
        baseAttr.value = true;
    }
}

const change = throttle(_change, 100);

function tool_watcher(t: number) {
    if (t === Tool.CHANGE_ACTION) getShapeType();
}

function selection_watcher(t: number) {
    change(t)
}

function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_TABLE_CELL) baseAttrVisible();
    else if (t === TableSelection.CHANGE_EDITING_CELL) baseAttrVisible();
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        const _is_pdm = props.context.workspace.is_path_edit_mode;
        baseAttr.value = !_is_pdm;
        editAttr.value = _is_pdm;
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    _change(Selection.CHANGE_SHAPE);
    props.context.tool.watch(tool_watcher);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <section id="Design">
        <el-scrollbar>
            <div v-if="!len">
                <PageBackgorund :context="props.context" v-if="props.context.selection.selectedPage"
                                :page="props.context.selection.selectedPage"></PageBackgorund>
            </div>
            <div v-else class="attr-wrapper">
                <Arrange :context="props.context" :shapes="shapes"></Arrange>
                <ShapeBaseAttr v-if="baseAttr" :context="props.context"></ShapeBaseAttr>
                <BaseForPathEdit v-if="editAttr" :context="props.context"></BaseForPathEdit>
                <Opacity :shapes="shapes" :context="props.context"></Opacity>
                <Module v-if="symbol_attribute" :context="props.context" :shapeType="shapeType"
                        :shapes="shapes"></Module>
                <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
                <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
                <Text v-if="WITH_TEXT.includes(shapeType)" :shape="(shapes[0] as TextShape)"
                      :textShapes="(textShapes as TextShape[])" :context="props.context"></Text>
                <TableText v-if="WITH_TABLE.includes(shapeType)" :shape="(shapes[0] as TableShape)"
                           :context="props.context">
                </TableText>
                <Shadow v-if="WITH_SHADOW.includes(shapeType)" :shapes="shapes" :context="props.context">
                </Shadow>
                <CutoutExport :shapes="shapes" :context="props.context"></CutoutExport>
            </div>
        </el-scrollbar>
    </section>
</template>

<style scoped lang="scss">
section {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;

    .attr-wrapper {
        padding-bottom: 100px;
        box-sizing: border-box;
    }
}
</style>