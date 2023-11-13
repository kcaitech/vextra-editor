<script setup lang="ts">
import {Matrix, TextShape, Variable} from "@kcdesign/data";
import {ref, h} from "vue";
import {renderTextStatic as r} from "@kcdesign/data"
import {Context} from "@/context";
import Ctrl from "./Ctrl.vue";

interface Props {
    context: Context
    shape: TextShape
}

const props = defineProps<Props>();
const height = 200
const matrix = ref(new Matrix());
const reflush = ref<number>(0);
const container = ref<HTMLDivElement>();
const container_root = ref<{ x: number, y: number }>({x: 0, y: 0});

function render() {
    const consumedVars: { slot: string, vars: Variable[] }[] = [];
    return r(h, props.shape, undefined, undefined, consumedVars, reflush.value, true);
}

function wheel(e: WheelEvent) {
    if (matrix.value.m12 === 0 && e.deltaY < 0) return;
    const step = e.deltaY > 0 ? 2 : -2;
    matrix.value.trans(0, -step);
    const del = matrix.value.m12 - 0;
    if (del > 0) matrix.value.trans(0, -del);
    reflush.value++;
}

function init_view_box() {
    if (!container.value) return '';
    const c_box = container.value.getBoundingClientRect();
    container_root.value.x = c_box.x;
    container_root.value.y = c_box.y;
    return `0 0 ${c_box.width - 8} 300`;
}
</script>
<template>
    <div class="holder-container" @wheel.prevent="wheel" ref="container">
        <svg v-if="container" version="1.1" xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink"
             xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
             :viewBox="init_view_box()" overflow="visible" class="holder" :style="{ transform: matrix.toString() }"
        >
            <render></render>
        </svg>
        <Ctrl v-if="container" :context="context" :root="container_root" :shape="props.shape"
              :matrix="matrix.toArray()" :view-box="init_view_box()"></Ctrl>
    </div>
</template>
<style>
.holder-container {
    width: 100%;
    height: 136px;
    background-color: #EFEFEF;
    border-radius: 4px;
    overflow: hidden;
    padding: 2px 4px;
    box-sizing: border-box;
    position: relative;

    .holder {
        width: calc(100% - 8px);
        position: absolute;

        text {
            cursor: text;
        }
    }

}
</style>