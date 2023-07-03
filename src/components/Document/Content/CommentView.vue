<script setup lang="ts">
import { reactive, onMounted, onUnmounted, computed, ref, watchEffect, nextTick } from 'vue';
import { Context } from '@/context';
import PageCommentItem from '@/components/Document/Content/PageCommentItem.vue'
import * as comment_api from '@/apis/comment';
import { ClientXY, PageXY } from '@/context/selection';
import { useRoute } from 'vue-router';
import { WorkSpace } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
import { searchCommentShape } from '@/utils/comment';
import { Page, Shape, ShapeType } from "@kcdesign/data";

type CommentView = InstanceType<typeof PageCommentItem>;

const { t } = useI18n();
const props = defineProps<{
    context: Context,
    pageId: string,
    spacePressed: boolean,
    root: HTMLDivElement | undefined,
    cursorClass: string,
    page: Page
}>();
const commentItem = ref<CommentView>();
const commentInput = ref(false);
const workspace = computed(() => props.context.workspace);
const documentCommentList = ref<any[]>(workspace.value.pageCommentList)
const route = useRoute()
const userId = localStorage.getItem('userId') || ''
const matrix = reactive(props.context.workspace.matrix); // 一切图形可视变换的根源！！！
const mousedownOnClientXY: ClientXY = { x: 0, y: 0 }; // 鼠标在可视区中的坐标
const mousedownOnPageXY: PageXY = { x: 0, y: 0 }; // 鼠标在page中的坐标
const prePt: { x: number, y: number } = { x: 0, y: 0 };
type commentListMenu = {
    text: string
    status_p: boolean
}
// 左侧评论列表的菜单
const commentMenuItems = ref<commentListMenu[]>([
    { text: `${t('comment.sort')}`, status_p: false },
    { text: `${t('comment.show_about_me')}`, status_p: false },
    { text: `${t('comment.show_resolved_comments')}`, status_p: props.context.selection.commentStatus || false }
])

function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(clientX - x, clientY - y);
    mousedownOnPageXY.x = xy.x, mousedownOnPageXY.y = xy.y; //页面坐标系上的点
    mousedownOnClientXY.x = clientX - x, mousedownOnClientXY.y = clientY - y; // 用户端可视区上的点
}

function getMouseOnPageXY(e: MouseEvent): PageXY { // 获取鼠标在页面上的点击位置
    const { clientX, clientY } = e;
    const { x, y } = workspace.value.root;
    return matrix.inverseCoord(clientX - x, clientY - y);
}

const commentEsc = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        document.removeEventListener('keydown', commentEsc);
        commentInput.value = false;
    }
}

