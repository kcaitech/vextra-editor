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
            position: absolute;
            display: flex;
            flex-flow: column nowrap;
            width: 100%;
            height: 100%;
        }
    }
}

.vue-recycle-scroller__item-view.hover{
    background-color: rgb(224, 224, 224, 0.8);
    border-radius: 6px;
}

.selected {
    background-color: rgba(59, 100, 252, 0.1);
    border-radius: 6px;
}
</style>
