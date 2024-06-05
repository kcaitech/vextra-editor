<script setup lang="ts">
import { RouterView } from 'vue-router';
import { debounce } from 'lodash';
import { onBeforeUnmount, onMounted } from "vue";
import { startRefreshTokenTask, stopRefreshTokenTask } from "@/utils/refresh_token";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: any) {
        callback = debounce(callback, 16);
        super(callback);
    }
}

document.title = t('product.name') + ' - ' + t('product.subtitle');

const description = document.createElement('meta');
description.name = "description";
description.content = t('product.description');
document.head.append(description);

const h1 = document.createElement('h1');
h1.innerText = t('product.description');
h1.style.display = 'none'
document.body.append(h1);

const keywords = document.createElement('meta');
keywords.name = "keywords";
keywords.content = t('product.keywords');
document.head.append(keywords);

onMounted(() => {
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
