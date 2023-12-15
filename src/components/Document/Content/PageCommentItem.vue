<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, computed, nextTick } from 'vue'
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Action } from "@/context/tool";
import HoverComment from './HoverComment.vue'
import CommentPopup from './CommentPopup.vue'
import { Matrix, Shape, ShapeType } from "@kcdesign/data";
import * as comment_api from '@/request/comment';
import { Selection } from '@/context/selection';
import { Comment } from '@/context/comment';
import { DocCommentOpData, DocCommentOpType } from "@/communication/modules/doc_comment_op"
import { d } from '@kcdesign/data/dist/data/utils';
type CommentViewEl = InstanceType<typeof CommentPopup>;
const props = defineProps<{
    context: Context
    matrix: number[]
    commentInfo: any
    index: number
    reflush: number
    myComment: any[]
}>()
const emit = defineEmits<{
    (e: 'moveCommentPopup', event: MouseEvent, index: number): void
    (e: 'deleteComment', index: number): void
    (e: 'resolve', status: number, index: number): void
    (e: 'recover'): void
    (e: 'editComment', index: number, text: string): void
    (e: 'updateShapeComment', index: number): void,
}>()
const commentPopupEl = ref<CommentViewEl>()
const workspace = computed(() => props.context.workspace);
const _comment = computed(() => props.context.comment);
const ShowComment = ref(false)
const commentScale = ref(0)
const markScale = ref(1)
const showScale = ref(false)
const rootHeight = ref(0)
const rootWidth = ref(0)
const comment = ref<HTMLDivElement>()
const matrix = new Matrix();
const documentCommentList = ref<any[]>([])
const commentOpacity = ref(_comment.value.isCommentOpacity)
const reply = ref(props.context.selection.commentStatus)
const commentLength = ref(props.context.comment.pageCommentList.length)
const myComment = ref(props.context.selection.commentAboutMe)
const visibleComment = ref(props.context.comment.isVisibleComment)
const action = ref()
const aboutMe = ref(false)
const status = computed(() => {
    if (!visibleComment.value && action.value !== Action.AddComment) {
        return false
    }
    const status = props.commentInfo.status
    replyStatus()
    showAboutMe()
    if (reply.value) {
        if (myComment.value) {
            if (aboutMe.value) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    } else {
        if (status === 0) {
            if (myComment.value) {
                if (aboutMe.value) {
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        } else {
            return false
        }
    }
})

const showAboutMe = () => {
    myComment.value = props.context.selection.commentAboutMe
    const comment = props.myComment.find(item => item.id === props.commentInfo.id)
    if (comment) {
        aboutMe.value = true
    } else {
        aboutMe.value = false
    }
}

const hoverComment = () => {
    if (props.context.comment.isCommentMove) return;
    if (!showScale.value) {
        props.context.comment.hoverComment(false);
        if (props.context.workspace.isTranslating) return;
        commentScale.value = 1;
        props.context.comment.hoverComment(true);
    }
    markScale.value = 1.1
}

const replyStatus = () => {
    reply.value = props.context.selection.commentStatus
}

const unHoverComment = () => {
    if (props.context.comment.isCommentMove) return
    commentScale.value = 0
    markScale.value = 1
}
const showComment = (e: MouseEvent) => {
    if (ShowComment.value) return;
    if (props.context.comment.isCommentMove) return
    documentCommentList.value = props.commentInfo.children.length > 0 ? [...props.commentInfo.children].reverse() : [];
    const commentX = props.commentInfo.shape_frame.x1
    const commentY = props.commentInfo.shape_frame.y1
    const workspace = props.context.workspace;
    const { bottom, right } = workspace.root;
    const commentCenter = workspace.matrix.computeCoord(commentX, commentY) //评论在视图上的位置
    if (bottom - commentCenter.y < 75) {
        props.context.workspace.matrix.trans(0, -80);
        props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else if (right - commentCenter.x < 330) {
        props.context.workspace.matrix.trans(-80, 0);
        props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
    props.context.comment.commentMount(false)
    const { x, y } = props.context.workspace.root
    commentScale.value = 0
    rootHeight.value = comment.value!.parentElement!.clientHeight
    rootWidth.value = comment.value!.parentElement!.clientWidth
    ShowComment.value = true
    showScale.value = true
}

const unHover = (e: MouseEvent) => {
    var timeout = setTimeout(() => {
        if (props.context.comment.isHoverCommentId === props.commentInfo.id) {
            return
        } else {
            props.context.comment.hoverComment(false);
        }
        clearTimeout(timeout)
    }, 100)
    markScale.value = 1
}

const moveCommentPopup = (e: MouseEvent) => {
    e.stopPropagation();
    if(props.commentInfo.user.id === props.context.comment.isUserInfo?.id) {
        emit('moveCommentPopup', e, props.index)
    }
}

const closeComment = (e?: MouseEvent) => {
    const target = e && e.target instanceof Element
    if (target && e.target.closest('.comment-mark') || target && e.target.closest('.container-hover')) return
    ShowComment.value = false
    showScale.value = false
    props.context.comment.commentOpacity(false)
    props.context.comment.saveCommentId('')
}

const deleteComment = () => {
    commentScale.value = 0
    markScale.value = 1
    emit('deleteComment', props.index)
}

const resolve = (status: number, index: number) => {
    emit('resolve', status, index)
}

const recover = (index?: number) => {
    emit('recover')
    if (index || index === 0) {
        documentCommentList.value.splice(index, 1)
    }
}
const addComment = (info: any) => {
    emit('recover');
    documentCommentList.value.push(info);
    getDocumentComment();
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
    const commentItem = props.context.comment.pageCommentList[index]
    const cx = reply.value ? commentItem.shape_frame.x1 : xy?.x
    const cy = reply.value ? commentItem.shape_frame.y1 : xy?.y
    if (isInner(cx, cy)) {
        props.context.selection.selectComment(reply.value ? commentItem.id : id)
        return
    }
    const commentCenter = workspace.matrix.computeCoord(cx, cy) // 计算评论相对contenview的位置
    const { x, y, bottom, right } = workspace.root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const transX = contentViewCenter.x - commentCenter.x, transY = contentViewCenter.y - commentCenter.y;
    props.context.selection.selectComment(reply.value ? commentItem.id : id)
    if (transX || transY) {
        workspace.matrix.trans(transX, transY);
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}

// 判断评论是否在可视区域内
function isInner(x: number, y: number) {
    const workspace = props.context.workspace;
    const { x: rx, y: ry, bottom, right } = workspace.root;
    const commentCenter = workspace.matrix.computeCoord(x, y) //评论在视图上的位置
    if ((commentCenter.x + rx) < rx || (commentCenter.y + ry) < ry) {
        return false
    } else if ((commentCenter.x + rx) > right || (commentCenter.y + ry + 35) > bottom) {
        return false
    } else {
        return true
    }
}

function setOrigin() { // 这个动作是让container与页面坐标系重合
    props.reflush;
    matrix.reset(props.matrix);
    matrix.preTrans(props.commentInfo.shape_frame.x1, props.commentInfo.shape_frame.y1);
}

const getDocumentComment = async () => {
    try {
        const { data } = await comment_api.getDocumentCommentAPI({ doc_id: props.commentInfo.doc_id, root_id: props.commentInfo.id })
        const list = data.map((item: any) => {
            item.content = item.content.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
            return item
        })
        documentCommentList.value = list.reverse();
    } catch (err) {
        console.log(err);
    }
}
const workspaceUpdate = (t: number, index?: number, me?: MouseEvent) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin()
    }
    action.value = props.context.tool.action;
}

const commentUpdate = (t: number, index?: number, me?: MouseEvent) => {
    if (t === Comment.HOVER_COMMENT) {
        unHoverComment()
    }
    if (t === Comment.OPACITY_COMMENT) {
        commentOpacity.value = _comment.value.isCommentOpacity
    }
    if (index === props.index) {
        // 打开
        showComment(me!)
    }
    if (t === Comment.VISIBLE_COMMENT) {
        visibleComment.value = props.context.comment.isVisibleComment
    }
    if (t === Comment.WATCH_COMMENT_CHANGE) {
        docComment();
    }
}

const docComment = () => {
    props.context.comment.notify(Comment.UPDATE_COMMENT_CHILD);
}

const pageSkipComment = () => {
    const workspace = props.context.workspace;
    const commentId = props.context.selection.commentId
    const index = props.context.comment.pageCommentList.findIndex(item => item.id === commentId)
    const commentItem = props.context.comment.pageCommentList[index]
    const cx = commentItem.shape_frame.x1
    const cy = commentItem.shape_frame.y1
    const commentCenter = workspace.matrix.computeCoord(cx, cy) // 计算评论相对contenview的位置
    const { x, y, bottom, right } = workspace.root;
    const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
    const transX = contentViewCenter.x - commentCenter.x, transY = contentViewCenter.y - commentCenter.y;
    props.context.selection.selectComment(commentId)
    if (transX || transY) {
        workspace.matrix.trans(transX, transY);
        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
}

const unfold = () => {
    if (props.context.selection.commentId === props.commentInfo.id) {
        props.context.comment.commentMount(false)
        if (comment.value) {
            rootHeight.value = comment.value.parentElement!.clientHeight
            rootWidth.value = comment.value.parentElement!.clientWidth
        }
        commentScale.value = 0
        documentCommentList.value = props.commentInfo.children.length > 0 ? [...props.commentInfo.children].reverse() : [];
        ShowComment.value = true
        showScale.value = true
        props.context.comment.saveCommentId(props.commentInfo.id);
    }
}

const selectedUpdate = (t: number) => {
    if (t === Selection.CHANGE_COMMENT) {
        unfold()
    }
    if (t === Selection.SOLVE_MENU_STATUS) {
        reply.value = props.context.selection.commentStatus
    }
    if (t === Selection.SKIP_COMMENT) {
        pageSkipComment()
        nextTick(() => {
            unfold()
        })
    }
    if (t === Selection.ABOUT_ME) {
        showAboutMe()
    }
}

const watchedShapes = new Map();
const watchCommentShape = new Map();
function watchShapes() { // 监听评论相关shape的变化
    const comment = props.commentInfo
    if (comment.page_id == comment.target_shape_id) return
    const needWatchShapes = new Map();
    let shapes = props.context.selection.selectedPage!.shapes;
    const shape = shapes.get(comment.target_shape_id);
    if (shape) {
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            needWatchShapes.set(p.id, p);
            p = p.parent;
        }
        needWatchShapes.set(comment.target_shape_id, shape);
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watchCommentShape.get(k));
        watchedShapes.delete(k);
        watchCommentShape.delete(k)
    });
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        const _ck = () => update(shape)
        v.watch(_ck);
        watchCommentShape.set(k, _ck);
        watchedShapes.set(k, v);
    });
}

