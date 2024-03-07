<script setup lang="ts">
import { reactive, onMounted, onUnmounted, computed, ref, nextTick } from 'vue';
import { Context } from '@/context';
import PageCommentItem from '@/components/Document/Content/PageCommentItem.vue'
import * as comment_api from '@/request/comment';
import { ClientXY, PageXY } from '@/context/selection';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { searchCommentShape } from '@/utils/comment';
import { GroupShape, PageView, Shape, ShapeView } from "@kcdesign/data";
import { Comment } from '@/context/comment';
import { DocCommentOpData, DocCommentOpType } from "@/communication/modules/doc_comment_op"
import { flattenShapes } from '@/utils/cutout';
type CommentView = InstanceType<typeof PageCommentItem>;

const { t } = useI18n();
const props = defineProps<{
    context: Context,
    pageId: string,
    root: HTMLDivElement | undefined,
    cursorClass: string,
    page: PageView
}>();
const commentItem = ref<CommentView>();
const commentInput = ref(false);
const workspace = computed(() => props.context.workspace);
const comment = computed(() => props.context.comment);
const documentCommentList = ref<any[]>(comment.value.pageCommentList)
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
    comment.value.commentMove(false)
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
            props.context.comment.showCommentPopup(commentIndex.value, e)
        } else {
            // if (documentCommentList.value[index].user.id !== userId) return
            const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
            const shape_frame = documentCommentList.value[index].shape_frame
            const commentxy = { x: shape_frame.x1, y: shape_frame.y1 }
            const shapes = searchCommentShape(props.context, commentxy);
            shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
            shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
            comment.value.commentMove(false)
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
                documentCommentList.value[index].shape_frame = data.shape_frame;
                documentCommentList.value[index].target_shape_id = props.pageId;
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
                documentCommentList.value[index].shape_frame = data.shape_frame;
                documentCommentList.value[index].target_shape_id = shape.id;
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
const isControls = (index: number) => {
    if (userId === documentCommentList.value[index].user.id || userId === comment.value.isDocumentInfo?.user.id) return true
    else return false
}
const moveCommentPopup = (e: MouseEvent, index: number) => {
    const { x, y } = workspace.value.root;
    const xy = matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const deltaX = Math.abs(xy.x - downOnPageXY.x);
    const deltaY = Math.abs(xy.y - downOnPageXY.y);
    const diff = Math.hypot(deltaX, deltaY);
    if (isControls(index)) {
        commentReflush.value++
        if (diff > 3) {
            props.context.comment.commentMove(true)
        }
        const shape_frame = documentCommentList.value[index].shape_frame
        shape_frame.x1 = shape_frame.x1 + (xy.x - mousedownOnPageXY.x)
        shape_frame.y1 = shape_frame.y1 + (xy.y - mousedownOnPageXY.y)
        setMousedownXY(e);
    }
};

const updateShapeComment = (index: number) => {
    // if (documentCommentList.value[index].user.id !== userId) return
    const shapes = props.context.selection.selectedPage!.shapes;
    const shape_frame = documentCommentList.value[index].shape_frame
    const shape = shapes.get(documentCommentList.value[index].target_shape_id);
    if (shape) {
        const { x, y } = shape.frame2Root()
        shape_frame.x1 = shape_frame.x2 + x
        shape_frame.y1 = shape_frame.y2 + y
        const fp = { x1: shape_frame.x1, y1: shape_frame.y1, x2: shape_frame.x2, y2: shape_frame.y2 }
        documentCommentList.value[index].shape_frame = fp;
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
    props.context.comment.setCommentList(documentCommentList.value)
    try {
        await comment_api.editCommentAPI(data)
        // getDocumentComment()
    } catch (err) {
        console.log(err);
    }
}

// 获取评论列表
const getDocumentComment = async () => {
    try {
        const docInfo = props.context.comment.isDocumentInfo;
        const { data } = await comment_api.getDocumentCommentAPI({ doc_id: docInfo?.document.id || route.query.id })
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
            comment.value.setNot2TreeComment(manageData)
            comment.value.setPageCommentList(list, props.pageId)
            props.context.comment.setCommentList(list)
            documentCommentList.value = comment.value.pageCommentList
            if (props.context.selection.isSelectComment) {
                props.context.selection.selectComment(props.context.selection.commentId)
                documentCommentList.value = comment.value.pageCommentList
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
    const commnetList = props.context.comment.not2treeComment
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
    documentCommentList.value.splice(index, 1)
    props.context.comment.setCommentList(documentCommentList.value)
}

//解决评论
const resolve = (status: number, index: number) => {
    documentCommentList.value[index].status = status
    props.context.comment.setCommentList(documentCommentList.value)
}

//回复评论
const recover = () => {
    props.context.comment.sendComment()
    props.context.comment.setCommentList(documentCommentList.value)
}

//修改评论内容
const editComment = (index: number, text: string) => {
    documentCommentList.value[index].content = text
    props.context.comment.setCommentList(documentCommentList.value)
}

//移动shape时保存shape身上的评论坐标
const saveShapeCommentXY = () => {
    const shapesId = props.context.comment.commentShape;
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const shapes: ShapeView[] = []
    shapesId.forEach((id: string) => {
        const shape = page.getShape(id);
        if (shape) {
            shapes.push(shape);
        }
    })
    const sleectShapes = flattenShapes(shapes)
    sleectShapes.forEach((item: ShapeView) => {
        documentCommentList.value.forEach((comment, i) => {
            if (comment.target_shape_id === item.id) {
                editShapeComment(i, comment.shape_frame.x1, comment.shape_frame.y1)
            }
        })
    })
    props.context.comment.editShapeComment(false, [])
}

function commentWatcher(type?: number) { // 更新编辑器状态，包括光标状态、是否正在进行图形变换
    if (type === Comment.UPDATE_COMMENT_POS) {
        saveShapeCommentXY();
    }
    //更新评论
    if (type === Comment.EDIT_COMMENT) {
        const timer = setTimeout(() => {
            getDocumentComment()
            clearTimeout(timer)
        }, 100);
    } else if (type === Comment.TOGGLE_COMMENT_PAGE) {
        documentCommentList.value = []
        const timer = setTimeout(() => {
            getDocumentComment()
            clearTimeout(timer)
        }, 100);
    }
    if (type === Comment.UPDATE_PAGE_COMMENT) {
        documentCommentList.value = props.context.comment.pageCommentList
    }
    if (type === Comment.UPDATE_COMMENT) {
        props.context.comment.updateCommentList(props.pageId)
        documentCommentList.value = props.context.comment.pageCommentList
    }
}

const docComment = (comment: DocCommentOpData) => {
    if (comment.comment.content) {
        comment.comment.content = comment.comment.content.replaceAll("\r\n", "<br/>").replaceAll("\n", "<br/>").replaceAll(" ", "&nbsp;")
    }
    const index = documentCommentList.value.findIndex(item => item.id === comment.comment.id)
    if (comment.type === DocCommentOpType.Update) {
        if (index !== -1) {
            documentCommentList.value[index] = {
                ...documentCommentList.value[index],
                ...comment.comment
            }
        } else {
            documentCommentList.value.forEach((item, i) => {
                if(item.children && item.children.length) {
                    const _index = item.children.findIndex((child: any) => child.id === comment.comment.id)
                    if (_index !== -1) {
                        documentCommentList.value[i].children = {
                            ...documentCommentList.value[i].children,
                            ...comment.comment
                        }
                        props.context.comment.setCommentList(documentCommentList.value);
                        props.context.comment.onUpdateComment();
                    }
                }
            })
        }
    } else if (comment.type === DocCommentOpType.Del) {
        if (index !== -1) {
            documentCommentList.value.splice(index, 1)
        } else {
            documentCommentList.value.forEach((item, i) => {
                if(item.children && item.children.length) {
                    const _index = item.children.findIndex((child: any) => child.id === comment.comment.id)
                    if (_index !== -1) {
                        documentCommentList.value[i].children.splice(index, 1);
                        props.context.comment.setCommentList(documentCommentList.value);
                        props.context.comment.onUpdateComment();
                    }
                }
            })
        }
    } else if (comment.type === DocCommentOpType.Add) {
        if (!comment.comment.root_id) {
            documentCommentList.value.unshift(comment.comment)
        } else {
            const _index = documentCommentList.value.findIndex(item => item.id === comment.comment.root_id);
            if (_index !== -1) {
                if (!documentCommentList.value[_index].children) {
                    documentCommentList.value[_index].children = []
                    documentCommentList.value[_index].commentMenu = commentMenuItems.value
                }
                documentCommentList.value[_index].children.unshift(comment.comment);
                props.context.comment.onUpdateComment();
            }
        }
    }
}
onMounted(() => {
    const updateComment = props.context.communication.docCommentOp
    updateComment.addUpdatedHandler(docComment)
    getDocumentComment()
    props.context.comment.watch(commentWatcher);
})

onUnmounted(() => {
    const updateComment = props.context.communication.docCommentOp
    updateComment.removeUpdatedHandler(docComment)
    props.context.comment.unwatch(commentWatcher);
})
</script>

<template>
    <PageCommentItem ref="commentItem" :context="props.context" @moveCommentPopup="downMoveCommentPopup"
        :matrix="matrix.toArray()" @delete-comment="deleteComment" @resolve="resolve" :reflush="commentReflush"
        v-for="(item, index) in documentCommentList" :key="item.id" :commentInfo="item" :index="index" @recover="recover"
        @editComment="editComment" @updateShapeComment="updateShapeComment" :myComment="aboutMe()" :docList="documentCommentList" >
    </PageCommentItem>
</template>

<style scoped lang="scss"></style>