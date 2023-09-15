<script setup lang="ts">
import { RouterView } from 'vue-router';
import { debounce } from 'lodash';

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver{
  constructor(callback:any) {
    callback = debounce(callback, 16);
    super(callback);
  }
}
</script>

<template>
    <RouterView></RouterView>
</template>

<style lang="scss">
html,body {
    margin: 0;
    padding: 0;

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
