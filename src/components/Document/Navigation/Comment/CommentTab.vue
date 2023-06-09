<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import CommentItem from "./CommentItem.vue";
import CommentMenu from "./CommentMenu.vue";
import { useI18n } from 'vue-i18n';
import * as comment_api from '@/apis/comment';
import { useRoute } from 'vue-router';
import { WorkSpace } from "@/context/workspace";
const { t } = useI18n();
const props = defineProps<{ context: Context }>();
type commentListMenu = {
    text: string
    status_p: boolean
}
const route = useRoute()
const docID = (route.query.id as string)
const commentMenu = ref<boolean>(false)
const commentMenuItems = ref<commentListMenu[]>([
    { text: `${t('comment.sort')}`, status_p: false},
    { text: `${t('comment.show_about_me')}`, status_p: false},
    { text: `${t('comment.show_resolved_comments')}`, status_p: false}
])
const documentCommentList = ref<any[]>([])
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
    commentMenuItems.value[index].status_p = status
}

const getDocumentComment = async(id :string) => {
    try {
       const {data} = await comment_api.getDocumentCommentAPI({doc_id: id})
       data.forEach((obj: { commentMenu: any; }) => {
        obj.commentMenu = commentMenuItems.value
       })
       documentCommentList.value = list2Tree(data, '') 
    }catch(err) {
        console.log(err);
    }
}

// 列表转树
const list2Tree = (list: any, rootValue: string) => {
  const arr: any = []
  list.forEach((item: any) => {
    if (item.parent_id === rootValue) {
      const children = list2Tree(list, item.id)
      if (children.length) {
        item.children = children
      }
      arr.push(item)
    }
  })
  return arr
}

const onResolve = (status: number, index: number) => {
    documentCommentList.value[index].status = status
}

const onDelete = (index:number) => {
    documentCommentList.value.splice(index, 1)
}
const update = (t: number) => {
    if(t === WorkSpace.SEND_COMMENT) {
        const timer = setTimeout(() => {
            getDocumentComment(docID)
            clearTimeout(timer)
        }, 500);
    }
}

onMounted(() => {
    getDocumentComment(docID)
    props.context.workspace.watch(update);
})
onUnmounted(() => {
    props.context.workspace.unwatch(update);
})
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
                <CommentItem v-for="(item, index) in documentCommentList" :key="item.id" :commentItem="item" :index="index"
                 :context="context" :pageId="item.page_id" @resolve="onResolve" @delete="onDelete"></CommentItem>
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