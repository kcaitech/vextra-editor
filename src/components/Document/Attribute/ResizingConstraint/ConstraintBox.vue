<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    horizontalPositionSelected: string;
    verticalPositionSelected: string;
    fixedWidth: boolean | string;
    disableToFixedWidth: boolean;
    fixedHeight: boolean | string;
    disableToFixedHeight: boolean;
}>()

const emits = defineEmits<{
    (e: 'change-hor-position', params: { value: string }, shift?: boolean): void;
    (e: 'change-hor-size'): void;
    (e: 'change-ver-position', params: { value: string }, shift?: boolean): void;
    (e: 'change-ver-size'): void;
}>()

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
</script>
<template>
<div style="display: flex;align-items: center;gap: 10px; padding: 8px 0">
    <div class="constraint-box">
        <div class="innerBox"/>
        <div
            style="position: absolute;width: 20px; height: 6px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)"
            @click="(e: MouseEvent) => {emits('change-hor-position', {value: 'hcenter'}, e.shiftKey)}"
        >
            <div style="width: 12px; height: 2px;" :class="`center ${centerHor ? 'active' : ''}`"/>
        </div>
        <div
            style="position: absolute;height: 20px; width: 6px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)"
            @click="(e: MouseEvent) => {emits('change-ver-position', {value: 'vcenter'}, e.shiftKey)}"
        >
            <div style="height: 12px; width: 2px; cursor: pointer;" :class="`center ${centerVer ? 'active' : ''}`"/>
        </div>
        <div
            style="position: absolute; width: 2px; height: 2px;cursor: pointer;left: 50%;top: 50%;transform: translate(-50%, -50%)"
            :class="{active: centerHor || centerVer}"/>
        <div id="top"
             style="position:absolute; width: 10px; height: 20px; top: 0; left:50%; transform: translateX(-50%); cursor: pointer;"
             @click="(e: MouseEvent) => {emits('change-ver-position', {value: 'top'}, e.shiftKey)}"
        >
            <div :class="{direct: true, active: top}"
                 style="height: 10px; width: 2px;top: 7px; left:50%; transform: translateX(-50%)"/>
        </div>
        <div id="bottom"
             style="position:absolute; width: 10px; height: 20px; bottom: 0; left:50%; transform: translateX(-50%); cursor: pointer;"
             @click="(e: MouseEvent) => {emits('change-ver-position', {value: 'bottom'}, e.shiftKey)}"
        >
            <div :class="{direct: true, active: bottom}"
                 style="height: 10px; width: 2px;bottom: 7px; left:50%; transform: translateX(-50%)"/>
        </div>
        <div id="left"
             style="position:absolute; height: 10px; width: 20px; left: 0; top:50%; transform: translateY(-50%); cursor: pointer;"
             @click="(e: MouseEvent) => {emits('change-hor-position', {value: 'left'}, e.shiftKey)}"
        >
            <div :class="{direct: true, active:left}"
                 style="width: 10px; height: 2px;left: 7px; top:50%; transform: translateY(-50%)"/>
        </div>
        <div id="right"
             style="position:absolute; height: 10px; width: 20px; right: 0; top:50%; transform: translateY(-50%); cursor: pointer;"
             @click="(e: MouseEvent) => {emits('change-hor-position', {value: 'right'}, e.shiftKey)}"
        >
            <div :class="{direct: true, active:right}"
                 style="width: 10px; height: 2px; right: 7px; top:50%; transform: translateY(-50%)"/>
        </div>
    </div>
    <div class="constraint-box">
        <div>
            <div
                style="height: 12px; width: 72px; transform: translate(-50%, -50%); left: 50%; top: 50%;"
                :class="{'fixed-size': true, 'active-fixed': fixedWidth, disabled: disableToFixedWidth}"
                @click="() => {emits('change-hor-size')}"
            >
                <div style="width: 2px; height: 8px; left: 0; top: 2px; position: absolute;"/>
                <div style="width: 2px; height: 8px; right: 0; top: 2px; position: absolute;"/>
                <div
                    style="width: 68px; height: 2px;  position: absolute;left: 2px; top: 50%; transform: translateY(-50%)"/>
            </div>
            <div
                style="width: 12px; height: 72px; transform: translate(-50%, -50%); left: 50%; top: 50%;"
                :class="{'fixed-size': true, 'active-fixed': fixedHeight, disabled: disableToFixedHeight}"
                @click="() => {emits('change-ver-size')}"
            >
                <div style="width: 8px; height: 2px; top: 0; left: 2px;position: absolute;"/>
                <div style="width: 8px; height: 2px; bottom: 0;left: 2px; position: absolute;"/>
                <div
                    style="width: 2px; height: 68px;  position: absolute;top: 2px; left: 50%; transform: translateX(-50%)"/>
            </div>
        </div>
    </div>
</div>
</template>
<style scoped>
.constraint-box {
    box-sizing: border-box;
    position: relative;
    border-radius: var(--default-radius);
    border: 1px solid rgba(0, 0, 0, 0.08);
    width: 88px;
    height: 88px;
}
.disabled {
    opacity: 0.3;
    pointer-events: none;
}
.active {
    background-color: var(--active-color) !important;
}

.active-fixed {
    > div {
        background-color: var(--active-color) !important;
    }
}

.direct {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
}

.center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
}

.innerBox {
    position: absolute;
    width: 40px;
    height: 40px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.8);
}

.fixed-size {
    position: absolute;
    cursor: pointer;

    > div {
        background-color: rgba(0, 0, 0, 0.8);
    }
}

</style>