/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Page, ResizingConstraints2, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Select, { SelectItem, SelectSource } from './ConstraintSelect.vue';
import { genOptions } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import TypeHeader from '../TypeHeader.vue';
import { throttle } from 'lodash';
import ConstraintBox from "@/components/Document/Attribute/ResizingConstraint/ConstraintBox.vue";
import SvgIcon from "@/components/common/SvgIcon.vue";

interface Props {
    context: Context;
    trigger: any[];
    selectionChange: number;
}

const { t } = useI18n();
const props = defineProps<Props>();
const mixed = t('attr.mixed');

const horizontalPositionSelected = ref<SelectItem>({ value: 'left', content: t('attr.fixed_left') });
const horizontalPositionOptions: SelectSource[] = genOptions([
    ['left', t('attr.fixed_left')],
    ['right', t('attr.fixed_right')],
    ['lrfixed', t('attr.fixed_left_right')],
    ['hcenter', t('attr.center')],
    ['hfollow', t('attr.follow_container')]
]);

const verticalPositionSelected = ref<SelectItem>({ value: 'top', content: t('attr.fixed_top') });
const VerticalPositionOptions: SelectSource[] = genOptions([
    ['top', t('attr.fixed_top')],
    ['bottom', t('attr.fixed_bottom')],
    ['tbfixed', t('attr.fixed_top_bottom')],
    ['vcenter', t('attr.center')],
    ['vfollow', t('attr.follow_container')]
]);

const fixedWidth = ref<boolean | string>(false);
const disableToFixedWidth = ref<boolean>(false);
const fixedHeight = ref<boolean | string>(false);
const disableToFixedHeight = ref<boolean>(false);

function createEditor() {
    const page = props.context.selection.selectedPage!;
    return props.context.editor.editor4ResizingConstraint(adapt2Shape(page) as Page);
}

function handleHorizontalPositionSelect(item: SelectItem, shift?: boolean) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'left':
            if (shift) {
                const ov = horizontalPositionSelected.value.value;
                if (ov === 'right') {
                    e.fixedToLR(selected);
                } else if (ov === 'lrfixed') {
                    e.fixedToRight(selected);
                } else if (ov === 'left') {
                    e.scaleByWidth(selected);
                } else {
                    e.fixedToLeft(selected);
                }
            } else {
                e.fixedToLeft(selected);
            }
            break;
        case 'right':
            if (shift) {
                const ov = horizontalPositionSelected.value.value;
                if (ov === 'left') {
                    e.fixedToLR(selected);
                } else if (ov === 'lrfixed') {
                    e.fixedToLeft(selected);
                } else if (ov === 'right') {
                    e.scaleByWidth(selected);
                } else {
                    e.fixedToRight(selected);
                }
            } else {
                e.fixedToRight(selected);
            }
            break;
        case 'hcenter':
            if (shift) {
                if (horizontalPositionSelected.value.value === 'hcenter') {
                    e.scaleByWidth(selected);
                } else {
                    e.HorizontaljustifyCenter(selected);
                }
            } else {
                e.HorizontaljustifyCenter(selected);
            }
            break;
        case 'lrfixed':
            e.fixedToLR(selected);
            break;
        case 'hfollow':
            e.scaleByWidth(selected);
            break;
        default:
            break;
    }
}

function handleCheckboxChangeForWidth() {
    if (disableToFixedWidth.value) return;
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    if (fixedWidth.value === 'mixed') return e.fixedToWidth(selected)
    if (fixedWidth.value) {
        e.flexWidth(selected);
    } else {
        e.fixedToWidth(selected);
    }
}

function handleVerticalPositionSelect(item: SelectItem, shift?: boolean) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'top':
            if (shift) {
                const ov = verticalPositionSelected.value.value;
                if (ov === 'bottom') {
                    e.fixedToTB(selected);
                } else if (ov === 'tbfixed') {
                    e.fixedToBottom(selected);
                } else if (ov === 'top') {
                    e.scaleByHeight(selected);
                } else {
                    e.fixedToTop(selected);
                }
            } else {
                e.fixedToTop(selected);
            }
            break;
        case 'bottom':
            if (shift) {
                const ov = verticalPositionSelected.value.value;
                if (ov === 'top') {
                    e.fixedToTB(selected);
                } else if (ov === 'tbfixed') {
                    e.fixedToTop(selected);
                } else if (ov === 'bottom') {
                    e.scaleByHeight(selected);
                } else {
                    e.fixedToBottom(selected);
                }
            } else {
                e.fixedToBottom(selected);
            }
            break;
        case 'vcenter':
            if (shift) {
                if (verticalPositionSelected.value.value === 'vcenter') {
                    e.scaleByHeight(selected);
                } else {
                    e.VerticaljustifyCenter(selected);
                }
            } else {
                e.VerticaljustifyCenter(selected);
            }
            break;
        case 'tbfixed':
            e.fixedToTB(selected);
            break;
        case 'vfollow':
            e.scaleByHeight(selected);
            break;
        default:
            break;
    }
}

