<script setup lang="ts">

</script>

<template>
    <div class="editor-tools">
        <div class="temp" title="选择工具"></div>
        <div class="temp" title="裁剪"></div>
        <div class="temp" title="形状"></div>
        <div class="temp" title="画笔"></div>
        <div class="temp" title="文字"></div>
        <div class="temp" title="图片"></div>
        <div class="temp" title="引用"></div>
        <div class="vertical-line" />
        <div class="temp" title="复制"></div>
    </div>
    
</template>

<style scoped>
    .editor-tools {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
    .editor-tools > div {
        margin: auto 4px;
    }
    .temp {
        cursor: pointer;
        width: 28px;
        height: 28px;
        background-color: #cecece;
        font-size: 12px;
    }
    .vertical-line {
        width: 1px;
        height: 28px;
        background-color: grey;
        flex: 0 0 auto;
        margin-left: 5px;
        margin-right: 5px;
    }
</style>