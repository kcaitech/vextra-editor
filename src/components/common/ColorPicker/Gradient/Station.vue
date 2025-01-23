<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import exchange_icon from "@/assets/icons/svg/exchange.svg";
import rotate90_icon from "@/assets/icons/svg/rotate90.svg";
import Tooltip from "@/components/common/Tooltip.vue";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { DragKit } from "@/components/common/draggable";
import { verifiedVal } from "@/components/common/ColorPicker/utils";
import { GradientCatch } from "../Editor/gradientlineareditor";

const props = defineProps<{ gradient: GradientCatch }>()

const {t} = useI18n();
const channelStyle = ref<any>({});
const stops = ref<RGBACatch[]>([]);
const circles = ref<{ x: number, active?: boolean }[]>([{x: 0, active: true}, {x: 40}, {x: 100}]);
const stopAt = ref<number>(0);
const lineEl = ref<HTMLDivElement>();
let lineL = 158;

function reverse() {
}

function rotate() {
}

function createStop() {
}

function drawCircles() {
}

const dragKit = new DragKit({
    move: (event: MouseEvent, x: number) => {
        circles.value[stopAt.value].x = verifiedVal(x, 0, lineL);
    }
})

function downStop(event: MouseEvent, index: number) {
    delete circles.value[stopAt.value].active;
    stopAt.value = index;
    circles.value[index].active = true;
    const target = (event.target as Element).closest('.stops') as HTMLDivElement;
    dragKit.start(event, {x: target.offsetLeft});
}

onMounted(() => {
    if (lineEl.value) lineL = lineEl.value.offsetWidth;
})
</script>

<template>
    <div class="gradient-container">
        <div class="line-container">
            <div ref="lineEl" class="line" :style="channelStyle" @mousedown="createStop"/>
            <div class="stops" v-for="(item, idx) in circles" :key="idx" :style="{ left: item.x + 'px' }"
                 @mousedown="(e) => downStop(e, idx)">
                <div :class="item.active ? 'stop-active' : 'stop'"/>
            </div>
        </div>
        <div class="reverse" @click="reverse">
            <Tooltip :content="t('color.reverse')">
                <SvgIcon :icon="exchange_icon"/>
            </Tooltip>
        </div>
        <div class="rotate" @click="rotate">
            <Tooltip :content="t('color.rotate')">
                <SvgIcon :icon="rotate90_icon"/>
            </Tooltip>
        </div>
    </div>
</template>

<style scoped lang="scss">
.gradient-container {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    height: 28px;
    padding: 0 12px;
    box-sizing: border-box;

    .line-container {
        flex: 1;
        position: relative;
        box-sizing: border-box;

        .line {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            box-shadow: 0 0 1px 1px #efefef;
        }

        .stops {
            position: absolute;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 4px;
            transform: translate(-50%, -50%);
        }

        .stop {
            width: 12px;
            height: 12px;
            border: 1px solid rgba(0, 0, 0, .2);
            border-radius: 50%;
            box-sizing: border-box;
            box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 3px rgba(0, 0, 0, 0.2);
        }

        .stop-active {
            width: 14px;
            height: 14px;
            box-sizing: border-box;
            border: 2px solid var(--active-color);
            border-radius: 50%;
            box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 3px rgba(0, 0, 0, 0.2);
        }
    }

    .reverse {
        flex: 0 0 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        svg {
            width: 14px;
            height: 14px;
            outline: none;
        }
    }

    .rotate {
        flex: 0 0 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        svg {
            width: 14px;
            height: 14px;
            outline: none;
        }
    }
}
</style>