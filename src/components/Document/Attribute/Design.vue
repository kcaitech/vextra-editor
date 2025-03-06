/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { onMounted, onUnmounted, onUpdated, ref, shallowRef } from 'vue';
import { ArtboardView, ShapeType, ShapeView, SymbolRefView, TableCellView, TableView, TextShapeView } from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr/Index.vue';
import Fill from './Fill2/Index.vue'
import Border from './Border2/Index.vue';
import PageBackground from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import { throttle } from 'lodash';
import Module from './Module/Module.vue'
import TableText from './Table/TableText.vue'
import CutoutExport from './CutoutExport/index.vue'
import Opacity from './Opacity/Opacity.vue';
import ResizingConstraints from '@/components/Document/Attribute/ResizingConstraint/index.vue';
import BaseForPathEdit from "@/components/Document/Attribute/BaseAttr/BaseForPathEdit.vue";
import InstanceAttr from './Module/InstanceAttr.vue';
import { get_var_for_ref, is_part_of_symbol, is_shapes_if_symbolref } from '@/utils/symbol';
import { useI18n } from 'vue-i18n';
import { TableSelection } from '@/context/tableselection';
import { flattenShapes } from '@/utils/cutout';
import ArtboardTemplate from "@/components/Document/Attribute/Artboard/ArtboardTemplate.vue";
import { Action, Tool } from "@/context/tool";
import AutoLayout from "./AutoLayout/index.vue"
import BlurVue from "./Blur/index.vue";
import Scale from "./Scale/index.vue";
import Shadow2 from "./Shadow2/Index.vue";
import StyleList from './StyleList/Index.vue';

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
    ShapeType.SymbolUnion,
    ShapeType.SymbolRef,
    ShapeType.BoolShape,
    ShapeType.Image,
];
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
    ShapeType.SymbolUnion,
    ShapeType.SymbolRef,
    ShapeType.BoolShape
];
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
    ShapeType.SymbolUnion,
    ShapeType.SymbolRef,
    ShapeType.Star,
    ShapeType.Polygon,
    ShapeType.BoolShape
]
const WITHOUT_OPACITY = [
    ShapeType.Cutout,
    ShapeType.TableCell
]

const props = defineProps<{ context: Context }>();
const shapes = shallowRef<ShapeView[]>([]);
const textShapes = ref<ShapeView[]>([]);
const tableShapes = ref<ShapeView[]>([]);
const { t } = useI18n();
const shapeType = ref();
const symbol_attribute = ref<boolean>(true);
const baseAttr = ref(true);
const editAttr = ref<boolean>(false);
const constraintShow = ref<boolean>(true);
const autoLayout = ref<boolean>(false);

const reflush_by_selection = ref<number>(0);
const reflush_by_table_selection = ref<number>(0);
const reflush_by_shapes = ref<number>(0);
const reflush = ref<number>(0);
const reflush_trigger = ref<any[]>([]);
const reflush_cells_trigger = ref<any[]>([]);

const frame = ref<boolean>(false);

const scaleMode = ref<boolean>(false);

// 图层选区变化
function _selection_change() {
    baseAttr.value = true;
    editAttr.value = false;
    symbol_attribute.value = false;
    autoLayout.value = false;

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length === 1) {
        symbol_attribute.value = true;
        const shape = selectedShapes[0];
        shapeType.value = shape.type;
        if ([ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolUnion, ShapeType.SymbolRef].includes(shape.type)) {
            autoLayout.value = true;
        }
        if (shape instanceof SymbolRefView && (!shape.autoLayout || !shape.symData?.autoLayout)) {
            autoLayout.value = false;
        }
    }

    shapes.value = [];
    textShapes.value = [];
    tableShapes.value = [];
    constraintShow.value = true;

    for (let i = 0, l = selectedShapes.length; i < l; i++) {
        const shape = selectedShapes[i];
        shapes.value.push(shape);
        if (shape.type === ShapeType.Text) {
            textShapes.value.push(shape);
        }
        if (shape.type === ShapeType.Table && !shape.isVirtualShape /* 实例暂不支持调整整表的文本属性 */) {
            tableShapes.value.push(shape);
        }

        if (!is_constrainted(shape)) {
            constraintShow.value = false;
        }
    }
    if (constraintShow.value) {
        const isAuto = selectedShapes.some(s => {
            return s.parent && (s.parent as ArtboardView).autoLayout;
        });
        if (isAuto) constraintShow.value = false;
    }

    reflush_by_selection.value++;
    reflush.value++;
}

const selection_change = _selection_change;

function is_constrainted(shape: ShapeView) {
    return shape.isVirtualShape || ([ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolUnion].includes(shape.parent?.type || ShapeType.Rectangle))
}

// 表格选区变化
function table_selection_change() {
    reflush_by_table_selection.value++;
}

let __trigger: Set<any> = new Set();
// 选区图层变化
function update_by_shapes(...args: any[]) {
    modify_constraint_show();
    args.forEach(v => __trigger.add(v))
    reflush_trigger.value = Array.from(__trigger);
    reflush_by_shapes.value++;
    reflush.value++;
}

function clear() {
    __trigger.clear();
}
function _modify_constraint_show() {
    constraintShow.value = props.context.selection.selectedShapes.every(
        s => is_constrainted(s)
    );
    const isAuto = props.context.selection.selectedShapes.some(s => {
        return s.parent && (s.parent as ArtboardView).autoLayout;
    });
    if (isAuto) constraintShow.value = false;
}

const modify_constraint_show = throttle(_modify_constraint_show, 160, { leading: true });

// 表格选区单元格变化
function update_by_cells(...args: any[]) {
    reflush_cells_trigger.value = [...(args?.length ? args : [])];
    reflush.value++;
}

