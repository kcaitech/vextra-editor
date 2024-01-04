<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue"
import { ChatDotSquare, Delete, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import { Context } from "@/context";
import { useI18n } from 'vue-i18n'
import { Page } from '@kcdesign/data';
import { Selection } from '@/context/selection'
import * as comment_api from '@/request/comment';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
import { Comment } from "@/context/comment";
import { WorkSpace } from "@/context/workspace";
import SvgIcon from "@/components/common/SvgIcon.vue";

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
    (e: 'delete', index: number): void
    (e: "switchpage", id: string): void;
}>()
const hoverIcon = ref(false)
const hoverComment = ref(false)
const comment = computed(() => props.context.comment);
const reply = ref(props.context.selection.commentStatus)
const myComment = ref(props.context.selection.commentAboutMe)
const aboutMe = ref(false)
const pageName = ref()
const resolve = computed(() => {
    return props.commentItem.status === 0 ? true : false
})
const selectComment = ref(false)
const status = computed(() => {
    const status = props.commentItem.status
    replyStatus()
    showAboutMe()
    if (reply.value) {
        if (myComment.value) {
            if (aboutMe.value) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    } else {
        if (status === 0) {
            if (myComment.value) {
                if (aboutMe.value) {
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        } else {
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
    if (comment) {
        aboutMe.value = true
    } else {
        aboutMe.value = false
    }
}
const isControls = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentItem.user.id || comment.value.isUserInfo?.id === comment.value.isDocumentInfo?.user.id) return true
    else return false
})

const isControlsDel = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentItem.user.id) return true
    else return false
})

const replyNum = computed(() => {
    if (props.commentItem.children) {
        const child = props.commentItem.children.length
        return child
    } else {
        return 0
    }
})


const hoverShape = (e: MouseEvent) => {
    hoverIcon.value = true
    hoverComment.value = true
}
const unHoverShape = (e: MouseEvent) => {
    hoverIcon.value = false
    hoverComment.value = false
}

