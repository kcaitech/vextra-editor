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
import SvgIcon from "@/components/common/SvgIcon.vue";
import delete_icon from "@/assets/icons/svg/delete.svg";

import { Context } from "@/context";
import { FillCatch, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { h, nextTick, onUnmounted, reactive, ref, watch, watchEffect } from "vue";
import { selectAllOnFocus } from "@/components/Document/Attribute/basic";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { Fill, FillType, GradientType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import CheckBox from "@/components/common/CheckBox.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { FillsPicker } from "@/components/common/ColorPicker/Editor/stylectxs/fillspicker";
import { getGradientCatch, GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { getPatternCatch, PatternCatch } from "@/components/common/ColorPicker/Editor/patternlineareditor";

/**
 * 用于展示和修改一条填充的属性
 */
const props = defineProps<{
    context: Context;
    manager: FillsContextMgr;
    data: FillCatch;
    last?: boolean;
}>();
const { t } = useI18n();
const colorHex = ref<string>(props.data.fill.color.toHex().slice(1));
const alpha = ref<string>(Math.round(props.data.fill.color.alpha * 100) + '%');
const colors = ref<Fill[]>([props.data.fill]);
const innerText = ref<string>('');
const compo = ref<any>();
const fillType = ref<string>(FillType.SolidColor);
const rgba = ref<RGBACatch>({ R: 153, G: 43, B: 43, A: 0.52, position: 1 });
const gradient = ref<GradientCatch | undefined>();
const pattern = ref<PatternCatch | undefined>();

const styleReplace = {
    flex: 1,
    width: '46px',
    outline: 'none',
    border: 'none',
    height: '14px',
    'background-color': 'transparent',
    'font-size': ' 12px',
    'box-sizing': 'border-box'
};
const HexInput = () => h('input', {
    style: styleReplace,
    value: colorHex.value,
    spellcheck: false,
    onFocus: selectAllOnFocus,
    onChange: (e) => props.manager.modifyFillHex(e, props.data.fill)
});
const DescSpan = () => h('div', {
    style: Object.assign({
        display: 'flex',
        'align-items': 'center'
    }, styleReplace),
    innerText: innerText.value
});

function assemble() {
    switch (props.data.fill.fillType) {
        case FillType.Gradient:
            innerText.value = t(`color.${props.data.fill.gradient!.gradientType}`);
            compo.value = DescSpan();
            break;
        case FillType.Pattern:
            innerText.value = t('pattern.image');
            compo.value = DescSpan();
            break;
        default:
            compo.value = HexInput();
    }
}

const colorPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.fill-item-container'], onDestroy: clearColorPanelStatus }
);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('fill-item-container')) {
            const color = props.context.color;
            color.set_gradient_type(fillType.value as GradientType);
            color.gradient_locate({ index: fillsPicker.index, type: "fills" });
            color.switch_editor_mode(true, props.data.fill.gradient);
            color.setImageScaleMode(undefined);
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -262} });
            break;
        }
        e = e.parentElement;
    }
}

const fillsPicker = new FillsPicker(props.context, props.data.fill.fillType);

function update() {
    const fill = props.data.fill;
    const color = fill.color;
    colorHex.value = color.toHex().slice(1);
    alpha.value = Math.round(color.alpha * 100) + '%';
    colors.value = [fill];
    fillsPicker.fill = fill;

    pattern.value = undefined;
    gradient.value = undefined;

    if (fill.fillType === FillType.Gradient) {
        fillType.value = fill.gradient!.gradientType;
        gradient.value = getGradientCatch(fill.gradient!);
        const opacity = fill.gradient?.gradientOpacity ?? 1;
        alpha.value = Math.round(opacity * 100) + '%';
    } else if (fill.fillType === FillType.Pattern) {
        fillType.value = fill.fillType;
        pattern.value = getPatternCatch(fill);
    } else {
        fillType.value = fill.fillType;
        rgba.value = { R: color.red, G: color.green, B: color.blue, A: color.alpha, position: 1 };
    }
    assemble();
}

function clearColorPanelStatus() {
    const color = props.context.color;
    if (color.gradient_type) color.set_gradient_type(undefined);
    if (color.locate) color.gradient_locate(undefined);
    if (color.mode) color.switch_editor_mode(false);
    if (color.imageScaleMode) color.setImageScaleMode(undefined);
    props.context.color.select_stop(undefined);
}

function close() {
    colorPanelStatusMgr.close();
    clearColorPanelStatus();
}

const watchList = [
    watchEffect(update),
    watchEffect(() => {
        const fill = props.data.fill;
        const color = props.context.color;
        if (!colorPanelStatus.visible) return;
        if (fillType.value === FillType.SolidColor) {
            if (color.gradient_type) color.set_gradient_type(undefined);
            if (color.locate) color.gradient_locate(undefined);
            if (color.mode) color.switch_editor_mode(false);
            if (color.imageScaleMode) color.setImageScaleMode(undefined);
            props.context.color.select_stop(undefined);
        } else if (fillType.value === FillType.Pattern) {
            color.gradient_locate({ index: fillsPicker.index, type: "fills" });
            color.setImageScaleMode(fill.imageScaleMode);
            color.setImageOriginFrame({
                width: fill.originalImageWidth ?? 100,
                height: fill.originalImageHeight ?? 100
            });
            color.setImageScale(fill.scale);
            color.switch_editor_mode(false);
            props.context.color.select_stop(undefined);
        } else {
            color.set_gradient_type(fillType.value as GradientType);
            color.gradient_locate({ index: fillsPicker.index, type: "fills" });
            color.switch_editor_mode(true, fill.gradient);
            color.setImageScaleMode(undefined);
        }
    }),
    watch(() => fillType.value, () => nextTick(() => colorPanelStatusMgr.repositioning()))
];

onUnmounted(() => {
    watchList.forEach(stop => stop());
    colorPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="fill-item-container">
        <CheckBox :check="data.fill.isEnabled" @change="() => manager.modifyVisible(data.fill)" />
        <div :class="{ 'value-panel-wrapper': true, disabled: !data.fill.isEnabled }">
            <ColorBlock :colors="colors as Fill[]" @click="showColorPanel" />
            <component v-blur :is="compo" />
            <input v-blur class="alpha" type="text" :value="alpha" @focus="selectAllOnFocus"
                @change="(e) => manager.modifyFillAlpha(e, data.fill)" />
        </div>
        <div class="delete" :class="{ disabled: last }" @click="() => manager.remove(data.fill)">
            <SvgIcon :icon="delete_icon" />
        </div>
    </div>
    <ColorPicker v-if="colorPanelStatus.visible" :editor="fillsPicker" :type="fillType" :color="rgba!"
        :gradient="gradient" :pattern="pattern" @close="close" />
</template>
<style scoped lang="scss">
.fill-item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;

    .value-panel-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        flex: 1;
        height: 32px;
        padding: 0 8px;
        box-sizing: border-box;
        background-color: var(--input-background);
        border-radius: var(--default-radius);

        .alpha {
            width: 46px;
            outline: none;
            border: none;
            background-color: transparent;
            height: 14px;
            font-size: 12px;
            box-sizing: border-box;
            flex: 0 0 46px;
            text-align: right;
        }
    }

    .disabled {
        opacity: 0.3;
        pointer-events: none;
    }

    .delete {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: #F5F5F5;
        }
    }
}
</style>