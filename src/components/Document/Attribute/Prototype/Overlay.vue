<template>
    <div class="set-float">
        <span>{{t('prototype.overlay_set')}}</span>
        <div class="content">
            <div class="position">
                <div v-for="i in  OverlayPositionType " :key="i" :class="{ 'ptactive': direction === i }"
                    @click.stop="setPosition(i)">
                </div>
            </div>
            <div class="margin">
                <div class="margin-item" v-for=" i  in  margin " :key="i[0]"
                    :style="{ pointerEvents: position?.position?.includes(i[0]) ? 'auto' : 'none', opacity: position?.position?.includes(i[0]) ? 1 : 0.4 }">
                    <svg-icon icon-class="margin" :style="{ rotate: i[1] + 'deg' }"></svg-icon>
                    <input v-select v-if="i[0] === 'TOP'" ref="marginInput" :id="i[0]" type="text"
                        :value="position?.position?.includes(i[0]) ? position.margin.top : '-'"
                        @change="setMargin($event, i[0], position?.margin.top!)">
                    <input v-select v-if="i[0] === 'BOTTOM'" ref="marginInput" :id="i[0]" type="text"
                        :value="position?.position?.includes(i[0]) ? position.margin.bottom : '-'"
                        @change="setMargin($event, i[0], position?.margin.bottom!)">
                    <input v-select v-if="i[0] === 'LEFT'" ref="marginInput" :id="i[0]" type="text"
                        :value="position?.position?.includes(i[0]) ? position.margin.left : '-'"
                        @change="setMargin($event, i[0], position?.margin.left!)">
                    <input v-select v-if="i[0] === 'RIGHT'" ref="marginInput" :id="i[0]" type="text"
                        :value="position?.position?.includes(i[0]) ? position.margin.right : '-'"
                        @change="setMargin($event, i[0], position?.margin.right!)">
                </div>
            </div>
        </div>
        <div class="checkbox">
            <input type="checkbox" id="closetab" v-model="overlayclose" @change="setInteraction">
            <label for="closetab">{{t('prototype.overlay_close')}}</label>
        </div>
        <div class="checkbox">
            <input type="checkbox" id="color" v-model="addmask" @change="setAppearance">
            <label for="color">{{t('prototype.overlay_background')}}</label>
        </div>
        <div v-if="addmask" class="setting">
            <ColorPicker class="color" :color="(background_color as Color)" :context="props.context"
                :auto_to_right_line="true" @change="c => colorChangeFromPicker(c)"></ColorPicker>
            <input v-select type="text" @change.stop="(e: Event) => change_c(e)" :value="clr_v" id="clr" ref="clr_ele"
                @click="clr_click" :spellcheck="false" @blur="is_color_select = false">
            <input v-select @change="(e: Event) => change_a(e)" :value="`${alpha_v}%`" id="alpha"
                @blur="is_alpha_select = false" @click="alpha_click" ref="alpha_ele">
        </div>

    </div>

</template>

<script setup lang="ts">
import ColorPicker from "@/components/common/ColorPicker/index.vue";
import { Reg_HEX } from "@/utils/color";
import { Color, OverlayBackgroundAppearance, OverlayBackgroundInteraction, OverlayBackgroundType, OverlayPositionType, OverlayPosition, OverlayMargin } from "@kcdesign/data";
import { message } from "@/utils/message";
import { onMounted, ref, watch } from "vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n';
import { debounce as d } from "@/utils/timing_util";

export interface Type {
    state: boolean
    color?: Color
}

export interface Margin {
    val: number,
    type: string
}

const props = defineProps<{
    context: Context,
    targetNodeId: string | undefined
}>()

const emits = defineEmits<{
    (e: "interaction", state: boolean): void;
    (e: "appearance", data: Type): void;
    (e: "position", data: OverlayPositionType): void;
    (e: "margin", data: Margin): void;
}>()

const { t } = useI18n()
const background_color = ref(new Color(1, 239, 239, 239));
const alpha_v = ref<number>(100);
const clr_v = ref<string>('EFEFEF');
const is_color_select = ref(false);
const alpha_ele = ref<HTMLInputElement>();
const clr_ele = ref<HTMLInputElement>();
const is_alpha_select = ref(false);
const addmask = ref<boolean>(false)
const position = ref<OverlayPosition>()
const event = ref<OverlayBackgroundInteraction>()
const Appearance = ref<OverlayBackgroundAppearance>()
const overlayclose = ref<boolean>(false)
const marginInput = ref<HTMLInputElement[]>();
const direction = ref<string>('cen')

const margin = new Map([
    ['TOP', 90],
    ['BOTTOM', -90],
    ['LEFT', 0],
    ['RIGHT', 180]
])

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return hex(r) + hex(g) + hex(b);
}

const setPosition = (val: OverlayPositionType) => {
    if (val === direction.value) return
    emits('position', val)
    getPosition(props.targetNodeId)
}

const setInteraction = () => {
    emits('interaction', overlayclose.value)
}

const setAppearance = () => {
    emits('appearance', { state: addmask.value })
}

