<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import CommentItem from "./CommentItem.vue";
import CommentMenu from "./CommentMenu.vue";
import { useI18n } from 'vue-i18n';
import * as comment_api from '@/apis/comment';
import { useRoute } from 'vue-router';
import { WorkSpace, Action } from "@/context/workspace";
import { ElScrollbar } from 'element-plus'
import { Selection } from "@/context/selection";
import ShowHiddenLeft from "../ShowHiddenLeft.vue";
import { watchEffect } from "vue";
import { Comment } from "@/context/comment";
import { DocCommentOpData, DocCommentOpType } from "@/communication/modules/doc_comment_op"

const { t } = useI18n();
const props = defineProps<{ context: Context, leftTriggleVisible: boolean, showLeft: boolean }>();
type commentListMenu = {
    text: string
    status_p: boolean
}
const route = useRoute()
const docID = (route.query.id as string)
const emit = defineEmits<{ (e: 'showNavigation'): void }>()

const commentMenu = ref<boolean>(false)
const commentMenuItems = ref<commentListMenu[]>([
    { text: `${t('comment.sort')}`, status_p: props.context.selection.commentPageSort},
    { text: `${t('comment.show_about_me')}`, status_p: props.context.selection.commentAboutMe},
    { text: `${t('comment.show_resolved_comments')}`, status_p: props.context.selection.commentStatus}
])
const documentCommentList = ref<any[]>(props.context.comment.commentList)
const commentAll = ref<any[]>() //没有转树的评论列表
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const isPageSort = ref(props.context.selection.commentPageSort)
const visibleComment = ref(props.context.comment.isVisibleComment)
const action = ref()
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

const getPage = (status: boolean) => {
    const pages = props.context.data.pagesList
    if(status) {
        const sortArr: any = []
        pages.forEach(item => {
            documentCommentList.value.forEach(comment => {
                if(item.id === comment.page_id) {
                    sortArr.push(comment)                    
                }
            })
        })
        return sortArr
    }
}

//关于我的评论
const aboutMe = () => {
    const aboutMeArr: any = []
    const userId = props.context.comment.isUserInfo?.id
    const commnetList = props.context.comment.not2treeComment
    commnetList.forEach((item: any) => {
        if(item.user.id === userId) {
            const rootId = item.root_id
            if(rootId) {
                commnetList.forEach((i: any) => {
                    if(i.id === rootId) {
                        aboutMeArr.push(i)
                    }
                })
            }else {
                aboutMeArr.push(item)
            }
        }
    })
    const myComment = Array.from(new Set(aboutMeArr))
    return myComment
}

const handleMenuStatus = (status: boolean, index: number) => {
    if(index === 2) {
        props.context.selection.commentSolveMenuStatus(status)
    }
    if(index === 0) {
        getPage(status)
        props.context.selection.setPageSort(status)
    }
    if(index === 1) {
        props.context.selection.setCommentAboutMe(status)
    }
    commentMenuItems.value[index].status_p = status
}

