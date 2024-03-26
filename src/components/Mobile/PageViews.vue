<script setup lang="ts">
import { router } from '@/router';


</script>

<template>
    <div class="status-bar">
        <div class="back" @click="router.go(-1)">
            <svg-icon icon-class="back-icon"></svg-icon>
        </div>

        <span>文件名</span>
    </div>
    <div class="pageview">test</div>
</template>


<style scoped lang="scss">
.status-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    background-color: #fff;
    box-sizing: border-box;

    .back {
        width: 28px;
        height: 28px;
        position: absolute;
        left: 8px;

        svg {
            width: 100%;
            height: 100%;

        }
    }

}

.pageview {
    width: 100%;
    height: calc(100% - 44px);
}
</style>
