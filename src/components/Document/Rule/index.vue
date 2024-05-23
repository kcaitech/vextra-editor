<script setup lang="ts">

import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { User } from "@/context/user";
import { WorkSpace } from "@/context/workspace";
import { Matrix } from '@kcdesign/data';

const props = defineProps<{
    context: Context
}>();

interface Scale {
    offset: number;
    data: number;
    opacity: number;

}

const ruleVisible = ref<boolean>(false);
const scalesHor = ref<Scale[]>([])

function render() {
    scalesHor.value.length = 0;
    ruleVisible.value = props.context.user.isRuleVisible;

    if (!ruleVisible.value) {
        return;
    }

    const matrix = new Matrix(props.context.workspace.matrix);

    const percent = Math.round(matrix.m00 * 100);

    matrix.trans(-20, -20);

    const inverse = new Matrix(matrix.inverse);
    const {width, height} = props.context.workspace.root;

    const scale = getScale(percent);

    let startX = inverse.computeCoord2(0, 0).x;
    let endX = inverse.computeCoord2(width + 20, 0).x;

    startX -= startX % scale;
    endX += scale - endX % scale;

    for (let x = startX; x < endX; x += scale) {
        const offset = matrix.computeCoord2(x, 0).x - 24.5;

        let scale: Scale = {data: x, opacity: getOpacity(offset), offset};
        scalesHor.value.push(scale);
    }
}

function getScale(percent: number) {
    let scale;
    if (percent >= 2 && percent < 5) {
        scale = 2500;
    } else if (percent >= 5 && percent < 10) {
        scale = 1000;
    } else if (percent >= 10 && percent < 20) {
        scale = 500;
    } else if (percent >= 20 && percent < 50) {
        scale = 250;
    } else if (percent >= 50 && percent < 100) {
        scale = 100;
    } else if (percent >= 100 && percent < 200) {
        scale = 50;
    } else if (percent >= 200 && percent < 500) {
        scale = 25;
    } else if (percent >= 500 && percent < 1000) {
        scale = 10
    } else if (percent >= 1000 && percent < 2500) {
        scale = 5;
    } else if (percent >= 2500 && percent < 5000) {
        scale = 2;
    } else {
        scale = 1;
    }
    return scale;
}

function getOpacity(distance: number) {
    if (distance > 10) {
        return 1;
    } else {
        return Number(((distance + 30) / 40).toFixed(1));
    }
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION || t === WorkSpace.ROOT_UPDATE) {
        render();
    }
}

function userWatcher(t: number) {
    if (t === User.RULE_STATUS_CHANGE) {
        render();
    }
}

onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
    props.context.user.watch(userWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.user.unwatch(userWatcher);
})
</script>
<template>
    <div v-if="ruleVisible" class="rule-container">
        <div class="contact-block"></div>
        <div class="d-hor">
            <div v-for="(s, i) in scalesHor"
                 :key="i"
                 :style="{transform: `translateX(${s.offset}px)`, opacity: s.opacity}"
                 class="scale"
            >
                <div class="scale-number">
                    {{ s.data }}
                </div>
                <div class="dot"></div>
            </div>
        </div>
        <div class="d-ver"></div>
    </div>
</template>
<style scoped lang="scss">
.rule-container {
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: relative;

    .contact-block {
        width: 20px;
        height: 20px;
        background-color: var(--theme-color-anti);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        border-bottom: 1px solid var(--grey);
    }

    .d-hor {
        position: absolute;
        width: calc(100% - 20px);
        top: 0;
        left: 20px;
        height: 20px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
        overflow: hidden;

        > .scale {
            position: absolute;
            top: 0;
            left: 0;
            width: 50px;
            height: 100%;
            font-size: 10px;
            color: grey;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
        }

        .dot {
            width: 1px;
            height: 4px;
            background-color: grey;
        }
    }

    .d-ver {
        position: absolute;
        width: 20px;
        top: 20px;
        left: 0;
        height: calc(100% - 20px);
        box-sizing: border-box;
        border-right: 1px solid var(--grey);
        background-color: var(--theme-color-anti);
    }
}
</style>