const getDocumentComment = async(id :string) => {
    try {
       const {data} = await comment_api.getDocumentCommentAPI({doc_id: id})
       data.forEach((obj: {children: any[]; commentMenu: any; }) => {
        obj.commentMenu = commentMenuItems.value
        obj.children = []
       })
       const list  = list2Tree(data, '') 
       props.context.comment.setNot2TreeComment(data)
       props.context.comment.setCommentList(list)
       documentCommentList.value = props.context.comment.commentList
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
    props.context.comment.setCommentList(documentCommentList.value)
}

const onDelete = (index:number) => {
    documentCommentList.value.splice(index, 1)
    props.context.comment.setCommentList(documentCommentList.value)
}

const onVisibleComment = () => {
    props.context.comment.setVisibleComment(true)
}

const update = (t: number) => {
    action.value = props.context.workspace.action;
}
const selectedUpdate = (t: number) => {
    if(t === Selection.PAGE_SORT) {
        isPageSort.value = props.context.selection.commentPageSort
    }
}
const commentUpdate = (t: number) => {
    if(t === Comment.SEND_COMMENT) {
        const timer = setTimeout(() => {
            getDocumentComment(docID)
            clearTimeout(timer)
        }, 150);
    }
    if(t === Comment.UPDATE_COMMENT) {
        documentCommentList.value = props.context.comment.commentList
    }
    if(t === Comment.SELECTE_COMMENT) {
        const curId = props.context.comment.isSelectCommentId
        const comment = document.querySelector(`[data-comment="${curId}"]`)
        if(comment) {
            scrollbarRef.value?.scrollTo({
                top: (comment as HTMLDivElement).offsetTop,
                behavior: "smooth"
            })
        }
    }
    if (t === Comment.VISIBLE_COMMENT) {
        visibleComment.value = props.context.comment.isVisibleComment
    }
}
watchEffect(() => {
    getDocumentComment(docID)
})

const docComment = (comment: DocCommentOpData) => {
    if(comment.comment.content) {
        comment.comment.content = comment.comment.content.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
    }
    const index = documentCommentList.value.findIndex(item => item.id === comment.comment.id)
    if(comment.type === DocCommentOpType.Update) {
        if(index !== -1) {
            documentCommentList.value[index] = {
                ...documentCommentList.value[index],
                ...comment.comment
            }
        }
    }else if (comment.type === DocCommentOpType.Del) {
        if(index !== -1) {
            documentCommentList.value.splice(index, 1)
        }
    }else if (comment.type === DocCommentOpType.Add) {
        if(!comment.comment.root_id) {
            documentCommentList.value.unshift(comment.comment)
        }
    }
}
onMounted(() => {
    const updateComment = props.context.communication.comment
    updateComment.addUpdatedHandler(docComment)
    props.context.workspace.watch(update);
    props.context.comment.watch(commentUpdate);
    props.context.selection.watch(selectedUpdate);
})
onUnmounted(() => {
    const updateComment = props.context.communication.comment
    updateComment.removeUpdatedHandler(docComment)
    props.context.workspace.unwatch(update);
    props.context.comment.unwatch(commentUpdate);
    props.context.selection.unwatch(selectedUpdate);
})
const showHiddenLeft = () => {
    emit('showNavigation')
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
        <div class="no_comment" v-if="documentCommentList.length <= 0">
            <div>{{t('comment.no_comment')}}</div>
            <div>{{t('comment.leave_a_comment')}}</div>
        </div>
        <div class="visible-comment" v-else-if="!visibleComment && action !== Action.AddComment">
            <div>{{t('comment.comments_hide')}}</div>
            <button @click="onVisibleComment">{{t('comment.show_comments')}}</button>
        </div>
        <div class="comment-list" v-else>
            <el-scrollbar ref="scrollbarRef">
                <CommentItem v-for="(item, index) in isPageSort ? getPage(true) : documentCommentList" :key="item.id" :commentItem="item" :index="index"
                 :context="context" :pageId="item.page_id" @resolve="onResolve" @delete="onDelete" :data-comment="item.id" :myComment="aboutMe()"></CommentItem>
                <div style="height: 30px;"></div>
            </el-scrollbar>
        </div>
        <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></ShowHiddenLeft>
    </div>
</template>

<style scoped lang="scss">
.comment-container {
    width: 100%;
    height: 100%;
    background-color: var(--theme-color-anti);
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    overflow: hidden;
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
        position: relative;
        height: 100%;
    }
    .no_comment {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #999;
    }
    .visible-comment {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        >button {
            margin-top: 10px;
            font-size: 10px;
            border: none;
            height: 30px;
            color: #fff;
            width: 70px;
            border-radius: 4px;
            background-color: var(--active-color);
        }
    }
}
.el-scrollbar {
    height: 100%;
    padding-right: 10px;
}
</style>