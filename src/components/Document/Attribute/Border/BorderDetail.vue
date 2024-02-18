<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import { Context } from '@/context';
import { Border, BorderPosition, BorderStyle, GroupShapeView, ShapeType, ShapeView, TableView } from "@kcdesign/data";
import { genOptions } from '@/utils/common';
import { Selection } from '@/context/selection';
import { get_actions_border_thickness, get_actions_border_position, get_actions_border_style } from '@/utils/shape_style';
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, is_editing, hidden_selection } from '@/utils/content';
import { getShapesForStyle } from '@/utils/style';

interface Props {
    context: Context
    shapes: ShapeView[]
    border: Border
    index: number
}

const props = defineProps<Props>();
const { t } = useI18n();
const isActived = ref(false)
const editor = computed(() => {
    return props.context.editor4Shape(props.shapes[0]);
});
const len = computed(() => props.shapes.length);
const popover = ref();
const isDrag = ref(false)
const curpt: { x: number } = { x: 0 }
const _curpt: { x: number } = { x: 0 }
const scale = ref<{ axleX: number }>({
    axleX: 0
})
const show_position = ref<boolean>(true);
const showStartStyle = ref<boolean>(true)
const showEndStyle = ref<boolean>(true)
const borderThickness = ref<HTMLInputElement>();
const borderStyle = ref<SelectItem>({ value: 'dash', content: t('attr.dash') });
const borderStyleOptionsSource: SelectSource[] = genOptions([
    ['solid', t('attr.solid')],
    ['dash', t('attr.dash')]
]);
const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);

function showMenu() {
    updater();
    popover.value.show();
}

function updater() {
    // border position init
    const positionSelected = positonOptionsSource.find(i => i.data.value === props.border.position)?.data;
    positionSelected && (position.value = positionSelected);

    // border style init
    const bs = ((s: BorderStyle) => s.length > 0 ? 'dash' : 'solid')(props.border.borderStyle);
    const borderStyleSelected = borderStyleOptionsSource.find(i => i.data.value === bs)?.data;
    borderStyleSelected && (borderStyle.value = borderStyleSelected);
}

function borderStyleSelect(selected: SelectItem) {
    borderStyle.value = selected;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const bs = selected.value === 'dash' ? new BorderStyle(2, 2) : new BorderStyle(0, 0);
        const e = props.context.editor4Table(shape as TableView);
        const range = get_table_range(table);
        e.setBorderStyle(props.index, bs, range)
    } else {
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
        const actions = get_actions_border_style(shapes, props.index, (selected.value as 'dash' | 'solid'));
        if (actions && actions.length) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderStyle(actions);
        }
    }
    popover.value.focus();
    hidden_selection(props.context);
}

function positionSelect(selected: SelectItem) {
    position.value = selected;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shapes = getShapesForStyle(selecteds);
    const actions = get_actions_border_position(shapes, props.index, selected.value as BorderPosition);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderPosition(actions);
    }
    popover.value.focus();
    hidden_selection(props.context);
}

function setThickness(e: Event) {
    const thickness = Number((e.target as HTMLInputElement).value);
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shape = selecteds[0];
    const table = props.context.tableSelection;
    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
        const e = props.context.editor4Table(shape as TableView);
        const range = get_table_range(table);
        e.setBorderThickness(props.index, thickness, range)
    } else {
        const shapes = getShapesForStyle(selecteds);
        const actions = get_actions_border_thickness(shapes, props.index, thickness);
        if (actions && actions.length) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderThickness(actions);
        }
    }
    hidden_selection(props.context);
}