function handleCheckboxChangeForHeight() {
    if (disableToFixedHeight.value) return;
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    if (fixedHeight.value === 'mixed') return e.fixedToHeight(selected);
    if (fixedHeight.value) {
        e.flexHeight(selected);
    } else {
        e.fixedToHeight(selected);
    }
}

const disabled = ref(false)
const selected = ref()

function _update() {
    modifyhorizontalPositionStatus();
    modifyverticalPositionStatus();
    modifyWidthStatus();
    modifyHeightStatus();
    disabled.value = props.context.selection.selectedShapes.some(item => item.isVirtualShape);
    selected.value = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
}

function modifyhorizontalPositionStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            horizontalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint || 0;

    if (ResizingConstraints2.isFixedLeftAndRight(rc)) {
        horizontalPositionSelected.value = { value: 'lrfixed', content: t('attr.fixed_left_right') };
    } else if (ResizingConstraints2.isFixedToLeft(rc)) {
        horizontalPositionSelected.value = { value: 'left', content: t('attr.fixed_left') };
    } else if (ResizingConstraints2.isFixedToRight(rc)) {
        horizontalPositionSelected.value = { value: 'right', content: t('attr.fixed_right') };
    } else if (ResizingConstraints2.isHorizontalJustifyCenter(rc)) {
        horizontalPositionSelected.value = { value: 'hcenter', content: t('attr.center') };
    } else if (ResizingConstraints2.isFlexWidth(rc)) {
        horizontalPositionSelected.value = { value: 'hfollow', content: t('attr.follow_container') }
    }

    function getGroupVal(val: number) {
        return (val & ResizingConstraints2.Left) + (val & ResizingConstraints2.Right) + (val & ResizingConstraints2.HCenter);
    }
}

function modifyWidthStatus() {
    disableToFixedWidth.value = false;
    fixedWidth.value = false;

    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }
    const rc0 = shapes[0].resizingConstraint || 0;
    fixedWidth.value = ResizingConstraints2.isFixedWidth(rc0);

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 0, l = shapes.length; i < l; i++) {
        const rc = shapes[i].resizingConstraint || 0;
        if (ResizingConstraints2.isFixedLeftAndRight(rc) || ResizingConstraints2.isHorizontalScale(rc)) {
            disableToFixedWidth.value = true;
        }

        let __rc = getGroupVal(rc);
        if (__rc !== commonRC) {
            fixedWidth.value = 'mixed';
        }
    }

    function getGroupVal(val: number) {
        return val & ResizingConstraints2.Width;
    }
}

function modifyverticalPositionStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            verticalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint || 0;

    if (ResizingConstraints2.isFixedTopAndBottom(rc)) {
        verticalPositionSelected.value = { value: 'tbfixed', content: t('attr.fixed_top_bottom') };
    } else if (ResizingConstraints2.isFixedToTop(rc)) {
        verticalPositionSelected.value = { value: 'top', content: t('attr.fixed_top') };
    } else if (ResizingConstraints2.isFixedToBottom(rc)) {
        verticalPositionSelected.value = { value: 'bottom', content: t('attr.fixed_bottom') };
    } else if (ResizingConstraints2.isVerticalJustifyCenter(rc)) {
        verticalPositionSelected.value = { value: 'vcenter', content: t('attr.center') };
    } else if (ResizingConstraints2.isFlexHeight(rc)) {
        verticalPositionSelected.value = { value: 'vfollow', content: t('attr.follow_container') }
    }

    function getGroupVal(val: number) {
        return (val & ResizingConstraints2.Top) + (val & ResizingConstraints2.Bottom) + (val & ResizingConstraints2.VCenter);
    }
}

function modifyHeightStatus() {
    disableToFixedHeight.value = false;
    fixedHeight.value = false;

    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    const rc0 = shapes[0].resizingConstraint || 0;
    fixedHeight.value = ResizingConstraints2.isFixedHeight(rc0);

    let commonRC = getGroupVal(rc0);
    for (let i = 0, l = shapes.length; i < l; i++) {
        const rc = shapes[i].resizingConstraint || 0;
        let __rc = getGroupVal(rc);
        if (__rc !== commonRC) {
            fixedHeight.value = 'mixed';
        }
        if (ResizingConstraints2.isFixedTopAndBottom(rc) || ResizingConstraints2.isVerticalScale(rc)) {
            disableToFixedHeight.value = true;
        }
    }

    function getGroupVal(val: number) {
        return (ResizingConstraints2.Mask ^ val & ResizingConstraints2.Height);
    }
}

