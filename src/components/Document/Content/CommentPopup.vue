<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed, nextTick, watch } from 'vue'
import { Context } from '@/context';
import { Close, Delete, CircleCheck, Back, CircleCheckFilled } from '@element-plus/icons-vue'
import CommentPopupItem from './CommentPopupItem.vue';
import { Action } from '@/context/workspace';
import { Matrix } from "@kcdesign/data";
import { WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/apis/comment';
import { v4 } from 'uuid';
import { ElScrollbar } from 'element-plus'
import { Selection } from '@/context/selection';
import { Comment } from '@/context/comment';
import { text } from 'express';
const { t } = useI18n()
const props = defineProps<{
    context: Context
    rootWidth: number
    rootHeight: number
    commentInfo: any
    index: number
    documentCommentList: any[]
    length: number
    reply: boolean
}>()
const emit = defineEmits<{
    (e: 'close', event?: MouseEvent): void
    (e: 'resolve', status: number, index: number): void
    (e: 'delete', index: number): void
    (e: 'recover', index?: number, id?: string): void
    (e: 'editComment', index: number, text: string): void
    (e: 'editCommentChild', index: number, text: string): void
    (e: 'previousArticle', index: number, xy?: { x: number, y: number }, id?: string): void
    (e: 'nextArticle', index: number, xy?: { x: number, y: number }, id?: string): void
    (e: 'moveCommentPopup', event: MouseEvent, index: number): void
}>()
interface CommentData {
    parent_id: string
    root_id: string
    doc_id: string
    page_id: string
    shape_id: string
    target_shape_id: string
    shape_frame: any
    record_created_at: string
    content: string
}
const matrix = new Matrix(props.context.workspace.matrix);
const workspace = computed(() => props.context.workspace);
const comment = computed(() => props.context.comment);
const textarea = ref('')
const offside = ref(false)
const commentPopup = ref<HTMLDivElement>()
const commentTop = ref(-10)
const scrollHeight = ref(0)
const textareaEl = ref<HTMLDivElement>()
const inputPopup = ref()
const isShaking = ref(false)
const selectedPerson = ref('')
const itemHeight = ref<HTMLDivElement>()
const scrollMaxHeight = ref(0)
const commentShowList = ref<any[]>([])
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const reply = ref<boolean>(props.context.selection.commentStatus)
const close = (e: MouseEvent) => {
    emit('close', e)
    nextTick(() => {
        props.context.comment.commentInput(false);
    })
}
const prenvetOpacity = computed(() => {
    const index = commentShowList.value.findIndex(item => props.commentInfo.id === item.id)
    return index
})
const nextOpacity = computed(() => {
    const index = commentShowList.value.findIndex(item => props.commentInfo.id === item.id)
    return index
})

const disablePrevent = computed(() => {
    if (reply.value) {
        return props.index === 0
    } else {
        return prenvetOpacity.value === 0
    }
})
const disableNext = computed(() => {
    if (reply.value) {
        return props.index === props.length - 1
    } else {
        return nextOpacity.value === commentShowList.value.length - 1
    }
})
const commentData = ref<CommentData>({
    parent_id: '',
    root_id: '',
    doc_id: props.commentInfo.doc_id,
    page_id: props.commentInfo.page_id,
    shape_id: '',
    target_shape_id: props.commentInfo.target_shape_id,
    shape_frame: {},
    record_created_at: '',
    content: ''
})

const resolve = computed(() => {
    return props.commentInfo.status === 0 ? true : false
})

const isControls = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id || comment.value.isUserInfo?.id === comment.value.isDocumentInfo?.user.id) return true
    else return false
})

const isControlsDel = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id) return true
    else return false
})

const height = ref()
const sendBright = computed(() => textarea.value.trim().length > 0)
const commentPosition = () => {
    nextTick(() => {
        const text = inputPopup.value?.$refs.textarea
        if (text) {
            const computedStyle = window.getComputedStyle(text);
            const _height = text.clientHeight + parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            height.value = Math.min(_height + 14, 214)
            inputPopup.value && inputPopup.value.focus()
            const p = matrix.computeCoord({ x: props.commentInfo.shape_frame.x1, y: props.commentInfo.shape_frame.y1 });
            offside.value = props.rootWidth! - p.x < 360
            let t = 0
            t = props.rootHeight! - p.y //剩余的高度
            scrollMaxHeight.value = (props.rootHeight - 55 - (height.value as number) - 30) * 0.7
            scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
            nextTick(() => {
                if (commentPopup.value) {
                    const commentPopupH = scrollHeight.value + height.value + 45
                    if (t - commentPopupH < -45) {
                        commentTop.value = t - commentPopupH + 10
                    } else {
                        commentTop.value = -10
                    }
                }
                scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
                text.scrollTo(0, text.clientHeight)
            })
        }
    })
}
const scrollVisible = ref(false)