const setMargin = (e: Event, i: string, old: number) => {
    const val = (e.target as HTMLInputElement).value;
    const input = marginInput.value?.find(p => p.id === i);
    if (!input) return
    let value: number;
    if (isNaN(Number(val))) {
        const el = marginInput.value?.find(p => p.id === i)
        if (el) el.value = old.toString()
    } else {
        value = Number(val)
        emits('margin', { val: value, type: i })
    }
    input.blur()
    getPosition(props.targetNodeId)
}

function setColor(clr: string, alpha: number) {
    const res = clr.match(Reg_HEX);
    if (!res) return message('danger', t('system.illegal_input'));
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const nc = new Color(alpha, r, g, b);
    //修改目标遮罩层颜色
    background_color.value = nc
    clr_v.value = toHex(nc.red, nc.green, nc.blue)
    emits('appearance', { state: addmask.value, color: nc })
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
    // nextTick(() => {
    //     clr_ele.value?.blur()
    // })
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
    alpha_ele.value?.blur()
}

function clr_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_color_select.value) return;
    is_color_select.value = true;
}

function alpha_click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_alpha_select.value) return;
    is_alpha_select.value = true;
}

const _colorChangeFromPicker = d((c: Color) => {
    emits('appearance', { state: addmask.value, color: c })
    background_color.value = c;
    clr_v.value = toHex(c.red, c.green, c.blue)
    alpha_v.value = c.alpha * 100
}, 100)

const colorChangeFromPicker = (c: Color) => {
    _colorChangeFromPicker(c).catch((e) => {
    });
};

const getPosition = (targetID: string | undefined) => {
    if (!targetID) return;
    const shapes = props.context.selection.selectedPage?.childs
    if (!shapes) return;
    const shape = shapes.find(i => i.id === targetID)
    if (!shape) return;
    const { overlayBackgroundAppearance, overlayBackgroundInteraction, overlayPosition } = shape
    position.value = overlayPosition ?? new OverlayPosition(OverlayPositionType.CENTER, new OverlayMargin())
    direction.value = position.value.position
    event.value = overlayBackgroundInteraction ?? OverlayBackgroundInteraction.NONE
    Appearance.value = overlayBackgroundAppearance ?? new OverlayBackgroundAppearance(OverlayBackgroundType.NONE, new Color(0.25, 0, 0, 0))
    background_color.value = Appearance.value.backgroundColor as Color
    addmask.value = Appearance.value.backgroundType === OverlayBackgroundType.NONE ? false : true;
    overlayclose.value = event.value === 'NONE' ? false : true
    clr_v.value = toHex(background_color.value.red, background_color.value.green, background_color.value.blue)
    alpha_v.value = background_color.value.alpha * 100
}

watch(() => props.targetNodeId, () => {
    getPosition(props.targetNodeId)
}, { deep: true })

onMounted(() => {
    getPosition(props.targetNodeId)
})

</script>

<style lang="scss" scoped>
.ptactive {
    background-color: #1878F5 !important;
}

.set-float {
    display: flex;
    flex-direction: column;

    span {
        line-height: 32px;
    }

    .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        width: 100%;
        height: 70px;

        .position {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            gap: 2px;
            padding: 2px;
            border-radius: 6px;
            border: 1px solid var(--input-background);
            box-sizing: border-box;

            // background-color: #F5F5F5;
            div {
                width: 22px;
                height: 22px;
                border-radius: 3px;
                background-color: var(--input-background);
            }
        }

        .margin {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 4px;

            .margin-item {
                display: flex;
                align-items: center;
                padding: 9px 4px;
                box-sizing: border-box;
                gap: 4px;
                width: 47px;
                height: 32px;
                border-radius: 6px;
                background-color: var(--input-background);

                svg {
                    width: 14px;
                    min-width: 14px;
                    height: 14px;
                }

                input {
                    outline: none;
                    border: none;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    font-size: 12px;
                    background-color: transparent;
                }
            }
        }
    }

    .checkbox {
        display: flex;
        align-items: center;
        line-height: 32px;

        input[type=checkbox] {
            position: relative;
            padding: 0;
            width: 14px;
            height: 14px;
        }

        input[type=checkbox]:checked::after {
            position: absolute;
            width: 100%;
            height: 100%;
            content: "";
            color: #FFFFFF;
            border-radius: 3px;
            border: 1px solid rgb(24, 120, 245);
            background-image: url('@/assets/select-icon.svg');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 60% 40%;
            background-color: rgb(24, 120, 245);
            box-sizing: border-box;
        }
    }

    .checkbox:has(input[type]:disabled) {
        opacity: 0.4;
    }

    .setting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 8px;
        height: 32px;
        background-color: #f5f5f5;
        border-radius: 6px;
        border: 1px solid transparent;
        box-sizing: border-box;

        input {
            outline: none;
            border: none;
            font-size: 12px;
            background-color: transparent;
        }

        #clr {
            width: 70%;
            padding: 0 8px;
        }

        #alpha {
            width: 30%;
        }
    }
}
</style>
