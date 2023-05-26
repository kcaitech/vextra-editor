<script setup lang="ts">
import { defineProps } from "vue";
import { Context } from "@/context";
import CommentItem from "./CommentItem.vue";
const props = defineProps<{ context: Context }>();
</script>

<template>
    <div class="comment-container">
        <div class="comment-title">
            <div class="title">评论区</div>
            <div class="drop-dowm"><svg-icon icon-class="comment-dropdown"></svg-icon></div>
        </div>
        <div class="comment-list">
            <el-scrollbar>
                <CommentItem v-for="item in 20" :key="item"></CommentItem>
                <div style="height: 30px;"></div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style scoped lang="scss">
.comment-container {
    width: 100%;
    height: 100%;
    background-color: var(--theme-color-anti);
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    .comment-title {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--default-padding);
        border-bottom: 1px solid var(--theme-color-line);
        .drop-dowm {
            width: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            >svg {
                width: 14px;
                height: 14px;
            }
        }
    }
    .comment-list {
        height: 100%;
        padding-left: var(--default-padding-half);
    }
}
.el-scrollbar {
    height: 100%;
    padding-right: 10px;
}
</style>