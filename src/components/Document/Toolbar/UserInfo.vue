<script setup lang="ts">
</script>

<template>
    <div class="user-info">
        <div class="temp" title="播放"></div>
        <div class="temp" title="个人信息"></div>
    </div>
    
</template>

<style scoped lang="scss">
    .user-info {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        position: absolute;
        right: 0;
        transform: translateX(-10%);
        div {
            margin: auto 4px;
        }
    }
    .temp {
        cursor: pointer;
        width: 28px;
        height: 28px;
        background-color: #cecece;
        font-size: 12px;
        border-radius: 50%;
    }
</style>