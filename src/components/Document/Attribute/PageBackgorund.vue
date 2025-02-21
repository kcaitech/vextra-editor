<script setup lang="ts">
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Context } from "@/context";
import { Color, Page, PageView, FillType } from "@kcdesign/data";
import { Reg_HEX } from "@/utils/color";
import { message } from "@/utils/message";
import { debounce } from "@/utils/timing_util";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { selectAllOnFocus } from '@/components/Document/Attribute/basic';

interface Props {
    context: Context
    page: PageView
}

const props = defineProps<Props>();
const { t } = useI18n();
let background_color = new Color(1, 239, 239, 239);
const colors = ref<Color[]>([background_color] as Color[]);
const clr_v = ref<string>('EFEFEF');
const alpha_v = ref<number>(100);
const clr_ele = ref<HTMLInputElement>();
const alpha_ele = ref<HTMLInputElement>();

const colorPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.color-wrapper'] }
);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('color-wrapper')) {
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -290 } });
            break;
        }
        e = e.parentElement;
    }
}

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
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

const _colorChangeFromPicker = debounce((c: Color) => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    editor.setBackground(c);
}, 100)
const colorChangeFromPicker = (c: Color) => {
    _colorChangeFromPicker(c).catch((e) => {
    });
};

function change_c(e: Event) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') value = "#" + value;
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (Reg_HEX.test(value)) {
        setColor(value, alpha_v.value / 100);
    } else {
        message('danger', t('system.illegal_input'));
    }
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

function change_a(e: Event) {
    let value = (e.currentTarget as any)['value'];
    value = Number(value) / 100;
    if (isNaN(value)) {
        return;
    }
    if (1 >= value && value >= 0) {
        setColor("#" + clr_v.value, value);
        alpha_v.value = value * 100;
    } else if (value > 1) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(100);
            setColor("#" + clr_v.value, 1);
        }
    } else if (value < 0) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(0);
            setColor("#" + clr_v.value, 0);
        }
    }
}

function init_value(c: Color) {
    colors.value = [c];
    clr_v.value = toHex(c.red, c.green, c.blue);
    alpha_v.value = c.alpha * 100;
}

const is_color_select = ref(false);

function clr_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_color_select.value) return;
    el.select();
    is_color_select.value = true;
}

const is_alpha_select = ref(false);

function alpha_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_alpha_select.value) return;
    el.select();
    is_alpha_select.value = true;
}

const stopWatch = watch(() => props.page, (cur) => {
    const f = cur.data.backgroundColor;
    if (f) init_value(f);
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
            <!-- <ColorPicker class="color" :color="background_color" :context="props.context" :late="-26"
                         :auto_to_right_line="true" @change="c => colorChangeFromPicker(c)">
            </ColorPicker> -->
            <ColorBlock :colors="(colors as Color[])" @click="showColorPanel" />
            <input class="colorShadow" type="text" :value="clr_v" @focus="selectAllOnFocus" @change="(e) => change_c(e)"
                @keyup.enter="(e) => (e.target as HTMLInputElement).blur()" />
            <input class="alphaShadow" type="text" :value="`${alpha_v}%`" @focus="selectAllOnFocus"
                @change="(e) => change_a(e)" @keyup.enter="(e) => (e.target as HTMLInputElement).blur()" />
            <!-- <input type="text" @change="(e: Event) => change_c(e)" :value="clr_v" id="clr" ref="clr_ele"
                   @click="clr_click" :spellcheck="false" @blur="is_color_select = false">
            <input @change="(e: Event) => change_a(e)" :value="`${alpha_v}%`" id="alpha" @blur="is_alpha_select = false"
                   @click="alpha_click" ref="alpha_ele"> -->
        </div>
        <ColorPicker v-if="colorPanelStatus.visible" :editor="fillsPicker" :type="FillType.SolidColor" :include="[]"
            :color="colors" @close="() => colorPanelStatusMgr.close()" />
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