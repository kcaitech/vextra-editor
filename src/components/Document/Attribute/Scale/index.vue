<script setup lang="ts">
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import { useI18n } from "vue-i18n";
import ScaleAnchorBox from "@/components/Document/Attribute/Scale/ScaleAnchorBox.vue";
import { Context } from "@/context";
import { useAuto } from "@/components/Document/Creator/execute";
import { nextTick, ref } from "vue";
import { AnchorType } from "@/components/Document/Attribute/Scale/index";
import { format_value as format } from "@/utils/common";
import MdNumberInput from "@/components/common/MdNumberInput.vue";
import { computeString } from "@/utils/content";
import { Attribute } from "@/context/atrribute";
import { Tool } from "@/context/tool";
import { LockMouse } from "@/transform/lockMouse";
import SvgIcon from "@/components/common/SvgIcon.vue";

const props = defineProps<{ context: Context }>();
const t = useI18n().t;
const fix = 2;

function esc() {
    useAuto(props.context)
}

const w = ref<number | string>(0);
const h = ref<number | string>(0);
const k = ref<number>(1);
const optionsVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();

const presetOptions = ['0.25x', '0.5x', '0.75x', '1x', '2x', '3x', '4x', '10x'];

function changeW(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return;

    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesWidth(shapes, _w);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeH(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) {
        return;
    }

    const shapes = props.context.selection.selectedShapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesHeight(shapes, _h);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function changeK(value: string) {
    value = value.replace(/x$/, '');
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);
    const _k: number = Number.parseFloat(value);
    if (isNaN(_k)) return;
    k.value = _k;
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
let lockMouseHandler: LockMouse | undefined = undefined;

async function modifyTelDown(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({ unadjustedMovement: true });
    }
    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function dragstart(e: MouseEvent) {
    modifyTelDown(e);
}

function draggingW(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeW(e.movementX);
}

function draggingH(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeH(e.movementX);
}

function draggingK(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeH(e.movementX);
}

function dragend2() {
    modifyTelUp();
    props.context.attr.notify(Attribute.FRAME_CHANGE);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();

    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
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
</script>
<template>
<div class="scale-panel">
    <TypeHeader :title="t('attr.scale')" class="mt-24" :active="true"/>
    <div class="content">
        <div class="tr">
            <MdNumberInput icon="W" draggable :value="format(w)" @change="changeW"
                           @dragstart="dragstart" @dragging="draggingW" @dragend="dragend2"/>
            <MdNumberInput icon="H" draggable :value="format(h)" @change="changeH"
                           @dragstart="dragstart" @dragging="draggingH" @dragend="dragend2"/>
        </div>
        <div style="display: flex; gap: 13px;margin-bottom: 8px;">
            <div style="position: relative">
                <MdNumberInput icon="scale-simple" draggable :value="`${k}x`" @change="changeK"
                               @dragstart="dragstart" @dragging="draggingK" @dragend="dragend2"/>
                <div class="options" id="scale-popover-0903">
                    <div class="trigger" @click.stop="emitTrigger">
                        <svg-icon icon-class="down" style="width: 12px; height: 12px"/>
                    </div>
                    <div v-if="optionsVisible" ref="popover" class="popover">
                        <div v-for="i in presetOptions" :key="i" class="option" @click="() => select(i)">
                            <span>{{ i }}</span>
                            <svg-icon v-if="(k+'x') ===i" icon-class="page-select"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-bottom: 8px;">
            <ScaleAnchorBox v-model:value="anchorType"/>
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
        height: 26px;
        top: 3px;
        right: 6px;
        width: 16px;
        border-radius: 4px;

        > svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .trigger:hover {
        background-color: var(--grey-dark);
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
</style>