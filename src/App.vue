<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <RouterView></RouterView>
</template>

<style lang="scss">
html {
    margin: 0;
    padding: 0;
    width: 100%;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }

    >body {
        font-family: var(--font-family);
        margin: inherit;
        padding: inherit;
        width: inherit;
        user-select: none; //禁止复制内容
        position: relative;

        >#app {
            margin: inherit;
            padding: inherit;
            width: inherit;
        }
    }
}
</style>
