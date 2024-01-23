<script setup lang="ts">
const props = defineProps<{
    title: string
}>();
</script>

<template>
    <div class="container-type">
        <div class="title">
            <span>{{ title }}</span>
            <slot name="select"></slot>
        </div>
        <div class="body">
            <slot name="body"></slot>
        </div>
    </div>
    <div class="line" style="width: 216px;height: 1px;background-color: #F5F5F5;margin-left: 12px;"></div>
</template>

<style scoped lang="scss">
.container-type {
    width: 100%;
    padding: 16px 12px;
    padding-right: 10px;
    box-sizing: border-box;

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        >span {
            font-weight: bold;
        }
    }
}
</style>