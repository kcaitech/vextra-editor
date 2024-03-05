<script setup lang="ts">

interface Props {
    x: number
    y: number
    size: number
}
const props = defineProps<Props>();
</script>

<template>
    <div class="percent_container" :style="{ transform: `translate(${x}px, ${y}px)` }">
        <span>{{size}}%</span>
    </div>
</template>

<style scoped lang="scss">
.percent_container {
    position: absolute;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;
    span {
        padding: 6px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0);
    }
}
</style>