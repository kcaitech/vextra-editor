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
import { Ref, ref, watchEffect } from "vue";
import { DragKit } from "@/components/common/draggable";
import { getHRGB, HSB2RGB, RGB, RGB2H2, RGB2HSB2, verifiedVal } from "@/components/common/ColorPicker/utils";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import eyedropper_icon from "@/assets/icons/svg/eyedropper.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { drawTooltip, hexToX } from "@/components/common/ColorPicker/utils";
import { inject } from "vue";
import { useI18n } from "vue-i18n";

const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const HEIGHT = 200;
const HEIGHT_CSS = `${HEIGHT}px`;
const DOT_SIZE = 12;
const DOT_SIZE_CSS = `${DOT_SIZE}px`;
const MIN_LEFT = -DOT_SIZE / 2;
const MAX_LEFT = WIDTH - DOT_SIZE / 2;
const MIN_TOP = -DOT_SIZE / 2;
const MAX_TOP = HEIGHT - DOT_SIZE / 2;
const LINE_LENGTH = 196;
const LINE_LENGTH_CSS = `${LINE_LENGTH}px`;
const { valueS, valueH, changeValueS, changeValueH } = inject('HSB') as { valueS: Ref<number>, valueH: Ref<number>, changeValueS: (v: number) => void, changeValueH: (v: number) => void };

const t = useI18n().t;

const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
    (e: "drag-begin"): void;
    (e: "dragging", stop: RGBACatch): void;
    (e: "drag-end"): void;
}>()
const props = defineProps<{ stop: RGBACatch }>();
const left = ref<number>(-DOT_SIZE / 2);
const top = ref<number>(-DOT_SIZE / 2);
const hue = ref<RGBACatch>(props.stop);
const hueX = ref<number>(0);
const alphaX = ref<number>(LINE_LENGTH - DOT_SIZE);

const lastHueDetail = {
    x: hueX.value,
    hue: hue.value
};

function modifySaturation(_s: number, _b: number) {
    const stop = props.stop;
    const h = RGB2H2(stop.R, stop.G, stop.B);
    const s = (_s + DOT_SIZE / 2) / WIDTH;
    changeValueS(s)
    const b = 1 - (_b + DOT_SIZE / 2) / HEIGHT;
    let rgb: RGB;
    if (valueH.value) {
        rgb = HSB2RGB(valueH.value, s, b);
    } else {
        rgb = HSB2RGB(h, s, b);

    }

    emits("dragging", {
        R: rgb.R,
        G: rgb.G,
        B: rgb.B,
        A: stop.A,
        position: stop.position
    });
}

const dragKit = new DragKit({
    down: () => emits("drag-begin"),
    move: (_: MouseEvent, x: number, y: number) => {
        modifySaturation(verifiedVal(x, MIN_LEFT, MAX_LEFT), verifiedVal(y, MIN_TOP, MAX_TOP));
    },
    commit: () => emits("drag-end")
});

function downDot(event: MouseEvent) {
    const target = event.target as HTMLElement;
    dragKit.start(event, { x: target.offsetLeft, y: target.offsetTop });
}

function downPanel(event: MouseEvent) {
    dragKit.start(event, { x: event.offsetX - 6, y: event.offsetY - 6 });
    modifySaturation(event.offsetX - 6, event.offsetY - 6);
}

function modifyHue(_h: number) {
    const h = _h / (LINE_LENGTH - DOT_SIZE) * 360;
    changeValueH(h);
    lastHueDetail.x = _h;
    lastHueDetail.hue = Object.assign({ ...props.stop }, getHRGB(h));
    const { R, G, B } = HSB2RGB(h, (left.value + DOT_SIZE / 2) / WIDTH, 1 - (top.value + DOT_SIZE / 2) / HEIGHT);
    emits("dragging", {
        R, G, B,
        A: props.stop.A,
        position: props.stop.position
    })
}

const hueDragKit = new DragKit({
    down: () => emits("drag-begin"),
    move: (_: MouseEvent, x: number) => {
        modifyHue(verifiedVal(x, 0, LINE_LENGTH - DOT_SIZE - 0.1));
    },
    commit: () => emits("drag-end")
});

function downHueDot(event: MouseEvent) {
    const target = event.target as HTMLElement;
    hueDragKit.start(event, { x: target.offsetLeft });
}

function downHueSlider(event: MouseEvent) {
    const x = event.offsetX - DOT_SIZE / 2;
    hueDragKit.start(event, { x });
    modifyHue(x);
}

function modifyAlpha(_a: number) {
    const stop = props.stop;
    emits("dragging", {
        R: stop.R,
        G: stop.G,
        B: stop.B,
        A: _a / (LINE_LENGTH - DOT_SIZE),
        position: props.stop.position
    });


}

const alphaDragKit = new DragKit({
    down: () => emits("drag-begin"),
    move: (_: MouseEvent, x: number) => {
        modifyAlpha(verifiedVal(x, 0, LINE_LENGTH - DOT_SIZE));
    },
    commit: () => emits("drag-end")
});

