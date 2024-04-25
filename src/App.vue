<script setup lang="ts">
import { RouterView } from 'vue-router';
import DeskTopBar from './components/DeskTopBar/index.vue'
import { debounce } from 'lodash';
import { onBeforeUnmount, onMounted } from "vue";
import { startRefreshTokenTask, stopRefreshTokenTask } from "@/utils/refresh_token";
import { PROJECT_NAME } from "@/const";

const kcdesk = (window as any)['kcdesk_07444f3a-343d-45a7-bd37-635fc9a26871'];

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
    <DeskTopBar v-if="kcdesk" :kcdesk="kcdesk" />
    <RouterView></RouterView>
</template>

<style lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    background-color: rgba(250, 250, 250, 1);

    >body {
        font-family: var(--font-family);
        height: 100vh;
        user-select: none; //禁止复制内容
        position: relative;

        &::-webkit-scrollbar {
            height: 0;
            width: 0;
        }

        >#app {
            position: absolute;
            width: 100%;
            height: 100%;
        }
    }
}
</style>
