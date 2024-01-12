<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { Delete, Edit, Back } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/request/comment';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
import { Comment } from '@/context/comment';
import SvgIcon from "@/components/common/SvgIcon.vue";
const { t } = useI18n()
const props = defineProps<{
    context: Context
    commentInfo: any
    index: number
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'delete', index: number, event: Event, id: string): void
    (e: 'editComment', index: number, text: string): void
    (e: 'quickReply', name: string): void
}>()
const hover = ref(false)
const comment = computed(() => props.context.comment);
const textarea = ref(props.commentInfo.content)
const sendBright = computed(() => textarea.value.trim().length > 0)
const showEditComment = ref(false)
const input = ref()
const popupItem = ref<HTMLDivElement>()
const scrollVisible = ref(false)
const isEditing = ref(false)

const hoverShape = (e: MouseEvent) => {
    hover.value = true
}
const isEdit = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id) return true
    else return false
})
const isControls = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id || comment.value.isUserInfo?.id === comment.value.isDocumentInfo?.user.id) return true
    else return false
})

const isControlsDel = computed(() => {
    if (comment.value.isUserInfo?.id === props.commentInfo.user.id) return true
    else return false
})

const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}

const onEditContext = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value || !isEdit.value) return
    if (showEditComment.value) {
        return input.value && input.value.focus()
    }
    textarea.value = props.commentInfo.content.replaceAll("<br/>", "\n").replaceAll("&nbsp;", " ")
    showEditComment.value = true
    const p = popupItem.value!.offsetTop - 10
    comment.value.notify(Comment.COMMENT_HANDLE_INPUT, p)
    nextTick(() => {
        input.value && input.value.focus()
        scrollVisible.value = true
    })
    document.addEventListener('click', closeEdit)
}

const closeEdit = (e: Event) => {
    if (e.target instanceof Element && e.target.closest('.textarea')) return
    document.removeEventListener('click', closeEdit)
    comment.value.notify(Comment.COMMENT_HANDLE_INPUT)
    updateComment()
}

const onQuickReply = (e: Event) => {
    e.stopPropagation()
    emit('quickReply', props.commentInfo.user.nickname)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if (!isControls.value) return
    emit('delete', props.index, e, props.commentInfo.id)
}

const carriageReturn = (event: KeyboardEvent) => {
    event.stopPropagation()
    const { code, ctrlKey, metaKey } = event;
    comment.value.notify(Comment.COMMENT_HANDLE_INPUT)
    if (event.key === 'Enter') {
        if (ctrlKey || metaKey) {
            textarea.value = textarea.value + '\n'
        } else {
            event.preventDefault()
            updateComment()
        }
    } else if (code === 'Escape') {
        emit('close')
    }
}

const updateComment = () => {
    const text = textarea.value.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
    comment.value.notify(Comment.COMMENT_HANDLE_INPUT)
    if (text.trim().length > 0) {
        emit('editComment', props.index, text)
        editComment(text)
    }
    showEditComment.value = false
}


const handleInput = () => {
    nextTick(() => {
        input.value?.focus()
    })
    const text = input.value?.$refs.textarea
    if (text) {
        const lineHeight = parseInt(getComputedStyle(text).lineHeight)
        const textareaHeight = text.clientHeight
        const numberOfLines = Math.ceil(textareaHeight / lineHeight)
        scrollVisible.value = numberOfLines >= 9 ? true : false
    }

}

