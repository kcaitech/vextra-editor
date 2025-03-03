<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import { Context } from '@/context';
import { BorderStyle, CornerType, ShapeType } from "@kcdesign/data";
import { genOptions } from '@/utils/common';
import { Selection } from '@/context/selection';
import { get_actions_border, get_actions_border_style, get_borders_corner } from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import { Menu } from "@/context/menu";
import BorderSideSelected from './BorderSideSelected.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import select_more_icon from '@/assets/icons/svg/select-more.svg';
import corner_miter_icon from '@/assets/icons/svg/corner-miter.svg';
import corner_bevel_icon from '@/assets/icons/svg/corner-bevel.svg';
import corner_round_icon from '@/assets/icons/svg/corner-round.svg';
import { customizable, StrokeFillContextMgr } from '../ctx';

const props = defineProps<{
    context: Context
    manager: StrokeFillContextMgr
    trigger: any[]
}>();
const { t } = useI18n();
const popover = ref();
const borderStyle = ref<SelectItem>({ value: 'dash', content: t('attr.dash') });
const borderStyleOptionsSource: SelectSource[] = genOptions([
    ['solid', t('attr.solid')],
    ['dash', t('attr.dash')]
]);
const selected = ref<CornerType>();
const is_corner = ref(true);
const is_border_custom = ref(false);
const mixed = ref(false);
function showMenu() {
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    updater();
    update_corner();
    popover.value.show();
}

function updater() {
    const strokeInfo = props.manager.fillCtx.strokeInfo;
    if (!strokeInfo) return;
    if (typeof strokeInfo.borderStyle === 'string') {
        mixed.value = true;
        borderStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        return;
    }
    const bs = ((s: BorderStyle) => s.length > 0 ? 'dash' : 'solid')(strokeInfo.borderStyle);
    const borderStyleSelected = borderStyleOptionsSource.find(i => i.data.value === bs)?.data;
    borderStyleSelected && (borderStyle.value = borderStyleSelected);
}

function borderStyleSelect(selected: SelectItem) {
    borderStyle.value = selected;
    const flat = props.context.selection.flat;
    const actions = get_actions_border_style(flat, selected.value as 'dash' | 'solid');
    if (actions && actions.length) props.manager.modifyStrokeStyle(actions);
    popover.value.focus();
    hidden_selection(props.context);
}

function setCornerType(type: CornerType) {
    if (selected.value === type) return;
    selected.value = type;
    const flat = props.context.selection.flat;
    if (flat.length < 1) return;
    const actions = get_actions_border(flat, type);
    if (actions && actions.length) props.manager.modifyCornerType(actions);
    popover.value.focus();
    hidden_selection(props.context);
}

function update_corner() {
    const flat = props.context.selection.selectedShapes;
    if (!flat.length) return;
    is_corner.value = flat.every(s => s.type === ShapeType.Line || s.type === ShapeType.Contact);
    if (is_corner.value) return;
    is_border_custom.value = flat.some(s => {
        return customizable.includes(s.type) && !s.data.haveEdit;
    });
    const actions = get_borders_corner(flat);
    if (actions) {
        selected.value = actions;
    } else {
        selected.value = undefined;
    }
}

const watchList: any[] = [
    watch(() => props.trigger, (v) => {
        if (v?.includes('bordersMask') || v?.includes('borders') || v?.includes('variables')) {
            updater();
        }
    }),
    props.context.selection.watch((t?: any) => {
        if (t === Selection.CHANGE_SHAPE) {
            update_corner();
        }
    })
];

onUnmounted(() => watchList.forEach(stop => stop()));
</script>

<template>
    <div class="border-detail-container" @mousedown.stop>
        <Popover :context="props.context" class="popover" ref="popover" :width="244" :auto_to_right_line="true"
            :title="t('attr.advanced_stroke')">
            <template #trigger>
                <div class="trigger">
                    <div class="bg" :class="{ active: props.context.menu.isPopoverExisted }" @click="showMenu">
                        <SvgIcon :icon="select_more_icon" />
                    </div>
                </div>
            </template>
            <template #body>
                <div class="options-container">
                    <div>
                        <label>{{ t('attr.borderStyle') }}</label>
                        <Select class="select" :source="borderStyleOptionsSource" :selected="borderStyle"
                            :item-view="BorderStyleItem" :value-view="BorderStyleSelected" @select="borderStyleSelect"
                                :mixed="mixed"/>
                    </div>
                    <BorderSideSelected v-if="is_border_custom && !manager.fillCtx.strokeMask" :context="context"
                        :manager="manager" :trigger="trigger">
                    </BorderSideSelected>
                    <div class="corner-style" v-if="!is_corner">
                        <div class="corner">{{ t('attr.corner') }}</div>
                        <div class="corner-select">
                            <div class="miter" :class="{ selected: selected === CornerType.Miter }"
                                @click="setCornerType(CornerType.Miter)" style="margin-right: 5px;">
                                <SvgIcon :icon="corner_miter_icon" />
                            </div>
                            <div class="bevel" :class="{ selected: selected === CornerType.Bevel }"
                                @click="setCornerType(CornerType.Bevel)">
                                <SvgIcon :icon="corner_bevel_icon" />
                            </div>
                            <div class="round" :class="{ selected: selected === CornerType.Round }"
                                @click="setCornerType(CornerType.Round)" style="margin-left: 5px;">
                                <SvgIcon :icon="corner_round_icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Popover>
    </div>
</template>

<style scoped lang="scss">
.active {
    background-color: #EBEBEB;
}

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

                >img {
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
                    flex: 1;
                    height: 32px;
                }

                >label {
                    flex: 0 0 24px;
                    box-sizing: border-box;
                    width: 24px;
                    height: 14px;
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

                    >img {
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

                        >img {
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

                .active {
                    border: 1px solid #1878F5;
                }

            }
        }

        .corner-style {
            width: 100%;
            height: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .corner {
                flex: 0 0 24px;
                box-sizing: border-box;
                width: 24px;
                font-size: 12px;
                color: #737373;
                margin-right: 24px;
            }

            .corner-select {
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

                    >img {
                        width: 16px;
                        height: 16px;
                    }
                }
            }
        }
    }
}

.selected {
    background-color: #FFFFFF;
}
</style>