<script setup lang="ts">
import ColorPicker from "@/components/common/ColorPicker/index.vue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Context } from "@/context";
import { Color } from "@kcdesign/data";
import { Reg_HEX } from "@/utils/color";
import { message } from "@/utils/message";
interface Props {
    context: Context
}
const props = defineProps<Props>();
const { t } = useI18n();
const background_color = ref<Color>(new Color(1, 239, 239, 239));
const clr_v = ref<string>('EFEFEF');
const alpha_v = ref<number>(100);
const clr_ele = ref<HTMLInputElement>();
const alpha_ele = ref<HTMLInputElement>();
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
    clr_v.value = toHex(r, b, b);
    const nc = new Color(alpha, r, g, b);
    props.context.workspace.setBackground(nc);
    background_color.value = nc;
}
function colorChangeFromPicker(c: Color) {
    background_color.value = c;
    props.context.workspace.setBackground(c);
    clr_v.value = toHex(c.red, c.green, c.blue);
    alpha_v.value = c.alpha * 100;
}
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
function init() {
    const c = props.context.workspace.background;
    background_color.value = c || new Color(1, 239, 239, 239);
    clr_v.value = toHex(c.red, c.green, c.blue);
    alpha_v.value = c.alpha * 100;
}
function change_a(e: Event) {
    let value = (e.currentTarget as any)['value'];
    value = Number(value) / 100;
    if (1 >= value && value >= 0) {
        setColor("#" + clr_v.value, value);
        alpha_v.value = value * 100;
    } else if (value > 1) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(100);
        }
    } else if (value < 0) {
        if (alpha_ele.value) {
            alpha_ele.value.value = String(0);
        }
    }
}
function clr_click() {
    if (clr_ele.value) {
        clr_ele.value.select();
    }
}
function alpha_click() {
    if (alpha_ele.value) {
        alpha_ele.value?.select();
    }
}
onMounted(() => {
    init();
})
</script>
<template>
    <div class="wrap">
        <span>{{ t('attr.background') }}</span>
        <div class="setting">
            <ColorPicker class="color" :color="(background_color as Color)" :context="props.context" :late="-24"
                @change="c => colorChangeFromPicker(c)">
            </ColorPicker>
            <input type="text" @change="(e: Event) => change_c(e)" :value="clr_v" id="clr" ref="clr_ele" @click="clr_click"
                :spellcheck="false">
            <input type="number" @change="(e: Event) => change_a(e)" :value="alpha_v" id="alpha" :max="100" :min="0"
                @click="alpha_click" :step="1" ref="alpha_ele">
        </div>
    </div>
</template>
<style scoped lang="scss">
.wrap {
    padding: 10px 13px;
    box-sizing: border-box;

    >span {
        font-weight: 700;
    }

    .setting {
        width: 100%;
        height: 28px;
        border-radius: 4px;
        padding: 8px 0px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .color {
            flex-shrink: 0;
        }

        input {
            outline: none;
            border: none;
        }

        #clr {
            margin-left: 13px;
            width: 80px;
        }

        #alpha {
            width: 40px;
        }
    }
}
</style>