const handleInput = () => {
    nextTick(() => {
        if (textareaEl.value) {
            const text = inputPopup.value.$refs.textarea
            if (text) {
                text.style.height = "auto"; // 重置高度，避免高度叠加
                text.style.height = text.scrollHeight + "px";
                const lineHeight = parseInt(getComputedStyle(text).lineHeight)
                const textareaHeight = text.clientHeight
                const numberOfLines = Math.ceil(textareaHeight / lineHeight)
                scrollVisible.value = numberOfLines > 10 ? true : false
                commentPosition()
            }
        }
    })
}

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    const action = workspace.value.action === Action.AddComment
    const length = textarea.value.trim().length < 4
    if (event.target instanceof Element && !event.target.closest('.container-popup') && length) {
        emit('close', event);
    } else if (event.target instanceof Element && !event.target.closest('.container-popup') && action && !length) {
        startShake()
        inputPopup.value && inputPopup.value.focus()
        inputPopup.value && inputPopup.value.select()
    }
}

const carriageReturn = (event: KeyboardEvent) => {
    event.stopPropagation()
    const { code, ctrlKey, metaKey } = event;
    if (event.key === 'Enter') {
        if (ctrlKey || metaKey) {
            textarea.value = textarea.value + '\n'
            handleInput()
        } else {
            event.preventDefault()
            addComment()
        }
    } else if (code === 'Escape' && textarea.value.trim().length < 4) {
        emit('close')
        nextTick(() => {
            props.context.comment.commentInput(false);
        })
    } else if (code === 'Escape' && textarea.value.trim().length >= 4) {
        startShake()
    }
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value) return
    const status = props.commentInfo.status === 0 ? 1 : 0
    setCommentStatus(status)
    emit('resolve', status, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value) return
    props.context.comment.commentInput(false);
    deleteComment(props.commentInfo.id)
    emit('delete', props.index)
}
const onDeleteItem = (index: number, e: Event) => {
    e.stopPropagation()
    deleteComment(props.commentInfo.id)
    emit('delete', index)
}
const onDeleteChild = (index: number, e: Event, id: string) => {
    e.stopPropagation()
    emit('recover', index, id)
    deleteComment(id)
    commentPosition()
}

const setCommentStatus = async (status: number) => {
    try {
        await comment_api.setCommentStatusAPI({ id: props.commentInfo.id, status: status })
    } catch (err) {
        console.log(err);
    }
}

const deleteComment = async (id: string) => {
    try {
        await comment_api.deleteCommentAPI({ comment_id: id })
    } catch (err) {
        console.log(err);
    }
}

function commentUpdate(t?: number, p?: number) {
    const length = textarea.value.trim().length < 4
    props.context.comment.commentInput(true);
    props.context.comment.commentMount(true);
    if (t === Comment.SHUTDOWN_COMMENT && length) {
        emit('close');
    }
    if (t === Comment.COMMENT_POPUP) {
        emit('close');
    }
    if (t === Comment.COMMENT_HANDLE_INPUT) {
        let timeout = setTimeout(() => {
            if (scrollbarRef.value) {
                if (itemHeight.value) {
                    scrollbarRef.value!.scrollTo(0, p)
                    scrollMaxHeight.value = (props.rootHeight - 55 - (height.value as number) - 30) * 0.7
                    scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
                }
            }
            clearTimeout(timeout)
        }, 10)
    }
    if (t === Comment.UPDATE_COMMENT_CHILD) {
        const timeout = setTimeout(() => {
            if (scrollbarRef.value) {
                scrollbarRef.value!.scrollTo(0, itemHeight.value!.clientHeight)
                commentPosition()
            }
            clearTimeout(timeout)
        }, 200)
    }
}

const previousArticle = () => {
    if (reply.value) {
        const index = props.index
        if (index === 0) return
        emit('previousArticle', index)
    } else {
        const index = commentShowList.value.findIndex(item => props.commentInfo.id === item.id)
        if (index === 0) return
        const { x1, y1 } = commentShowList.value[index - 1].shape_frame
        const id = commentShowList.value[index - 1].id
        emit('previousArticle', index, { x: x1, y: y1 }, id)
    }
}