function downAlpha(event: MouseEvent) {
    const target = event.target as HTMLElement;
    alphaDragKit.start(event, { x: target.offsetLeft });
}

function downAlphaSlider(event: MouseEvent) {
    const x = event.offsetX - DOT_SIZE / 2;
    alphaDragKit.start(event, { x });
    modifyAlpha(x);
}

function eyedropper() {
    const EyeDropper = (window as any).EyeDropper;
    if (!EyeDropper) return;
    const s_eye_dropper = new EyeDropper();
    s_eye_dropper.open().then((result: any) => {
        const rgb = hexToX(result.sRGBHex);
        emits('change', { R: rgb[0], G: rgb[1], B: rgb[2], A: 1, position: 1 });
    }).catch((e: any) => {
        console.error(e);
    });
    const tooltip = drawTooltip(t('stylelib.esc_exit'));
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
}

function locate() {
    const { R, G, B, A } = props.stop;
    const hsb = RGB2HSB2(R, G, B);
    if (R === 0 && G === 0 && B === 0) {
        left.value = WIDTH * valueS.value - DOT_SIZE / 2;
    } else {
        left.value = WIDTH * hsb.s - DOT_SIZE / 2;
    }
    top.value = HEIGHT * (1 - hsb.b) - DOT_SIZE / 2;
    alphaX.value = (LINE_LENGTH - DOT_SIZE) * A;
    if ((R === 0 && G === 0 && B === 0) || hsb.s === 0) {
        hueX.value = valueH.value / 360 * (LINE_LENGTH - DOT_SIZE);
        hue.value = Object.assign({ ...props.stop }, getHRGB(valueH.value));
    } else {
        hueX.value = (LINE_LENGTH - DOT_SIZE) * hsb.h;
        hue.value = Object.assign({ ...props.stop }, getHRGB(hsb.h * 360));
        changeValueH(hsb.h * 360);
    }
}

watchEffect(locate);
</script>

<template>
    <div id="saturation"
        :style="{ width: WIDTH_CSS, height: HEIGHT_CSS, backgroundColor: `rgb(${hue.R}, ${hue.G}, ${hue.B})` }">
        <div class="white" />
        <div class="black" @mousedown="downPanel" />
        <div class="dot"
            :style="{ left: left + 'px', top: top + 'px', backgroundColor: `rgb(${stop.R}, ${stop.G}, ${stop.B})` }"
            @mousedown="downDot" />
    </div>
    <div id="controller">
        <div class="eyedropper">
            <SvgIcon :icon="eyedropper_icon" @click.stop="eyedropper" />
        </div>
        <div class="sliders-container">
            <div class="hue" @mousedown="downHueSlider">
                <div class="hue-indicator" :style="{ left: hueX + 'px' }" @mousedown="downHueDot" />
            </div>
            <div class="alpha-background">
                <div class="alpha" @mousedown="downAlphaSlider"
                    :style="{ background: `linear-gradient(to right, rgba(${stop.R}, ${stop.G}, ${stop.B}, 0) 0%, rgb(${stop.R}, ${stop.G}, ${stop.B}) 100%)` }">
                    <div class="alpha-indicator" :style="{ left: alphaX + 'px' }" @mousedown="downAlpha" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
#saturation {
    position: relative;

    .white {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #fff, #fff0);
    }

    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, #000, #fff0);
    }

    .dot {
        width: v-bind('DOT_SIZE_CSS');
        height: v-bind('DOT_SIZE_CSS');
        border-radius: 50%;
        border: 2px solid #fff;
        position: absolute;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
        box-sizing: border-box;
    }
}

#controller {
    width: 100%;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 12px;
    box-sizing: border-box;
    justify-content: space-around;

    >.sliders-container {
        width: v-bind('LINE_LENGTH_CSS');
        height: 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        >.hue {
            position: relative;
            width: 100%;
            height: 8px;
            background: linear-gradient(90deg, #f00 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
            border-radius: 5px 5px 5px 5px;
            cursor: pointer;

            >.hue-indicator {
                top: -2px;
                width: v-bind('DOT_SIZE_CSS');
                height: v-bind('DOT_SIZE_CSS');
                border-radius: 50%;
                border: 2px solid #fff;
                position: absolute;
                box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
                box-sizing: border-box;
            }
        }

        >.alpha-background {
            width: 100%;
            height: 8px;
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
            background-size: auto 75%;
            border-radius: 5px 5px 5px 5px;
            cursor: pointer;
            box-sizing: border-box;

            >.alpha {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 5px 5px 5px 5px;

                >.alpha-indicator {
                    top: -2px;
                    width: v-bind('DOT_SIZE_CSS');
                    height: v-bind('DOT_SIZE_CSS');
                    border-radius: 50%;
                    border: 2px solid #fff;
                    position: absolute;
                    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2), 0 0 0 1px rgba(0, 0, 0, .2);
                    box-sizing: border-box;
                }
            }

        }
    }

    >.eyedropper {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 2px;
        transition: 0.1s;
        padding: 6px;
        box-sizing: border-box;

        >svg {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
    }
}
</style>