<script setup lang="ts">
import { Context } from '@/context';
import { ClientXY, PageXY } from '@/context/selection';
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
import { collect } from '@/utils/artboardFn';
import { getHorizontalAngle, modifyXYByAlignSetting } from '@/utils/common';
import { init_contact_shape, init_insert_shape, init_shape } from '@/utils/content';
import { get_direction } from '@/utils/controllerFn';
import { Wheel, fourWayWheel } from '@/utils/wheel';
import {
    Artboard,
    AsyncCreator,
    ContactForm,
    ContactLineView,
    GroupShape,
    Matrix,
    PageView,
    ShapeFrame,
    ShapeType,
    ShapeView,
    adapt2Shape
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentInput from '../Content/CommentInput.vue';
import { useRoute } from 'vue-router';
import { searchCommentShape } from '@/utils/comment';
import ContactInit from '../Toolbar/ContactInit.vue';
import { get_contact_environment } from '@/utils/contact';
import { Cursor } from '@/context/cursor';
import { debounce } from 'lodash';
import { Asssit } from "@/context/assist";
import { CreatorExecute } from "@/components/Document/Creator/execute";

interface Props {
    context: Context
}

const props = defineProps<Props>();

const dragActiveDis = 4; // 拖动 4px 后开始触发移动
const t = useI18n().t;
let newShape: ShapeView | undefined;
let wheel: Wheel | undefined;
let asyncCreator: AsyncCreator | undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
let page_xy_1: PageXY = { x: 0, y: 0 };
let page_xy_2: PageXY = { x: 0, y: 0 };

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
const route = useRoute()
const posi = ref({ x: 0, y: 0 });
const rootWidth = ref<number>(props.context.workspace.root.width);
const cursor = ref<string>('');

let creatorHdl: undefined | CreatorExecute = undefined;

// #endregion
function down(e: MouseEvent) {
    if (e.button === 0) {
        e.stopPropagation();
        const action = props.context.tool.action;
        modify_page_xy_1(e);
        modify_client_xy_1(e);
        if (action !== Action.AddComment) {
            commentInput.value = false;
        }
        if (action === Action.AddContact) {
            just_search = true;
        }

        creatorHdl = new CreatorExecute(props.context, e);

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    }
}

function move(e: MouseEvent) {
    if (e.buttons === 1) {
        // if (newShape) {
        if (isDrag) {
            // modify_new_shape_frame(e);
            creatorHdl?.modifyFrame(e);
        // } else if (!isDrag && Math.hypot(e.clientX - client_xy_1.x, e.clientY - client_xy_1.y) > dragActiveDis) {
        } else if (Math.hypot(e.clientX - client_xy_1.x, e.clientY - client_xy_1.y) > dragActiveDis) {
            // const __xy2 = props.context.workspace.getContentXY(e);
            // page_xy_2 = matrix1.computeCoord(__xy2);
            // gen_new_shape(e);
            creatorHdl?.createApiCaller();

            isDrag = true;
        }
    }
}

function move2(e: MouseEvent) {
    if (just_search || e.buttons === 0) {
        if (props.context.tool.action === Action.AddContact) {
            search_apex(e);
        }
    }
}

function up(e: MouseEvent) {
    // if (isDrag && newShape) {
    //     shapeCreateEnd();
    // } else if (!isDrag && props.context.tool.action.startsWith('add')) {
    //     const action = props.context.tool.action;
    //     if (action === Action.AddComment) return addComment(e);
    //     if (action !== Action.AddContact && action !== Action.AddTable) {
    //         init_insert_shape(props.context, page_xy_1, t, e.shiftKey);
    //     }
    // }
    creatorHdl?.fulfil();
    isDrag = false;
    just_search = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
}

// #region 评论
const detectionShape = (e: MouseEvent) => {
    const workspace = props.context.workspace;
    const { x, y } = workspace.getContentXY(e);
    const xy = matrix1.computeCoord2(x, y);
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
    if (e.target instanceof Element && e.target.closest(`.comment-mark-item`)) {
        return
    }

    if (comment.isCommentInput) {
        comment.commentOpacity(false)
        comment.commentInput(false)
        return
    }

    if (commentInput.value) {
        return;
    }
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x; //评论输入框在页面的坐标
    commentPosition.y = xy.y;

    posi.value.x = x // 评论弹出框的位置坐标
    posi.value.y = y
    commentInput.value = true;
    document.addEventListener('keydown', commentEsc);
}

const getCommentInputXY = (e: MouseEvent) => {
    const { x, y, xy } = detectionShape(e)
    commentPosition.x = xy.x;
    commentPosition.y = xy.y;
    posi.value.x = x
    posi.value.y = y
}
const commentEsc = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        document.removeEventListener('keydown', commentEsc);
        commentInput.value = false;
    }
}
//移动输入框
const mouseDownCommentInput = (e: MouseEvent) => {
    e.stopPropagation();
    const comment = props.context.comment;
    comment.moveCommentInput(true);
    document.addEventListener("mousemove", mouseMoveInput);
    document.addEventListener("mouseup", mouseUpCommentInput);
}
const mouseMoveInput = (e: MouseEvent) => {
    e.stopPropagation()
    getCommentInputXY(e)
}
const mouseUpCommentInput = (e: MouseEvent) => {
    detectionShape(e)
    const comment = props.context.comment;
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
    comment.moveCommentInput(false);
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
const completed = (succession: boolean, event?: MouseEvent) => {
    commentInput.value = false;
    if (succession && event) {
        addComment(event);
    }
}

// #region 连接线
let apex1: ContactForm | undefined, apex2: ContactForm | undefined;
let page_xy2: PageXY | undefined;

function search_apex(e: MouseEvent) {
    const { x, y } = props.context.workspace.root;
    const xy = props.context.workspace.matrix.inverseCoord(e.clientX - x, e.clientY - y);
    const shapes = props.context.selection.getContactByXY(xy);
    if (shapes.length) {
        props.context.tool.setContactApex((shapes[0]));
    } else {
        props.context.tool.resetContactApex();
    }
}

function contact_init(e: MouseEvent, apex?: ContactForm, p2?: PageXY) {
    down(e);
    apex1 = apex;
    page_xy2 = p2;
}

const m = debounce((ac: AsyncCreator, environment: ShapeView | PageView) => {
    ac.migrate(adapt2Shape(environment) as GroupShape);
}, 200);

function modify_contact_to(e: MouseEvent, ac: AsyncCreator) {
    const root = props.context.workspace.root;
    const p = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    ac.contact_to(p);
    const points = (newShape as ContactLineView).getPoints();
    const environment = get_contact_environment(props.context, newShape!, points)!;
    if (newShape!.parent?.id !== environment.id) {
        m(ac, environment);
    }
}

// #endregion
function modify_page_xy_1(e: MouseEvent) {
    const rootXY = props.context.workspace.getRootXY(e);

    const assistResult = props.context.assist.alignXY2(rootXY);

    if (assistResult.sticked_by_x) {
        rootXY.x = assistResult.x;
    }
    if (assistResult.sticked_by_y) {
        rootXY.y = assistResult.y;
    }

    page_xy_1 = { ...rootXY };

    modifyXYByAlignSetting(props.context, page_xy_1);

    matrix1 = new Matrix(props.context.workspace.matrix.inverse);
}

function modify_client_xy_1(e: MouseEvent) {
    client_xy_1.x = e.clientX, client_xy_1.y = e.clientY;
}

function correct_page_xy(x: number, y: number) {
    // const stickness = props.context.assist.stickness;
    // const target = props.context.assist.create_match({ x, y });
    // if (target) {
    //     if (stickedX) {
    //         if (Math.abs(x - sticked_x_v) >= stickness) stickedX = false;
    //         else x = sticked_x_v;
    //     } else if (target.sticked_by_x) {
    //         x = target.x;
    //         sticked_x_v = x;
    //         stickedX = true;
    //     }
    //     if (stickedY) {
    //         if (Math.abs(y - sticked_y_v) >= stickness) stickedY = false;
    //         else y = sticked_y_v;
    //     } else if (target.sticked_by_y) {
    //         y = target.y;
    //         sticked_y_v = y;
    //         stickedY = true;
    //     }
    // }
    return { x, y }
}

/**
 * @description 等比设置frame
 */
function er_frame(asyncCreator: AsyncCreator, x: number, y: number) {
    if (!newShape) {
        asyncCreator.setFrame({ x, y });
        return;
    }
    if (newShape.type === ShapeType.Line) {
        const p2 = { x, y };
        const m = newShape.matrix2Root(), lt = m.computeCoord2(0, 0);
        const type_d = get_direction(Math.floor(getHorizontalAngle(lt, p2)));
        if (type_d === 0) {
            p2.y = lt.y;
        } else if (type_d === 45) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
        } else if (type_d === 90) {
            p2.x = lt.x;
        } else if (type_d === 135) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y + len * Math.sin(0.25 * Math.PI);
        } else if (type_d === 180) {
            p2.y = lt.y;
        } else if (type_d === 225) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x - len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
        } else if (type_d === 270) {
            p2.x = lt.x;
        } else if (type_d === 315) {
            const len = Math.hypot(p2.x - lt.x, p2.y - lt.y);
            p2.x = lt.x + len * Math.cos(0.25 * Math.PI), p2.y = lt.y - len * Math.sin(0.25 * Math.PI);
        }

        const align = props.context.user.isPixelAlignMent;
        if (align) {
            p2.x = Math.round(p2.x);
            p2.y = Math.round(p2.y);
        }

        asyncCreator.setFrame({ x: p2.x, y: p2.y });
    } else {
        const del = x - page_xy_1.x;
        y = page_xy_1.y + del;

        const align = props.context.user.isPixelAlignMent;
        if (align) {
            x = Math.round(x);
            y = Math.round(y);
        }

        asyncCreator.setFrame({ x, y });
    }
    props.context.assist.notify(Asssit.CLEAR);
}

