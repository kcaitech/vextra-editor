<script setup lang="ts">

const props = defineProps<{
    align: string,
    show: boolean
}>();
</script>

<template>
    <div class="box" :style="{ 'justify-content': align }" :class="{ active: show }">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</template>

<style scoped lang="scss">
.box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 4px;
    position: absolute;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    z-index: 9;

    >div {
        width: 4px;
        height: 7px;
        border-radius: 1px;
    }

    &:hover {
        background-color: #fff;

        >div {
            background-color: rgba(25, 137, 252, 0.4);
        }
    }
}

.active {
    background-color: #fff;

    >div {
        background-color: #1989FC !important;
    }
}
</style>