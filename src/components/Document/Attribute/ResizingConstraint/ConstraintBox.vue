<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
    horizontalPositionSelected: string;
    verticalPositionSelected: string;
    fixedWidth: boolean | string;
    disableToFixedWidth: boolean;
    fixedHeight: boolean | string;
    disableToFixedHeight: boolean;
}>()

const frame = ref<HTMLDivElement>();
const rect = ref<HTMLDivElement>();

const centerHor = computed<boolean>(() => {
    return props.horizontalPositionSelected === 'hcenter';
});
const left = computed<boolean>(() => {
    const v = props.horizontalPositionSelected
    return (v === 'left' || v === 'lrfixed');
});
const right = computed<boolean>(() => {
    const v = props.horizontalPositionSelected
    return (v === 'right' || v === 'lrfixed');
});

const hfollow = computed<boolean>(() => {
    return props.horizontalPositionSelected === 'hfollow';
});

const centerVer = computed<boolean>(() => {
    return props.verticalPositionSelected === 'vcenter';
});
const top = computed<boolean>(() => {
    const v = props.verticalPositionSelected
    return (v === 'top' || v === 'tbfixed');
});
const bottom = computed<boolean>(() => {
    const v = props.verticalPositionSelected
    return (v === 'bottom' || v === 'tbfixed');
});

const vfollow = computed<boolean>(() => {
    return props.verticalPositionSelected === 'vfollow';
});

function enter() {
    const frameEl = frame.value;
    const rectEl = rect.value;
    if (!frameEl || !rectEl) return;
    frameEl.style.width = '80px';
    rectEl.style.width = '40px';
    rectEl.style.left = '24px';
}

function leave() {
    const frameEl = frame.value;
    const rectEl = rect.value;
    if (!frameEl || !rectEl) return;
    frameEl.style.width = '50px';
    rectEl.style.width = '25px';
    rectEl.style.left = '10px';
}
</script>
<template>
<div style="display: flex;align-items: center;gap: 8px;">
    <div class="constraint-box"
         style="position: relative;border-radius: var(--default-radius); border: 1px solid var(--grey-dark); width: 86px; height: 86px;">
        <div
            :class="{innerBox: true, fixWidth: true, flexWidth: hfollow || (left && right), disabled: disableToFixedWidth}"/>
        <div
            :class="{innerBox: true, fixHeight: true, flexHeight: vfollow || (top && bottom),disabled: disableToFixedHeight} ">
            <div style="width: 6px; height: 30px; left: -3px;top: 50%; transform: translateY(-50%);"/>
            <div style="width: 6px; height: 30px; right: -3px;top: 50%; transform: translateY(-50%);"/>
            <div style="height: 6px; width: 30px; top: -3px;left: 50%; transform: translateX(-50%);"/>
            <div style="height: 6px; width: 30px; bottom: -3px;left: 50%; transform: translateX(-50%);"/>
        </div>
        <div
            style="position: absolute;width: 20px; height: 6px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)">
            <div style="width: 20px; height: 2px;" :class="`center ${centerHor ? 'active' : ''}`"/>
        </div>
        <div
            style="position: absolute;height: 20px; width: 6px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)">
            <div style="height: 20px; width: 2px; cursor: pointer;" :class="`center ${centerVer ? 'active' : ''}`"/>
        </div>
        <div
            style="position: absolute;width: 2px; height: 2px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)"
            :class="{active: centerHor || centerVer}"/>
        <div id="top"
             style="position:absolute; width: 8px; height: 14px; top: 0; left:50%; transform: translateX(-50%); cursor: pointer;">
            <div :class="{direct: true, active: top}"
                 style="height: 12px; width: 2px;top: 2px; left:50%; transform: translateX(-50%)"/>
        </div>
        <div id="bottom"
             style="position:absolute; width: 8px; height: 14px; bottom: 0; left:50%; transform: translateX(-50%); cursor: pointer;">
            <div :class="{direct: true, active: bottom}"
                 style="height: 12px; width: 2px;bottom: 2px; left:50%; transform: translateX(-50%)"/>
        </div>
        <div id="left"
             style="position:absolute; height: 8px; width: 14px; left: 0; top:50%; transform: translateY(-50%); cursor: pointer;">
            <div :class="{direct: true, active:left}"
                 style="width: 12px; height: 2px;left: 2px; top:50%; transform: translateY(-50%)"/>
        </div>
        <div id="right"
             style="position:absolute; height: 8px; width: 14px; right: 0; top:50%; transform: translateY(-50%); cursor: pointer;">
            <div :class="{direct: true, active:right}"
                 style="width: 12px; height: 2px; right: 2px; top:50%; transform: translateY(-50%)"/>
        </div>
    </div>
    <div @mouseenter="enter" @mouseleave="leave" class="preview"
         style="border: 1px solid var(--grey-light); border-radius: var(--default-radius); flex: 1; height: 86px;background-color: #f4f5f5">
        <div ref="frame" class="frame"
             style="margin-left: 4px; margin-top: 3px;background-color: #FFFFFF; position: relative;">
            <div ref="rect" class="rect"
                 style="background-color: #d8d8d8; position: absolute;"/>
        </div>
    </div>
</div>
</template>
<style scoped>
.active {
    background-color: var(--active-color) !important;
}

.direct {
    position: absolute;
    background-color: var(--grey-dark);
}

.center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--grey-dark);
}

.innerBox {
    position: absolute;
    width: 32px;
    height: 32px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    border-radius: var(--default-radius);

    > div {
        position: absolute;
        cursor: pointer;
    }
}

.fixHeight {
    border-left: 2px solid var(--grey-dark);
    border-right: 2px solid var(--grey-dark);
}

.flexHeight {
    border-left: 2px dashed var(--grey-dark);
    border-right: 2px dashed var(--grey-dark);
}

.fixWidth {
    border-top: 2px solid var(--grey-dark);
    border-bottom: 2px solid var(--grey-dark);
}

.flexWidth {
    border-top: 2px dashed var(--grey-dark);
    border-bottom: 2px dashed var(--grey-dark);
}

.disabled {
    opacity: 0.4;
}

.preview {
    transition: 0.8s;
    cursor: pointer;

    .frame {
        width: 50px;
        height: 50px;
        transition: 0.8s;
    }

    .rect {
        left: 10px;
        top: 5px;
        width: 25px;
        height: 25px;
        transition: 0.8s;
    }
}
</style>