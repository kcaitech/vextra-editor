<script setup lang="ts">
import eyedropper_icon from "@/assets/icons/svg/eyedropper.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { drawTooltip, hexToX, verifiedVal } from "@/components/common/ColorPicker/utils";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { ref } from "vue";
import { DragKit } from "@/components/common/draggable";

const LINE_LENGTH = 196;
const DOT_SIZE = 12;
const DOT_SIZE_CSS = `${DOT_SIZE}px`;
const LINE_LENGTH_CSS = `${LINE_LENGTH}px`;

defineProps<{ stop: RGBACatch }>();
const hueX = ref<number>(0);
const alphaX = ref<number>(LINE_LENGTH - DOT_SIZE);

function eyedropper() {
    const System_EyeDropper = (window as any).EyeDropper;
    const s_eye_dropper = new System_EyeDropper();
    s_eye_dropper.open().then((result: any) => {
        const rgb = hexToX(result.sRGBHex);
        console.log('--rgb--', rgb);
    }).catch((e: any) => {
        console.log("failed:", e);
    });
    const tooltip = drawTooltip('小提示真好玩');
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
}

const hueDragKit = new DragKit({
    move: (event: MouseEvent, x: number) => {
        hueX.value = verifiedVal(x, 0, LINE_LENGTH - DOT_SIZE);
    }
});

function downHueDot(event: MouseEvent) {
    const target = event.target as HTMLElement;
    hueDragKit.start(event, {x: target.offsetLeft});
}

function downHueSlider(event: MouseEvent) {
    hueX.value = event.offsetX - DOT_SIZE / 2;
    hueDragKit.start(event, {x: hueX.value});
}

const alphaDragKit = new DragKit({
    move: (event: MouseEvent, x: number) => {
        alphaX.value = verifiedVal(x, 0, LINE_LENGTH - DOT_SIZE);
    }
});

function downAlpha(event: MouseEvent) {
    const target = event.target as HTMLElement;
    alphaDragKit.start(event, {x: target.offsetLeft});
}

function downAlphaSlider(event: MouseEvent) {
    alphaX.value = event.offsetX - DOT_SIZE / 2;
    alphaDragKit.start(event, {x: alphaX.value});
}
</script>

<template>
    <div class="controller">
        <div class="eyedropper">
            <SvgIcon :icon="eyedropper_icon" @click.stop="eyedropper"/>
        </div>
        <div class="sliders-container">
            <div class="hue" @mousedown="downHueSlider">
                <div class="hue-indicator" :style="{ left: hueX + 'px' }" @mousedown="downHueDot"/>
            </div>
            <div class="alpha-background">
                <div class="alpha" @mousedown="downAlphaSlider"
                     :style="{ background: `linear-gradient(to right, rgba(${stop.R}, ${stop.G}, ${stop.B}, 0) 0%, rgb(${stop.R}, ${stop.G}, ${stop.B}) 100%)` }">
                    <div class="alpha-indicator" :style="{ left: alphaX + 'px' }" @mousedown="downAlpha"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.controller {
    width: 100%;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 12px;
    box-sizing: border-box;
    justify-content: space-around;

    > .sliders-container {
        width: v-bind('LINE_LENGTH_CSS');
        height: 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        > .hue {
            position: relative;
            width: 100%;
            height: 8px;
            background: linear-gradient(90deg, #f00 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
            border-radius: 5px 5px 5px 5px;
            cursor: pointer;

            > .hue-indicator {
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

        > .alpha-background {
            width: 100%;
            height: 8px;
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
            background-size: auto 75%;
            border-radius: 5px 5px 5px 5px;
            cursor: pointer;
            box-sizing: border-box;

            > .alpha {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 5px 5px 5px 5px;

                > .alpha-indicator {
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

    > .eyedropper {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 2px;
        transition: 0.1s;
        padding: 6px;
        box-sizing: border-box;

        > svg {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
    }
}
</style>