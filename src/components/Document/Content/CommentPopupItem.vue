<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { Delete, Edit, Back } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    context: Context
}>()

const emit = defineEmits<{
    (e: 'close') : void
}>()
const hover = ref(false)
const textarea = ref('Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis,  Lorem ipsum dolor, sit amet consectetur a')
const sendBright = computed(() => textarea.value.trim().length > 0)
const showEditComment = ref(false)
const input = ref<HTMLInputElement>()
const hoverShape = (e: MouseEvent) => {
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}

const onEditContext = (e: Event) => {
    e.stopPropagation()
    showEditComment.value = true
    nextTick(() => {
        input.value && input.value.focus()
    })
    console.log('编辑内容');
    document.addEventListener('click', closeEdit)
}

const closeEdit = (e: Event) => {
    if(e.target instanceof Element && e.target.closest('.textarea')) return
    document.removeEventListener('click', closeEdit)
    showEditComment.value = false
}

const onQuickReply = (e: Event) => {
    e.stopPropagation()
    console.log('快速回复');
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    console.log('删除评论');
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
    console.log('编辑添加评论');
    
}
</script>

<template>
    <div class="popup-body"  @mouseenter="hoverShape" @mouseleave="unHoverShape">
        <div class="container">
            <div class="avatar">
                <img src="https://thirdwx.qlogo.cn/mmopen/vi_32/getbgSw8iaiagB4ChgXIiax3eYG9U8iaWVkTZemvaTZRXZz6oad8tl7qXWxLxgfFQxWUZVPj1oXI5lGQpicNOnZPoMg/132" alt="">
            </div>
            <div class="popup-body-context">
                <div class="box-heard">
                    <div class="name">
                        <div>丘吉尔 </div>&nbsp;&nbsp;
                        <div class="date"> 5月20日 13:14</div>
                    </div>
                    <div class="icon" :style="{visibility: hover ? 'visible' : 'hidden'}">
                        <el-button-group class="ml-4">
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.edit_content')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                                <el-button plain :icon="Edit" @click="onEditContext" style="margin-right: 5px;"/>
                            </el-tooltip>
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.quick_reply')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                                <el-button plain @click="onQuickReply" style="margin-right: 5px;"><i style="font-size: 13px;">@</i></el-button>
                            </el-tooltip>
                            <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`"
                                placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                                <el-button plain :icon="Delete" @click="onDelete"/>
                            </el-tooltip>
                        </el-button-group>
                    </div>
                </div>
                <div class="box-context" v-if="!showEditComment" @dblclick="onEditContext">Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis,  Lorem ipsum dolor, sit amet consectetur a</div>
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
                    <div class="send" :style="{opacity: sendBright ? '1' : '0.5'}" @click="addComment"><el-icon :size="14"><Back /></el-icon></div>
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
            display: flex;
            flex-direction: column;
            .box-heard {
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .name {
                    display: flex;
                }
                .icon {
                    width: 70px;
                    height: 20px;
                    display: flex;
                    justify-content: space-between;
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
                    width: 20px;
                    height: 20px;
                    background-color: var(--active-color);
                    border-radius: 50%;
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
  }
</style>