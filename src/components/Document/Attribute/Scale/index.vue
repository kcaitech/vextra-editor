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
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import { useI18n } from "vue-i18n";
import ScaleAnchorBox from "@/components/Document/Attribute/Scale/ScaleAnchorBox.vue";
import { Context } from "@/context";
import { useAuto } from "@/components/Document/Creator/execute";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { AnchorType } from "@/components/Document/Attribute/Scale/index";
import { format_value as format } from "@/utils/common";
import MossInput from "@/components/common/MossInput.vue";
import { computeString } from "@/utils/content";
import { Attribute } from "@/context/atrribute";
import { Tool } from "@/context/tool";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { XY } from "@/context/selection";
import { ColVector3D, ShapeSize, ShapeView, Transform, XYsBounding } from "@kcdesign/data";
import { ScaleUniformer } from "@/transform/scaleUniform";

const props = defineProps<{ context: Context, selectionChange: number, shapeChange: any }>();
const t = useI18n().t;
const fix = 2;

function esc() {
    useAuto(props.context);
}

const w = ref<number>(0);
const h = ref<number>(0);
const k = ref<number>(1);
const optionsVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
let __base_width = 0;
const presetOptions = ['0.25x', '0.5x', '0.75x', '1x', '2x', '3x', '4x', '5x', '10x'];

function __get_box() {
    const selected = props.context.selection.selectedShapes;
    const points: XY[] = [];
    for (const shape of selected) {
        const frame = shape.frame;
        const transform = shape.matrix2Root();
        const right = frame.x + frame.width;
        const bottom = frame.y + frame.height;

        points.push(...transform.transform([
            ColVector3D.FromXY(frame.x, frame.y),
            ColVector3D.FromXY(right, frame.y),
            ColVector3D.FromXY(right, bottom),
            ColVector3D.FromXY(frame.x, bottom),
        ]));
    }
    return XYsBounding(points);
}

function getSize() {
    const box = __get_box();
    w.value = box.right - box.left;
    h.value = box.bottom - box.top;
}

function modifyFixed(transform: Transform, ratio: number, __box?: {
    left: number,
    top: number,
    right: number,
    bottom: number
}) {
    const box = __box ?? __get_box();
    let x = box.left;
    let y = box.top;
    const width = box.right - box.left;
    const height = box.bottom - box.top;

    const fixedRatio = ratio - 1;

    const __cur_anchor = anchorType.value;

    if (__cur_anchor === AnchorType.Center) {
        x -= (width * fixedRatio) / 2;
        y -= (height * fixedRatio) / 2;
    } else if (__cur_anchor === AnchorType.Top) {
        x -= (width * fixedRatio) / 2;
    } else if (__cur_anchor === AnchorType.RightTop) {
        x -= width * fixedRatio;
    } else if (__cur_anchor === AnchorType.Right) {
        x -= width * fixedRatio;
        y -= (height * fixedRatio) / 2
    } else if (__cur_anchor === AnchorType.RightBottom) {
        x -= width * fixedRatio;
        y -= height * fixedRatio;
    } else if (__cur_anchor === AnchorType.Bottom) {
        x -= (width * fixedRatio) / 2;
        y -= height * fixedRatio;
    } else if (__cur_anchor === AnchorType.Left) {
        y -= (height * fixedRatio) / 2;
    } else if (__cur_anchor === AnchorType.BottomLeft) {
        y -= height * fixedRatio;
    }
    transform.setTranslate(ColVector3D.FromXY(x, y));
}

