<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-27 14:56:57
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 09:57:17
 * @FilePath: \kcdesign\src\components\Document\Toolbar\EditorTools.vue
-->
<script setup lang="ts">
import "@/assets/icons/svg/cursor.svg";
import "@/assets/icons/svg/frame.svg";
import "@/assets/icons/svg/pen.svg";
import "@/assets/icons/svg/pointer.svg";
import "@/assets/icons/svg/rectangle.svg";
import "@/assets/icons/svg/resource.svg";
import "@/assets/icons/svg/text.svg";
import "@/assets/icons/svg/ungroup.svg";
import ToolButton from './ToolButton.vue';

</script>

<template>
    <div class="editor-tools">
        <!-- 选择工具 -->
        <ToolButton>
            <el-popover
              placement="bottom"
              :width="200"
              trigger="click"
              content="选择工具 二级菜单"
              :show-arrow="false"
              effect="dark"
            >
                <template #reference>
                    <div class="temp" title="Cursor">
                        <svg-icon icon-class="cursor"></svg-icon>
                    </div>
                </template>
            </el-popover>
        </ToolButton>
        <!-- 剪裁 -->
        <ToolButton>
            <div class="temp" title="Frame">
                <svg-icon icon-class="frame"></svg-icon>
            </div>
        </ToolButton>
        <!-- 形状 -->
        <ToolButton>
            <el-popover
              placement="bottom"
              :width="200"
              trigger="click"
              content="形状 二级菜单"
              :show-arrow="false"
              effect="dark"
            >
                <template #reference>
                    <div class="temp" title="Rectangle">
                        <svg-icon icon-class="rectangle"></svg-icon>
                    </div>
                </template>
            </el-popover>
        </ToolButton>
        <!-- 画笔 -->
        <ToolButton>
            <el-popover
              placement="bottom"
              :width="200"
              trigger="click"
              content="画笔 二级菜单"
              :show-arrow="false"
              effect="dark"
            >
                <template #reference>
                    <div class="temp" title="Pen">
                        <svg-icon icon-class="pen"></svg-icon>
                    </div>
                </template>
            </el-popover>
        </ToolButton>
        <!-- 插入文字 -->
        <ToolButton>
            <div class="temp" title="Text">
                <svg-icon icon-class="text"></svg-icon>
            </div>
        </ToolButton>
        <!-- 插入图片 -->
        <ToolButton>
            <div class="temp" title="Resource">
                <svg-icon icon-class="resource"></svg-icon>
            </div>
        </ToolButton>
        <!-- 引用 -->
        <ToolButton>
            <div class="temp" title="Pointer">
                <svg-icon icon-class="pointer"></svg-icon>
            </div>
        </ToolButton>
        <div class="vertical-line" />
        <!-- 画笔 -->
        <ToolButton>
            <el-popover
              placement="bottom"
              :width="200"
              trigger="click"
              content="复制 二级菜单"
              :show-arrow="false"
              effect="dark"
            >
                <template #reference>
                    <div class="temp" title="复制">
                        <svg-icon icon-class="ungroup"></svg-icon>
                    </div>
                </template>
            </el-popover>
        </ToolButton>
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
            font-size: 12px;
            color: #ffffff;
            box-sizing: border-box;
            padding: 4px;
            > svg {
                width: 100%;
                height: 100%;
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
    }
</style>