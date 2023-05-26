<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Context } from "@/context";
import CommentItem from "./CommentItem.vue";
import CommentMenu from "./CommentMenu.vue";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{ context: Context }>();

const commentMenu = ref<boolean>(false)
let commentMenuItems: string[] = []
const showMenu = () => {
    if(commentMenu.value) {
        commentMenu.value = false
        return
    }
    commentMenuItems = ['按页面排序', '仅显示关于我的','显示已解决评论']
    commentMenu.value = true
}
const closeMenu = () => {
    commentMenu.value = false
}
</script>

<template>
    <div class="comment-container">
        <div class="comment-title">
            <div class="title">评论区</div>
            <div class="drop-dowm" @click.stop="showMenu">
                <svg-icon icon-class="comment-dropdown"></svg-icon>
            </div>
            <CommentMenu v-if="commentMenu" :Items="commentMenuItems" @close="closeMenu"></CommentMenu>
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
        position: relative;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--default-padding);
        border-bottom: 1px solid var(--theme-color-line);
        z-index: 1;
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
    }
}
.el-scrollbar {
    height: 100%;
    padding-right: 10px;
}
</style>