<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
interface Props {
    title: string
}

const props = defineProps<Props>();

const emits = defineEmits(['data-update'])


//===>Apphome组件接收
const update = (data: any,searchtitle:string) => {
    //main目录下传过来的lists和title
    emits('data-update', data,searchtitle)
}

</script>

<template>
    <div class="title">
        <span>{{ props.title }}</span>
    </div>
    <el-divider />
    <div class="main">
        <RouterView @data-update="update" />
    </div>
</template>

<style lang="scss" scoped>
.el-divider {
    margin: 10px 0;
}

.title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 20px;

    span {
        font-size: 18px;
        width: auto;
        font-weight: 600;
        letter-spacing: 2px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}
</style>