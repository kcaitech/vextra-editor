<script setup lang="ts">
import {ref, onMounted, computed, onUnmounted } from "vue"
import { ChatDotSquare, Delete, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import { Context } from "@/context";
import { useI18n } from 'vue-i18n'
import { Page } from '@kcdesign/data';
import { Selection } from '@/context/selection'
import { WorkSpace } from "@/context/workspace";
import * as comment_api from '@/apis/comment';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
import { Comment } from "@/context/comment";
const { t } = useI18n()
const props = defineProps<{
    commentItem: any,
    index: number,
    context: Context,
    pageId: string,
    myComment: any[]
}>()
const emit = defineEmits<{
    (e: 'resolve', status: number, index: number): void
    (e: 'delete', index: number):void
    (e: "switchpage", id: string): void;
}>()
const hoverIcon = ref(false)
const hoverComment = ref(false)
const workspace = computed(() => props.context.workspace);
const comment = computed(() => props.context.comment);
const reply = ref(props.context.selection.commentStatus)
const myComment = ref(props.context.selection.commentAboutMe)
const aboutMe = ref(false)
const resolve = computed(() => {
    return props.commentItem.status === 0 ? true : false
})
const selectComment = ref(false)
const status = computed(() => {
    const status = props.commentItem.status
    replyStatus()
    showAboutMe()
    if(reply.value) {
        if(myComment.value) {
            if(aboutMe.value) {
                return true
            }else {
                return false
            }
        }else {
            return true
        }
    }else {
        if(status === 0) {
            if(myComment.value) {
                if(aboutMe.value) {
                    return true
                }else {
                    return false
                }
            }else {
                return true
            }
        }else {
            return false
        }
    }
})

const replyStatus = () => {
    reply.value = props.context.selection.commentStatus
}
const showAboutMe = () => {
    myComment.value = props.context.selection.commentAboutMe
    const comment = props.myComment.find(item => item.id === props.commentItem.id)
    if(comment) {
        aboutMe.value = true
    } else {
        aboutMe.value = false
    }
}
const isControls = computed(() => {
    if(comment.value.isUserInfo?.id === props.commentItem.user.id || comment.value.isUserInfo?.id === comment.value.isDocumentInfo?.user.id) return true
    else return false
})

const isControlsDel = computed(() => {
    if(comment.value.isUserInfo?.id === props.commentItem.user.id) return true
    else return false
})

const replyNum = computed(() => {
    if(props.commentItem.children) {
        const child = props.commentItem.children.length
        return child
    }else {
        return 0
    }
})


const hoverShape = (e: MouseEvent) => {
    hoverIcon.value = true
    hoverComment.value = true
}
const page = ref<Page>()
const unHoverShape = (e: MouseEvent) => {
    hoverIcon.value = false
    hoverComment.value = false
}

const onReply = () => {
    const id = props.context.selection.selectedPage?.id
    if(id === props.pageId) {
        if(isInner()) {
            props.context.selection.selectComment(props.commentItem.id)
            return
        }
        const workspace = props.context.workspace;
        const cx = props.commentItem.shape_frame.x1
        const cy = props.commentItem.shape_frame.y1
        const commentCenter = workspace.matrix.computeCoord(cx, cy) // 计算评论相对contenview的位置
        const { x, y, bottom, right } = workspace.root;
        const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
        const transX = contentViewCenter.x - commentCenter.x, transY = contentViewCenter.y - commentCenter.y;
        props.context.selection.selectComment(props.commentItem.id)
        
        if (transX || transY) {
            workspace.matrix.trans(transX, transY);
            workspace.matrixTransformation();
        }
    }else {
        props.context.comment.commentMount(false)
        props.context.selection.selectCommentPage(props.pageId) 
        props.context.selection.setCommentSelect(true)
        props.context.selection.selectComment(props.commentItem.id)
    }
}
// 判断评论是否在可视区域内
function isInner() {
  const workspace = props.context.workspace;
  const { x: rx, y: ry, bottom, right } = workspace.root;
  const cx = props.commentItem.shape_frame.x1
  const cy = props.commentItem.shape_frame.y1
  const commentCenter = workspace.matrix.computeCoord(cx, cy) //评论在视图上的位置
  if((commentCenter.x + rx) < rx ||(commentCenter.y + ry) < ry) {
    return false
  } else if ((commentCenter.x + rx) > right || (commentCenter.y + ry + 35) > bottom) {
    return false
  }else {
    return true
  }
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    if(!isControls.value) return
    props.context.comment.editTabComment()
    const state = props.commentItem.status === 0 ? 1 : 0
    setCommentStatus(state)
    emit('resolve', state, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if(!isControlsDel.value) return
    props.context.comment.editTabComment()
    props.context.comment.commentInput(false);
    deleteComment()
    emit('delete', props.index)
}

const setCommentStatus = async(status: number) => {
    try{
        await comment_api.setCommentStatusAPI({id: props.commentItem.id, status: status})
    }catch(err) {
        console.log(err);
    }
}

const deleteComment = async() => {
    try{
        await comment_api.deleteCommentAPI({comment_id: props.commentItem.id})
    }catch(err) {
        console.log(err);
    }
}

const formatDate = computed(() => {
  return function (value: string): string {
    const lang = localStorage.getItem('locale') || 'zh'
    moment.locale(mapDateLang.get(lang) || 'zh-cn');
    return filterDate(value);
  }
})

const filterDate = (time: string) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${moment(date).format("MMM Do")} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const getPage = () => {
    const p = props.context.data
    p.pagesMgr.get(props.pageId).then((p: Page | undefined) => {
        if(!p) return
            page.value = p
    })
}

const selectionUpdate = (t: number) => {
    if(t === Selection.SOLVE_MENU_STATUS) {
        replyStatus()
    }
    if(t === Selection.ABOUT_ME) {
        showAboutMe()
    }
}

const commentUpdate = (t: number) => {
    if(t === Comment.CURRENT_COMMENT) {
        const curId = props.context.comment.isHoverCommentId
        if(curId === props.commentItem.id) {
            hoverComment.value = props.context.comment.isHoverComment
        }
    }
    if(t === Comment.SELECTE_COMMENT) {
        const curId = props.context.comment.isSelectCommentId
            selectComment.value = curId === props.commentItem.id ? true : false
    }
}

getPage()
onMounted(() => {
    props.context.selection.watch(selectionUpdate);
    props.context.comment.watch(commentUpdate);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionUpdate);
    props.context.comment.unwatch(commentUpdate);
})
</script>
<template>
    <div class="comment-item-container" :class="{active: hoverComment, selected: selectComment}" @mouseenter="hoverShape" @mouseleave="unHoverShape" @click="onReply" v-if="status">
        <div class="avatar">
            <img :src="props.commentItem.user.avatar" alt="">
        </div>
        <div class="content">
            <div class="item-title">
                <div class="item_heard">
                    <div class="name" :style="{opacity: props.commentItem.status === 0 ? 1 : 0.5}">{{props.commentItem.user.nickname}} </div>&nbsp;&nbsp;
                    <div class="date">{{ formatDate(props.commentItem.record_created_at) }}</div>
                </div>
                <div class="icon"  :style="{visibility: hoverIcon ? 'visible' : 'hidden'}">
                    <el-button-group class="ml-4">
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.reply')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="ChatDotSquare" @click.stop="onReply" style="margin-right: 5px;"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="isControlsDel">
                            <el-button plain :icon="Delete" @click="onDelete" :style="{'margin-right': 5 +'px'}" v-if="isControlsDel"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="resolve && isControls">
                            <el-button plain :icon="CircleCheck" @click="onResolve" v-if="isControls"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-else-if="!resolve && isControls">
                            <el-button class="custom-icon" plain :icon="CircleCheckFilled" @click="onResolve" v-if="isControls"/>
                        </el-tooltip>
                    </el-button-group>
                </div>
            </div>
            <div class="text" v-html="commentItem.content"></div>
            <div class="bottom-info">
                <div class="reply" :style="{opacity: props.commentItem.status === 0 ? 1 : 0.5}">{{replyNum}} {{ t('comment.a_few_reply') }}</div>
                <div class="page">{{ page?.name }}</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .comment-item-container {
        font-size: var(--font-default-fontsize);
        padding: var(--default-padding-half) 0;
        padding-left: var(--default-padding-half);
        display: flex;
        .avatar {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #efefef;
            margin-right: 5px;
            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
        .content {
            width: calc(100% - 37px);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-right: 5px;
            .item-title {
                display: flex;
                width: 100%;
                height: 30px;
                align-items: center;
                justify-content: space-between;
                .item_heard {
                    display: flex;
                    width: calc(100% - 70px);
                    .name {
                        width: calc(100% - 95px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
                .icon {
                    display: flex;
                    justify-content: flex-end;
                    width: 70px;
                    height: 20px;
                    .el-button {
                        border: none;
                        background-color: transparent;
                        padding: 0;
                        border-radius: 2px;
                        width: 20px;
                        height: 20px;
                        &:hover {
                            background-color: rgba(0,0,0,0.08);
                        }
                    }
                }
            }
            .text {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                color:rgba(0, 0, 0, .5);
            }
            .bottom-info {
                display: flex;
                margin-top: 10px;
                justify-content: space-between;
                .page {
                    color:rgba(0, 0, 0, .5);
                }
            }
        }
    }
    .active {
        background-color: var(--grey);
    }
    .selected {
        background-color: var(--left-navi-button-select-color);
    }
    .custom-icon {
        color: green; /* 设置颜色为绿色 */
    }
</style>