const onReply = () => {
    const id = props.context.selection.selectedPage?.id
    if (id === props.pageId) {
        if (isInner()) {
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
            workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    } else {
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
    if ((commentCenter.x + rx) < rx || (commentCenter.y + ry) < ry) {
        return false
    } else if ((commentCenter.x + rx) > right || (commentCenter.y + ry + 35) > bottom) {
        return false
    } else {
        return true
    }
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value) return
    const state = props.commentItem.status === 0 ? 1 : 0
    setCommentStatus(state)
    emit('resolve', state, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value) return
    props.context.comment.commentInput(false);
    deleteComment()
    emit('delete', props.index)
}

const setCommentStatus = async (status: number) => {
    try {
        await comment_api.setCommentStatusAPI({ id: props.commentItem.id, status: status })
    } catch (err) {
        console.log(err);
    }
}

const deleteComment = async () => {
    try {
        await comment_api.deleteCommentAPI({ comment_id: props.commentItem.id })
    } catch (err) {
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

const getPageName = () => {
    const pages = props.context.data.pagesList
    const name = pages.find(item => item.id === props.pageId)?.name
    pageName.value = name
}
getPageName()

const selectionUpdate = (t: number) => {
    if (t === Selection.SOLVE_MENU_STATUS) {
        replyStatus()
    }
    if (t === Selection.ABOUT_ME) {
        showAboutMe()
    }
}

const commentUpdate = (t: number) => {
    if (t === Comment.CURRENT_COMMENT) {
        const curId = props.context.comment.isHoverCommentId
        if (curId === props.commentItem.id) {
            hoverComment.value = props.context.comment.isHoverComment
        }
    }
    if (t === Comment.SELECTE_COMMENT) {
        const curId = props.context.comment.isSelectCommentId
        selectComment.value = curId === props.commentItem.id ? true : false
    }
}

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
    <div class="comment-item-container" :class="{ active: hoverComment, selected: selectComment }" @mouseenter="hoverShape"
        @mouseleave="unHoverShape" @click="onReply" v-if="status">
        <div class="content">
            <div class="item-title">
                <div class="avatar">
                    <img :src="props.commentItem.user.avatar" alt="">
                </div>
                <div class="item_heard" :style="{ width: hoverIcon ? 'calc(100% - 73px)' : 'calc(100% - 3px)' }">
                    <div class="name" :style="{ opacity: props.commentItem.status === 0 ? 1 : 0.5 }">
                        {{ props.commentItem.user.nickname }}
                    </div>
                    <div class="date" style="width: 92px;height: 12px;white-space: nowrap;font-family: HarmonyOS Sans;font-size: 10px;
                    line-height: 10px;text-align: left;color: #8C8C8C;margin-top: 6px;">{{
                        formatDate(props.commentItem.record_created_at) }}
                    </div>
                </div>
                <div class="reply" :style="{ opacity: props.commentItem.status === 0 ? 1 : 0.5 }">
                    <template v-if="replyNum > 0">
                        {{ replyNum }}
                        {{ t('comment.a_few_reply') }}
                    </template>
                </div>
            </div>
            <div class="text" v-html="commentItem.content"></div>
            <div class="bottom-info">
                <div class="page">{{ pageName }}</div>
                <div class="icon" v-if="hoverIcon" :style="{ visibility: hoverIcon ? 'visible' : 'hidden' }">
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.reply')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0">
                        <div class="onReply" @click.stop="onReply" :class="{ checked: selectComment }">
                            <svg-icon icon-class="comment-reply"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="isControls">
                        <div class="onDelete" @click="onDelete" v-if="isControls" :class="{ checked: selectComment }">
                            <svg-icon icon-class="comment-delete"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="resolve && isControls">
                        <div class="onResolve" @click="onResolve" v-if="isControls" :class="{ checked: selectComment }">
                            <svg-icon icon-class="comment-solve"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-else-if="!resolve && isControls">
                        <div class="onResolved" @click="onResolve" v-if="isControls" :class="{ checked: selectComment }">
                            <svg-icon icon-class="comment-solved"></svg-icon>
                        </div>
                    </el-tooltip>
                </div>
                <div class="icon" v-else>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="!resolve && isControls">
                        <div class="onResolved" @click="onResolve" v-if="isControls" :class="{ checked: selectComment }">
                            <svg-icon icon-class="comment-solved"></svg-icon>
                        </div>
                    </el-tooltip>
                </div>
            </div>
        </div>

    </div>
</template>
<style scoped lang="scss">
.comment-item-container {
    display: flex;
    padding: 0 14px;

    .content {
        //width: calc(100% - 37px);
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-bottom: 1px solid #F0F0F0;

        .item-title {
            display: flex;
            width: 100%;
            height: 36px;
            align-items: flex-start;
            justify-content: space-between;
            padding: 4px 0;
            margin-top: 16px;
            box-sizing: border-box;

            .avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex: 0 0 28px;

                >img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
            }

            .item_heard {
                display: flex;
                //width: calc(100% - 73px);
                margin-left: 5px;
                flex-direction: column;
                flex: 1;

                .name {
                    flex: 1;
                    width: calc(100% - 16px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-left: 1px;
                    font-family: HarmonyOS Sans;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 12px;
                    color: #000000;
                }
            }

            .reply {
                width: 60px;
                height: 12px;
                font-family: HarmonyOS Sans;
                font-size: 12px;
                line-height: 12px;
                color: #8C8C8C;
                margin-top: 3px;
                flex: 0 0 60px;
                margin-right: 4px;
                text-align: right;
            }
        }

        .text {
            width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            color: #595959;
            margin: 6px 0px 6px 34px;
            font-family: HarmonyOS Sans;
            font-size: 13px;
            line-height: 22px;
        }

        .bottom-info {
            display: flex;
            height: 24px;
            justify-content: space-between;
            margin-bottom: 16px;

            .page {
                color: rgba(0, 0, 0, .5);
                max-width: 98px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                height: 12px;
                font-size: 12px;
                line-height: 12px;
                margin: 6px 0 6px 34px;
            }

            .icon {
                display: flex;
                justify-content: flex-end;
                width: 72px;
                height: 24px;

                //.el-button {
                //    border: none;
                //    background-color: transparent;
                //    padding: 0;
                //    border-radius: 2px;
                //    width: 20px;
                //    height: 20px;
                //    &:hover {
                //        background-color: rgba(0,0,0,0.08);
                //    }
                //}
                .onReply {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 12px;
                        height: 12px;
                        color: #555555;
                    }
                }

                .onReply:hover {
                    background-color: #EBEBED;
                }

                .onDelete {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 12px;
                        height: 12px;
                        color: #555555;
                    }
                }

                .onDelete:hover {
                    background-color: #EBEBED;
                }

                .onResolve {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 12px;
                        height: 12px;
                        color: #555555;
                    }
                }

                .onResolve:hover {
                    background-color: #EBEBED;
                }

                .onResolved {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 12px;
                        height: 14px;
                        color: #169248;
                    }
                }

                .onResolved:hover {
                    background-color: #EBEBED;
                }

                .checked:hover {
                    background-color: #BDE2FF;
                }
            }
        }
    }
}

.active {
    background-color: #F5F5F5;
}

.selected {
    background-color: #E6F5FF;
}
</style>