function __change_size(ratio: number) {
    const box = __get_box();
    const units: { shape: ShapeView, transform: Transform }[] = [];
    const selected = props.context.selection.selectedShapes;

    const cache = new Map<ShapeView, Transform>();
    for (const shape of selected) {
        const parent = shape.parent!;
        if (cache.has(parent)) continue;
        cache.set(parent, (parent.matrix2Root()));
    }

    const selectionTransform = new Transform().setTranslate(ColVector3D.FromXY(box.left, box.top));
    const inverse = selectionTransform.getInverse();

    for (const shape of selected) {
        const transform = (shape.transform.clone()).addTransform(cache.get(shape.parent!)!);
        transform.addTransform(inverse);
        units.push({ shape, transform });
    }

    selectionTransform.setScale(ColVector3D.FromXYZ(ratio, ratio, 1));

    modifyFixed(selectionTransform, ratio, box);

    const parentsTransform = new Map<ShapeView, Transform>();
    for (const shape of selected) {
        const parent = shape.parent!;
        if (parentsTransform.has(parent)) continue;
        const t = (parent.matrix2Root());
        parentsTransform.set(parent, t.getInverse());
    }

    const params: {
        shape: ShapeView,
        transform: Transform,
        size: { width: number, height: number },
        decomposeScale: { x: number, y: number }
    }[] = [];

    for (const unit of units) {
        const { shape, transform } = unit;
        const __t = transform.addTransform(selectionTransform).addTransform(parentsTransform.get(shape.parent!)!);
        const scale = __t.decomposeScale();
        const size = {
            width: shape.size.width * Math.abs(scale.x),
            height: shape.size.height * Math.abs(scale.y)
        } as ShapeSize;

        __t.clearScaleSize();

        params.push({ shape, size, transform: __t, decomposeScale: { x: scale.x, y: scale.y } });
    }

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.uniformScale(params, ratio);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
        props.context.attr.notify(Attribute.FRAME_CHANGE);
    });
}

function changeW(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return;
    if (_w / w.value < 0.02) return;
    __change_size(_w / w.value);
}

function changeH(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) {
        return;
    }
    if (_h / h.value < 0.02) return;
    __change_size(_h / h.value);
}

function changeK(value: string) {
    value = value.replace(/x$/, '');
    value = Number
        .parseFloat(computeString(value)).toString();
    const _k: number = Number.parseFloat(value);
    if (isNaN(_k)) return;
    const scale = _k / k.value;
    if (scale < 0.02) return;
    __change_size(scale);
}

function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let scaleUniformer: ScaleUniformer | undefined = undefined;
let currentValue = 0;
let baseValue = 0;

async function modifyTelDown(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) await el.requestPointerLock({ unadjustedMovement: true });
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function dragstart(e: MouseEvent) {
    modifyTelDown(e);
}

function draggingW(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    if (!scaleUniformer) {
        baseValue = w.value;
        currentValue = w.value;
        scaleUniformer = new ScaleUniformer(props.context, anchorType.value);
        scaleUniformer.createApiCaller();
    }
    currentValue += e.movementX;
    const ratio = currentValue / baseValue;
    if (ratio <= 0.02) return;
    scaleUniformer.execute(ratio);
}

function draggingH(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    if (!scaleUniformer) {
        baseValue = h.value;
        currentValue = h.value;
        scaleUniformer = new ScaleUniformer(props.context, anchorType.value);
        scaleUniformer.createApiCaller();
    }
    currentValue += e.movementX;
    const ratio = currentValue / baseValue;
    if (ratio <= 0.02) return;
    scaleUniformer.execute(ratio);
}

function draggingK(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    if (!scaleUniformer) {
        baseValue = k.value;
        currentValue = k.value;
        scaleUniformer = new ScaleUniformer(props.context, anchorType.value);
        scaleUniformer.createApiCaller();
    }
    currentValue += e.movementX / 100;
    const ratio = currentValue / baseValue;
    if (ratio <= 0.02) return;
    scaleUniformer.execute(ratio);
}

function dragend2() {
    modifyTelUp();
    scaleUniformer?.fulfil();
    scaleUniformer = undefined;
    props.context.attr.notify(Attribute.FRAME_CHANGE);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) modifyTelUp();
}

const anchorType = ref<AnchorType>(AnchorType.Center);

function blur(e: MouseEvent) {
    if (!(e.target && (e.target as Element).closest('#scale-popover-0903'))) {
        optionsVisible.value = false;
        document.removeEventListener('click', blur);
    }
}

function emitTrigger() {
    optionsVisible.value = true;
    document.addEventListener('click', blur);
    props.context.escstack.save('scale-popover', () => {
        document.removeEventListener('click', blur);
        const achieve = optionsVisible.value;
        optionsVisible.value = false;
        return achieve;
    });
    nextTick(() => {
        const el = popover.value! as HTMLDivElement;
        const decrK = k.value + 'x';
        for (let i = 0; i < presetOptions.length; i++) {
            const preset = presetOptions[i];
            if (decrK === preset) el.style.top = -(8 + 28 * i) + 'px';
        }
    });
}

