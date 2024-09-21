<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Context } from "@/context";
import { OvalData, OvalOptions, sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import { hidden_selection } from "@/utils/content";

const props = defineProps<{ context: Context; trigger: any[] }>();
const form = ref<HTMLFormElement>();

const options = reactive<OvalOptions>({
    start: 0,
    sweep: 100,
    ratio: 0
});

const ovalData = new OvalData(props.context, options);

function changeStartOnce(event: Event) {
    const target = event.target as HTMLInputElement;
    let value: number = sortValue(target.value);
    if (isNaN(value)) return;
    if (value < -180) value = -180;
    else if (value > 180) value = 180;
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
    if (value < -100) value = -100;
    else if (value > 100) value = 100;
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
    if (value < 0) value = 0;
    else if (value > 100) value = 100;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.modifyShapesRadius(props.context.selection.selectedShapes, value / 100);
    hidden_selection(props.context);
    target.blur();
}

onMounted(() => {
    if (form.value) {
        form.value.addEventListener('focus', (event: Event) => {
            (event.target as HTMLInputElement).select();
            ovalData.stashSelection();
        }, true);
    }
    ovalData.__update();
});
watch(() => props.trigger, ovalData.update.bind(ovalData));
</script>
<template>
    <form ref="form" class="oval-arc-options-wrapper">
        <div class="start">
            <svg-icon icon-class="oval-start"/>
            <input type="text" :value="`${options.start}°`" @change="changeStartOnce"/>
        </div>
        <div class="sweep">
            <input type="text" :value="`${options.sweep}%`" @change="changeSweepOnce"/>
        </div>
        <div class="ratio">
            <input type="text" :value="`${options.ratio}%`" @change="changeRatioOnce"/>
        </div>
    </form>
</template>
<style lang="scss" scoped>
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
        }

        input {
            flex: 1;
        }
    }

    > .sweep {
        flex: 0 0 56px;
        width: 56px;

    }

    > .ratio {
        flex: 0 0 56px;
        width: 56px;
    }
}
</style>