const editComment = async (content: string) => {
    try {
        const parent_id = props.commentInfo.parent_id
        const root_id = props.commentInfo.root_id
        await comment_api.editCommentAPI({ id: props.commentInfo.id, parent_id, root_id, content })
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
function startEditing() {
    isEditing.value = true
}
function stopEditing() {
    isEditing.value = false;
    updateComment();
}
</script>

<template>
    <div class="popup-body" ref="popupItem" @mouseenter="hoverShape" @mouseleave="unHoverShape">
        <div class="container">
            <div class="avatar">
                <img :src="commentInfo.user.avatar" alt="">
            </div>
            <div class="popup-body-context">
                <div class="box-heard">
                    <div class="item_heard">
                        <div class="name">{{ commentInfo.user.nickname }}</div>&nbsp;&nbsp;
                        <div class="date">{{ formatDate(commentInfo.record_created_at) }}</div>
                    </div>
                    <div class="icon" :style="{ visibility: hover ? 'visible' : 'hidden' }">
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.edit_content')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="isControls && isEdit">
                            <div class="onEditContext" @click="onEditContext" v-if="isControls && isEdit">
                                <svg-icon icon-class="comment-edit"></svg-icon>
                            </div>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.quick_reply')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                            <div class="onQuickReply" @click="onQuickReply">
                                <svg-icon icon-class="comment-quick"></svg-icon>
                            </div>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                            :show-after="1000" :offset="10" :hide-after="0" v-if="isControls">
                            <div class="onDelete" @click="onDelete" v-if="isControls">
                                <svg-icon icon-class="comment-delete"></svg-icon>
                            </div>
                        </el-tooltip>
                    </div>
                </div>
                <div class="box-context" v-if="!showEditComment" @dblclick="onEditContext" v-html="commentInfo.content">
                </div>
                <div class="textarea" v-if="showEditComment">
                    <el-input ref="input" class="input" v-model="textarea" :autosize="{ minRows: 1, maxRows: 10 }"
                        type="textarea" :placeholder="t('comment.input_comments')" resize="none" size="small"
                        :input-style="{ overflow: scrollVisible ? 'visible' : 'hidden', background: isEditing ? '#F4F5F5' : 'transparent', color: '#777777' }"
                        @keydown="carriageReturn" @input="handleInput" @focus="startEditing" @blur="stopEditing" />
                    <div class="send" :style="{ background: sendBright ? '#1878F5' : 'transparent' }" @click="updateComment">
                        <svg-icon icon-class="send" :style="{ color: sendBright ? '#FFFFFF' : '#CCCCCC' }"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <!--        <i class="line"></i>-->
    </div>
</template>

<style scoped lang="scss">
.popup-body {
    padding: 14px 0 0 14px;
    margin-left: -1px;

    .container {
        display: flex;
        border-bottom: 1px solid #F0F0F0;

        .avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #efefef;
            margin-right: 5px;
            flex: 0 0 24px;

            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }

        .popup-body-context {
            width: 260px;
            display: flex;
            flex-direction: column;

            .box-heard {
                height: 24px;
                width: 267px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .item_heard {
                    display: flex;
                    align-items: center;
                    height: 12px;
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
                    width: 72px;
                    height: 24px;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;

                    //    .el-button {
                    //    border: none;
                    //    padding: 0;
                    //    width: 20px;
                    //    border-radius: 2px;
                    //    height: 20px;
                    //    &:hover {
                    //        background-color: rgba(0,0,0,0.08);
                    //    }
                    //}
                    .onEditContext {
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

                    .onQuickReply {
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
                }
            }

            .box-context {
                width: 260px;
                word-wrap: break-word;
                margin-bottom: 15px;
                margin-top: 11px;
                font-family: HarmonyOS Sans;
                font-size: 13px;
                line-height: 22px;
                color: #777777;
            }

            .textarea {
                display: flex;
                flex-direction: column;
                width: 270px;
                align-items: self-end;
                margin-top: 5px;

                .el-input--small {
                    font-family: HarmonyOS Sans;
                    font-size: 13px;
                    line-height: 22px;
                    border-radius: var(--default-radius);
                    box-sizing: border-box;
                    border: 1px solid #F4F5F5;
                    padding: 4px 0 4px 10px;
                }

                .send {
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 24px;
                    height: 24px;
                    background-color: var(--active-color);
                    border-radius: 4px;
                    margin-top: 13px;
                    margin-right: 2px;
                    margin-bottom: 18px;

                    >svg {
                        width: 13px;
                        height: 13px;
                    }
                }
            }
        }
    }

    .line {
        display: block;
        //margin: 0 15px;
        width: 300px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
}

:deep(.el-textarea__inner) {
    padding-left: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-right: 0;
    color: black;
}
</style>