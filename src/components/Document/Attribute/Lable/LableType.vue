<script setup lang="ts">
const props = defineProps<{
    title: string
}>();
</script>

<template>
    <div class="container-type" :class="{border_t: true}">
        <div class="title">
            <span>{{ title }}</span>
            <slot name="select"></slot>
        </div>
        <div class="body">
            <slot name="body"></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container-type {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    .title {
        display: flex;
        justify-content: space-between;
        >span {
            font-weight: bold;
        }
    }
}
.border_t {
    border-bottom: 1px solid rgba($color: gray, $alpha: 0.5);
}
</style>