const augment = (e: Event) => {
    if (borderThickness.value) {
        const selecteds = props.context.selection.selectedShapes;
        const page = props.context.selection.selectedPage;
        if (!page || selecteds.length < 1) return;
        const shape = selecteds[0];
        const table = props.context.tableSelection;
        const thickness = Number(borderThickness.value.value) + 1
        if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(shape as TableView);
            const range = get_table_range(table);
            e.setBorderThickness(props.index, thickness, range)

        } else {
            const shapes = getShapesForStyle(selecteds);
            const actions = get_actions_border_thickness(shapes, props.index, thickness);
            if (actions && actions.length) {
                const editor = props.context.editor4Page(page);
                editor.setShapesBorderThickness(actions);
            }
        }
        borderThickness.value.value = String(Number(borderThickness.value.value) + 1)
        hidden_selection(props.context);
    }
}
const decrease = (e: Event) => {
    if (borderThickness.value) {
        if (Number(borderThickness.value.value) === 0) return
        const thickness = Number(borderThickness.value.value) - 1;
        const selecteds = props.context.selection.selectedShapes;
        const page = props.context.selection.selectedPage;
        if (!page || selecteds.length < 1) return;
        const shape = selecteds[0];
        const table = props.context.tableSelection;
        if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
            const table = props.context.tableSelection;
            const e = props.context.editor4Table(shape as TableView);
            const range = get_table_range(table);
            e.setBorderThickness(props.index, thickness, range)

        } else {
            const shapes = getShapesForStyle(selecteds);
            const actions = get_actions_border_thickness(shapes, props.index, thickness);
            if (actions && actions.length) {
                const editor = props.context.editor4Page(page);
                editor.setShapesBorderThickness(actions);
            }
        }
        borderThickness.value.value = String(Number(borderThickness.value.value) - 1)
    }
    hidden_selection(props.context);
}

watch(() => props.border, () => {
    updater();
}, { deep: true })

const onMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    isDrag.value = true
    //鼠标按下时的位置
    curpt.x = e.screenX
    _curpt.x = e.screenX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}
const i = ref(0)
const onMouseMove = (e: MouseEvent) => {
    let mx = e.screenX - curpt.x
    scale.value.axleX = e.screenX - _curpt.x
    if (scale.value.axleX > 0 || Number(borderThickness.value!.value) !== 0) {
        curpt.x = e.screenX
        i.value = i.value + 1
        if (i.value >= 3 && isDrag.value) {
            i.value = 0
            const selecteds = props.context.selection.selectedShapes;
            const page = props.context.selection.selectedPage;
            if (!page || selecteds.length < 1) return;
            const shape = selecteds[0];
            const table = props.context.tableSelection;
            if (mx > 0) {
                if (borderThickness.value) {
                    const thickness = Number(borderThickness.value.value) + 1;
                    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
                        const table = props.context.tableSelection;
                        const e = props.context.editor4Table(shape as TableView);
                        const range = get_table_range(table);
                        e.setBorderThickness(props.index, thickness, range)
                    } else {
                        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
                        const actions = get_actions_border_thickness(shapes, props.index, thickness);
                        if (actions && actions.length) {
                            const editor = props.context.editor4Page(page);
                            editor.setShapesBorderThickness(actions);
                        }
                    }
                    borderThickness.value.value = String(Number(borderThickness.value.value) + 1)
                }
            } else if (mx < 0) {
                if (borderThickness.value) {
                    let thickness = Number(borderThickness.value.value) - 1
                    if (thickness <= 0) {
                        thickness = 0
                        _curpt.x = e.screenX
                    }
                    if (selecteds.length === 1 && shape.type === ShapeType.Table && is_editing(table)) {
                        const table = props.context.tableSelection;
                        const e = props.context.editor4Table(shape as TableView);
                        const range = get_table_range(table);
                        e.setBorderThickness(props.index, thickness, range)
                    } else {
                        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
                        const actions = get_actions_border_thickness(shapes, props.index, thickness);
                        if (actions && actions.length) {
                            const editor = props.context.editor4Page(page);
                            editor.setShapesBorderThickness(actions);
                        }
                    }
                    if (Number(borderThickness.value.value) > 0) {
                        borderThickness.value.value = String(Number(borderThickness.value.value) - 1)
                    }
                }
            }
        }
    }
}
const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation()
    isDrag.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}

function layout() {
    showStartStyle.value = false;
    showEndStyle.value = false;
    show_position.value = true;
    if (props.shapes.length === 1) {
        const shape = props.shapes[0];
        if (shape.type === ShapeType.Line) {
            show_position.value = false;
            if (props.index === 0) {
                showStartStyle.value = true;
                showEndStyle.value = true;
            }
        }
    } else if (props.shapes.length > 1) {
        const _idx = props.shapes.findIndex(i => i.type === ShapeType.Line);
        if (_idx > -1 && props.index === 0) {
            showStartStyle.value = true;
            showEndStyle.value = true;
        }
    }
}

