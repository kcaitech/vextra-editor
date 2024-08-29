<script setup lang="ts">

const props = defineProps<{
    align: string,
    show: boolean
}>();
</script>

<template>
    <div class="box" :style="{ 'align-items': align }" :class="{ active: show }">
        <div class="left"></div>
        <div class="center"></div>
        <div class="right"></div>
    </div>
</template>

<style scoped lang="scss">
.box {
    display: flex;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    position: absolute;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    z-index: 9;

    >div {
        width: 4px;
        border-radius: 1px;
    }

    .left {
        height: 10px;
    }

    .center {
        height: 16px;
    }

    .right {
        height: 7px;
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