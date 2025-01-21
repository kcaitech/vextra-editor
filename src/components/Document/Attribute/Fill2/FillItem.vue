<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import delete_icon from "@/assets/icons/svg/delete.svg";

import { Context } from "@/context";
import { FillCatch, FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import { h, onUnmounted, reactive, ref, watch } from "vue";
import { selectAllOnFocus } from "@/components/Document/Attribute/basic";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { Fill, FillType } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import CheckBox from "@/components/common/CheckBox.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";

/**
 * 用于展示和修改一条填充的属性
 */
const props = defineProps<{
    context: Context;
    manager: FillsContextMgr;
    data: FillCatch;
}>();
const {t} = useI18n();
const colorHex = ref<string>(props.data.fill.color.toHex().slice(1));
const alpha = ref<string>(props.data.fill.color.alpha * 100 + '%');
const colors = ref<(Fill)[]>([props.data.fill]);
const innerText = ref<string>('');
const compo = ref<any>();

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

const colorPanelStatus = reactive<ElementStatus>({id: '#color-piker-gen-2-panel', visible: false});
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    {whiteList: ['#color-piker-gen-2-panel', '.color-wrapper']}
);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('color-wrapper')) {
            colorPanelStatusMgr.showBy(e, {once: {offsetLeft: -290}});
            break;
        }
        e = e.parentElement;
    }
}

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

assemble();
onUnmounted(watch(() => props.data, () => {
    colorHex.value = props.data.fill.color.toHex().slice(1);
    alpha.value = props.data.fill.color.alpha * 100 + '%';
    colors.value = [props.data.fill];
    assemble();
}));
</script>
<template>
    <div class="fill-item-container">
        <CheckBox :check="data.fill.isEnabled" @change="() => manager.modifyVisible(data.fill)"/>
        <div :class="{'value-panel-wrapper': true, disabled: !data.fill.isEnabled}">
            <ColorBlock :colors="colors as Fill[]" @click="showColorPanel"/>
            <component :is="compo"/>
            <input class="alpha" type="text" :value="alpha"
                   @focus="selectAllOnFocus"
                   @change="(e) => manager.modifyFillAlpha(e, data.fill)"/>
        </div>
        <div class="delete" @click="() => manager.remove(data.fill)">
            <SvgIcon :icon="delete_icon"/>
        </div>
        <ColorPicker v-if="colorPanelStatus.visible" @close="() => colorPanelStatusMgr.close()"/>
    </div>
</template>
<style scoped lang="scss">
.fill-item-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 4px;

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
        > * {
            opacity: 0.3;
            pointer-events: none;
        }

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

        > img {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background-color: #F5F5F5;
        }
    }
}
</style>