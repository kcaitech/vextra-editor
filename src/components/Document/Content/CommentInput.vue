<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed } from 'vue'
import { Context } from '@/context';
import { Back } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/apis/comment'
import { useRoute } from 'vue-router';
const { t } = useI18n()
const props = defineProps<{
    context: Context
    x: number
    y: number
    rootWidth?: number
}>()

const emit = defineEmits<{
    (e: 'close', event?: MouseEvent): void
    (e: 'mouseDownCommentInput', event: MouseEvent): void
}>()
const route = useRoute()
const docID = (route.query.id as string)
const textarea = ref('')
const comment = ref<HTMLDivElement>()
const surplusX = ref<number>(0)
const commentWidth = 330
const offside = ref(false)
const input = ref<HTMLInputElement>()
const inputIcon = ref<HTMLInputElement>()
const isShaking = ref(false)

function handleClickOutside(event: MouseEvent) {
  event.stopPropagation()
  const length = textarea.value.trim().length < 4
  if(event.target instanceof Element && !event.target.closest('.comment-input') && length) {
    emit('close', event);
  }else if(event.target instanceof Element && !event.target.closest('.container-popup') && !length) {
      startShake()
      input.value && input.value.focus()
      input.value && input.value.select()
  }
}

const inputPosition = () => {
    offside.value = props.rootWidth! - props.x < commentWidth
    surplusX.value = props.x - commentWidth - 50
    input.value?.focus()
}
const sendBright = computed(() => textarea.value.trim().length > 0)

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
    }else if(code === 'Escape' && textarea.value.trim().length < 4) {
        emit('close')
    }else if (code === 'Escape' && textarea.value.trim().length >= 4) {
        startShake()
    }
}

const mouseDownCommentInput = (e: MouseEvent) => {
    e.stopPropagation()
    emit('mouseDownCommentInput', e)
}

const addComment = () => {
    console.log('添加评论');
    const page = props.context.selection.selectedPage
    const timestamp  = Date.now()
    console.log(page?.id,'pageId');
    
}

const createComment = () => {

}

const startShake = () => {
    input.value && input.value.select()
    isShaking.value = true
    const timer = setTimeout(() => {
        isShaking.value = false;
        clearTimeout(timer)
      }, 500); // 停止时间可以根据需要进行调整
}

defineExpose({
    comment
})

let clickTimer:any = null
watchEffect(inputPosition)
onMounted(() => {  
    clickTimer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    },10)
})
onUnmounted(() => {  
  document.removeEventListener('click', handleClickOutside);
  clearTimeout(clickTimer)
})
</script>

<template>
    <div ref="comment" class="comment-input" :style="{ top: props.y + 'px', left: offside ? surplusX + 'px' : props.x + 'px' }">
        <div :class="{ icon_left: !offside, icon_right: offside }" ref="inputIcon"  @mousedown="mouseDownCommentInput">
            <div class="line1"></div>
            <div class="line2"></div>
        </div>
        <div class="textarea" :class="{'shake': isShaking}">
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
</template>

<style scoped lang="scss">
    .comment-input {
        position: absolute;
        width: 330px;
        z-index: 99;
        font-size: var(--font-default-fontsize);
        cursor: default;

        .icon_left {
            position: absolute;
            top: 15px;
            left: -40px;
            width: 30px;
            height: 30px;
            border-radius: calc(13px);
            border-bottom-left-radius: 0;
            background-color: #fff;
            box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
        }
        .icon_right {
            position: absolute;
            top: 15px;
            right: -40px;
            width: 30px;
            height: 30px;
            border-radius: calc(13px);
            border-bottom-left-radius: 0;
            background-color: #fff;
            box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
        }
        .textarea {
            display: flex;
            align-items: self-end;
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
    .line1 {
        position: absolute;
        left: 7px;
        top: 11px;
        width: 40%;
        height: 3px;
        border: 1px solid #fff;
        box-sizing: border-box;
        background-color:  rgb(0, 0, 0,.8);
    }
    .line2 {
        position: absolute;
        left: 7px;
        top: 16px;
        width: 50%;
        height: 3px;
        border: 1px solid #fff;
        box-sizing: border-box;
        background-color:  rgb(0, 0, 0,.8);
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
   
</style>