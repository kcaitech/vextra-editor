<script setup lang="ts">
import ToolButton from './ToolButton.vue';

function onclick() {}

</script>

<template>
    <div class="temp" title="打开菜单"></div>
    <ToolButton :onclick="onclick" :valid="true" :selected="false">
        <span>新建文档</span>
    </ToolButton>
</template>

<style scoped>
    .temp {
        cursor: pointer;
        width: 28px;
        height: 28px;
        background-color: #cecece;
        font-size: 12px;
    }
</style>