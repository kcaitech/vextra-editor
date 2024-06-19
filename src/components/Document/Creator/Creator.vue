<script setup lang="ts">
import { Context } from '@/context';
import { ClientXY, PageXY, XY } from '@/context/selection';
import { Action, Tool } from '@/context/tool';
import { ContactForm, CurvePoint } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// import CommentInput from '../Content/CommentInput.vue';
// import { useRoute } from 'vue-router';
// import { searchCommentShape } from '@/utils/comment';
import ContactInit from '../Toolbar/ContactInit.vue';
import { Cursor } from '@/context/cursor';
import { PathEditor } from "@/transform/pathEdit";
import { PathShapeView } from "@kcdesign/data";
import { CreatorExecute } from "./execute";

interface Props {
    context: Context,
    params: {
        visible: boolean
    }
}

const props = defineProps<Props>();

const dragActiveDis = 5;
const t = useI18n().t;
let isDrag: boolean = false;
let just_search: boolean = false;

// #region
// const commentInput = ref<boolean>(false);
// const commentPosition: ClientXY = reactive({ x: 0, y: 0 });
// type CommentInputEl = InstanceType<typeof CommentInput>;
// const commentEl = ref<CommentInputEl>();
const shapeID = ref('')
const shapePosition: ClientXY = reactive({ x: 0, y: 0 });
// const route = useRoute()
const posi = ref({ x: 0, y: 0 });
const rootWidth = ref<number>(props.context.workspace.root.width);
const cursor = ref<string>('');

const mode = ref<'normal' | 'pen'>('normal');

const dotXY = ref<XY>({ x: -10, y: -10 });
let pathEditor: PathEditor | undefined;

let creatorHdl: undefined | CreatorExecute = undefined;
let downXY: XY = { x: 0, y: 0 };

// #endregion
function down(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    // creator 中的特殊场景之一，该场景需要交给 PathEditor 处理。
    if (mode.value === 'pen') {
        pathEditor = new PathEditor(props.context, e);
        pathEditor.createApiCaller(-1, -1, true);

        const vec = pathEditor.createVec();
        if (!vec) {
            return;
        }
        const page = props.context.selection.selectedPage!;
        props.context.nextTick(page, () => {
            const _vec = page.getShape(vec.id);
            if (!_vec) {
                return;
            }

            props.context.selection.selectShape(_vec);

            props.context.workspace.setPathEditMode(true);

            const path = props.context.path;

            path.setContactStatus(true);
            path.setBridgeParams({ handler: pathEditor!, segment: 0, index: 0, e });

            const point = (_vec as PathShapeView).segments[0].points[0] as CurvePoint;
            if (point) {
                path.setLastPoint({ point, segment: 0, index: 0 });
            }

            mode.value = 'normal';
        });
        return;
    }

    const action = props.context.tool.action;

    if (creatorHdl) {
        return;
    }

    // if (action !== Action.AddComment) {
        // commentInput.value = false;
        creatorHdl = new CreatorExecute(props.context, e);
    // }

    if (action === Action.AddContact) {
        just_search = true;
        creatorHdl?.initContact();
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        return;
    }

    if (isDrag) {
        creatorHdl?.modifyFrame(e);
    } else if (Math.hypot(e.x - downXY.x, e.y - downXY.y) > dragActiveDis) {
        if (!creatorHdl?.asyncApiCaller) {
            creatorHdl?.createApiCaller();
        }
        isDrag = true;
    }
}

function move2(e: MouseEvent) {
    if (just_search || e.buttons === 0) {
        dotXY.value = props.context.workspace.getContentXY(e);

        if (props.context.tool.action === Action.AddContact) {
            search_apex(e);
        }
    }
}

function up(e: MouseEvent) {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);

    // if (!isDrag && props.context.tool.action.startsWith('add')) {

    //     if (props.context.tool.action === Action.AddComment) {
    //         isDrag = false;
    //         // return addComment(e);
    //     }
    // }

    creatorHdl?.fulfil();
    creatorHdl = undefined;
    just_search = false;
}

// #region 评论
// const detectionShape = (e: MouseEvent) => {
//     const workspace = props.context.workspace;
//     const { x, y } = workspace.getContentXY(e);
//     const xy = workspace.matrix.inverseCoord(x, y);
//     const shapes = searchCommentShape(props.context, xy);
//     if (shapes.length === 0) { //点击的位置是否有图形
//         shapePosition.x = 0
//         shapePosition.y = 0
//         shapeID.value = props.context.selection.selectedPage!.id
//     } else {
//         const shape = shapes[0]
//         const fp = shape.frame2Root();
//         const frameXY = { x: fp.x, y: fp.y }
//         shapePosition.x = xy.x - frameXY.x //评论输入框相对于shape的距离
//         shapePosition.y = xy.y - frameXY.y
//         shapeID.value = shape.id
//     }
//     return { x, y, xy }
// }
// const addComment = (e: MouseEvent) => {
//     e.stopPropagation()
//     const comment = props.context.comment;
//     if (e.target instanceof Element && e.target.closest(`.comment-mark-item`)) {
//         return
//     }

