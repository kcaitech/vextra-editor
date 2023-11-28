<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="main">
        <RouterView />
    </div>
</template>

<style lang="scss" scoped>
.main {
    height: 100%;
    margin: 0 24px;
    overflow: hidden;
}
</style>