const nextArticle = () => {
    if (reply.value) {
        const index = props.index
        if (index === props.length - 1) return
        emit('nextArticle', index)
    } else {
        const index = commentShowList.value.findIndex(item => props.commentInfo.id === item.id)
        const length = commentShowList.value.length
        if (index === length - 1) return
        const { x1, y1 } = commentShowList.value[index + 1].shape_frame
        const id = commentShowList.value[index + 1].id
        emit('nextArticle', index, { x: x1, y: y1 }, id)
    }
}

const commentShow = () => {
    const commentList = props.context.comment.pageCommentList
    commentList.forEach(item => {
        if (item.status === 0) {
            commentShowList.value && commentShowList.value.push(item)
        }
    })
}

const addComment = () => {
    const timestamp = getCurrentTime()
    commentData.value.record_created_at = timestamp
    commentData.value.content = textarea.value
    commentData.value.doc_id = props.commentInfo.doc_id
    commentData.value.page_id = props.commentInfo.page_id
    commentData.value.target_shape_id = props.commentInfo.target_shape_id
    commentData.value.shape_frame = {}
    commentData.value.shape_id = v4()
    commentData.value.parent_id = props.commentInfo.id
    commentData.value.root_id = props.commentInfo.id
    const data = commentData.value
    createComment(data)
    emit('recover')
    textarea.value = ''

}

const getCurrentTime = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = padNumber(currentDate.getMonth() + 1);
    const day = padNumber(currentDate.getDate());
    const hours = padNumber(currentDate.getHours());
    const minutes = padNumber(currentDate.getMinutes());
    const seconds = padNumber(currentDate.getSeconds());
    const milliseconds = padNumber(currentDate.getMilliseconds(), 6);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}
function padNumber(number: number, length = 2) {
    return String(number).padStart(length, '0');
}

const createComment = async (d: any) => {
    try {
        await comment_api.createCommentAPI(d)
    } catch (err) {
        console.log(err);
    }
}

const startShake = () => {
    inputPopup.value && inputPopup.value.select()
    isShaking.value = true
    const timer = setTimeout(() => {
        isShaking.value = false;
        clearTimeout(timer)
    }, 500); // 停止时间可以根据需要进行调整
}

const editComment = (index: number, text: string) => {
    emit('editComment', index, text)
}

const editCommentChild = (index: number, text: string) => {
    // documentCommentList.value[index].content = text
    emit('editCommentChild', index, text)
}

const quickReply = (name: string) => {
    textarea.value = `@${name} `
    selectedPerson.value = `@${name}`
    inputPopup.value && inputPopup.value.focus()
}
watchEffect(() => {
    commentPosition()
})

// watch(
//     () => props.documentCommentList,
//     () => {
//         nextTick(() => {
//             if(scrollbarRef.value) {
//                 scrollbarRef.value!.scrollTo(0, itemHeight.value!.clientHeight)
//             }
//         })
//     }
// )

const scrollup = (e: MouseEvent) => {
}

const closeComment = (e: KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.code === 'Escape') {
        emit('close')
    } else if (e.code === 'ArrowUp') {
        previousArticle()
    } else if (e.code === 'ArrowDown') {
        nextArticle()
    }
}

const moveCommentPopup = (e: MouseEvent) => {
    e.stopPropagation()
    emit('moveCommentPopup', e, props.index)
}

const update = (t: number) => {
    if (t === Selection.SOLVE_MENU_STATUS) {
        reply.value = props.context.selection.commentStatus
    }
}

defineExpose({
    commentPopup,
    textarea,
    startShake
})
onMounted(() => {
    commentShow()
    props.context.comment.saveCommentId(props.commentInfo.id);
    props.context.comment.commentOpacity(true);
    props.context.comment.commentInput(true);
    props.context.comment.watch(commentUpdate)
    props.context.selection.watch(update)
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('mouseup', scrollup)
    document.addEventListener('keydown', closeComment);
})
onUnmounted(() => {
    props.context.comment.unwatch(commentUpdate)
    props.context.selection.unwatch(update);
    document.removeEventListener('mouseup', handleClickOutside);
    document.removeEventListener('mouseup', scrollup);
    document.removeEventListener('keydown', closeComment);
})
</script>