const editCommentId = ref('')
const commentIndex = ref<number>(0)
const downOnPageXY: ClientXY = reactive({ x: 0, y: 0 });
//移动评论
const downMoveCommentPopup = (e: MouseEvent, index: number) => {
    setMousedownXY(e); // 记录鼠标点下的位置（相对于page）
    prePt.x = e.screenX;
    prePt.y = e.screenY;
    const { x, y } = getMouseOnPageXY(e)
    downOnPageXY.x = x
    downOnPageXY.y = y
    workspace.value.commentMove(false)
    editCommentId.value = documentCommentList.value[index].id
    commentIndex.value = index
    const handleMouseMove = (e: MouseEvent) => {
        moveCommentPopup(e, index);
    };

    const handleMouseUp = (e: MouseEvent) => {
        const { x, y } = workspace.value.root;
        const dx = e.screenX - prePt.x;
        const dy = e.screenY - prePt.y;
        const diff = Math.hypot(dx, dy);
        if (diff < 4) {
            props.context.workspace.showCommentPopup(commentIndex.value, e)
        } else {
            if (documentCommentList.value[index].user.id !== userId) return
            const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
            const shape_frame = documentCommentList.value[index].shape_frame
            const commentxy = { x: shape_frame.x1, y: shape_frame.y1 }
            const shapes = searchCommentShape(props.context, commentxy);
            shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
            shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
            workspace.value.commentMove(false)
            if (shapes.length === 0) {
                const data = {
                    id: editCommentId.value,
                    target_shape_id: props.pageId,
                    shape_frame: {
                        x1: shape_frame.x1,
                        y1: shape_frame.y1,
                        x2: 0,
                        y2: 0
                    }
                }
                editMoveCommentPosition(data)
            } else {
                const shape = shapes[0]
                const fp = shape.frame2Root();
                const farmeXY = { x: fp.x, y: fp.y }
                const data = {
                    id: editCommentId.value,
                    target_shape_id: shape.id,
                    shape_frame: {
                        x1: shape_frame.x1,
                        y1: shape_frame.y1,
                        x2: shape_frame.x1 - farmeXY.x,
                        y2: shape_frame.y1 - farmeXY.y
                    }
                }
                editMoveCommentPosition(data)
            }
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
};
const commentReflush = ref(0)
const moveCommentPopup = (e: MouseEvent, index: number) => {
    if (documentCommentList.value[index].user.id !== userId) return
    commentReflush.value++
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const deltaX = Math.abs(xy.x - downOnPageXY.x);
    const deltaY = Math.abs(xy.y - downOnPageXY.y);
    const diff = Math.hypot(deltaX, deltaY);
    if (diff > 3) {
        props.context.workspace.commentMove(true)
    }
    const shape_frame = documentCommentList.value[index].shape_frame
    shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
    shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
    setMousedownXY(e);
};

const updateShapeComment = (index: number) => {
    // if (documentCommentList.value[index].user.id !== userId) return
    const shapes = props.context.selection.selectedPage!.shapes;
    const shape_frame = documentCommentList.value[index].shape_frame
    const shape = shapes.get(documentCommentList.value[index].target_shape_id);
    if(shape) {
        const { x, y } = shape.frame2Root()
        shape_frame.x1 = shape_frame.x2 + x
        shape_frame.y1 = shape_frame.y2 + y    
        commentReflush.value++
    }
}

const editShapeComment = (index: number, x: number, y: number) => {
    const comment = documentCommentList.value[index]
    const id = comment.id
    const shapeId = comment.target_shape_id
    const { x2, y2 } = comment.shape_frame
    const data = {
        id: id,
        target_shape_id: shapeId,
        shape_frame: {
            x1: x,
            y1: y,
            x2: x2,
            y2: y2
        }
    }
    editCommentShapePosition(data)
}
const editCommentShapePosition = async (data: any) => {
    try {
        await comment_api.editCommentAPI(data)
    } catch (err) {
        console.log(err);
    }
}
const editMoveCommentPosition = async (data: any) => {
    try {
        await comment_api.editCommentAPI(data)
        getDocumentComment()
    } catch (err) {
        console.log(err);
    }
}

// 获取评论列表
const getDocumentComment = async () => {
    try {
        const { data } = await comment_api.getDocumentCommentAPI({ doc_id: route.query.id })
        if (data) {
            data.forEach((obj: { children: any[]; commentMenu: any; }) => {
                obj.commentMenu = commentMenuItems.value
                obj.children = []
            })
            const manageData = data.map((item: any) => {
                item.content = item.content.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
                return item
            })
            const list = list2Tree(manageData, '')
            workspace.value.setNot2TreeComment(manageData)
            workspace.value.setPageCommentList(list, props.pageId)
            workspace.value.setCommentList(list)
            documentCommentList.value = workspace.value.pageCommentList
            if (props.context.selection.isSelectComment) {
                props.context.selection.selectComment(props.context.selection.commentId)
                documentCommentList.value = workspace.value.pageCommentList
                nextTick(() => {
                    props.context.selection.setCommentSelect(false)
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}

// 列表转树
const list2Tree = (list: any, rootValue: string) => {
    const arr: any = []
    list.forEach((item: any) => {
        if (item.parent_id === rootValue) {
            const children = list2Tree(list, item.id)
            if (children.length) {
                item.children = children
            }
            arr.push(item)
        }
    })
    return arr
}

//关于我的评论
const aboutMe = () => {
    const aboutMeArr: any = []
    const userId = localStorage.getItem('userId')
    const commnetList = props.context.workspace.not2treeComment
    commnetList.forEach((item: any) => {
        if (item.user.id === userId) {
            const rootId = item.root_id
            if (rootId) {
                commnetList.forEach((i: any) => {
                    if (i.id === rootId) {
                        aboutMeArr.push(i)
                    }
                })
            } else {
                aboutMeArr.push(item)
            }
        }
    })
    const myComment = Array.from(new Set(aboutMeArr))
    return myComment
}

// 删除评论
const deleteComment = (index: number) => {
    workspace.value.sendComment()
    documentCommentList.value.splice(index, 1)
}

//解决评论
const resolve = (status: number, index: number) => {
    workspace.value.sendComment()
    documentCommentList.value[index].status = status
}

//回复评论
const recover = () => {
    workspace.value.sendComment()
}

//修改评论内容
const editComment = (index: number, text: string) => {
    workspace.value.sendComment()
    documentCommentList.value[index].content = text
}

//移动shape时保存shape身上的评论坐标
const saveShapeCommentXY = () => {
    const shapes = workspace.value.commentShape
    const sleectShapes = flattenShapes(shapes)
    sleectShapes.forEach((item: any) => {
        documentCommentList.value.filter((comment, i) => {
            if (comment.target_shape_id === item.id) {
                editShapeComment(i, comment.shape_frame.x1, comment.shape_frame.y1)
            }
        })
    })
    workspace.value.editShapeComment(false, undefined)
}

// 递归函数，用于将数组扁平化处理
function flattenShapes(shapes: any) {
    return shapes.reduce((result: any, item: Shape) => {
        if (Array.isArray(item.childs)) {
            // 如果当前项有子级数组，则递归调用flattenArray函数处理子级数组
            result = result.concat(flattenShapes(item.childs));
        }
        return result.concat(item);
    }, []);
}

function workspaceWatcher(type?: number) { // 更新编辑器状态，包括光标状态、是否正在进行图形变换
    if (type === WorkSpace.CURSOR_CHANGE) {
        if (type === WorkSpace.UPDATE_COMMENT_POS) {
            saveShapeCommentXY();
        }
    }
    //更新评论
    if (type === WorkSpace.EDIT_COMMENT) {
        const timer = setTimeout(() => {
            getDocumentComment()
            clearTimeout(timer)
        }, 100);
    } else if (type === WorkSpace.TOGGLE_COMMENT_PAGE) {
        documentCommentList.value = []
        const timer = setTimeout(() => {
            getDocumentComment()
            clearTimeout(timer)
        }, 100);
    }
    if (type === WorkSpace.UPDATE_PAGE_COMMENT) {
        documentCommentList.value = props.context.workspace.pageCommentList
    }
    if (type === WorkSpace.UPDATE_COMMENT) {
        props.context.workspace.updateCommentList(props.pageId)
        documentCommentList.value = props.context.workspace.pageCommentList
    }
}

onMounted(() => {
    getDocumentComment()
    props.context.workspace.watch(workspaceWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
    <PageCommentItem ref="commentItem" :context="props.context" @moveCommentPopup="downMoveCommentPopup"
        :matrix="matrix.toArray()" @delete-comment="deleteComment" @resolve="resolve" :reflush="commentReflush"
        v-for="(item, index) in documentCommentList" :key="index" :commentInfo="item" :index="index" @recover="recover"
        @editComment="editComment" @updateShapeComment="updateShapeComment" :myComment="aboutMe()">
    </PageCommentItem>
</template>

<style scoped lang="scss"></style>