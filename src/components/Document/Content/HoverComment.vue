<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Context } from '@/context';
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/request/comment';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
import { Comment } from '@/context/comment';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { Perm } from '@/context/workspace';
const { t } = useI18n()
const props = defineProps<{
    context: Context
    scale: number
    commentInfo: any
    index: number
}>()

const emit = defineEmits<{
    (e: 'unHoverComment'): void
    (e: 'showComment', event: MouseEvent): void
    (e: 'deleteComment', index: number): void
    (e: 'resolve', status: number, index: number): void
    (e: 'moveCommentPopup', event: MouseEvent, index: number): void
}>()
const comment = computed(() => props.context.comment);
const hover = ref(false)
const commentShow = ref(props.context.comment.isHoverComment)
const hoverCommentId = ref(comment.value.isHoverCommentId);
const prePt = ref({ x: 0, y: 0 });
const cur_perm = ref<Perm>(props.context.workspace.documentPerm);
const replyNum = computed(() => {
    if (props.commentInfo.children) {
        const child = props.commentInfo.children.length
        return child
    } else {
        return 0
    }
})
const resolve = computed(() => {
    return props.commentInfo.status === 0 ? true : false
})
const isControls = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id || comment.value.isUserInfo?.id === comment.value.isDocumentInfo?.user.id) return true
    else return false
})

const hoverShape = (e: MouseEvent) => {
    e.stopPropagation();
    comment.value.hoverComment(true, props.commentInfo.id)
    hover.value = true
}
const unHoverShape = (e: MouseEvent) => {
    e.stopPropagation();
    if (!props.context.comment.isCommentMove) {
        comment.value.hoverComment(false, props.commentInfo.id)
    }
    hover.value = false
    emit('unHoverComment')
}

const onReply = (e: MouseEvent) => {
    e.stopPropagation()
    const dx = e.clientX - prePt.value.x;
    const dy = e.clientY - prePt.value.y;
    const diff = Math.hypot(dx, dy);
    if(diff > 5) return;
    hover.value = false;
    emit('showComment', e)
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value || cur_perm.value === Perm.isRead) return
    const status = props.commentInfo.status === 0 ? 1 : 0
    setCommentStatus(status)
    emit('resolve', status, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value || cur_perm.value === Perm.isRead) return
    props.context.comment.hoverComment(false);
    props.context.comment.commentInput(false);
    let timeout = setTimeout(() => {
        emit('deleteComment', props.index)
        deleteComment()
        clearTimeout(timeout)
    }, 150)
}

const deleteComment = async () => {
    try {
        await comment_api.deleteCommentAPI({ comment_id: props.commentInfo.id })
    } catch (err) {
        console.log(err);
    }
}

const setCommentStatus = async (status: number) => {
    try {
        await comment_api.setCommentStatusAPI({ id: props.commentInfo.id, status: status })
    } catch (err) {
        console.log(err);
    }
}

const moveCommentPopup = (e: MouseEvent) => {
    e.stopPropagation();
    prePt.value = { x: e.clientX, y: e.clientY };
    emit('moveCommentPopup', e, props.index)
}

const formatDate = computed(() => {
    return function (value: string): string {
        const lang = localStorage.getItem('locale') || 'zh'
        moment.locale(mapDateLang.get(lang) || 'zh-cn');
        return filterDate(value).replace(/\s*/g, '');
    }
})

const filterDate = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // return `${moment(date).format("MMM Do")} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return moment(date).fromNow();
}

const commentUpdate = (t: number) => {
    if (t === Comment.CURRENT_COMMENT) {
        hoverCommentId.value = comment.value.isHoverCommentId
    }
    if (t === Comment.HOVER_COMMENT) {
        commentShow.value = comment.value.isHoverComment
    }
    if (t === Comment.HOVER_SHOW_COMMENT) {
        commentShow.value = comment.value.isHoverComment
    }
}

onMounted(() => {
    props.context.comment.watch(commentUpdate);
})
onUnmounted(() => {
    props.context.comment.commentOpacity(false)
    props.context.comment.commentInput(false);
    props.context.comment.unwatch(commentUpdate);
})
</script>

