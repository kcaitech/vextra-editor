<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RefreshTiming } from "./react";
import { Context } from "@/context";

const props = withDefaults(
    defineProps<{
        context: Context;
        refreshTiming?: RefreshTiming;
        backgroundColor?: string;
    }>(),
    {
        backgroundColor: '#000',
        refreshTiming: RefreshTiming.Focus
    }
);

const root = ref<HTMLDivElement>();

function refresh() {
    console.log('__refresh__');
}

function __init() {
    const rootEL = root.value;
    if (rootEL) {
        rootEL.style.backgroundColor = props.backgroundColor;
    }
    if (props.refreshTiming === RefreshTiming.Focus) {
        console.log('__focus__');
        window.addEventListener('focus', refresh);
    }
}

function destory() {
    window.removeEventListener('focus', refresh);
}

onMounted(__init);
onUnmounted(destory);
</script>
<template>
<div ref="root" class="root">

</div>
</template>
<style lang="scss">
.root {
    width: 600px;
    height: 600px;
}
</style>