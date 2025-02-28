<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import delete_icon from "@/assets/icons/svg/delete.svg";
import { Context } from "@/context";
import { FillCatch } from "@/components/Document/Attribute/Fill2/ctx";
import { h, onUnmounted, reactive, ref, watchEffect } from "vue";
import { selectAllOnFocus } from "@/components/Document/Attribute/basic";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { Fill, FillType, GradientType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import CheckBox from "@/components/common/CheckBox.vue";
import { StrokeFillContextMgr } from "./ctx";
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { GradientCatch, getGradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { PaintsPicker } from "@/components/common/ColorPicker/Editor/stylectxs/paintspicker";

const props = defineProps<{
    context: Context;
    manager: StrokeFillContextMgr;
    data: FillCatch;
}>();
const { t } = useI18n();
const fillTypes = [FillType.SolidColor, FillType.Gradient];
const colorHex = ref<string>(props.data.fill.color.toHex().slice(1));
const alpha = ref<string>(props.data.fill.color.alpha * 100 + '%');
const colors = ref<Fill[]>([props.data.fill]);
const innerText = ref<string>();
const compo = ref<any>();
const fillType = ref<string>(FillType.SolidColor);
const rgba = ref<RGBACatch>({ R: 153, G: 43, B: 43, A: 0.52, position: 1 });
const gradient = ref<GradientCatch | undefined>();

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
    { whiteList: ['#color-piker-gen-2-panel', '.color-wrapper'], onDestroy: close }
);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('color-wrapper')) {
            const color = props.context.color;
            color.set_gradient_type(fillType.value as GradientType);
            color.gradient_locate({ index: fillsPicker.index, type: "borders" });
            color.switch_editor_mode(true, props.data.fill.gradient);
            color.setImageScaleMode(undefined);
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -290 } });
            break;
        }
        e = e.parentElement;
    }
}

const fillsPicker = new PaintsPicker(props.context, props.data.fill.fillType);

function update() {
    const fill = props.data.fill;
    const color = fill.color;
    colorHex.value = color.toHex().slice(1);
    alpha.value = Math.round(color.alpha * 100) + '%';
    colors.value = [fill];
    fillsPicker.paint = fill;

    gradient.value = undefined;

    if (fill.fillType === FillType.Gradient) {
        fillType.value = fill.gradient!.gradientType;
        gradient.value = getGradientCatch(fill.gradient!);
        const opacity = fill.gradient?.gradientOpacity ?? 1;
        alpha.value = Math.round(opacity * 100) + '%';
    } else {
        fillType.value = fill.fillType;
        rgba.value = { R: color.red, G: color.green, B: color.blue, A: color.alpha, position: 1 };
    }

    assemble();
}

function close() {
    colorPanelStatusMgr.close();
    const color = props.context.color;
    if (color.gradient_type) color.set_gradient_type(undefined);
    if (color.locate) color.gradient_locate(undefined);
    if (color.mode) color.switch_editor_mode(false);
}

const stop1 = watchEffect(update);
const stop2 = watchEffect(() => {
    const fill = props.data.fill;
    const color = props.context.color;
    if (!colorPanelStatus.visible) return;
    if (fillType.value === FillType.SolidColor) {
        if (color.gradient_type) color.set_gradient_type(undefined);
        if (color.locate) color.gradient_locate(undefined);
        if (color.mode) color.switch_editor_mode(false);
    } else {
        color.set_gradient_type(fillType.value as GradientType);
        color.gradient_locate({ index: fillsPicker.index, type: "borders" });
        color.switch_editor_mode(true, fill.gradient);
        color.setImageScaleMode(undefined);
    }
})

onUnmounted(() => {
    stop1();
    stop2();
    colorPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="fill-item-container">
        <CheckBox :check="data.fill.isEnabled" @change="() => manager.modifyVisible(data.fill)" />
        <div :class="{ 'value-panel-wrapper': true, disabled: !data.fill.isEnabled }">
            <ColorBlock :colors="(colors as Fill[])" @click="showColorPanel" />
            <component v-blur :is="compo" />
            <input v-blur class="alpha" type="text" :value="alpha" @focus="selectAllOnFocus"
                @change="(e) => manager.modifyFillAlpha(e, data.fill)" />
        </div>
        <div class="delete" :class="{ disabled: (manager.fillCtx.mask && manager.fillCtx.fills.length === 1) }"
            @click="() => manager.remove(data.fill)">
            <SvgIcon :icon="delete_icon" />
        </div>
        <ColorPicker v-if="colorPanelStatus.visible" :editor="fillsPicker" :type="fillType" :include="fillTypes"
            :color="rgba!" :gradient="gradient" @close="close" />
    </div>
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