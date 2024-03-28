<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import { Context } from '@/context';
import { Border, BorderStyle, ShapeType, ShapeView, TableView } from "@kcdesign/data";
import { genOptions } from '@/utils/common';
import { Selection } from '@/context/selection';
import {
    get_actions_border_style
} from '@/utils/shape_style';
import { flattenShapes } from '@/utils/cutout';
import { get_table_range, is_editing, hidden_selection } from '@/utils/content';
import { Menu } from "@/context/menu";

interface Props {
    context: Context
    shapes: ShapeView[]
    border: Border
    index: number
}

const props = defineProps<Props>();
const { t } = useI18n();
const popover = ref();
const showStartStyle = ref<boolean>(true)
const showEndStyle = ref<boolean>(true)
const borderStyle = ref<SelectItem>({ value: 'dash', content: t('attr.dash') });
const borderStyleOptionsSource: SelectSource[] = genOptions([
    ['solid', t('attr.solid')],
    ['dash', t('attr.dash')]
]);

function showMenu() {
    console.log('click')
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    updater();
    layout();
    popover.value.show();
}

function updater() {
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
        e.setBorderStyle4Cell(props.index, bs, range)
    } else {
        const shapes = flattenShapes(selecteds).filter(s => s.type !== ShapeType.Group);
        const actions = get_actions_border_style(shapes, props.index, (selected.value as 'dash' | 'solid'));
        if (actions && actions.length) {
            const editor = props.context.editor4Page(page);
            editor.setShapesBorderStyle(actions);
        }
    }
    popover.value.focus();
    hidden_selection(props.context);
}


watch(() => props.border, () => {
    updater();
}, { deep: true })


function layout() {
    showStartStyle.value = false;
    showEndStyle.value = false;
    if (props.shapes.length === 1) {
        const shape = props.shapes[0];
        if (shape.type === ShapeType.Line) {
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
                    <div class="bg" :class="{ actived: props.context.menu.ispopover }" @click="showMenu">
                        <svg-icon icon-class="select-more"></svg-icon>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="options-container">
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
.actived {
    background-color: #EBEBEB;
}

.border-detail-container {
    > .popover {
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

                > svg {
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

            > div {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                > .select {
                    width: 128px;
                    height: 32px;
                }

                > label {
                    flex: 0 0 24px;
                    box-sizing: border-box;
                    width: 24px;
                    height: 14px;
                    font-family: HarmonyOS Sans;
                    font-size: 12px;
                    color: #737373;
                    margin-right: 24px;
                }

                > .thickness-container {
                    box-sizing: border-box;
                    padding: 3px;
                    background-color: var(--input-background);
                    width: calc(100% - 48px);
                    height: 32px;
                    border-radius: var(--default-radius);
                    display: flex;
                    align-items: center;

                    > svg {
                        cursor: ew-resize;
                        flex: 0 0 24px;
                        height: 24px;
                        margin-left: 9px;
                    }

                    > input {
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

                        > svg {
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