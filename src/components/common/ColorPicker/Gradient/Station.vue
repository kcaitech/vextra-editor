/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import exchange_icon from "@/assets/icons/svg/exchange.svg";
import rotate90_icon from "@/assets/icons/svg/rotate90.svg";
import Tooltip from "@/components/common/Tooltip.vue";
import { useI18n } from "vue-i18n";
import { onMounted, onUnmounted, ref, watchEffect } from "vue";
import { DragKit } from "@/components/common/draggable";
import { gradient_channel_generator, verifiedVal } from "@/components/common/ColorPicker/utils";
import { GradientCatch } from "../Editor/gradientlineareditor";
import { toRGBA } from "@/utils/color";
import { get_add_gradient_color2 } from "@/components/Document/Selection/Controller/ColorEdit/gradient_utils";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

const props = defineProps<{ gradient: GradientCatch, at: number }>()
const emits = defineEmits<{
    (e: "change-stop", id: string): void;
    (e: "create-stop", stop: RGBACatch): void;
    (e: "reverse"): void;
    (e: "rotate"): void;
    (e: "drag-start"): void;
    (e: "dragging", position: number): void;
    (e: "drag-end"): void;
}>();

const { t } = useI18n();
const channelStyle = ref<any>({});
const circles = ref<{ x: number, stopStr: string, id: string, active?: boolean }[]>([]);
const lineEl = ref<HTMLDivElement>();
let lineL = 158;

function createStop(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    if (target !== lineEl.value) return;
    const position = event.offsetX / target.offsetWidth;
    const stop = get_add_gradient_color2(props.gradient.RGBAs, position)!;
    emits("create-stop", stop);
}

function drawCircles() {
    const stops = props.gradient.RGBAs;
    const ids = props.gradient.stopIds;
    const css: { x: number, stopStr: string, id: string, active?: boolean }[] = [];
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        css.push({
            x: stop.position * lineL,
            stopStr: toRGBA({ red: stop.R, green: stop.G, blue: stop.B, alpha: stop.A }),
            id: ids[i]
        });
    }
    css[props.at].active = true;

    circles.value = css;
}

const dragKit = new DragKit({
    down: () => emits("drag-start"),
    move: (event: MouseEvent, x: number) => {
        emits("dragging", verifiedVal(x, 0, lineL) / lineL)
    },
    commit: () => emits("drag-end")
})

function downStop(event: MouseEvent, id: string) {
    const index = props.gradient.stopIds.findIndex(s => s === id);
    
    if (index !== props.at) delete circles.value[props.at].active;
    emits("change-stop", id);

    const target = (event.target as Element).closest('.stops') as HTMLDivElement;
    dragKit.start(event, { x: target.offsetLeft });
}

function update() {
    channelStyle.value = gradient_channel_generator(props.gradient);
    drawCircles();
}

onMounted(() => {
    if (lineEl.value) lineL = lineEl.value.offsetWidth;
})
onUnmounted(watchEffect(update));
</script>

<template>
    <div class="gradient-container">
        <div class="line-container">
            <div ref="lineEl" class="line" :style="channelStyle" @mousedown="createStop" />
            <div class="stops" v-for="(item, idx) in circles" :key="idx" :style="{ left: item.x + 'px' }"
                @mousedown="(e) => downStop(e, item.id)">
                <div :class="item.active ? 'stop-active' : 'stop'" :style="{ backgroundColor: item.stopStr }" />
            </div>
        </div>
        <div class="reverse" @click="emits('reverse')">
            <Tooltip :content="t('color.reverse')">
                <SvgIcon :icon="exchange_icon" />
            </Tooltip>
        </div>
        <div class="rotate" @click="emits('rotate')">
            <Tooltip :content="t('color.rotate')">
                <SvgIcon :icon="rotate90_icon" />
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