<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Context } from "@/context";
import { OvalData, OvalOptions, sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import { hidden_selection } from "@/utils/content";
import { LinearApi } from "@kcdesign/data"
import Tooltip from "@/components/common/Tooltip.vue";
import { LockedPointer } from "@/components/Document/Attribute/LockedPointer/lockedpointer";
import { LockMouse } from "@/transform/lockMouse";
import { useI18n } from "vue-i18n";
import SvgIcon from "@/components/common/SvgIcon.vue";

const t = useI18n().t;

const props = defineProps<{ context: Context; trigger: any[]; selectionChange: number; }>();
const form = ref<HTMLFormElement>();

const locker = new LockedPointer();
let lockApi: LockMouse | undefined = undefined;

const options = reactive<OvalOptions>({start: 0, sweep: 100, ratio: 0, disabled: false});

const ovalData = new OvalData(props.context, options);
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

function changeStartOnce(event: Event) {
    const target = event.target as HTMLInputElement;
    let value: number = sortValue(target.value);
    if (isNaN(value)) return;
    value = Math.max(-180, Math.min(180, value));
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const __target = (360 + value) % 360 / 360 * (Math.PI * 2);
    editor.modifyShapesStartingAngle(props.context.selection.selectedShapes, __target);
    hidden_selection(props.context);
    target.blur();
}

function changeSweepOnce(event: Event) {
    const target = event.target as HTMLInputElement;
    let value: number = sortValue(target.value);
    if (isNaN(value)) return;
    value = Math.max(-100, Math.min(100, value));
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyShapesSweep(props.context.selection.selectedShapes, value);
    hidden_selection(props.context);
    target.blur();
}

function changeRatioOnce(event: Event) {
    const target = event.target as HTMLInputElement;
    let value: number = sortValue(target.value);
    if (isNaN(value)) return;
    value = Math.max(0, Math.min(100, value));
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyShapesRadius(props.context.selection.selectedShapes, value / 100);
    hidden_selection(props.context);
    target.blur();
}

function keydownStart(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = Math.max(-180, Math.min(180, value));
        const __target = (360 + value) % 360 / 360 * (Math.PI * 2);
        const shapes = props.context.selection.selectedShapes;
        linearApi.modifyStartingAngle(shapes, __target);
        target.select();
        event.preventDefault();
    }
}

function keydownSweep(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = Math.max(-100, Math.min(100, value));
        const shapes = props.context.selection.selectedShapes;
        linearApi.modifySweep(shapes, value / 100 * Math.PI * 2);
        target.select();
        event.preventDefault();
    }
}

function keydownInnerRadius(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = Math.max(0, Math.min(100, value));
        const shapes = props.context.selection.selectedShapes;
        linearApi.modifyInnerRadius(shapes, value / 100);
        target.select();
        event.preventDefault();
    }
}

function __downStart(event: MouseEvent) {
    const shapes = props.context.selection.selectedShapes;
    locker.start(event, (e: MouseEvent) => {
        if (!lockApi) {
            lockApi = new LockMouse(props.context, event);
            lockApi.createApiCaller("translating");
        }
        lockApi.modifyStartingAngleBy(shapes, (e.movementX / 360) * Math.PI * 2);
    }, () => {
        lockApi?.fulfil();
        lockApi = undefined;
    });
}

function downStart(event: MouseEvent) {
    if (!event.altKey) return;
    event.preventDefault();
    (event.target as HTMLInputElement)?.select();
    __downStart(event);
}

function downEnd(event: MouseEvent) {
    if (!event.altKey) return;
    event.preventDefault();
    (event.target as HTMLInputElement)?.select();
    const shapes = props.context.selection.selectedShapes;
    locker.start(event, (e: MouseEvent) => {
        if (!lockApi) {
            lockApi = new LockMouse(props.context, event);
            lockApi.createApiCaller("translating");
        }
        lockApi.modifySweepBy(shapes, (e.movementX / 1000) * Math.PI * 2);
    }, () => {
        lockApi?.fulfil();
        lockApi = undefined;
    });
}

function downInnerRadius(event: MouseEvent) {
    if (!event.altKey) return;
    event.preventDefault();
    (event.target as HTMLInputElement)?.select();
    const shapes = props.context.selection.selectedShapes;
    locker.start(event, (e: MouseEvent) => {
        if (!lockApi) {
            lockApi = new LockMouse(props.context, event);
            lockApi.createApiCaller("translating");
        }
        lockApi.modifyInnerRadiusBy(shapes, e.movementX / 1000);
    }, () => {
        lockApi?.fulfil();
        lockApi = undefined;
    });
}

