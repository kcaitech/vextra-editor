<script setup lang="ts">
import { RouterView } from 'vue-router';
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
        }
    }
}
</style>
