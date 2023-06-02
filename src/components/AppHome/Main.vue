<script setup lang="ts">
import { RouterView } from 'vue-router';
import { defineProps } from 'vue';
interface Props {
    title: string
}
const props = defineProps<Props>();
</script>

<template>
    <div class="title">
        <div>
            <span>{{ props.title }}</span>
        </div>
    </div>
    <el-divider />
    <div class="main">
        <RouterView />
    </div>
</template>

<style lang="scss" scoped>
.main .title {
    width: calc(100vw - 381px);
    height: 100vh;
    overflow: scroll;

}

.title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 40px;

    .el-icon {
        margin-right: 20px;

        &:hover {
            background: rgb(188, 188, 188);
        }
    }

    span {
        width: 80px;
        font-weight: bold;
        letter-spacing: 2px;
    }
}
</style>