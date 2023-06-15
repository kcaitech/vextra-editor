<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, computed } from 'vue'
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import HoverComment from './HoverComment.vue'
import CommentView from './CommentView.vue'
import { Matrix, Shape } from "@kcdesign/data";
import * as comment_api from '@/apis/comment';
import { Selection } from '@/context/selection';

type CommentViewEl = InstanceType<typeof CommentView>;
const props = defineProps<{
    context: Context
    x: number
    y: number
    matrix: number[]
    commentInfo: any
    index: number
    reflush: number
}>()
const emit = defineEmits<{
    (e: 'moveCommentPopup', event: MouseEvent, index: number): void
    (e: 'deleteComment', index: number): void
    (e: 'resolve', status: number, index: number): void
    (e: 'recover'): void
    (e: 'editComment', index: number, text: string): void
    (e: 'updateShapeComment', x: number, y: number, index: number): void
}>()
const commentPopupEl = ref<CommentViewEl>()
const workspace = computed(() => props.context.workspace);
const ShowComment = ref(false)
const commentScale = ref(0)
const markScale = ref(1)
const showScale = ref(false)
const rootHeight = ref(0)
const rootWidth = ref(0)
const comment = ref<HTMLDivElement>()
const matrix = new Matrix();
const posi = { x: 0, y: 0 }
const documentCommentList = ref<any[]>(workspace.value.pageCommentList[props.index].children || [])
const commentOpacity = ref(workspace.value.isCommentOpacity)
const reply = ref(props.context.selection.commentStatus)
const commentLength = ref(props.context.workspace.pageCommentList.length)

const status = computed(() => {
    const status = props.commentInfo.status
    replyStatus()
    if (reply.value) {
        return true
    } else {
        return status === 0
    }
})

const hoverComment = () => {
    if (!showScale.value) {
        props.context.workspace.hoverComment(false);
        commentScale.value = 1
        props.context.workspace.hoverComment(true);
    }
    markScale.value = 1.1
}

const replyStatus = () => {
    reply.value = props.context.selection.commentStatus
}

const unHoverComment = () => {
    if (props.context.workspace.isCommentMove) return
    commentScale.value = 0
    markScale.value = 1
}
const showComment = (e: MouseEvent) => {
    if (props.context.workspace.isCommentMove) return
    props.context.workspace.commentMount(false)
    const { x, y } = props.context.workspace.root
    posi.x = e.clientX - x
    posi.y = e.clientY - y
    commentScale.value = 0
    rootHeight.value = comment.value!.parentElement!.clientHeight
    rootWidth.value = comment.value!.parentElement!.clientWidth
    getDocumentComment()
    ShowComment.value = true
    showScale.value = true
}

const unHover = () => {
    markScale.value = 1
}

const moveCommentPopup = (e: MouseEvent) => {
    e.stopPropagation()
    emit('moveCommentPopup', e, props.index)
}

const closeComment = (e?: MouseEvent) => {
    const target = e && e.target instanceof Element
    if (target && e.target.closest('.comment-mark') || target && e.target.closest('.container-hover')) return
    ShowComment.value = false
    showScale.value = false
    props.context.workspace.commentOpacity(false)
    props.context.workspace.saveCommentId('')
}

const deleteComment = () => {
    emit('deleteComment', props.index)
}

const resolve = (status: number, index: number) => {
    emit('resolve', status, index)
}

const recover = (index?: number) => {
    props.context.workspace.editTabComment()
    emit('recover')
    if (index) {
        documentCommentList.value.splice(index, 1)
    } else {
        const timer = setTimeout(() => {
            getDocumentComment()
            clearTimeout(timer)
        }, 100);
    }
}

const editComment = (index: number, text: string) => {
    emit('editComment', index, text)
}

const editCommentChild = (index: number, text: string) => {
    documentCommentList.value[index].content = text
}
const dragstart = (e: DragEvent) => {
    e.preventDefault()
}

const previousArticle = (i: number, xy?: { x: number, y: number }, id?: string) => {
    const index = i - 1
    skipComment(index, xy, id)
}

const nextArticle = (i: number, xy?: { x: number, y: number }, id?: string) => {
    const index = i + 1
    skipComment(index, xy, id)
}