const ratioTips = ref<boolean>(false);
let t1: any;

function __enter_ratio() {
    t1 = setTimeout(() => {
        ratioTips.value = true;
        clearTimeout(t1);
        t1 = null;
    }, 1000)
}

function __leave_ratio() {
    ratioTips.value = false;
    t1 && clearTimeout(t1);
    t1 = null;
}

const sweepTips = ref<boolean>(false);
let t2: any;

function __enter_sweep() {
    t2 = setTimeout(() => {
        sweepTips.value = true;
        clearTimeout(t2);
        t2 = null;
    }, 1000)
}

function __leave_sweep() {
    sweepTips.value = false;
    t2 && clearTimeout(t2);
    t2 = null;
}

watch(() => props.selectionChange, (val) => {
    ovalData.stashSelection();
    ovalData.update(val);
});
watch(() => props.trigger, ovalData.update.bind(ovalData));

onMounted(() => {
    form.value && form.value.addEventListener('focus', (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.select && typeof target.select === 'function') target.select();
        ovalData.stashSelection();
        ratioTips.value = false;
        sweepTips.value = false;
        if (t2) {
            clearTimeout(t2);
            t2 = null;
        }
        if (t1) {
            clearTimeout(t1);
            t1 = null;
        }
    }, true);
    ovalData.__update();
});
import oval_start_icon from "@/assets/icons/svg/oval-start.svg"
</script>
<template>
    <form ref="form" :class="{'oval-arc-options-wrapper': true, disabled: options.disabled}">
        <div class="start">
            <Tooltip :content="t('attr.startingAngle')">
                <SvgIcon :icon="oval_start_icon" @mousedown="__downStart"/>
            </Tooltip>
            <input type="text" :value="options.start"
                   @change="changeStartOnce" @keydown="keydownStart" @mousedown="downStart"/>
        </div>
        <div class="sweep" @mouseenter="__enter_sweep" @mouseleave="__leave_sweep">
            <input type="text" :value="options.sweep"
                   @change="changeSweepOnce" @keydown="keydownSweep" @mousedown="downEnd"/>
            <div class="tips" :style="{opacity: sweepTips ? 1 : 0}">
                <div class="content">{{ t('attr.sweep') }}</div>
            </div>
        </div>
        <div class="ratio" @mouseenter="__enter_ratio" @mouseleave="__leave_ratio">
            <input type="text" :value="options.ratio"
                   @change="changeRatioOnce" @keydown="keydownInnerRadius" @mousedown="downInnerRadius"/>
            <div class="tips" :style="{opacity: ratioTips ? 1 : 0}">
                <div class="content">{{ t('attr.ratio') }}</div>
            </div>
        </div>
    </form>
</template>
<style lang="scss" scoped>
.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.oval-arc-options-wrapper {
    height: 32px;
    width: 189px;
    border-radius: var(--default-radius);
    display: flex;
    gap: 1px;
    margin-bottom: 8px;
    input {
        outline: none;
        border: none;
        width: 100%;
        height: 100%;
        background: transparent;
        font-size: var(--font-default-fontsize);
        padding: 0;
    }

    > div {
        background-color: var(--input-background);
        height: 100%;
        padding: 0 0 0 8px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    > .start {
        flex: 1;
        gap: 6px;
        border-radius: var(--default-radius) 0 0 var(--default-radius);

        svg {
            flex: 0 0 12px;
            width: 12px;
            height: 12px;
            fill: rgb(128, 128, 128);
            cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto;
            outline: none;
        }

        input {
            flex: 1;
        }
    }

    .sweep {
        position: relative;
        flex: 0 0 56px;
        width: 56px;
    }

    .ratio {
        position: relative;
        flex: 0 0 56px;
        width: 56px;
        border-radius: 0 var(--default-radius) var(--default-radius) 0;

        input {
            border-radius: 0 var(--default-radius) var(--default-radius) 0;
        }
    }

    .tips {
        pointer-events: none;
        position: absolute;
        top: 36px;
        left: 50%;
        transform: translateX(-50%);
        transition: 0.2s;
        font-size: 12px;

        .content {
            white-space: nowrap;
            width: fit-content;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            box-sizing: border-box;
            border-radius: 4px;
            background-color: #3f3f3f;
            color: #ffffff;
        }
    }
}
</style>