function table_selection_watcher(t: number) {
    table_selection_change();
    watch_cells();
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        const table = props.context.selection.tableSelection;
        if (table.tableRowStart < 0) {
            baseAttr.value = true;
        }
    }
}

function selection_watcher(t: number | string) {
    if (t !== Selection.CHANGE_SHAPE && t !== Selection.CHANGE_PAGE) {
        return;
    }
    selection_change();
    watch_shapes();
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        const _is_pdm = props.context.workspace.is_path_edit_mode;
        baseAttr.value = !_is_pdm;
        editAttr.value = _is_pdm;
    }
}

const is_symbolref = () => {
    return is_shapes_if_symbolref(shapes.value) && need_instance_attr_show();
}
const need_instance_attr_show = () => {
    let v = false;
    if (shapes.value.length === 1) {
        const symref = props.context.selection.symbolrefview;
        if (!symref) {
            return false;
        }
        if (!is_part_of_symbol(symref)) {
            return true;
        }
        const result = get_var_for_ref(symref, t);

        if (!result) {
            return false;
        }

        v = !!(result.variables.length || result.visible_variables.length);
    }
    return v;
}

const shadowLimit = () => {
    return shapes.value.length < 6;
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selectedShapes);
    shapes.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

const watchCells = new Map<string, TableCellView>(); // 表格单元格监听
function watch_cells() {
    watchCells.forEach((v, k) => {
        v.unwatch(update_by_cells);
        watchCells.delete(k);
    })

    const tableSelection = props.context.tableSelection;

    const selectedCells = tableSelection.getSelectedCells();
    const editedCell = tableSelection.editingCell;
    const list = [...selectedCells.map(s => s.cell)];
    if (editedCell) {
        list.push(editedCell);
    }
    if (list.length) {
        baseAttr.value = false;
    }

    list.forEach(v => {
        if (v) {
            v.watch(update_by_cells);
            watchCells.set(v.id, v);
        }
    })
}

function toolWatcher(t: number) {
    if (t === Tool.CHANGE_ACTION) {
        frame.value = props.context.tool.action === Action.AddFrame;
        scaleMode.value = props.context.tool.action === Action.AutoK;
    }
}

onUpdated(clear);

onMounted(() => {
    props.context.workspace.watch(workspace_watcher);
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    props.context.tool.watch(toolWatcher);
    _selection_change();
    table_selection_change();
    watch_shapes();
    watch_cells();
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.tool.unwatch(toolWatcher);
    watchedShapes.forEach(v => {
        v.unwatch(update_by_shapes);
    });
    watchCells.forEach(v => {
        v.unwatch(update_by_cells);
    })
})
</script>

<template>
    <section id="Design">
        <div style="display: none">{{ reflush }}</div>
        <el-scrollbar height="100%">
            <div v-if="!shapes.length && props.context.selection.selectedPage">
                <PageBackground :context="props.context" :page="props.context.selection.selectedPage" />
                <CutoutExport :shapes="shapes" :context="props.context" :trigger="reflush_trigger" />
                <StyleList :context="props.context"></StyleList>
            </div>
            <div v-if="shapes.length" class="attr-wrapper">
                <Arrange :context="props.context" :shapes="shapes" :selection-change="reflush_by_selection"
                    :trigger="reflush_trigger" />
                <ShapeBaseAttr v-if="baseAttr" :context="props.context" :selection-change="reflush_by_selection"
                    :trigger="reflush_trigger" :shapes="shapes" />
                <Scale v-if="scaleMode" :context="props.context" :selection-change="reflush_by_selection"
                    :shape-change="reflush_trigger" />
                <div v-else>
                    <Module v-if="symbol_attribute" :context="props.context" :shapeType="shapeType" :shapes="shapes" />
                    <InstanceAttr :context="context" v-if="is_symbolref()" :shapes="(shapes as SymbolRefView[])" />
                    <AutoLayout v-if="autoLayout || shapes.length > 1" :trigger="reflush_trigger"
                        :selection-change="reflush_by_selection" :context="props.context" :shapes="shapes" />
                    <BaseForPathEdit v-if="editAttr" :context="props.context" />
                    <ResizingConstraints v-if="constraintShow" :context="props.context" :trigger="reflush_trigger"
                        :selection-change="reflush_by_selection" />
                    <Opacity v-if="!WITHOUT_OPACITY.includes(shapeType)" :context="props.context"
                        :selection-change="reflush_by_selection" :trigger="reflush_trigger" />
                    <Text v-if="textShapes.length" :shape="((textShapes[0]) as TextShapeView)"
                        :selection-change="reflush_by_selection" :textShapes="((textShapes) as TextShapeView[])"
                        :context="props.context" :trigger="reflush_trigger" />
                    <TableText v-if="tableShapes.length" :shape="(tableShapes[0] as TableView)"
                        :context="props.context" />
                    <Fill v-if="WITH_FILL.includes(shapeType)" :context="context"
                        :selection-change="reflush_by_selection" :trigger="reflush_trigger" />
                    <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="context"
                        :selection-change="reflush_by_selection" :trigger="reflush_trigger" />
                    <Shadow2 v-if="WITH_SHADOW.includes(shapeType) && shadowLimit()" :context="props.context"
                        :selection-change="reflush_by_selection" :trigger="reflush_trigger" />
                    <BlurVue v-if="WITH_SHADOW.includes(shapeType)" :shapes="shapes"
                        :selection-change="reflush_by_selection" :trigger="reflush_trigger" :context="props.context" />
                    <CutoutExport :shapes="shapes" :context="props.context" :trigger="reflush_trigger" />
                </div>
            </div>
        </el-scrollbar>
        <artboard-template v-if="frame" :context="context" />
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