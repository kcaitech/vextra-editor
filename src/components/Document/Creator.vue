<script setup lang="ts">
import { Context } from '@/context';
import { ClientXY, PageXY } from '@/context/selection';
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
import { collect } from '@/utils/artboardFn';
import { getHorizontalAngle } from '@/utils/common';
import { flattenShapes, init_contact_shape, init_insert_shape, init_shape, list2Tree } from '@/utils/content';
import { get_direction } from '@/utils/controllerFn';
import { EffectType, Wheel, fourWayWheel } from '@/utils/wheel';
import { Artboard, AsyncCreator, ContactForm, GroupShape, Matrix, Shape, ShapeFrame, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentInput from './Content/CommentInput.vue';
import { useRoute } from 'vue-router';
import { searchCommentShape } from '@/utils/comment';
import * as comment_api from '@/apis/comment';
import ContactInit from './Toolbar/ContactInit.vue';
import { get_contact_environment } from '@/utils/contact';

interface Props {
    context: Context
}
const props = defineProps<Props>();

const dragActiveDis = 4; // 拖动 4px 后开始触发移动
const t = useI18n().t;
let newShape: Shape | undefined;
let wheel: Wheel | undefined;
let asyncCreator: AsyncCreator | undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
let page_xy_1: PageXY = { x: 0, y: 0 };
let client_xy_1: ClientXY = { x: 0, y: 0 };
let matrix1: Matrix = new Matrix(props.context.workspace.matrix.inverse);
let isDrag: boolean = false;
let just_search: boolean = false;

// #region
const commentInput = ref<boolean>(false);
const commentPosition: ClientXY = reactive({ x: 0, y: 0 });
type CommentInputEl = InstanceType<typeof CommentInput>;
const commentEl = ref<CommentInputEl>();
const shapeID = ref('')
const shapePosition: ClientXY = reactive({ x: 0, y: 0 });
const documentCommentList = ref<any[]>(props.context.comment.pageCommentList);
const route = useRoute()
const posi = ref({ x: 0, y: 0 });
const rootWidth = ref<number>(props.context.workspace.root.width);
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
// #endregion

function down(e: MouseEvent) {
    if (e.button === 0) {
        const action = props.context.tool.action;
        modify_page_xy_1(e);
        modify_client_xy_1(e);
        wheelSetup();
        if (action !== Action.AddComment) commentInput.value = false;
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    }
}
function move(e: MouseEvent) {
    if (e.buttons === 1) {
        if (newShape) {
            modify_new_shape_frame(e);
        } else if (Math.hypot(e.clientX - client_xy_1.x, e.clientY - client_xy_1.y) > dragActiveDis) {
            gen_new_shape(e);
            isDrag = true;
        }
    }
}
function move2(e: MouseEvent) {
    if (just_search || (e.buttons === 0 && props.context.tool.action === Action.AddContact)) search_apex(e);
}
function up(e: MouseEvent) {
    removeWheel();
    if (commentInput.value) commentInput.value = false;
    if (isDrag && newShape) {
        shapeCreateEnd();
    } else if (props.context.tool.action.startsWith('add')) {
        const action = props.context.tool.action;
        if (action === Action.AddComment) return addComment(e);
        if (action !== Action.AddContact && action !== Action.AddTable) {
            init_insert_shape(props.context, page_xy_1, t);
        }
    }
    isDrag = false, just_search = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
}
// #region 评论
const detectionShape = (e: MouseEvent) => {
    const workspace = props.context.workspace;
    const { x, y } = workspace.root;
    const xy = matrix1.computeCoord2(e.clientX - x, e.clientY - y);
    const shapes = searchCommentShape(props.context, xy);
    if (shapes.length === 0) { //点击的位置是否有图形
        shapePosition.x = 0
        shapePosition.y = 0
        shapeID.value = props.context.selection.selectedPage!.id
    } else {
        const shape = shapes[0]
        const fp = shape.frame2Root();
        const farmeXY = { x: fp.x, y: fp.y }
        shapePosition.x = xy.x - farmeXY.x //评论输入框相对于shape的距离
        shapePosition.y = xy.y - farmeXY.y
        shapeID.value = shape.id
    }
    return { x, y, xy }
}
const addComment = (e: MouseEvent) => {
    e.stopPropagation()
    const comment = props.context.comment;
    if (comment.isCommentInput && e.target instanceof Element && !e.target.closest(`.comment-mark-item`)) {
        comment.commentOpacity(false)
        comment.commentInput(false)
        return
    } else if (e.target instanceof Element && e.target.closest(`.comment-mark-item`)) {
        return
    }
    if (commentInput.value) return
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x; //评论输入框在页面的坐标
    commentPosition.y = xy.y;
    posi.value.x = e.clientX - x // 评论弹出框的位置坐标
    posi.value.y = e.clientY - y
    commentInput.value = true;
    document.addEventListener('keydown', commentEsc);
}
const getCommentInputXY = (e: MouseEvent) => {
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x;
    commentPosition.y = xy.y;
    posi.value.x = e.clientX - x
    posi.value.y = e.clientY - y
}
const commentEsc = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        document.removeEventListener('keydown', commentEsc);
        commentInput.value = false;
    }
}
//移动shape时保存shape身上的评论坐标
const saveShapeCommentXY = () => {
    const comment = props.context.comment;
    const shapes = comment.commentShape
    const sleectShapes = flattenShapes(shapes)
    const commentList = props.context.comment.pageCommentList
    sleectShapes.forEach((item: any) => {
        commentList.forEach((comment: any, i: number) => {
            if (comment.target_shape_id === item.id) {
                editShapeComment(i, comment.shape_frame.x1, comment.shape_frame.y1)
            }
        })
    })
    comment.editShapeComment(false, undefined)
}
//移动输入框
const mouseDownCommentInput = (e: MouseEvent) => {
    document.addEventListener("mousemove", mouseMoveInput);
    document.addEventListener("mouseup", mouseUpCommentInput);
}
const mouseMoveInput = (e: MouseEvent) => {
    e.stopPropagation()
    getCommentInputXY(e)
}
const mouseUpCommentInput = (e: MouseEvent) => {
    detectionShape(e)
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
}
const editShapeComment = (index: number, x: number, y: number) => {
    const comment = documentCommentList.value[index]
    const id = comment.id
    const shapeId = comment.target_shape_id
    const { x2, y2 } = comment.shape_frame
    const data = {
        id: id,
        target_shape_id: shapeId,
        shape_frame: { x1: x, y1: y, x2: x2, y2: y2 }
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
// 取消评论输入框
const closeComment = (e?: MouseEvent) => {
    if (e && e.target instanceof Element && e.target.closest('#content') && !e.target.closest('.container-popup')) {
        commentInput.value = false;
    } else if (!e) {
        commentInput.value = false;
    }
}
// 调用评论API，并通知listTab组件更新评论列表
const completed = () => {
    props.context.comment.sendComment()
    const timer = setTimeout(() => {
        getDocumentComment()
        clearTimeout(timer)
        commentInput.value = false;
    }, 150);
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
            const comment = props.context.comment;
            const list = list2Tree(manageData, '')
            comment.setNot2TreeComment(manageData)
            comment.setPageCommentList(list, props.context.selection.selectedPage!.id)
            comment.setCommentList(list)
            documentCommentList.value = comment.pageCommentList
            if (props.context.selection.isSelectComment) {
                props.context.selection.selectComment(props.context.selection.commentId)
                documentCommentList.value = comment.pageCommentList
                props.context.selection.setCommentSelect(false)
            }
        }
    } catch (err) {
        console.log(err);
    }
}
// #endregion

