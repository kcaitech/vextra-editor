<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed, nextTick, watch } from 'vue'
import { Context } from '@/context';
import CommentPopupItem from './CommentPopupItem.vue';
import { Action } from "@/context/tool";
import { Matrix } from "@kcdesign/data";
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/request/comment';
import { v4 } from 'uuid';
import { ElScrollbar } from 'element-plus'
import { Selection } from '@/context/selection';
import { Comment } from '@/context/comment';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { Perm } from '@/context/workspace';
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
    docList: any[]
}>()
const emit = defineEmits<{
    (e: 'close', event?: MouseEvent): void
    (e: 'resolve', status: number, index: number): void
    (e: 'delete', index: number): void
    (e: 'addComment', info: any): void
    (e: 'recover', id?: string): void
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
const iscommentTop = ref(false);
const lastHover = ref(false);
const nextHover = ref(false);
const cur_perm = ref<Perm>(props.context.workspace.documentPerm);
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

const height = ref()
const sendBright = computed(() => textarea.value.trim().length > 0)
const commentPosition = () => {
    nextTick(() => {
        const text = inputPopup.value?.$refs.textarea
        if (text) {
            const computedStyle = window.getComputedStyle(text);
            iscommentTop.value = true;
            const _height = text.clientHeight + parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            height.value = height.value ? Math.min(_height + 18, 214) : Math.min(_height, 214);
            const p = matrix.computeCoord({ x: props.commentInfo.shape_frame.x1, y: props.commentInfo.shape_frame.y1 });
            offside.value = props.rootWidth! - p.x < 360;
            let t = 0;
            t = props.rootHeight! - p.y //剩余的高度
            scrollMaxHeight.value = (props.rootHeight - 55 - (height.value as number) - 30) * 0.7
            scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
            nextTick(() => {
                if (commentPopup.value) {
                    const commentPopupH = scrollHeight.value + height.value + 45
                    if (t - commentPopupH < -45) {
                        commentTop.value = t - commentPopupH;
                    } else {
                        commentTop.value = -10
                    }
                }
                scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
                if (cur_perm.value === Perm.isRead) return;
                inputPopup.value && inputPopup.value.focus();
            })
        }
    })
}
const scrollVisible = ref(false)

const handleInput = () => {
    if (!scrollbarRef.value) return;
    scrollbarRef.value!.scrollTo(0, itemHeight.value!.clientHeight)
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
            }
        }
        scrollbarRef.value!.scrollTo(0, itemHeight.value!.clientHeight)
    })
    commentPosition()
}

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    const action = props.context.tool.action === Action.AddComment
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
    if (!isControls.value || cur_perm.value === Perm.isRead) return
    const status = props.commentInfo.status === 0 ? 1 : 0
    setCommentStatus(status)
    emit('resolve', status, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value || cur_perm.value === Perm.isRead) return
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
    deleteComment(id).then(() => {
        emit('recover', id)
    })
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
}

const previousArticle = () => {
    if (reply.value) {
        const index = props.index
        if (index === 0) return
        emit('previousArticle', index)
    } else {
        const index = commentShowList.value.findIndex(item => props.commentInfo.id === item.id)
        if (index === 0 || index === -1) return
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
        if (index === length - 1 || index === -1) return
        const { x1, y1 } = commentShowList.value[index + 1].shape_frame
        const id = commentShowList.value[index + 1].id
        emit('nextArticle', index, { x: x1, y: y1 }, id)
    }
}

const commentShow = () => {
    const commentList = props.docList;
    commentList.forEach(item => {
        if (item.status === 0) {
            commentShowList.value && commentShowList.value.push(item)
        }
    })
    handleInput();
}
const cur_id = ref<string>('')
const addComment = () => {
    const timestamp = getCurrentTime();
    const id = v4();
    cur_id.value = id;
    commentData.value.record_created_at = timestamp;
    commentData.value.content = textarea.value;
    commentData.value.doc_id = props.commentInfo.doc_id;
    commentData.value.page_id = props.commentInfo.page_id;
    commentData.value.target_shape_id = props.commentInfo.target_shape_id;
    commentData.value.shape_frame = {};
    commentData.value.shape_id = v4();
    commentData.value.parent_id = props.commentInfo.id;
    commentData.value.root_id = props.commentInfo.id;
    const data = commentData.value;
    const info = { ...data, status: 0, user: props.context.comment.isUserInfo, id };
    createComment(data)
    emit('addComment', info);
    // scrollMaxHeight.value = (props.rootHeight - 58 - 100) * 0.7
    // commentHtight(); 
    nextTick(() => {
        scrollbarRef.value!.scrollTo(0, itemHeight.value!.clientHeight);
    })
    textarea.value = '';
}