const update = throttle(_update, 160, { leading: true });

const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, update); // 监听选区变化

onMounted(update);
onUnmounted(() => {
    stop();
    stop2();
});

import select_icon from '@/assets/icons/svg/select.svg';
import vertical_constraint_icon from '@/assets/icons/svg/vertical-constraint.svg';
import horizontal_constraint_icon from '@/assets/icons/svg/horizontal-constraint.svg';

</script>
<template>
<div class="wrap">
    <TypeHeader :title="t('attr.groupings')" class="mt-24" :active="!disabled">
    </TypeHeader>
    <ConstraintBox
        :horizontal-position-selected="horizontalPositionSelected.value as string"
        :vertical-position-selected="verticalPositionSelected.value as string"
        :disable-to-fixed-width="disableToFixedWidth"
        :fixed-width="fixedWidth"
        :disable-to-fixed-height="disableToFixedHeight"
        :fixed-height="fixedHeight"
        @change-hor-position="(params: any, shift?: boolean) => {handleHorizontalPositionSelect(params as SelectItem, shift)}"
        @change-ver-position="(params: any, shift?: boolean) => {handleVerticalPositionSelect(params as SelectItem, shift)}"
        @change-hor-size="handleCheckboxChangeForWidth"
        @change-ver-size="handleCheckboxChangeForHeight"
    />
    <div class="content" :class="{ 'disabled': disabled }">
        <div class="main">
            <div class="row">
                <Select :selected="horizontalPositionSelected" :source="horizontalPositionOptions"
                        @select="handleHorizontalPositionSelect" :disabled="disabled">
                    <template #prefix>
                        <SvgIcon style="width: 12px; height: 12px;" :icon="horizontal_constraint_icon"/>
                    </template>
                </Select>
                <div :class="{ checkboxWrap: true, disabledBox: disableToFixedWidth }"
                     @click="handleCheckboxChangeForWidth">
                    <div class="checkbox" :style="{ border: fixedWidth ? 'none' : '' }">
                        <div v-if="fixedWidth === 'mixed'" class="mixed-status">
                            <div class="mixed"></div>
                        </div>
                        <div v-else-if="fixedWidth" class="active">
                            <SvgIcon :icon="select_icon"/>
                        </div>
                    </div>
                    <span>{{ t('attr.fixedWidth') }}</span>
                </div>
            </div>
            <div class="row">
                <Select :selected="verticalPositionSelected" :source="VerticalPositionOptions"
                        @select="handleVerticalPositionSelect" :disabled="disabled">
                    <template #prefix>
                        <SvgIcon style="width: 12px; height: 12px;" :icon="vertical_constraint_icon"/>
                    </template>
                </Select>
                <div :class="{ checkboxWrap: true, disabledBox: disableToFixedHeight }"
                     @click="handleCheckboxChangeForHeight">
                    <div class="checkbox" :style="{ border: fixedHeight ? 'none' : '' }">
                        <div v-if="fixedHeight === 'mixed'" class="mixed-status">
                            <div class="mixed"></div>
                        </div>
                        <div v-else-if="fixedHeight" class="active">
                            <SvgIcon :icon="select_icon"/>
                        </div>
                    </div>
                    <span>{{ t('attr.fixedHeight') }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">

.disabled {
    opacity: 0.4;
}

.wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .content {
        padding: 6px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;

        .main {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;

            .row {
                width: 186px;
                display: flex;
                align-items: center;

                > .select-container {
                    flex: 1 1 84px;
                    height: 32px;
                }

                .checkboxWrap {
                    flex: 0 0 72px;
                    height: 14px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;

                    > .checkbox {
                        box-sizing: border-box;
                        border-radius: 3px;
                        background-color: transparent;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #808080;
                        overflow: hidden;
                        flex: 0 0 14px;
                        height: 14px;

                        > .mixed-status {
                            width: 14px;
                            height: 14px;
                            background-color: var(--active-color);
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            > div {
                                background-color: #ffffff;
                                width: 7px;
                                height: 1px;
                            }
                        }

                        .active {
                            width: 14px;
                            height: 14px;
                            background-color: var(--active-color);
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            > img {
                                width: 60%;
                                height: 60%;
                            }
                        }
                    }

                    > span {
                        margin-left: 4px;
                    }
                }

                > .disabledBox {
                    pointer-events: none;
                    opacity: 0.3;
                }
            }
        }
    }
}
</style>