function wheelSetup() {
    wheel = fourWayWheel(props.context, { rolling: undefined }, page_xy_1);
}

function gen_new_shape(e: MouseEvent) {
    const _xy = props.context.workspace.getContentXY(e);
    const { x, y } = matrix1.computeCoord2(_xy.x, _xy.y);
    let width = Math.abs(x - page_xy_1.x);
    let height = Math.abs(y - page_xy_1.y);

    if (props.context.user.isPixelAlignMent) {
        width = Math.max(1, width);
        height = Math.max(1, height);
    }

    const shapeFrame = new ShapeFrame(page_xy_1.x, page_xy_1.y, width, height);

    if (props.context.tool.action === Action.AddContact) {
        const result = init_contact_shape(props.context, shapeFrame, page_xy_1, t, apex1, page_xy2);
        if (result) {
            asyncCreator = result.asyncCreator;
            const page = props.context.selection.selectedPage!;
            props.context.nextTick(page, () => {
                newShape = page.getShape(result.new_shape.id);
            })
        }
    } else {
        const result = init_shape(props.context, shapeFrame, page_xy_1, t, e.shiftKey);
        if (result) {
            asyncCreator = result.asyncCreator;
            const page = props.context.selection.selectedPage!;
            props.context.nextTick(page, () => {
                newShape = page.getShape(result.new_shape.id);
                props.context.assist.set_trans_target([(newShape!)]);
            })
        }
    }
}