const skipComment = (index: number, xy?: { x: number, y: number }, id?: string) => {
    const workspace = props.context.workspace;
    const commentItem = props.context.workspace.pageCommentList[index]
    const cx = reply.value ? commentItem.shape_frame.x1 : xy?.x
    const cy = reply.value ? commentItem.shape_frame.y1 : xy?.y
    const commentCenter = workspace.matrix.computeCoord(cx, cy) // 计算评论相对contenview的位置
    const { x, y, bottom, right } = workspace.root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const transX = contentViewCenter.x - commentCenter.x, transY = contentViewCenter.y - commentCenter.y;
    props.context.selection.selectComment(reply.value ? commentItem.id : id)
    if (transX || transY) {
        workspace.matrix.trans(transX, transY);
        workspace.matrixTransformation();
    }
}

watchEffect(() => {
    props.reflush;
    matrix.reset(props.matrix);
    matrix.preTrans(props.commentInfo.shape_frame.x1, props.commentInfo.shape_frame.y1);
})

const getDocumentComment = async () => {
    try {
        const { data } = await comment_api.getDocumentCommentAPI({ doc_id: props.commentInfo.doc_id, root_id: props.commentInfo.id })
        documentCommentList.value = data
        documentCommentList.value = documentCommentList.value.reverse()
    } catch (err) {
        console.log(err);
    }
}
const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.HOVER_COMMENT) {
        unHoverComment()
    }
    if (t === WorkSpace.OPACITY_COMMENT) {
        commentOpacity.value = workspace.value.isCommentOpacity
    }
    if (props.commentInfo.shape_frame.x2 || props.commentInfo.shape_frame.y2) {
        setCommentPosition()
    }
}
const update = (t: number) => {
    if (t === Selection.CHANGE_COMMENT) {
        if (props.context.selection.commentId === props.commentInfo.id) {
            props.context.workspace.commentMount(false)
            if (comment.value) {
                rootHeight.value = comment.value.parentElement!.clientHeight
                rootWidth.value = comment.value.parentElement!.clientWidth
            }
            commentScale.value = 0
            getDocumentComment()
            ShowComment.value = true
            showScale.value = true
        }
    }
    if (t === Selection.SOLVE_MENU_STATUS) {
        reply.value = props.context.selection.commentStatus
    }
}

const setCommentPosition = () => {
    const shape: Shape[] = props.context.selection.selectedPage!.childs
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (!workspace.value.transforming) return
    shape.forEach(item => {
        if (item.id === props.commentInfo.target_shape_id) {            
            if(selection.includes(item)) {
                
                workspace.value.editShapeComment(true, item)
                const { x, y } = item.frame2Page();
                console.log(x, y);
                const farmeX = x + props.commentInfo.shape_frame.x2
                const farmeY = y + props.commentInfo.shape_frame.y2
                emit('updateShapeComment', farmeX, farmeY, props.index)
            }
        }
    })
}

onMounted(() => {
    setCommentPosition()
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(update);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(update);
})
</script>

<template>
    <div class="container comment-mark-item" ref="comment" :style="{
        transform: `translate(${matrix.m02}px, ${matrix.m12}px)`
        , left: -2 + 'px', top: -33 + 'px'
    }" :reflush="reflush !== 0 ? reflush : undefined" v-if="status">
        <div class="comment-mark" @mouseenter="hoverComment" @mouseleave="unHover" @mousedown="moveCommentPopup"
            :style="{ transform: `scale(${markScale})`, opacity: commentOpacity && !ShowComment ? '0.5' : '1' }"
            :class="{ shadow: commentScale === 1 }">
            <img @dragstart="dragstart" :src="commentInfo.user.avatar" alt="">
        </div>
        <HoverComment :context="props.context" :scale="commentScale" @showComment="showComment"
            @unHoverComment="unHoverComment" :commentInfo="props.commentInfo" :index="props.index"
            @deleteComment="deleteComment" @resolve="resolve" @moveCommentPopup.stop="moveCommentPopup"></HoverComment>
        <CommentView v-if="ShowComment" ref="commentPopupEl" :x="posi.x" :y="posi.y" :rootHeight="rootHeight"
            :rootWidth="rootWidth" :length="commentLength" :context="props.context" @close="closeComment"
            :commentInfo="props.commentInfo" :index="props.index" @resolve="resolve" @delete="deleteComment"
            @recover="recover" @editComment="editComment" @editCommentChild="editCommentChild"
            :documentCommentList="documentCommentList" @previousArticle="previousArticle" @next-article="nextArticle"
            :reply="reply" @moveCommentPopup.stop="moveCommentPopup"></CommentView>
    </div>
</template>

<style scoped lang="scss">
.container {
    position: absolute;
    width: 35px;
    transform: translateY(50%);
    height: 35px;
    border-radius: calc(14px);
    border-bottom-left-radius: 0;

    .comment-mark {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        border-radius: calc(14px);
        border-bottom-left-radius: 0;
        background-color: #fff;
        box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
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
}</style>