const commentHtight = () => {
    nextTick(() => {
        if (scrollbarRef.value) {
            scrollHeight.value = Math.min(scrollMaxHeight.value, itemHeight.value!.clientHeight)
            if (commentPopup.value) {
                const p = matrix.computeCoord({ x: props.commentInfo.shape_frame.x1, y: props.commentInfo.shape_frame.y1 });
                let t = 0;
                t = props.rootHeight! - p.y //剩余的高度
                const commentPopupH = scrollHeight.value + 73 + 45
                if (t - commentPopupH < -45) {
                    commentTop.value = t - commentPopupH;
                } else {
                    commentTop.value = -10
                }
            }
        }
    })
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
        await comment_api.createCommentAPI(d);
        const text = inputPopup.value.$refs.textarea
        if (text) {
            text.style.height = "auto"; // 重置高度，避免高度叠加
            text.style.height = 30 + "px";
        }
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
    emit('editCommentChild', index, text)
}

const quickReply = (name: string) => {
    if (cur_perm.value === Perm.isRead) return;
    textarea.value = `@${name} `
    selectedPerson.value = `@${name}`
    inputPopup.value && inputPopup.value.focus()
}

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
    if (cur_perm.value === Perm.isRead) return;
    emit('moveCommentPopup', e, props.index)
}

const inputFocus = () => {
    if (cur_perm.value === Perm.isRead) {
        inputPopup.value && inputPopup.value.blur()
    }
}

const update = (t: number) => {
    if (t === Selection.SOLVE_MENU_STATUS) {
        reply.value = props.context.selection.commentStatus
    }
}
watchEffect(() => {
    props.documentCommentList;
    commentHtight();
    // commentPosition();
})

