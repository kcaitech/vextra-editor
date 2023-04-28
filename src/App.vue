<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <RouterView></RouterView>
</template>

<style lang="scss">
html {
    width: 100%;
    height: 100%;

    >body {
        font-family: var(--font-family);
        overflow: hidden;
        margin: 0px;
        width: 100%;
        height: 100%;
        user-select: none;

        >#app {
            display: flex;
            flex-flow: column nowrap;
            width: 100%;
            height: 100%;
        }
    }
}
</style>