<template>
    <div class="container-popup" ref="commentPopup" :style="{ top: commentTop + 'px' }"
        :class="{ popup_left: offside, popup_right: !offside, 'shake': isShaking }">
        <div class="popup-heard" @mousedown="moveCommentPopup">
            <div class="button-shift">
                <el-button plain class="custom-button" :style="{ opacity: disablePrevent ? '0.2' : '1' }"
                    @click="previousArticle">{{ t('comment.last') }}</el-button>
                <div class="button-icon"></div>
                <el-button plain class="custom-button" :style="{ opacity: disableNext ? '0.2' : '1' }"
                    @click="nextArticle">{{ t('comment.next') }}</el-button>
            </div>
            <div class="comment-commands">
                <el-button-group class="ml-4">
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="isControls">
                        <el-button plain :icon="Delete" @click="onDelete" v-if="isControls" />
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-if="resolve && isControls">
                        <el-button plain :icon="CircleCheck" @click="onResolve" v-if="isControls" />

                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                        :show-after="1000" :offset="10" :hide-after="0" v-else-if="!resolve && isControls">
                        <el-button class="custom-icon" plain :icon="CircleCheckFilled" @click="onResolve"
                            v-if="isControls" />
                    </el-tooltip>
                    <el-button plain :icon="Close" @click="close" />
                </el-button-group>
            </div>
        </div>
        <el-scrollbar ref="scrollbarRef" :height="scrollHeight + 'px'" @wheel.stop>
            <div ref="itemHeight">
                <CommentPopupItem :context="props.context" @close="() => emit('close')" :commentInfo="props.commentInfo"
                    :index="props.index" @delete="onDeleteItem" @editComment="editComment" @quick-reply="quickReply">
                </CommentPopupItem>
                <CommentPopupItem v-for="(item, index) in props.documentCommentList" :key="index" :commentInfo="item"
                    :index="index" :context="props.context" @close="() => emit('close')" @delete="onDeleteChild"
                    @editComment="editCommentChild" @quick-reply="quickReply"></CommentPopupItem>
            </div>
        </el-scrollbar>
        <div class="popup-footer">
            <div class="textarea" ref="textareaEl">
                <el-input ref="inputPopup" class="input" v-model="textarea" :autosize="{ minRows: 1, maxRows: 10 }"
                    type="textarea" :placeholder="t('comment.input_comments')" resize="none" size="small"
                    :input-style="{ overflow: scrollVisible ? 'visible' : 'hidden' }" @keydown="carriageReturn"
                    @input="handleInput"/>
                <div class="send" :style="{ opacity: sendBright ? '1' : '0.5' }" @click="addComment"><svg-icon
                        icon-class="send"></svg-icon></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container-popup {
    position: absolute;
    width: 330px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
    z-index: 99;
    font-size: var(--font-default-fontsize);
    cursor: default;

    .popup-heard {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 45px;
        padding: 12px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(0, 0, 0, 0.15);

        .button-shift {
            position: relative;
            width: 94px;
            height: 24px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 4px;

            .button-icon {
                width: 0;
                height: 16px;
                border-left: 1px solid rgba(0, 0, 0, 0.15);
                position: absolute;
                left: 47px;
            }

            .el-button:hover {
                background-color: rgba(0, 0, 0, 0.08);
            }
        }

        .comment-commands {
            display: flex;
            justify-content: flex-end;
            width: 90px;
            height: 30px;

            .el-button {
                border: none;
                border-radius: 4px;
                width: 30px;
                height: 30px;

                &:hover {
                    background-color: rgba(0, 0, 0, 0.08);
                }
            }
        }
    }

    .popup-footer {
        .textarea {
            display: flex;
            align-items: self-end;
            padding: 12px;
            background-color: #fff;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
            border-radius: 4px;

            .send {
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 23px;
                height: 22px;
                background-color: var(--active-color);
                border-radius: 50%;

                >svg {
                    width: 13px;
                    height: 13px;
                }
            }
        }
    }
}

.popup_right {
    left: 50px;
}

.popup_left {
    right: 50px;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(10px);
    }

    40% {
        transform: translateX(0);
    }

    55% {
        transform: translateX(7px);
    }

    70% {
        transform: translateX(0);
    }

    85% {
        transform: translateX(5px);
    }

    100% {
        transform: translateX(0);
    }
}

.shake {
    animation: shake 0.7s;
}

.custom-button {
    border: none;
    width: 47px;
    border-radius: calc(4px);
    height: 24px;
    font-size: 10px;
    padding: 0;
}

:deep(.el-textarea__inner) {
    border: none;
    box-shadow: none;
}

:deep(.el-textarea__inner::-webkit-scrollbar) {
    width: 6px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
    border-radius: 3px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    background-color: #c3c3c3;
}

:deep(.el-textarea__inner::-webkit-scrollbar-track) {
    background-color: transparent;
}

.el-scrollbar {
    padding-right: 10px;
}

.custom-icon {
    color: green;
    /* 设置颜色为绿色 */
}
</style>