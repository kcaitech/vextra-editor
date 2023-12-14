<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/request/comment'
import { useRoute } from 'vue-router';
import { Matrix } from "@kcdesign/data";
import { v4 } from 'uuid';
import SvgIcon from "@/components/common/SvgIcon.vue";
const { t } = useI18n()
const props = defineProps<{
    context: Context
    x1: number
    y1: number
    rootWidth?: number
    pageID: string
    shapeID: string
    matrix: Matrix
    x2: number
    y2: number
    posi: { x: number, y: number }
}>()

const emit = defineEmits<{
    (e: 'close', event?: MouseEvent): void
    (e: 'mouseDownCommentInput', event: MouseEvent): void
    (e: 'completed'): void
}>()
interface Comment {
    doc_id: string
    page_id: string
    shape_id: string
    target_shape_id: string
    shape_frame: any
    record_created_at: string
    content: string
}
const matrix = new Matrix();
const route = useRoute()
const docID = (route.query.id as string)
const textarea = ref('')
const comment = ref<HTMLDivElement>()
const surplusX = ref<number>(0)
const commentWidth = 360
const offside = ref(false)
const input = ref()
const textareaEl = ref<HTMLDivElement>()
const inputIcon = ref<HTMLInputElement>()
const isShaking = ref(false)
const position = ref({ x: 0, y: 0 })

const commentData = ref<Comment>({
    doc_id: docID,
    page_id: props.pageID,
    shape_id: '',
    target_shape_id: props.shapeID,
    shape_frame: {},
    record_created_at: '',
    content: ''
})

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    if (event.target instanceof Element && event.target.closest('.comment-input')) {
        return;
    }

    const mins = textarea.value.trim().length < 4;

    if (mins) {
        emit('close', event);
    } else {
        startShake()
        input.value && input.value.focus()
        input.value && input.value.select()
    }
}

const inputPosition = () => {
    offside.value = props.rootWidth! - props.posi.x < commentWidth
    surplusX.value = -(commentWidth - 12)
    input.value?.focus()
}
const sendBright = computed(() => textarea.value.trim().length > 0)

const carriageReturn = (event: KeyboardEvent) => {
    event.stopPropagation()
    const { code, ctrlKey, metaKey } = event;
    if (event.key === 'Enter') {
        if (ctrlKey || metaKey) {
            textarea.value = textarea.value + '\n'
        } else {
            event.preventDefault()
            addComment()
        }
    } else if (code === 'Escape' && textarea.value.trim().length < 4) {
        emit('close')
    } else if (code === 'Escape' && textarea.value.trim().length >= 4) {
        startShake()
    }
}

const mouseDownCommentInput = (e: MouseEvent) => {
    e.stopPropagation()
    emit('mouseDownCommentInput', e)
}

const addComment = () => {
    if(textarea.value.trim().length < 1) return;
    const timestamp = getCurrentTime()
    commentData.value.record_created_at = timestamp
    commentData.value.content = textarea.value
    commentData.value.doc_id = docID
    commentData.value.page_id = props.pageID
    commentData.value.target_shape_id = props.shapeID
    commentData.value.shape_frame = {
        x1: props.x1,
        y1: props.y1,
        x2: props.x2,
        y2: props.y2
    }
    commentData.value.shape_id = v4()
    const data = commentData.value
    createComment(data).then(() => {
        emit('completed');
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

const createComment = async (data: any) => {
    try {
        await comment_api.createCommentAPI(data)
    } catch (err) {
        console.log(err);
    }
}

const setPosition = () => {
    position.value = matrix.computeCoord({ x: props.x1, y: props.y1 })
}

const startShake = () => {
    input.value && input.value.select()
    isShaking.value = true
    const timer = setTimeout(() => {
        isShaking.value = false;
        clearTimeout(timer)
    }, 500); // 停止时间可以根据需要进行调整
}

const scrollVisible = ref(false)
const handleInput = () => {
    nextTick(() => {
        if (textareaEl.value) {
            const text = input.value.$refs.textarea
            if (text) {
                text.style.height = "auto"; // 重置高度，避免高度叠加
                text.style.height = text.scrollHeight + "px";
                const lineHeight = parseInt(getComputedStyle(text).lineHeight)
                const textareaHeight = text.clientHeight
                const numberOfLines = Math.ceil(textareaHeight / lineHeight)
                scrollVisible.value = numberOfLines > 10 ? true : false
            }
        }
    })
}

defineExpose({
    comment
})

let clickTimer: any = null
watchEffect(() => {
    matrix.reset(props.matrix);
    matrix.preTrans(props.x1, props.y1);
    inputPosition()
    setPosition()
})

onMounted(() => {
    clickTimer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 10)
})
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    clearTimeout(clickTimer)
})
</script>

