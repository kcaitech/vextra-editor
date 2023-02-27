<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-27 14:56:57
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-27 17:42:44
 * @FilePath: \kcdesign\src\components\Document\Toolbar\EditorTools.vue
-->
<script setup lang="ts">

</script>

<template>
    <div class="editor-tools">
        <!-- 选择工具 -->
        <el-popover
          placement="bottom"
          :width="200"
          trigger="click"
          content="选择工具 二级菜单"
          :show-arrow="false"
        >
            <template #reference>
                <div class="temp" title="选择工具" />
            </template>
        </el-popover>
        <!-- 剪裁 -->
        <div class="temp" title="裁剪"></div>
        <!-- 形状 -->
        <el-popover
          placement="bottom"
          :width="200"
          trigger="click"
          content="形状 二级菜单"
          :show-arrow="false"
        >
            <template #reference>
                <div class="temp" title="形状" />
            </template>
        </el-popover>
        <!-- 画笔 -->
        <el-popover
          placement="bottom"
          :width="200"
          trigger="click"
          content="画笔 二级菜单"
          :show-arrow="false"
        >
            <template #reference>
                <div class="temp" title="画笔" />
            </template>
        </el-popover>
        <!-- 插入文字 -->
        <div class="temp" title="文字" />
        <!-- 插入图片 -->
        <div class="temp" title="图片" />
        <!-- 引用 -->
        <div class="temp" title="引用" />
        <div class="vertical-line" />
        <!-- 画笔 -->
        <el-popover
          placement="bottom"
          :width="200"
          trigger="click"
          content="复制 二级菜单"
          :show-arrow="false"
        >
            <template #reference>
                <div class="temp" title="复制" />
            </template>
        </el-popover>
    </div>
    
</template>

<style scoped lang="scss">
    .editor-tools {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        div {
            margin: auto 4px;
        }
        .temp {
            cursor: pointer;
            width: 28px;
            height: 28px;
            background-color: #cecece;
            font-size: 12px;
        }
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