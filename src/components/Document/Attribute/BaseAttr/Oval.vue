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

const t = useI18n().t;

const props = defineProps<{ context: Context; trigger: any[]; selectionChange: number; }>();
const form = ref<HTMLFormElement>();

const locker = new LockedPointer();
let lockApi: LockMouse | undefined = undefined;

const options = reactive<OvalOptions>({ start: 0, sweep: 100, ratio: 0, disabled: false });

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
    }, true);
    ovalData.__update();
});
</script>
<template>
<form ref="form" :class="{'oval-arc-options-wrapper': true, disabled: options.disabled}">
    <div class="start">
        <Tooltip :content="t('attr.startingAngle')">
            <svg-icon icon-class="oval-start" @mousedown="__downStart"/>
        </Tooltip>
        <input type="text" :value="options.start"
               @change="changeStartOnce" @keydown="keydownStart" @mousedown="downStart"/>
    </div>
    <Tooltip :content="t('attr.sweep')">
        <div class="sweep">
            <input type="text" :value="options.sweep"
                   @change="changeSweepOnce" @keydown="keydownSweep" @mousedown="downEnd"/>
        </div>
    </Tooltip>
    <el-tooltip class="box-item" effect="dark" :content="t('attr.ratio')" placement="bottom"
                :show-after="500" :offset="10" :hide-after="0">
        <div class="ratio">
            <input type="text" :value="options.ratio" class="ratio"
                   @change="changeRatioOnce" @keydown="keydownInnerRadius" @mousedown="downInnerRadius"/>
        </div>
    </el-tooltip>
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
    overflow: hidden;
    display: flex;
    gap: 1px;

    input {
        outline: none;
        border: none;
        width: 100%;
        background: transparent;
        font-size: var(--font-default-fontsize);
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

    .sweep, .ratio {
        position: relative;
        flex: 0 0 56px;
        width: 56px;
    }
}
</style>