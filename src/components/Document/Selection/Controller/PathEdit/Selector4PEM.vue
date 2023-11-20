<script setup lang="ts">
import {Context} from '@/context';
import {Shape} from '@kcdesign/data';
import {watchEffect, onMounted, onUnmounted} from 'vue';

export interface SelectorFrame {
    top: number
    left: number
    width: number
    height: number
    includes: boolean
}

interface Props {
    selectorFrame: SelectorFrame
    context: Context
}

const props = defineProps<Props>();
const selectedShapes: Map<string, Shape> = new Map();
let changed: boolean = false;

function select() {
    //todo
    console.log('select-emit');
}

// 加入
function finder() {
    //todo
}

// 剔除
function remove() {
    //todo
}

function reset() {
}

// hooks
onMounted(() => {
})
onUnmounted(() => {
})
watchEffect(select);
</script>
<template>
    <div class="selector"
         :style="{ top: `${props.selectorFrame.top}px`, left: `${props.selectorFrame.left}px`, width: `${props.selectorFrame.width}px`, height: `${props.selectorFrame.height}px` }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--theme-color-anti);
    background-color: rgba($color: #ffffff, $alpha: 0.1);
}
</style>