//     if (comment.isCommentInput) {
//         comment.commentOpacity(false)
//         comment.commentInput(false)
//         return
//     }

//     if (commentInput.value) {
//         return;
//     }
//     const { x, y, xy } = detectionShape(e)
//     commentPosition.x = xy.x; //评论输入框在页面的坐标
//     commentPosition.y = xy.y;

//     posi.value.x = x // 评论弹出框的位置坐标
//     posi.value.y = y
//     commentInput.value = true;

//     props.context.escstack.save('comment-input-visible', () => {
//         const achieve = commentInput.value;
//         commentInput.value = false;
//         return achieve;
//     })
// }

// const getCommentInputXY = (e: MouseEvent) => {
//     const { x, y, xy } = detectionShape(e)
//     commentPosition.x = xy.x;
//     commentPosition.y = xy.y;
//     posi.value.x = x
//     posi.value.y = y
// }
//移动输入框
// const mouseDownCommentInput = (e: MouseEvent) => {
//     e.stopPropagation();
//     const comment = props.context.comment;
//     comment.moveCommentInput(true);
//     document.addEventListener("mousemove", mouseMoveInput);
//     document.addEventListener("mouseup", mouseUpCommentInput);
// }
const mouseMoveInput = (e: MouseEvent) => {
    e.stopPropagation()
    // getCommentInputXY(e)
}
const mouseUpCommentInput = (e: MouseEvent) => {
    // detectionShape(e)
    // const comment = props.context.comment;
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
    // comment.moveCommentInput(false);
}

// 取消评论输入框
// const closeComment = (e?: MouseEvent) => {
//     if (e && e.target instanceof Element && e.target.closest('#content') && !e.target.closest('.container-popup')) {
//         commentInput.value = false;
//     } else if (!e) {
//         commentInput.value = false;
//     }
// }
// // 调用评论API，并通知listTab组件更新评论列表
// const completed = (succession: boolean, event?: MouseEvent) => {
//     commentInput.value = false;
//     if (succession && event) {
//         addComment(event);
//     }
// }

// #region 连接线
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

function contact_init(e: MouseEvent, apex?: ContactForm) {
    creatorHdl = new CreatorExecute(props.context, e);

    creatorHdl.initContact(apex);

    just_search = true;

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

// #endregion
function e_contact_to(apex: ContactForm, p2: PageXY) {
    creatorHdl?.contactTo(apex, p2);
}

function cursor_watcher(t: number, type: string) {
    if (t === Cursor.CHANGE_CURSOR && type) {
        cursor.value = type;
    }
}

function windowBlur() {
    creatorHdl?.fulfil();

    creatorHdl = undefined;
    isDrag = false;
    just_search = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

function init() {
    let timer: any = setTimeout(() => {
        const action = props.context.tool.action;
        // if (action === Action.AddComment) {
        //     props.context.cursor.setType('comment', 0);
        // } else 
        if (action === Action.Pen) {
            props.context.cursor.setType('pen', 0);
            mode.value = 'pen';
        } else {
            props.context.cursor.setType('cross', 0)
        }

        cursor.value = props.context.cursor.type;
        clearTimeout(timer);
        timer = null;
    }, 20);
    props.context.assist.set_collect_target([], true);
    props.context.selection.unHoverShape();
}

function toolWatcher(t: number) {
    const action = props.context.tool.action;
    if (t === Tool.CHANGE_ACTION) {
        mode.value = 'normal';
        if (action === Action.Pen) {
            mode.value = 'pen';
        }
    }
}

onMounted(() => {
    init();
    props.context.cursor.watch(cursor_watcher);
    props.context.tool.watch(toolWatcher);
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    props.context.cursor.unwatch(cursor_watcher);
    props.context.tool.unwatch(toolWatcher);
    window.removeEventListener('blur', windowBlur);
})
</script>
<template>
    <div @mousedown="down" @mousemove="move2" :class="`creator ${cursor}`" v-if="props.params.visible">
        <ContactInit :context="props.context" @contact-init="contact_init" @contact-to="e_contact_to"></ContactInit>
        <div v-if="mode === 'pen'" class="dot" :style="{left: (dotXY.x - 4) + 'px', top: (dotXY.y - 4) + 'px'}"></div>
    </div>
</template>
<style scoped lang="scss">
.creator {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;

    .dot {
        position: absolute;
        width: 8px;
        height: 8px;
        box-sizing: border-box;
        border-radius: 50%;
        background-color: #ffffff;
        border: 1px solid var(--active-color);

        pointer-events: none;
    }
}
</style>