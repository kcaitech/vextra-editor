<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { Context } from '@/context';
import HoverComment from './HoverComment.vue'
import CommentView from './CommentView.vue'
type CommentViewEl = InstanceType<typeof CommentView>;
const props = defineProps<{
    context: Context
    x: number
    y: number
    rootWidth?: number
}>()
const commentPopupEl = ref<CommentViewEl>()
const ShowComment = ref(false)
const commentScale = ref(0)
const markScale = ref(1)
const showScale = ref(false)
const rootHeight = ref(0)
const comment = ref<HTMLDivElement>()
const hoverComment = () => {
    if(!showScale.value) {
        commentScale.value = 1
    }
    markScale.value = 1.1
}
const unHoverComment = () => {
    commentScale.value = 0
    markScale.value = 1
}
const showComment = (e: MouseEvent) => {
    e.stopPropagation()
    commentScale.value = 0
    rootHeight.value = comment.value!.parentElement!.clientHeight
    ShowComment.value = true
    showScale.value = true
    document.addEventListener('keydown', commentEsc);
}

const unHover = () => {
    markScale.value = 1
}

const commentEsc = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        document.removeEventListener('keydown', commentEsc);
        ShowComment.value = false;
    }
}


const closeComment = (e?: MouseEvent) => {
    if(e && e.target instanceof Element && e.target.closest('.comment-mark')) return
    ShowComment.value = false
    showScale.value = false
}
</script>

<template>
    <div class="container" ref="comment" :style="{ top: props.y - 10 + 'px', left: props.x - 42 + 'px'}" @mouseup.stop>
        <div class="comment-mark" @mouseenter="hoverComment" @mouseleave="unHover"
        :style="{transform: `scale(${markScale})`}" :class="{shadow: commentScale === 1 }">
            <img src="https://thirdwx.qlogo.cn/mmopen/vi_32/getbgSw8iaiagB4ChgXIiax3eYG9U8iaWVkTZemvaTZRXZz6oad8tl7qXWxLxgfFQxWUZVPj1oXI5lGQpicNOnZPoMg/132" alt="">
        </div>
        <HoverComment :context="props.context" :scale="commentScale" @showComment="showComment" @unHoverComment="unHoverComment"></HoverComment>
        <CommentView v-if="ShowComment" ref="commentPopupEl" :x="props.x" :y="props.y" :rootWidth="props.rootWidth" 
        :rootHeight="rootHeight" :context="props.context" @close="closeComment" @mousedown.stop></CommentView>
    </div>
</template>

<style scoped lang="scss">
.container {
    position: absolute;
    width: 35px;
    transform: translateY(50%);
    height: 35px;
    .comment-mark {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        border-radius: calc(14px);
        border-bottom-left-radius: 0;
        background-color: #fff;
        box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
        transition: 0.2s;
        transform-origin: left bottom;
        cursor: default;
        >img {
            width: 80%;
            height: 80%;
            border-radius: 50%;
        }
    }
    .shadow {
        box-shadow: none;
    }
}
</style>