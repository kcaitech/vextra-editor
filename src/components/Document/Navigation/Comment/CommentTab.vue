<script setup lang="ts">
import { ref } from "vue";
import { Context } from "@/context";
import CommentItem from "./CommentItem.vue";
import CommentMenu from "./CommentMenu.vue";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{ context: Context }>();
type commentListMenu = {
    text: string
    status: boolean
}
const commentMenu = ref<boolean>(false)
const commentMenuItems = ref<commentListMenu[]>([
    { text: `${t('comment.sort')}`, status: false},
    { text: `${t('comment.show_about_me')}`, status: false},
    { text: `${t('comment.show_resolved_comments')}`, status: false}
])
const showMenu = () => {
    if(commentMenu.value) {
        commentMenu.value = false
        return
    }
    commentMenu.value = true
}
const closeMenu = () => {
    commentMenu.value = false
}

const handleMenuStatus = (status: boolean, index: number) => {
    commentMenuItems.value[index].status = status
}
</script>

<template>
    <div class="comment-container">
        <div class="comment-title">
            <div class="title">{{t('comment.comment_area')}}</div>
            <div class="drop-dowm" @click.stop="showMenu">
                <svg-icon icon-class="comment-dropdown"></svg-icon>
            </div>
            <CommentMenu v-if="commentMenu" :Items="commentMenuItems" @close="closeMenu" @comment-menu-status="handleMenuStatus"></CommentMenu>
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