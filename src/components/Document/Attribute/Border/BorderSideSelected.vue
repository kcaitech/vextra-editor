<script lang="ts" setup>
import { Context } from '@/context';
import BorderCustomInput from './BorderCustomInput.vue';
import { Border, ShapeType, ShapeView, SideType, TableView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border, get_borders_side } from '@/utils/shape_style';
import { Selection } from '@/context/selection';
import { get_table_range, hidden_selection, is_editing } from '@/utils/content';


interface Props {
    context: Context
    border: Border
    index: number
}

const props = defineProps<Props>();
const select_side = ref<SideType>();

const update_side = () => {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group && (s.type === ShapeType.Rectangle || s.type === ShapeType.Artboard || s.type === ShapeType.Symbol || s.type === ShapeType.SymbolRef));
    if(!shapes.length) return;
    const action = get_borders_side(shapes, props.index);
    if (action) {
        select_side.value = action;
    } else {
        select_side.value = undefined;
    }
}

const setSideType = (type: SideType) => {
    if (select_side.value === type) return;
    select_side.value = type;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(shape as TableView);
        const range = get_table_range(table);
    } else {
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border(shapes, props.index, type);
        if (actions && actions.length) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderSideType(actions);
        }
    }
    hidden_selection(props.context);
}

function selection_wather(t?: any) {
    if (t === Selection.CHANGE_SHAPE) {
        update_side();
    }
}
onMounted(() => {
    update_side();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
</script>

<template>
    <div class="container">
        <div class="border-style" style="margin-bottom: 6px;">
            <div class="border">单边</div>
            <div class="border-select">
                <div class="all" :class="{ selected: select_side === SideType.Normal }" @click="setSideType(SideType.Normal)">
                    <svg-icon icon-class="border-all"></svg-icon>
                </div>
                <div class="top" :class="{ selected: select_side === SideType.Top }" @click="setSideType(SideType.Top)">
                    <svg-icon icon-class="border-top"></svg-icon>
                </div>
                <div class="bottom" :class="{ selected: select_side === SideType.Bottom }" @click="setSideType(SideType.Bottom)">
                    <svg-icon icon-class="border-bottom"></svg-icon>
                </div>
                <div class="left" :class="{ selected: select_side === SideType.Left }" @click="setSideType(SideType.Left)">
                    <svg-icon icon-class="border-left"></svg-icon>
                </div>
                <div class="right" :class="{ selected: select_side === SideType.Right }" @click="setSideType(SideType.Right)">
                    <svg-icon icon-class="border-right"></svg-icon>
                </div>
                <div class="custom" :class="{ selected: select_side === SideType.Custom }" @click="setSideType(SideType.Custom)" >
                    <svg-icon icon-class="border-custom"></svg-icon>
                </div>
            </div>
        </div>
        <div class="border-style" style="margin-bottom: 6px;" v-if="select_side === SideType.Custom">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="top" :shadowV="0"></BorderCustomInput>
                <BorderCustomInput ticon="bottom" :shadowV="0"></BorderCustomInput>
            </div>
        </div>
        <div class="border-style" v-if="select_side === SideType.Custom">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="left" :shadowV="0"></BorderCustomInput>
                <BorderCustomInput ticon="right" :shadowV="0"></BorderCustomInput>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 12px;
}

.border-style {
    width: 100%;
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .border {
        flex: 0 0 24px;
        box-sizing: border-box;
        width: 24px;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        color: #737373;
        margin-right: 24px;
    }

    .border-select {
        flex: 1;
        height: 32px;
        border-radius: var(--default-radius);
        background-color: #F5F5F5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2px;
        box-sizing: border-box;

        >div {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            height: 28px;

            >svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .border-custom {
        flex: 1;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;

        svg {
            width: 16px;
            height: 16px;
        }
    }
}

.selected {
    background-color: #FFFFFF;
}
</style>