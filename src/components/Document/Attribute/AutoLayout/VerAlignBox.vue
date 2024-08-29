<script setup lang="ts">

const props = defineProps<{
    align: string,
    show: boolean
}>();
</script>

<template>
    <div class="box" :style="{ 'align-items': align }" :class="{ active: show }">
        <div class="top"></div>
        <div class="center"></div>
        <div class="bottom"></div>
    </div>
</template>

<style scoped lang="scss">
.box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    position: absolute;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    z-index: 9;

    >div {
        height: 4px;
        border-radius: 1px;
    }

    .top {
        width: 10px;
    }

    .center {
        width: 16px;
    }

    .bottom {
        width: 7px;
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