// #region 连接线
let apex1: ContactForm | undefined, apex2: ContactForm | undefined;
let page_xy2: PageXY | undefined;

function search_apex(e: MouseEvent) {
    const { x, y } = props.context.workspace.root;
    const xy = props.context.workspace.matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const shapes = props.context.selection.getContactByXY(xy);
    if (shapes.length) {
        props.context.tool.setContactApex(shapes[0]);
    } else {
        props.context.tool.resetContactApex();
    }
}
function contact_init(e: MouseEvent, apex?: ContactForm, p2?: PageXY) {
    down(e);
    apex1 = apex, page_xy2 = p2, just_search = true;
}
function modify_contact_to(e: MouseEvent, ac: AsyncCreator) {
    const root = props.context.workspace.root;
    const p = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    ac.contact_to(p);
    const points = newShape!.getPoints();
    const environment = get_contact_environment(props.context, newShape!, points);
    if (newShape!.parent?.id !== environment.id) {
        asyncCreator
    }
    ac.migrate(environment as GroupShape);
}
// #endregion
function modify_page_xy_1(e: MouseEvent) {
    const { x, y } = props.context.workspace.root;
    matrix1 = new Matrix(props.context.workspace.matrix.inverse);
    page_xy_1 = matrix1.computeCoord2(e.clientX - x, e.clientY - y);
}
function modify_client_xy_1(e: MouseEvent) {
    client_xy_1.x = e.clientX, client_xy_1.y = e.clientY;
}
function correct_page_xy(x: number, y: number) {
    const stickness = props.context.assist.stickness + 1;
    const target = props.context.assist.create_match({ x, y });
    if (target) {
        if (stickedX) {
            if (Math.abs(x - sticked_x_v) > stickness) stickedX = false;
            else x = sticked_x_v;
        } else if (target.sticked_by_x) {
            x = target.x;
            sticked_x_v = x;
            stickedX = true;
        }
        if (stickedY) {
            if (Math.abs(y - sticked_y_v) > stickness) stickedY = false;
            else y = sticked_y_v;
        } else if (target.sticked_by_y) {
            y = target.y;
            sticked_y_v = y;
            stickedY = true;
        }
    }
    return { x, y }
}
/**
 * @description 等比设置frame
 */
