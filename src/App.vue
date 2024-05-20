<script setup lang="ts">
import { RouterView } from 'vue-router';
import { debounce } from 'lodash';
import { onBeforeUnmount, onMounted } from "vue";
import { startRefreshTokenTask, stopRefreshTokenTask } from "@/utils/refresh_token";
import { PROJECT_NAME } from "@/const";

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: any) {
        callback = debounce(callback, 16);
        super(callback);
    }
}

onMounted(() => {
    document.title = PROJECT_NAME;
    startRefreshTokenTask();
})

onBeforeUnmount(() => {
    stopRefreshTokenTask();
})
</script>

<template>
    <RouterView></RouterView>
</template>

<style lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    background-color: rgba(250, 250, 250, 1);
    font-family: var(--font-family);
    user-select: none; //禁止复制内容
    position: relative;
    overflow: hidden;
    --webkit-overflow-scrolling: touch;
    width: 100%;
    height: 100%;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }

}

#app {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
