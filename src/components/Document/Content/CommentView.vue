<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { Close, Delete, CircleCheck, Back } from '@element-plus/icons-vue'
import CommentPopupItem from './CommentPopupItem.vue';
import { Action } from '@/context/workspace';
import { WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    context: Context
    x: number
    y: number
    rootWidth?: number
    rootHeight: number
}>()
const emit = defineEmits<{
    (e:'close', event?: MouseEvent): void
}>()
const workspace = computed(() => props.context.workspace);
const textarea = ref('')
const offside = ref(false)
const commentPopup = ref<HTMLDivElement>()
const commentTop = ref(-10)
const scrollHeight = ref(0)
const textareaEl = ref<HTMLDivElement>()
const inputPopup = ref<HTMLInputElement>()
const isShaking = ref(false)
const close = (e: MouseEvent) => {
    emit('close', e)
}

const height = ref()

const sendBright = computed(() => textarea.value.trim().length > 0)
const commentPosition = () => {
    nextTick(() => {
        inputPopup.value && inputPopup.value.focus()
        height.value = height.value ? textareaEl.value?.clientHeight : 52
        offside.value = props.rootWidth! - props.x < 330
        let t = 0
        t = props.rootHeight! - props.y //剩余的高度
        scrollHeight.value = props.rootHeight - 55 - (height.value as number) - 30

        nextTick(() => {
            if(commentPopup.value) {
                if(t - commentPopup.value!.clientHeight < 0) {
                    commentTop.value = t - commentPopup.value!.clientHeight - 30
                }else {
                    commentTop.value = -10
                }
            }
        })
    })
}

function handleClickOutside(event: MouseEvent) {
  event.stopPropagation()
  const action = workspace.value.action === Action.AddComment
  const length = textarea.value.trim().length < 4
  if(event.target instanceof Element && !event.target.closest('.container-popup') && action && length) {
    emit('close', event);
  }else if(event.target instanceof Element && !event.target.closest('.container-popup') && action && !length) {
      startShake()
      inputPopup.value && inputPopup.value.focus()
      inputPopup.value && inputPopup.value.select()
  }
}

const carriageReturn = (event: KeyboardEvent) => {
    event.stopPropagation()
    commentPosition()
    const { code, ctrlKey, shiftKey } = event;
    if(event.key === 'Enter') {
        if(ctrlKey) {
            textarea.value = textarea.value + '\n'
        }else {
            event.preventDefault()
            addComment()
        }
    }else if(code === 'Escape' && textarea.value.trim().length < 4) {
        emit('close')
    }else if (code === 'Escape' && textarea.value.trim().length >= 4) {
        startShake()
    }
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    console.log('解决评论');
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    console.log('删除评论');
}

function workspaceUpdate(t?: number) {  
    const length = textarea.value.trim().length < 4
    props.context.workspace.commentInput(true);
  if (t === WorkSpace.SHUTDOWN_COMMENT && length) {
    emit('close');
  }
}

const previousArticle = () => {
    console.log('上一条评论');
    
}

const nextArticle = () => {
    console.log('下一条评论');
    
}

const addComment = () => {
    console.log('添加评论');
    
}

const startShake = () => {
    inputPopup.value && inputPopup.value.select()
    isShaking.value = true
    const timer = setTimeout(() => {
        isShaking.value = false;
        clearTimeout(timer)
      }, 500); // 停止时间可以根据需要进行调整
}

watchEffect(commentPosition)
const scrollup = (e: MouseEvent) => {
}

const closeComment = (e: KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.code === 'Escape') {
        emit('close')
    }
}

defineExpose({
    commentPopup,
    textarea,
    startShake
})
onMounted(() => {  
  props.context.workspace.commentInput(true);
  props.context.workspace.watch(workspaceUpdate);
  document.addEventListener('mouseup', handleClickOutside);
  document.addEventListener('mouseup', scrollup)
  document.addEventListener('keydown', closeComment);
})
onUnmounted(() => {  
  props.context.workspace.unwatch(workspaceUpdate);
  document.removeEventListener('mouseup', handleClickOutside);
  document.removeEventListener('mouseup', scrollup);
  document.removeEventListener('keydown', closeComment);
})
</script>

<template>
    <div class="container-popup" ref="commentPopup" :style="{ top: commentTop + 'px' }" 
    :class="{ popup_left: offside, popup_right: !offside, 'shake': isShaking }">
        <div class="popup-heard">
            <div class="button-shift">
                <el-button plain class="custom-button" @click="previousArticle">{{t('comment.last')}}</el-button>
                <div class="button-icon"></div>
                <el-button plain class="custom-button" @click="nextArticle">{{t('comment.next')}}</el-button>
            </div>
            <div class="comment-commands">
                <el-button-group class="ml-4">
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`"
                        placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                        <el-button plain :icon="Delete" @click="onDelete"/>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`"
                        placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                        <el-button plain :icon="CircleCheck" @click="onResolve"/>
                    </el-tooltip>
                    <el-button plain :icon="Close" @click="close"/>
                </el-button-group>
            </div>
        </div>
        <el-scrollbar :height="scrollHeight + 'px'">
            <CommentPopupItem  v-for="item in 20" :key="item" :context="props.context" @close="() => emit('close')"></CommentPopupItem>
        </el-scrollbar>
        <div class="popup-footer">
            <div class="textarea" ref="textareaEl">
                <el-input
                    ref="inputPopup"
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
</template>

<style scoped lang="scss">
    .container-popup {
        position: absolute;
        width: 330px;
        background-color: #fff;
        border-radius: 6px;
        box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
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
            border-bottom: 1px solid rgba(0,0,0,0.15);
            .button-shift {
                position: relative;
                width: 94px;
                height: 24px;
                border: 1px solid rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-radius: 4px;
                .button-icon {
                    width: 0;
                    height: 16px;
                    border-left: 1px solid rgba(0,0,0,0.15);
                    position: absolute;
                    left: 47px;
                }
                .el-button:hover {
                    background-color: rgba(0,0,0,0.08);
                }
            }
            .comment-commands {
                width: 90px;
                height: 30px;
                .el-button {
                    border: none;
                    border-radius: 4px;
                    width: 30px;
                    height: 30px;
                    &:hover {
                        background-color: rgba(0,0,0,0.08);
                    }
                }
            }
        }
       
        .popup-footer {
            .textarea {
            display: flex;
            align-items:self-end ;
            padding: 12px;
            background-color: #fff;
            box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
            border-radius: 4px;
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
    :deep(.el-textarea__inner::-webkit-scrollbar){
     width: 6px ;
    }
    :deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
        border-radius: 3px ;
        -moz-border-radius: 3px ;
        -webkit-border-radius: 3px ;
        background-color: #c3c3c3 ;
    }
    :deep(.el-textarea__inner::-webkit-scrollbar-track) {
        background-color: transparent ;
    }
    .el-scrollbar {
        padding-right: 10px;
    }
</style>