defineExpose({
    commentPopup,
    textarea,
    startShake
})
onMounted(() => {
    commentShow()
    commentPosition();
    props.context.comment.saveCommentId(props.commentInfo.id);
    props.context.comment.commentOpacity(true);
    props.context.comment.commentInput(true);
    props.context.comment.watch(commentUpdate)
    props.context.selection.watch(update)
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('mouseup', scrollup)
    document.addEventListener('keydown', closeComment);
    nextTick(() => {
        if (scrollbarRef.value) {
            scrollbarRef.value.scrollTo(0, 0)
        }
    })
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
                <div class="comment-last" :style="{ opacity: disablePrevent ? '0.2' : '1' }"
                    :class="{ 'comment-last-hover': lastHover && !disablePrevent }" @click="previousArticle"
                    @mouseenter="lastHover = true" @mouseleave="lastHover = false">
                    <svg-icon icon-class="comment-last"></svg-icon>
                </div>
                <div class="button-icon"></div>
                <div class="comment-next" :style="{ opacity: disableNext ? '0.2' : '1' }"
                    :class="{ 'comment-last-hover': nextHover && !disableNext }" @click="nextArticle"
                    @mouseenter="nextHover = true" @mouseleave="nextHover = false">
                    <svg-icon icon-class="comment-next"></svg-icon>
                </div>
            </div>
            <div class="comment-commands">
                <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                    :show-after="1000" :offset="10" :hide-after="0" v-if="isControls && cur_perm !== Perm.isRead">
                    <div class="onDelete" @click="onDelete">
                        <svg-icon icon-class="comment-delete"></svg-icon>
                    </div>
                </el-tooltip>
                <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                    :show-after="1000" :offset="10" :hide-after="0"
                    v-if="resolve && isControls && cur_perm !== Perm.isRead">
                    <div class="onResolve" @click="onResolve">
                        <svg-icon icon-class="comment-solve"></svg-icon>
                    </div>
                </el-tooltip>
                <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                    :show-after="1000" :offset="10" :hide-after="0" v-else-if="!resolve">
                    <div @click="onResolve"
                        :class="{ hovered: cur_perm === Perm.isRead, onResolved: cur_perm !== Perm.isRead }">
                        <svg-icon icon-class="comment-solved"></svg-icon>
                    </div>
                </el-tooltip>
                <div class="close" @click="close">
                    <svg-icon icon-class="comment-close"></svg-icon>
                </div>
            </div>
        </div>
        <el-scrollbar ref="scrollbarRef" :height="scrollHeight + 'px'" @wheel.stop @mousedown.stop>
            <div ref="itemHeight">
                <CommentPopupItem :context="props.context" @close="() => emit('close')" :commentInfo="props.commentInfo"
                    :index="props.index" @delete="onDeleteItem" @editComment="editComment" @quick-reply="quickReply">
                </CommentPopupItem>
                <CommentPopupItem v-for="(item, index) in props.documentCommentList" :key="item.id" :commentInfo="item"
                    :index="index" :context="props.context" @close="() => emit('close')" @delete="onDeleteChild"
                    @editComment="editCommentChild" @quick-reply="quickReply"></CommentPopupItem>
            </div>
        </el-scrollbar>
        <div class="popup-footer" @mousedown.stop>
            <div class="textarea" ref="textareaEl">
                <el-input ref="inputPopup" class="input" v-model="textarea" :autosize="{ minRows: 0, maxRows: 10 }"
                    type="textarea"
                    :placeholder="cur_perm === Perm.isRead ? t('comment.input_no_perm') : t('comment.reply_comment')"
                    resize="none" size="small" :input-style="{ overflow: scrollVisible ? 'visible' : 'hidden' }"
                    @keydown="carriageReturn" @input="handleInput" @focus="inputFocus" />
                <div class="send" :style="{ background: sendBright ? '#1878F5' : 'transparent' }" @click="addComment">
                    <svg-icon icon-class="send" :style="{ color: sendBright ? '#FFFFFF' : '#CCCCCC' }"></svg-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container-popup {
    position: absolute;
    width: 330px;
    // max-height: 664px;
    box-shadow: 0px 3px 20px 0px rgba(0, 0, 0, 0.07);
    z-index: 99;
    font-size: var(--font-default-fontsize);
    cursor: default;
    border-radius: 12px;
    background: #FFFFFF;
    border: 1px solid #EBEBEB;

    .popup-heard {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        padding: 8px 14px;
        box-sizing: border-box;
        border-bottom: 1px solid #F0F0F0;
        border-radius: 12px 12px 0px 0px;

        .button-shift {
            position: relative;
            width: 72px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 5px 5px 5px 5px;
            background: #FFFFFF;
            box-sizing: border-box;
            border: 1px solid #F0F0F0;

            .button-icon {
                width: 0;
                height: 23px;
                border-left: 1px solid #F0F0F0;
                position: absolute;
                left: 35px;
            }

            .el-button:hover {
                background-color: rgba(0, 0, 0, 0.08);
            }

            .comment-last {
                width: 36px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 5px 0 0 5px;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }

            .comment-next {
                width: 36px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 0 5px 5px 0;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }

            .comment-last-hover {
                background-color: #EBEBED;
            }
        }

        .comment-commands {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 90px;
            height: 30px;

            //.el-button {
            //    border: none;
            //    border-radius: 4px;
            //    width: 30px;
            //    height: 30px;
            //
            //    &:hover {
            //        background-color: rgba(0, 0, 0, 0.08);
            //    }
            //}

            .onDelete {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

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
                border-radius: var(--default-radius);

                >svg {
                    width: 14px;
                    height: 14px;
                    color: #169248;
                }
            }

            .hovered {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                >svg {
                    width: 14px;
                    height: 14px;
                    color: #169248;
                }
            }

            .close {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                >svg {
                    width: 14px;
                    height: 14px;
                    color: #555555;
                }
            }

            .close:hover {
                background-color: #EBEBED;
            }
        }
    }

    .popup-footer {
        padding: 0 14px;

        .textarea {
            display: flex;
            //align-items: self-end;
            background-color: #fff;
            //box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
            border-radius: 12px;
            box-sizing: border-box;
            align-items: center;
            padding: 13px 0;

            .el-input--small {
                font-family: HarmonyOS Sans;
                font-size: 13px;
                line-height: 22px;
                color: #333333;
            }

            .send {
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 24px;
                height: 24px;
                background-color: #1878F5;
                border-radius: 4px;
                margin-right: 4px;
                flex: 0 0 24px;

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
    font-size: var(--font-default-fontsize);
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

//.custom-icon {
//    color: green;
//    /* 设置颜色为绿色 */
//}</style>