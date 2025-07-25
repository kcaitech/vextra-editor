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
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Context } from "@/context";
import { Color, Page, PageView, FillType } from "@kcaitech/vextra-core";
import { Reg_HEX, toHex } from "@/utils/color";
import { message } from "@/utils/message";
import { debounce } from "@/utils/timing_util";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { selectAllOnFocus } from '@/components/Document/Attribute/basic';
import { RGBACatch } from '@/components/common/ColorPicker/Editor/solidcolorlineareditor';
import { backgroundColorPicker } from "@/components/common/ColorPicker/Editor/stylectxs/backgorundpicker";
interface Props {
    context: Context
    page: PageView
}

const props = defineProps<Props>();
const { t } = useI18n();
let background_color = new Color(1, 239, 239, 239);
const colors = ref<Color[]>([background_color] as Color[]);
const colorValue = ref<string>('EFEFEF');
const alphaValue = ref<number>(100);
const oldAlphaValue = ref<number>(100);
const colorInput = ref<HTMLInputElement>();
const alphaInput = ref<HTMLInputElement>();
const rgba = ref<RGBACatch>({ R: 0, G: 0, B: 0, A: 0.3, position: 1 });

const colorPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.color-wrapper'] }
);

const backgorundPicker = new backgroundColorPicker(props.context, FillType.SolidColor);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('color-wrapper')) {
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -268, offsetTop: -10 } });
            break;
        }
        e = e.parentElement;
    }
}

function setColor(clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) return message('danger', t('system.illegal_input'));
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const nc = new Color(alpha, r, g, b);
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    editor.setBackground(nc);
}

function change_c(e: Event) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') value = "#" + value;
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        setColor(value, alphaValue.value / 100);
    } else {
        message('danger', t('system.illegal_input'));
    }
}

function handleAlphaChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const rawValue = input.value;
    const numericValue = Number(rawValue) / 100;

    // 验证并处理有效输入
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
        setColor(`#${colorValue.value}`, numericValue);
        alphaValue.value = numericValue * 100;
        oldAlphaValue.value = alphaValue.value;
        return;
    }

    // 恢复旧值并清理无效输入
    if (alphaInput.value && oldAlphaValue.value !== undefined) {
        input.value = `${oldAlphaValue.value}%`;
    }
}

function init_value(c: Color) {
    colors.value = [c];
    rgba.value = { R: c.red, G: c.green, B: c.blue, A: c.alpha, position: 1 };
    colorValue.value = toHex(c).slice(1);
    alphaValue.value = c.alpha * 100;
}

function update() {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    if (!page.data.backgroundColor) {
        const c = Page.defaultBGColor;
        init_value(c);
    } else {
        const c = page.data.backgroundColor;
        init_value(new Color(c.alpha, c.red, c.green, c.blue));
    }
}

const stopWatch = watch(() => props.page, (cur, old) => {
    const f = cur.data.backgroundColor;
    if (f) init_value(f);
    if (old) old.unwatch(update);
    cur.watch(update);
})
onMounted(() => {
    update();
    props.page.watch(update);
})
onUnmounted(() => {
    props.page.unwatch(update);
    stopWatch();
})
</script>
<template>
    <div class="wrap">
        <div
            style="width: 224px;height: 30px;margin-bottom: 6px;align-items: center;justify-content: flex-start;display: flex;">
            <span>{{ t('attr.background') }}</span>
        </div>
        <div class="value-panel-wrapper">
            <ColorBlock :colors="(colors as Color[])" @click="showColorPanel" />
            <input ref="colorInput" class="colorShadow" type="text" :value="colorValue" @focus="selectAllOnFocus"
                @change="(e) => change_c(e)" @keyup.enter="(e) => (e.target as HTMLInputElement).blur()" />
            <input ref="alphaInput" class="alphaShadow" type="text" :value="`${alphaValue}%`" @focus="selectAllOnFocus"
                @change="(e) => handleAlphaChange(e)" @keyup.enter="(e) => (e.target as HTMLInputElement).blur()" />
        </div>
        <ColorPicker v-if="colorPanelStatus.visible" :editor="backgorundPicker" :type="FillType.SolidColor"
            :include="[]" :color="rgba" @close="() => colorPanelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
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

    .colorShadow {
        flex: 1;
        width: 46px;
        outline: none;
        border: none;
        height: 14px;
        background-color: transparent;
        font-size: 12px;
        box-sizing: border-box;
    }

    .alphaShadow {
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

.wrap {
    padding: 12px 8px;
    box-sizing: border-box;
    height: auto;
    border-bottom: 1px solid #F0F0F0;

    >span {
        width: 48px;
        height: 14px;
        font-weight: 700;
        font-family: HarmonyOS Sans;
        font-size: 12px;
        font-feature-settings: "kern" on;
        color: #000000;
    }

    .settings {
        width: 224px;
        height: 32px;
        border-radius: 4px;
        padding: 8px 60px 8px 8px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        background-color: #F4F5F5;

        .color {
            flex-shrink: 0;
        }

        input {
            outline: none;
            border: none;
            background-color: #F4F5F5;
        }

        #clr {
            margin-left: 16px;
            width: 92px;
            height: 14px;
        }

        #alpha {
            width: 40px;
            height: 14px;
        }
    }
}
</style>