function selection_wather(t?: any) {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) layout();
}

const selectBorderThicknes = () => {
    isActived.value = true
    borderThickness.value?.select()
}
function blur2() {
    isActived.value = false
}
onMounted(() => {
    props.context.selection.watch(selection_wather);
    layout();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
</script>

<template>
    <div class="border-detail-container" @mousedown.stop>
        <Popover :context="props.context" class="popover" ref="popover" :width="200" :auto_to_right_line="true"
            :title="t('attr.advanced_stroke')">
            <template #trigger>
                <div class="trigger">
                    <div class="bg" @click="showMenu">
                        <svg-icon icon-class="gear"></svg-icon>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="options-container">
                    <!-- 边框位置 -->
                    <div v-if="show_position" :style="{ opacity: shapes[0].type === ShapeType.Table ? '.5' : '1' }">
                        <label>{{ t('attr.position') }}</label>
                        <Select class="select" :source="positonOptionsSource" :selected="position"
                            @select="positionSelect"></Select>
                    </div>
                    <!-- 边框厚度 -->
                    <div>
                        <label>{{ t('attr.thickness') }}</label>
                        <div class="thickness-container" :class="{ actived: isActived }">
                            <svg-icon icon-class="thickness" @mousedown="onMouseDown"></svg-icon>
                            <input ref="borderThickness" type="text" :value="border.thickness"
                                @change="e => setThickness(e)" @blur="blur2" @focus="selectBorderThicknes">
                            <div class="up_down" :class="{ active: isActived }">
                                <svg-icon icon-class="down" style="transform: rotate(180deg);" @click="augment"></svg-icon>
                                <svg-icon icon-class="down" @click="decrease"></svg-icon>
                            </div>
                        </div>
                    </div>
                    <!-- 边框样式 -->
                    <div>
                        <label>{{ t('attr.borderStyle') }}</label>
                        <Select class="select" :source="borderStyleOptionsSource" :selected="borderStyle"
                            :item-view="BorderStyleItem" :value-view="BorderStyleSelected"
                            @select="borderStyleSelect"></Select>
                    </div>
                </div>
            </template>
        </Popover>
    </div>
</template>

<style scoped lang="scss">
.border-detail-container {
    >.popover {
        width: 28px;
        height: 32px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            .bg {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .bg:hover {
                background-color: #F5F5F5;
            }
        }

        .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px 12px 0 12px;
            box-sizing: border-box;
            height: 100%;

            >div {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                >.select {
                    width: 128px;
                    height: 32px;
                }

                >label {
                    flex: 0 0 24px;
                    box-sizing: border-box;
                    width: 24px;
                    height: 14px;
                    font-family: HarmonyOS Sans;
                    font-size: 12px;
                    color: #737373;
                    margin-right: 24px;
                }

                >.thickness-container {
                    box-sizing: border-box;
                    padding: 3px;
                    background-color: var(--input-background);
                    width: calc(100% - 48px);
                    height: 32px;
                    border-radius: var(--default-radius);
                    display: flex;
                    align-items: center;

                    >svg {
                        cursor: ew-resize;
                        flex: 0 0 24px;
                        height: 24px;
                        margin-left: 9px;
                    }

                    >input {
                        outline: none;
                        border: none;
                        width: calc(100% - 68px);
                        margin-left: 12px;
                        background-color: transparent;
                    }

                    input::selection {
                        color: #FFFFFF;
                        background: #1878F5;
                    }

                    input::-moz-selection {
                        color: #FFFFFF;
                        background: #1878F5;
                    }

                    .up_down {
                        width: 19px;
                        height: 100%;
                        color: #666666;
                        align-items: center;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-around;
                        border-radius: 4px;

                        >svg {
                            width: 12px;
                            height: 12px;
                        }
                    }

                    .up_down:hover {
                        background-color: #EBEBEB;
                    }

                    .up_down.active {
                        background-color: #EBEBEB;
                    }
                }

                .actived {
                    border: 1px solid #1878F5;
                }

            }
        }
    }
}
</style>