<template>
    <div class="container-hover" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown="moveCommentPopup"
        @click="onReply" :style="{ transform: `scale(${scale && commentShow ? scale : 0})` }">
        <div class="avatar" @click="onReply">
            <img :src="commentInfo.user.avatar" alt="">
        </div>
        <div class="content">
            <div class="box-heard">
                <div class="item_heard">
                    <div class="name">{{ commentInfo.user.nickname }}</div>&nbsp;&nbsp;
                    <div class="date">{{ formatDate(commentInfo.record_created_at) }}</div>
                </div>
                <div class="icon" :style="{ visibility: hover ? 'visible' : 'hidden' }">
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.reply')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0">
                        <div class="onReply" @click.stop="onReply">
                            <svg-icon icon-class="comment-reply"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="isControls && cur_perm !== Perm.isRead">
                        <div class="onDelete" @click="onDelete">
                            <svg-icon icon-class="comment-delete"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="resolve && isControls && cur_perm !== Perm.isRead">
                        <div class="onResolve" @click="onResolve" @mouseup.stop @mousedown.stop>
                            <svg-icon icon-class="comment-solve"></svg-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-else-if="!resolve">
                        <div @click="onResolve" @mouseup.stop @mousedown.stop :class="{hovered: cur_perm === Perm.isRead, onResolved: cur_perm !== Perm.isRead}">
                            <svg-icon icon-class="comment-solved"></svg-icon>
                        </div>
                    </el-tooltip>
                </div>
            </div>
            <div class="box-context" v-html="commentInfo.content"></div>
            <div class="box-footer">
                <div class="reply">{{ replyNum }} {{ t('comment.a_few_reply') }}</div>
                <div class="check" @click.stop="onReply">{{ t('comment.check') }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container-hover {
    position: absolute;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    display: flex;
    width: 330px;
    padding: 16px 14px;
    background-color: #fff;
    border-radius: calc(12px);
    border-bottom-left-radius: 0;
    font-size: var(--font-default-fontsize);
    transition: 0.15s;
    transform-origin: left bottom;
    cursor: default;
    background: #FFFFFF;
    border: 1px solid #EBEBEB;
    box-shadow: 0px 3px 20px 0px rgba(0, 0, 0, 0.18);

    .avatar {
        width: 24px;
        height: 24px;
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
        width: 270px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .box-heard {
            display: flex;
            justify-content: space-between;
            //margin: 5px 0;

            .item_heard {
                display: flex;
                align-items: center;
                width: calc(100% - 70px);

                .name {
                    max-width: calc(100% - 103px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 12px;
                    color: #000000;
                }

                .date {
                    width: 92px;
                    height: 12px;
                    white-space: nowrap;
                    font-size: 12px;
                    line-height: 12px;
                    color: #333333;
                }
            }

            .icon {
                display: flex;
                justify-content: flex-end;
                width: 72px;
                height: 24px;
                flex: 0 0 72px;

                //.el-button {
                //    border: none;
                //    padding: 0;
                //    border-radius: 2px;
                //    width: 20px;
                //    height: 20px;
                //
                //    &:hover {
                //        background-color: rgba(0, 0, 0, 0.08);
                //    }
                //}
                .onReply {
                    width: 24px;
                    height: 24px;
                    margin-left: -27px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 14px;
                        height: 14px;
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
                        width: 14px;
                        height: 14px;
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
                        width: 14px;
                        height: 14px;
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
                        width: 14px;
                        height: 14px;
                        color: #169248;
                    }
                }

                .onResolved:hover {
                    background-color: #EBEBED;
                }
                .hovered {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;

                    >svg {
                        width: 14px;
                        height: 14px;
                        color: #169248;
                    }
                }
            }
        }

        .box-context {
            width: 270px;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            margin-top: 11px;
            color: #777777;
            font-size: 13px;
            font-family: HarmonyOS Sans;
        }

        .box-footer {
            display: flex;
            margin-top: 5px;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0 6px 0;

            .reply {
                font-family: HarmonyOS Sans;
                font-size: 12px;
                line-height: 12px;
                font-feature-settings: "kern" on;
                color: #000000;
            }

            .check {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 48px;
                height: 24px;
                border-radius: 5px;
                background: #FFFFFF;
                box-sizing: border-box;
                border: 1px solid #F0F0F0;
                padding: 6px 12px;
                font-family: Source Han Sans;
                font-size: 11px;
                font-weight: 500;
                line-height: 12px;
                color: #333333;
            }
        }
    }
}

.custom-icon {
    color: green;
    /* 设置颜色为绿色 */
}</style>