function select(v: string) {
    changeK(v);
    optionsVisible.value = false;
}

function initBase() {
    getSize();
    __base_width = w.value;
    k.value = 1;
}

const stop = watch(() => props.selectionChange, initBase);
const stop2 = watch(() => props.shapeChange, () => {
    getSize();
    k.value = w.value / __base_width;
});
onMounted(initBase);
onUnmounted(() => {
    stop();
    stop2();
});

import w_icon from "@/assets/icons/svg/W.svg";
import h_icon from "@/assets/icons/svg/H.svg";
import scale_simple_icon from "@/assets/icons/svg/scale-simple.svg";
import down_icon from "@/assets/icons/svg/down.svg";
import page_select_icon from "@/assets/icons/svg/page-select.svg";

</script>
<template>
<div class="scale-panel">
    <TypeHeader :title="t('attr.scale')" class="mt-24" :active="true"/>
    <div class="content">
        <div class="tr">
            <MossInput :icon="w_icon" :value="format(w)" @change="changeW" draggable
                           @dragstart="dragstart" @dragging="draggingW" @dragend="dragend2"/>
            <MossInput :icon="h_icon" :value="format(h)" @change="changeH" draggable
                           @dragstart="dragstart" @dragging="draggingH" @dragend="dragend2"/>
        </div>
        <div style="display: flex; gap: 13px;margin-bottom: 8px;">
            <div style="position: relative">
                <MossInput :icon="scale_simple_icon" :value="`${format(k)}x`" @change="changeK"
                               draggable @dragstart="dragstart" @dragging="draggingK" @dragend="dragend2"/>
                <div class="options" id="scale-popover-0903">
                    <div class="trigger" @click.stop="emitTrigger">
                        <SvgIcon :icon="down_icon" style="width: 12px; height: 12px"/>
                    </div>
                    <div v-if="optionsVisible" ref="popover" class="popover">
                        <div v-for="i in presetOptions" :key="i" class="option" @click="() => select(i)">
                            <span>{{ i }}</span>
                            <SvgIcon v-if="(k+'x') ===i" :icon="page_select_icon"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-bottom: 8px;">
            <ScaleAnchorBox v-model:type="anchorType" :context="props.context"/>
        </div>
        <div
            style="width: 189px; height: 32px;
            background-color: var(--active-color);
            color: var(--theme-color-anti);
            display: flex;
            font-size: 12px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: var(--default-radius)"
            @click="esc"
        >
            {{ t('attr.exit_scale') }}
        </div>
    </div>
</div>
<teleport to="body">
    <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
    </div>
</teleport>
</template>
<style lang="scss" scoped>
.scale-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        > svg {
            transform: rotate(45deg);
            width: 16px;
            height: 16px;
        }
    }

    .close:hover {
        background-color: #F5F5F5;
    }

    .content {
        padding: 8px 0;

        .tr {
            position: relative;
            height: 30px;
            align-items: center;
            display: flex;
            margin-bottom: 8px;
            gap: 13px;
        }
    }
}

.options {
    position: absolute;
    right: 0;
    top: 0;
    height: 30px;
    width: fit-content;

    .trigger {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 24px;
        top: 3px;
        right: 4px;
        width: 20px;
        border-radius: 4px;

        > svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .trigger:hover {
        background-color: rgb(235, 235, 235);
    }
}

.popover {
    position: absolute;
    right: 0;
    width: 88px;
    height: fit-content;
    background-color: var(--theme-color-anti);
    border-radius: var(--default-radius);
    padding: 8px 0;
    box-sizing: border-box;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    z-index: 1;

    .option {
        width: 100%;
        color: var(--theme-color);
        height: 28px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        box-sizing: border-box;
        justify-content: space-between;

        > svg {
            width: 12px;
            height: 12px;
        }
    }

    .option:hover {
        background-color: var(--active-color);
        color: var(--theme-color-anti);

        > svg {
            fill: var(--theme-color-anti);
        }
    }
}

.point {
    position: absolute;
    width: 24px;
    height: 24px;
    background-image: url("@/assets/cursor/scale.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 32px;
    z-index: 10000;
}
</style>