<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted, defineExpose, watchEffect, computed } from 'vue'
import { Context } from '@/context';
import { Back } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
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
const textarea = ref('')
const comment = ref<HTMLDivElement>()
const surplusX = ref<number>(0)
const commentWidth = 330
const offside = ref(false)
const input = ref<HTMLInputElement>()
const inputIcon = ref<HTMLInputElement>()

function handleClickOutside(event: MouseEvent) {
  event.stopPropagation()
  event.target instanceof Element && !event.target.closest('.comment-input') && emit('close', event);
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
    }
}

const mouseDownCommentInput = (e: MouseEvent) => {
    e.stopPropagation()
    emit('mouseDownCommentInput', e)
}

const addComment = () => {
    console.log(11);
    
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
        <div class="textarea">
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