function modify_new_shape_frame(e: MouseEvent) {
    const _xy = props.context.workspace.getContentXY(e);
    const { x, y } = matrix1.computeCoord2(_xy.x, _xy.y);

    if (asyncCreator) {
        if (newShape && newShape.type === ShapeType.Contact) {
            modify_contact_to(e, asyncCreator);
        } else {
            if (e.shiftKey) {
                er_frame(asyncCreator, x, y); // 等比
            } else {
                const cxy = correct_page_xy(x, y)

                const align = props.context.user.isPixelAlignMent;
                if (align) {
                    cxy.x = Math.round(cxy.x);
                    cxy.y = Math.round(cxy.y);
                }
                asyncCreator.setFrame(cxy);
            }
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
    if (!newShape) {
        return;
    }

    if (newShape.type === ShapeType.Text) {
        props.context.workspace.notify(WorkSpace.INIT_EDITOR, 0);
    } else if (newShape.type === ShapeType.Artboard) {
        const children = collect(props.context);
        const page = props.context.selection.selectedPage;
        if (page && asyncCreator) {
            asyncCreator.collect(page, children.map((s) => adapt2Shape(s)), adapt2Shape(newShape) as Artboard);
        }
    }
    removeCreator();
    props.context.assist.reset();
    newShape = undefined;
    apex1 = undefined;
    page_xy2 = undefined;
}

function removeCreator() {
    if (asyncCreator) {
        asyncCreator = asyncCreator.close();
    }

    props.context.cursor.setType("auto", 0);

    props.context.workspace.creating(false);

    props.context.tool.setAction(Action.AutoV);
}

function cursor_watcher(t: number, type: string) {
    if (t === Cursor.CHANGE_CURSOR && type) {
        cursor.value = type;
    }
}

function windowBlur() {
    shapeCreateEnd();
    removeWheel();
    isDrag = false;
    just_search = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

function init() {
    setTimeout(() => { // dom的进出事件竟然是先enter再leave，这边用定时器强行调整了一下init的顺序
        const action = props.context.tool.action;
        if (action === Action.AddComment) {
            props.context.cursor.setType('comment', 0);
        } else {
            props.context.cursor.setType('cross', 0)
        }

        cursor.value = props.context.cursor.type;
    }, 20);
    props.context.assist.set_collect_target([], true);
    props.context.selection.resetSelectShapes();
}

onMounted(() => {
    init();
    props.context.cursor.watch(cursor_watcher);
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    props.context.cursor.unwatch(cursor_watcher);
    window.removeEventListener('blur', windowBlur);
})
</script>
<template>
    <div @mousedown="down" @mousemove="move2" :class="`creator ${cursor}`">
        <CommentInput v-if="commentInput" :context="props.context" :x1="commentPosition.x" :y1="commentPosition.y"
                      :pageID="props.context.selection.selectedPage!.id" :shapeID="shapeID" ref="commentEl"
                      :rootWidth="rootWidth"
                      @close="closeComment" @mouseDownCommentInput="mouseDownCommentInput"
                      :matrix="props.context.workspace.matrix"
                      :x2="shapePosition.x" :y2="shapePosition.y" @completed="completed" :posi="posi"></CommentInput>
        <ContactInit :context="props.context" @contact-init="contact_init" @contact-to="e_contact_to"></ContactInit>
    </div>
</template>
<style scoped lang="scss">
.creator {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}
</style>