function er_frame(asyncCreator: AsyncCreator, x: number, y: number) {
    if (newShape && newShape.type === ShapeType.Line) {
        const p2 = { x, y };
        const m = newShape.matrix2Root(), lt = m.computeCoord2(0, 0);
        const type_d = get_direction(Math.floor(getHorizontalAngle(lt, p2)));
        if (type_d === 0) p2.y = lt.y;
        else if (type_d === 45) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
        }
        else if (type_d === 90) p2.x = lt.x;
        else if (type_d === 135) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
        }
        else if (type_d === 180) p2.y = lt.y;
        else if (type_d === 225) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
        }
        else if (type_d === 270) p2.x = lt.x;
        else if (type_d === 315) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
        }
        asyncCreator.setFrame({ x: p2.x, y: p2.y });
    } else {
        const del = x - page_xy_1.x;
        y = page_xy_1.y + del;
        asyncCreator.setFrame({ x, y });
    }
}
function wheelSetup() {
    wheel = fourWayWheel(props.context, { rolling: undefined }, page_xy_1);
}
function gen_new_shape(e: MouseEvent) {
    const root = props.context.workspace.root;
    const { x, y } = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const shapeFrame = new ShapeFrame(x, y, 1, 1);
    if (props.context.tool.action === Action.AddContact) {
        const result = init_contact_shape(props.context, shapeFrame, page_xy_1, t, apex1, page_xy2);
        if (result) {
            asyncCreator = result.asyncCreator;
            newShape = result.new_shape;
        }
    } else {
        const result = init_shape(props.context, shapeFrame, page_xy_1, t);
        if (result) {
            asyncCreator = result.asyncCreator;
            newShape = result.new_shape;
            props.context.assist.set_trans_target([newShape!]);
        }
    }
}
function modify_new_shape_frame(e: MouseEvent) {
    const root = props.context.workspace.root;
    const { x, y } = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    if (wheel && asyncCreator) {
        const isOut = wheel.moving(e, { type: EffectType.NEW_SHAPE, effect: asyncCreator.setFrameByWheel });
        if (isOut) return;
        if (newShape && newShape.type === ShapeType.Contact) {
            modify_contact_to(e, asyncCreator);
        } else if (e.shiftKey) {
            er_frame(asyncCreator, x, y); // 等比
        } else {
            asyncCreator.setFrame(correct_page_xy(x, y));
        }
    }
}
function e_contact_to(apex: ContactForm, p2: PageXY) {
    if (asyncCreator) {
        asyncCreator.contact_to(p2, apex);
    }
}
function removeWheel() {
    if (wheel) wheel = wheel.remove();
}
function shapeCreateEnd() {
    if (newShape) {
        if (newShape.type === ShapeType.Text) {
            props.context.workspace.notify(WorkSpace.INIT_EDITOR);
        } else if (newShape.type === ShapeType.Artboard) {
            const childs = collect(props.context);
            const page = props.context.selection.selectedPage;
            if (page && asyncCreator) asyncCreator.collect(page, childs, props.context.selection.selectedShapes[0] as Artboard);
        }
        removeCreator();
        props.context.assist.reset();
        newShape = undefined, apex1 = undefined, page_xy2 = undefined;
    }
}
function removeCreator() {
    if (asyncCreator) asyncCreator = asyncCreator.close();
    props.context.workspace.creating(false);
    if (props.context.tool.action !== Action.AddContact) {
        props.context.tool.setAction(Action.AutoV);
        props.context.cursor.setType("auto-0");
    }
}
function windowBlur() {
    shapeCreateEnd();
    removeWheel();
    isDrag = false, just_search = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
onMounted(() => {
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    window.removeEventListener('blur', windowBlur);
})
</script>
<template>
    <div @mousedown.stop="down" @mousemove="move2" class="creator">
        <CommentInput v-if="commentInput" :context="props.context" :x1="commentPosition.x" :y1="commentPosition.y"
            :pageID="props.context.selection.selectedPage!.id" :shapeID="shapeID" ref="commentEl" :rootWidth="rootWidth"
            @close="closeComment" @mouseDownCommentInput="mouseDownCommentInput" :matrix="props.context.workspace.matrix"
            :x2="shapePosition.x" :y2="shapePosition.y" @completed="completed" :posi="posi"></CommentInput>
        <ContactInit :context="props.context" @contact-init="contact_init" @contact-to="e_contact_to"></ContactInit>
    </div>
</template>
<style scoped lang="scss">
.creator {
    // background-color: rgba($color: #006600, $alpha: 0.2);
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}
</style>