const update = (shape?: Shape) => {
    watcher()
    if (!shape) return
    emit('updateShapeComment', props.index)
    props.context.comment.editShapeComment(true, [shape])
}

function watcher() {
    watchShapes()
}


defineExpose({
    showComment
})

onMounted(() => {
    props.context.workspace.watch(workspaceUpdate);
    props.context.comment.watch(commentUpdate);
    props.context.selection.watch(selectedUpdate);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.comment.unwatch(commentUpdate);
    props.context.selection.unwatch(selectedUpdate);
})
watchEffect(setOrigin)
watchEffect(watcher)
</script>

<template>
    <div class="container comment-mark-item" ref="comment" :style="{
        transform: `translate(${matrix.m02}px, ${matrix.m12}px)`
        , left: -2 + 'px', top: -33 + 'px'
    }" :reflush="reflush !== 0 ? reflush : undefined" v-if="status"
        :class="{ hierarchy: ShowComment || commentScale === 1 ? true : false }">
        <div class="comment-mark" @mouseenter="hoverComment" @mouseleave="unHover" @mousedown="moveCommentPopup"
            :style="{ transform: `scale(${markScale})`, opacity: commentOpacity && !ShowComment ? '0.5' : '1' }"
            :class="{ shadow: commentScale === 1, active: ShowComment }">
            <img @dragstart="dragstart" :src="commentInfo.user.avatar" alt="">
        </div>
        <HoverComment :context="props.context" :scale="commentScale" @showComment="showComment"
            @unHoverComment="unHoverComment" :commentInfo="props.commentInfo" :index="props.index"
            @deleteComment="deleteComment" @resolve="resolve" @moveCommentPopup.stop="moveCommentPopup"></HoverComment>
        <CommentPopup v-if="ShowComment" ref="commentPopupEl" :rootHeight="rootHeight" :rootWidth="rootWidth"
            :length="commentLength" :context="props.context" @close="closeComment" :commentInfo="props.commentInfo"
            :index="props.index" @resolve="resolve" @delete="deleteComment" @recover="recover" @editComment="editComment"
            @editCommentChild="editCommentChild" :documentCommentList="documentCommentList"
            @previousArticle="previousArticle" @next-article="nextArticle" :reply="reply"
            @moveCommentPopup.stop="moveCommentPopup" @addComment="addComment"></CommentPopup>
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
    z-index: 1;

    .comment-mark {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 94.12%;
        height: 94.12%;
        //border-radius: calc(14px);
        //border-bottom-left-radius: 0;
        //background-color: #fff;
        //box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
        transition: 0.2s;
        transform-origin: left bottom;
        cursor: default;
        border-radius: 20px 20px 20px 0px;
        opacity: 1;
        background: #FFFFFF;
        border: 1px solid #EBEBEB;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.05);

        >img {
            width: 80%;
            height: 80%;
            border-radius: 50%;
        }
    }

    .shadow {
        box-shadow: none;
        margin-top: -3px;
        margin-left: 1px
    }

    .active {
        border: 2px solid #1878F5;
    }
}

.hierarchy {
    z-index: 2;
}
</style>