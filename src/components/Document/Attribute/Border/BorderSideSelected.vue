<script lang="ts" setup>
import { Context } from '@/context';
import BorderCustomInput from './BorderCustomInput.vue';
import { Border, BorderSideSetting, ShapeType, ShapeView, SideType, TableView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border, get_borders_side, get_borders_side_thickness } from '@/utils/shape_style';
import { Selection } from '@/context/selection';
import { hidden_selection } from '@/utils/content';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface Props {
    context: Context
    border: Border
    index: number
    reflush_side: number
}

const props = defineProps<Props>();
const select_side = ref<SideType>();
const shapes = ref<ShapeView[]>();
const thickness_top = ref<number | string>(0);
const thickness_right = ref<number | string>(0);
const thickness_bottom = ref<number | string>(0);
const thickness_left = ref<number | string>(0);

const update_side = () => {
    const selected = props.context.selection.selectedShapes;
    const s = flattenShapes(selected).filter(s => s.type !== ShapeType.Group && (s.type === ShapeType.Rectangle || s.type === ShapeType.Artboard || s.type === ShapeType.Symbol || s.type === ShapeType.SymbolRef));
    if (!s.length) return;
    shapes.value = s;
    const action = get_borders_side(s, props.index);
    if (action) {
        select_side.value = action;
    } else {
        select_side.value = undefined;
    }
}

const setSideType = (type: SideType) => {
    if (select_side.value === type || !shapes.value) return;
    select_side.value = type;
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const border = shapes.value[0].style.borders[props.index];
    const data = getSideInfo(border, type)
    if (!data) return;
    const actions = get_actions_border(shapes.value, props.index, data);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderSide(actions);
    }
    hidden_selection(props.context);
}

const getSideInfo = (border: Border, type: SideType) => {
    const { thicknessBottom, thicknessTop, thicknessLeft, thicknessRight, sideType } = border.sideSetting;
    const max_thickness = Math.max(thicknessTop, thicknessLeft, thicknessBottom, thicknessRight)
    switch (type) {
        case SideType.Normal:
            if (sideType === SideType.Custom) {
                return new BorderSideSetting(type, max_thickness, max_thickness, max_thickness, max_thickness);
            } else {
                return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
        case SideType.Top:
            if (sideType === SideType.Custom) {
                return new BorderSideSetting(type, thicknessTop, thicknessTop, thicknessTop, thicknessTop);
            } else {
                return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
        case SideType.Left:
            if (sideType === SideType.Custom) {
                return new BorderSideSetting(type, thicknessLeft, thicknessLeft, thicknessLeft, thicknessLeft);
            } else {
                return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
        case SideType.Right:
            if (sideType === SideType.Custom) {
                return new BorderSideSetting(type, thicknessRight, thicknessRight, thicknessRight, thicknessRight);
            } else {
                return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
        case SideType.Bottom:
            if (sideType === SideType.Custom) {
                return new BorderSideSetting(type, thicknessBottom, thicknessBottom, thicknessBottom, thicknessBottom);
            } else {
                return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
        case SideType.Custom:
            switch (sideType) {
                case SideType.Top:
                    return new BorderSideSetting(type, thicknessTop, 0, 0, 0);
                case SideType.Left:
                    return new BorderSideSetting(type, 0, thicknessLeft, 0, 0);
                case SideType.Right:
                    return new BorderSideSetting(type, 0, 0, 0, thicknessRight);
                case SideType.Bottom:
                    return new BorderSideSetting(type, 0, 0, thicknessBottom, 0);
                case SideType.Normal:
                    return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
            }
    }
}

const setSideThickness = (thickness: number) => {
    console.log('setSideThickness', thickness);

}


function selection_wather(t?: any) {
    if (t === Selection.CHANGE_SHAPE) {
        update_side();
    }
}

watch(() => props.reflush_side, () => {
    getSideThickness();
})

const getSideThickness = () => {
    if (!shapes.value) return;
    const side = get_borders_side_thickness(shapes.value, props.index)
    if (side) {
        const { thicknessTop, thicknessLeft, thicknessBottom, thicknessRight } = side;
        thickness_bottom.value = thicknessBottom;
        thickness_top.value = thicknessTop;
        thickness_left.value = thicknessLeft;
        thickness_right.value = thicknessRight;
    } else {
        thickness_bottom.value = t('attr.more_value');
        thickness_top.value = t('attr.more_value');
        thickness_left.value = t('attr.more_value');
        thickness_right.value = t('attr.more_value');
    }
}

onMounted(() => {
    update_side();
    getSideThickness();
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
                <div class="all" :class="{ selected: select_side === SideType.Normal }"
                    @click="setSideType(SideType.Normal)">
                    <svg-icon icon-class="border-all"></svg-icon>
                </div>
                <div class="top" :class="{ selected: select_side === SideType.Top }" @click="setSideType(SideType.Top)">
                    <svg-icon icon-class="border-top"></svg-icon>
                </div>
                <div class="bottom" :class="{ selected: select_side === SideType.Bottom }"
                    @click="setSideType(SideType.Bottom)">
                    <svg-icon icon-class="border-bottom"></svg-icon>
                </div>
                <div class="left" :class="{ selected: select_side === SideType.Left }"
                    @click="setSideType(SideType.Left)">
                    <svg-icon icon-class="border-left"></svg-icon>
                </div>
                <div class="right" :class="{ selected: select_side === SideType.Right }"
                    @click="setSideType(SideType.Right)">
                    <svg-icon icon-class="border-right"></svg-icon>
                </div>
                <div class="custom" :class="{ selected: select_side === SideType.Custom }"
                    @click="setSideType(SideType.Custom)">
                    <svg-icon icon-class="border-custom"></svg-icon>
                </div>
            </div>
        </div>
        <div class="border-style" style="margin-bottom: 6px;" v-if="select_side === SideType.Custom">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="top" :shadowV="thickness_top" @onChange=setSideThickness></BorderCustomInput>
                <BorderCustomInput ticon="bottom" :shadowV="thickness_bottom" @onChange=setSideThickness>
                </BorderCustomInput>
            </div>
        </div>
        <div class="border-style" v-if="select_side === SideType.Custom">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="left" :shadowV="thickness_left" @onChange=setSideThickness>
                </BorderCustomInput>
                <BorderCustomInput ticon="right" :shadowV="thickness_right" @onChange=setSideThickness>
                </BorderCustomInput>
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