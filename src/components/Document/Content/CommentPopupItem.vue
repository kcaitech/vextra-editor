<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { Delete, Edit, Back } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/apis/comment';
const { t } = useI18n()
const props = defineProps<{
    context: Context
    commentInfo: any
    index: number
}>()

const emit = defineEmits<{
    (e: 'close') : void
    (e: 'delete', index: number, event: Event, id: string):void
    (e: 'editComment', index: number, text: string): void
    (e: 'quickReply', name: string): void
}>()
const hover = ref(false)
const workspace = computed(() => props.context.workspace);
const textarea = ref(props.commentInfo.content)
const sendBright = computed(() => textarea.value.trim().length > 0)
const showEditComment = ref(false)
const input = ref<HTMLInputElement>()
const hoverShape = (e: MouseEvent) => {
    hover.value = true
}

const isControls = computed(() => {
    props.commentInfo.user.id || workspace.value.isDocumentInfo?.user.id || workspace.value.isUserInfo?.id
    if(workspace.value.isUserInfo?.id === props.commentInfo.user.id || workspace.value.isUserInfo?.id === workspace.value.isDocumentInfo?.user.id) return true
    else return false
})

const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}

const onEditContext = (e: Event) => {
    e.stopPropagation()
    if(!isControls.value) return
    textarea.value = props.commentInfo.content
    showEditComment.value = true
    nextTick(() => {
        input.value && input.value.focus()
    })
    document.addEventListener('click', closeEdit)
}

const closeEdit = (e: Event) => {
    if(e.target instanceof Element && e.target.closest('.textarea')) return
    document.removeEventListener('click', closeEdit)
    showEditComment.value = false
}

const onQuickReply = (e: Event) => {
    e.stopPropagation()
    emit('quickReply', props.commentInfo.user.nickname)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if(!isControls.value) return
    emit('delete', props.index, e, props.commentInfo.id)
}

const carriageReturn = (event: KeyboardEvent) => {
    event.stopPropagation()
    const { code, ctrlKey, shiftKey } = event;
    if(event.key === 'Enter') {
        if(ctrlKey) {
            textarea.value = textarea.value + '\n'
        }else {
            event.preventDefault()
            addComment()
        }
    }else if(code === 'Escape') {
        emit('close')
    }
}

const addComment = () => {
    const text = textarea.value
    emit('editComment', props.index, text)
    editComment(text)
    showEditComment.value = false
}

const editComment = async(content: string) => {
    try{
        const parent_id = props.commentInfo.parent_id
        const root_id = props.commentInfo.root_id
        await comment_api.editCommentAPI({id: props.commentInfo.id, parent_id, root_id, content})
    }catch (err) {
        console.log(err);
    }
}

const formatDate = computed(() => {
  return function (value: string): string {
    const date = new Date(value);
    const zh_month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const lang = localStorage.getItem('locale') || 'zh'
    const en_month = date.toLocaleString('en-US', { month: 'long' });
    if(lang === 'zh') {
        return `${zh_month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }else {
        return `${en_month} ${day}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
})
</script>

<template>
    <div class="popup-body"  @mouseenter="hoverShape" @mouseleave="unHoverShape">
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
                    <div class="icon" :style="{visibility: hover ? 'visible' : 'hidden'}">
                        <el-button-group class="ml-4">
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.edit_content')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="isControls">
                                <el-button plain :icon="Edit" @click="onEditContext" :style="{'margin-right': 5 +'px'}" v-if="isControls"/>
                            </el-tooltip>
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.quick_reply')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                                <el-button plain @click="onQuickReply" style="margin-right: 5px;"><i style="font-size: 13px;">@</i></el-button>
                            </el-tooltip>
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="isControls">
                                <el-button plain :icon="Delete" @click.stop="onDelete" v-if="isControls"/>
                            </el-tooltip>
                        </el-button-group>
                    </div>
                </div>
                <div class="box-context" v-if="!showEditComment" @dblclick="onEditContext">{{ commentInfo.content }}</div>
                <div class="textarea" v-if="showEditComment">
                    <el-input
                        ref="input"
                        class="input"
                        v-model="textarea"
                        :autosize="{ minRows: 1, maxRows: 12 }"
                        type="textarea"
                        :placeholder="t('comment.input_comments')"
                        resize="none"
                        size="small"
                        @keydown="carriageReturn"
                    />
                    <div class="send" :style="{opacity: sendBright ? '1' : '0.5'}" @click="addComment"><svg-icon icon-class="send"></svg-icon></div>
                </div>
            </div>
        </div>
        <i class="line"></i>
    </div>
</template>

<style scoped lang="scss">
 .popup-body {
    .container {
        display: flex;
        padding: 12px;
        .avatar {
            width: 30px;
            height: 30px;
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
        .popup-body-context {
            width: 260px;
            display: flex;
            flex-direction: column;
            .box-heard {
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .item_heard {
                    display: flex;
                    width: calc(100% - 80px);
                    .name {
                        max-width: calc(100% - 82px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .date {
                        width: 82px;
                    }
                }
                .icon {
                    width: 70px;
                    height: 20px;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    .el-button {
                    border: none;
                    padding: 0;
                    width: 20px;
                    border-radius: 2px;
                    height: 20px;
                    &:hover {
                        background-color: rgba(0,0,0,0.08);
                    }
                }
                }
            }
            .box-context {
                width: 260px;
                word-wrap: break-word;
            }
            .textarea {
                display: flex;
                width: 260px;
                align-items:self-end ;
                background-color: #fff;
                .send {
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 22px;
                    height: 20px;
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
    
    .line {
        display: block;
        margin: 0 15px;
        width: 300px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
    }
}
  :deep(.el-textarea__inner) {
    padding-left: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
</style>