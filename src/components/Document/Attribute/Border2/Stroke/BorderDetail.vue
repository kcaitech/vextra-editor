/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref, watch, onUnmounted, reactive, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import { Context } from '@/context';
import { BorderStyle, CornerType, ShapeType } from "@kcaitech/vextra-core";
import { genOptions } from '@/utils/common';
import { Selection } from '@/context/selection';
import { get_actions_border, get_actions_border_style, get_borders_corner } from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import BorderSideSelected from './BorderSideSelected.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import select_more_icon from '@/assets/icons/svg/select-more.svg';
import corner_miter_icon from '@/assets/icons/svg/corner-miter.svg';
import corner_bevel_icon from '@/assets/icons/svg/corner-bevel.svg';
import corner_round_icon from '@/assets/icons/svg/corner-round.svg';
import { customizable, StrokeFillContextMgr } from '../ctx';
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';
import PopoverHeader from "@/components/common/PopoverHeader.vue";

const props = defineProps<{
    context: Context
    manager: StrokeFillContextMgr
    trigger: any[]
}>();
const { t } = useI18n();
const borderStyle = ref<SelectItem>({ value: 'dash', content: t('attr.dash') });
const borderStyleOptionsSource: SelectSource[] = genOptions([
    ['solid', t('attr.solid')],
    ['dash', t('attr.dash')]
]);
const selected = ref<CornerType>();
const is_corner = ref(true);
const is_border_custom = ref(false);
const mixed = ref(false);

const detailsPanelStatus = reactive<ElementStatus>({ id: '#border-detail-container', visible: false });
const detailsPanelStatusMgr = new ElementManager(
    props.context,
    detailsPanelStatus,
    { whiteList: ['#border-detail-container', '.borders-container'], level: 1 }
);

function showDetailPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('borders-container')) {
            e && detailsPanelStatusMgr.showBy(e, { once: { offsetLeft: -266, offsetTop: 6 } });
            break;
        }
        e = e.parentElement;
    }
    updater();
    update_corner();
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
    hidden_selection(props.context);
}

function setCornerType(type: CornerType) {
    if (selected.value === type) return;
    selected.value = type;
    const flat = props.context.selection.flat;
    if (flat.length < 1) return;
    const actions = get_actions_border(flat, type);
    if (actions && actions.length) props.manager.modifyCornerType(actions);
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
        if (v?.includes('bordersMask') || v?.includes('borders') || v?.includes('variables')) updater();
    }),
    props.context.selection.watch((t?: any) => {
        if (t === Selection.CHANGE_SHAPE) update_corner();
    })
];

onUnmounted(() => watchList.forEach(stop => stop()));
</script>

<template>
    <div class="border-trigger" :class="{ 'active': detailsPanelStatus.visible }" @click="showDetailPanel">
        <SvgIcon :icon="select_more_icon" />
    </div>
    <div v-if="detailsPanelStatus.visible" class="border-detail-container" id="border-detail-container">
        <PopoverHeader :title="t('attr.advanced_stroke')" :create="false" @close="detailsPanelStatusMgr.close()"/>
        <div class="options-container">
            <div>
                <label>{{ t('attr.borderStyle') }}</label>
                <Select class="select" :source="borderStyleOptionsSource" :selected="borderStyle"
                    :item-view="BorderStyleItem" :value-view="BorderStyleSelected" @select="borderStyleSelect"
                    :mixed="mixed" />
            </div>
            <BorderSideSelected v-if="is_border_custom && !manager.fillCtx.strokeMask" :context="context"
                                :manager="manager" :trigger="trigger"
                                @repositioning="() => nextTick(() => detailsPanelStatusMgr.repositioning())">
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
    </div>
</template>

<style scoped lang="scss">
.active {
    background-color: #EBEBEB !important;
}

.border-trigger {
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--default-radius);

    >img {
        width: 16px;
        height: 16px;
    }
}

.border-trigger:hover {
    background-color: #F5F5F5;
}

#border-detail-container {
    width: 254px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 99;

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
        }
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

.selected {
    background-color: #FFFFFF;
}
</style>