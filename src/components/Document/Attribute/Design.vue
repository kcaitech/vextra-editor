<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { WorkSpace } from "@/context/workspace";
import { onMounted, onUnmounted, shallowRef, ref } from 'vue';
import { ShapeView, TextShapeView, TableView, SymbolRefView } from "@kcdesign/data"
import { ShapeType } from "@kcdesign/data"
import Arrange from './Arrange.vue';
import ShapeBaseAttr from './BaseAttr/Index.vue';
import Fill from './Fill/Fill.vue';
import Border from './Border/Border.vue';
import Shadow from './Shadow/Shadows.vue';
import PageBackgorund from './PageBackgorund.vue';
import Text from './Text/Text.vue';
import { debounce, throttle } from 'lodash';
import Module from './Module/Module.vue'
import TableText from './Table/TableText.vue'
import CutoutExport from './CutoutExport/index.vue'
import Opacity from './Opacity/Opacity.vue';
import ResizingConstraints from '@/components/Document/Attribute/ResizingConstraint/index.vue';
import BaseForPathEdit from "@/components/Document/Attribute/BaseAttr/BaseForPathEdit.vue";
import InstanceAttr from './Module/InstanceAttr.vue';
import { get_var_for_ref, is_part_of_symbol, is_shapes_if_symbolref } from '@/utils/symbol';
import { useI18n } from 'vue-i18n';

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
const WITHOUT_OPACITY = [
    ShapeType.Cutout,
    ShapeType.TableCell
]

const props = defineProps<{ context: Context }>();
const shapes = shallowRef<ShapeView[]>([]);
const textShapes = ref<ShapeView[]>([]);
const { t } = useI18n();
const shapeType = ref();
const symbol_attribute = ref<boolean>(true);
const opacity = ref<boolean>(false);
const baseAttr = ref(true);
const editAttr = ref<boolean>(false);
const constraintShow = ref<boolean>(true);

const reflush_by_selection = ref<number>(0);
const reflush_by_shapes = ref<number>(0);
const reflush = ref<number>(0);
const reflush_trigger = ref<any[]>([]);

function _selection_change() {
    baseAttr.value = true;
    editAttr.value = false;
    symbol_attribute.value = false;

    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length === 1) {
        symbol_attribute.value = true;
        const shape = selectedShapes[0];
        shapeType.value = shape.type;
        if (shape.type === ShapeType.Table) {
            const table = props.context.tableSelection;
            const is_editing = props.context.tableSelection.editingCell;
            baseAttr.value = table.tableColStart === -1 && !is_editing;
        }
    }

    shapes.value = [];
    textShapes.value = [];
    opacity.value = false;
    constraintShow.value = true;

    for (let i = 0, l = selectedShapes.length; i < l; i++) {
        const shape = selectedShapes[i];
        shapes.value.push(shape);
        if (shape.type === ShapeType.Text) {
            textShapes.value.push(shape);
        }
        if (!shape.isVirtualShape) {
            opacity.value = true;
        }
        if (![ShapeType.Artboard, ShapeType.Group, ShapeType.SymbolRef, ShapeType.SymbolRef].includes(shape.parent?.type || ShapeType.Rectangle)) {
            constraintShow.value = false;
        }
    }

    reflush_by_selection.value++;
    reflush.value++;
}
const selection_change = debounce(_selection_change, 160, { leading: true });

function update_by_shapes(...args: any[]) {
    modify_constraint_show();
    reflush_trigger.value = [...(args?.length ? args : [])];
    reflush_by_shapes.value++;
    reflush.value++;
}

function _modify_constraint_show() {
    constraintShow.value = props.context.selection.selectedShapes.every(
        s => [ShapeType.Artboard, ShapeType.Group, ShapeType.SymbolRef, ShapeType.SymbolRef]
            .includes(s.parent?.type || ShapeType.Rectangle)
    );
}

const modify_constraint_show = throttle(_modify_constraint_show, 160, { trailing: true });

function tool_watcher(t: number) {
    // if (t === Tool.CHANGE_ACTION) updateShapeType();
}

function selection_watcher(t: number) {
    if (t !== Selection.CHANGE_SHAPE) {
        return;
    }
    selection_change();
    watch_shapes();
}

function table_selection_watcher() {
    selection_change();
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
    } else if (shapes.value.length > 1) {
        // todo
    }
    return v;
}

const watchedShapes = new Map<string, ShapeView>();
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    selectedShapes.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    watch_shapes();
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    props.context.tool.watch(tool_watcher);
    props.context.workspace.watch(workspace_watcher);
    _selection_change();
    watch_shapes();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(update_by_shapes);
    });
})
</script>
<template>
    <section id="Design">
        <el-scrollbar height="100%">
            <div v-if="!shapes.length">
                <PageBackgorund :context="props.context" v-if="props.context.selection.selectedPage"
                    :page="props.context.selection.selectedPage"></PageBackgorund>
                <CutoutExport :shapes="shapes" :context="props.context" :trigger="reflush_trigger"></CutoutExport>
            </div>
            <div v-else class="attr-wrapper">
                <Arrange :context="props.context" :shapes="shapes"></Arrange>
                <ShapeBaseAttr v-if="baseAttr" :context="props.context" :selection-change="reflush_by_selection"
                    :triggle="reflush_trigger"></ShapeBaseAttr>
                <BaseForPathEdit v-if="editAttr" :context="props.context"></BaseForPathEdit>
                <ResizingConstraints v-if="constraintShow" :context="props.context" :trigger="reflush_trigger" :selection-change="reflush_by_selection">
                </ResizingConstraints>
                <Opacity v-if="opacity && !WITHOUT_OPACITY.includes(shapeType)" :context="props.context" :change="reflush">
                </Opacity>
                <Module v-if="symbol_attribute" :context="props.context" :shapeType="shapeType" :shapes="shapes"></Module>
                <InstanceAttr :context="context" v-if="is_symbolref()" :shapes="(shapes as SymbolRefView[])">
                </InstanceAttr>
                <Fill v-if="WITH_FILL.includes(shapeType)" :shapes="shapes" :context="props.context"></Fill>
                <Border v-if="WITH_BORDER.includes(shapeType)" :shapes="shapes" :context="props.context"></Border>
                <Text v-if="WITH_TEXT.includes(shapeType)" :shape="((textShapes[0]) as TextShapeView)"
                    :textShapes="((textShapes) as TextShapeView[])" :context="props.context"
                    :trigger="reflush_trigger"></Text>
                <TableText v-if="WITH_TABLE.includes(shapeType)" :shape="(shapes[0] as TableView)" :context="props.context">
                </TableText>
                <Shadow v-if="WITH_SHADOW.includes(shapeType)" :shapes="shapes" :context="props.context">
                </Shadow>
                <CutoutExport :shapes="shapes" :context="props.context" :trigger="reflush_trigger"></CutoutExport>
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