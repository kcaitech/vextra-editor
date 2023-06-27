<script setup lang="ts">
import { RouterView } from 'vue-router';
interface Props {
    title: string
}

const props = defineProps<Props>();

</script>

<template>
    <div class="title">
        <span>{{ props.title }}</span>
    </div>
    <el-divider />
    <div class="main">
        <RouterView />
    </div>
</template>

<style lang="scss" scoped>
.el-divider{
    margin: 10px 0;
}
.title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 20px;

    span {
        width: auto;
        font-weight: bold;
        letter-spacing: 2px;
    }
}
</style>