<template>
    <div ref="comment" class="comment-input"
        :style="{ transform: `translate(${matrix.m02}px, ${matrix.m12}px)`, left: offside ? surplusX + 'px' : 48 + 'px', top: -33 + 'px' }">
        <div :class="{ icon_left: !offside, icon_right: offside }" ref="inputIcon" @mousedown="mouseDownCommentInput">
            <svg-icon icon-class="comment-add"></svg-icon>
        </div>
        <div class="textarea" ref="textareaEl" :class="{ 'shake': isShaking }">
            <el-input ref="input" class="input" v-model="textarea" :autosize="{ minRows: 1, maxRows: 10 }" type="textarea"
                :placeholder="t('comment.input_comments')" resize="none" size="small"
                :input-style="{ overflow: scrollVisible ? 'visible' : 'hidden' }" @keydown="carriageReturn"
                @input="handleInput" />
            <div class="send" :style="{ background: sendBright ? '#1878F5' : 'transparent' }" @click="addComment">
                <svg-icon icon-class="send" :style="{ color: sendBright ? '#FFFFFF' : '#CCCCCC' }"></svg-icon>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.comment-input {
    position: absolute;
    width: 330px;
    z-index: 9;
    font-size: var(--font-default-fontsize);
    cursor: default;

    .icon_left {
        position: absolute;
        top: 3px;
        left: -48px;
        width: 32px;
        height: 32px;
        border-radius: 16px 16px 16px 0;
        background-color: #1878F5;
        box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px;
        box-sizing: border-box;

        >svg {
            color: #FFFFFF;
            width: 25px;
            height: 25px;
        }
    }

    .icon_right {
        position: absolute;
        top: 3px;
        right: -48px;
        width: 32px;
        height: 32px;
        border-radius: 16px 16px 16px 0;
        background-color: #1878F5;
        box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px;
        box-sizing: border-box;

        >svg {
            color: #FFFFFF;
            width: 25px;
            height: 25px;
        }
    }

    .textarea {
        display: flex;
        align-items: self-end;
        padding: 10px 8px;
        background-color: #FFFFFF;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.05);
        border-radius: var(--default-radius);
        box-sizing: border-box;
        border: 1px solid #EBEBEB;

        .el-input--small {
            display: flex;
            font-size: 13px;
            line-height: 22px;
            align-items: center;
            justify-content: center;
            color: #CCCCCC;
            font-family: HarmonyOS Sans;
        }

        .send {
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 2px;
            width: 24px;
            height: 24px;
            background-color: #1878F5;
            border-radius: 4px;

            >svg {
                width: 15px;
                height: 15px;
            }
        }
    }
}

//.line1 {
//    position: absolute;
//    left: 7px;
//    top: 11px;
//    width: 40%;
//    height: 3px;
//    border: 1px solid #fff;
//    box-sizing: border-box;
//    background-color: rgb(0, 0, 0, .8);
//}
//
//.line2 {
//    position: absolute;
//    left: 7px;
//    top: 16px;
//    width: 50%;
//    height: 3px;
//    border: 1px solid #fff;
//    box-sizing: border-box;
//    background-color: rgb(0, 0, 0, .8);
//}

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
</style>