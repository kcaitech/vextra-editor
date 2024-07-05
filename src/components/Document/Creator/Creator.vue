<script setup lang="ts">
import { Context } from '@/context';
import { PageXY, XY } from '@/context/selection';
import { Action, Tool } from '@/context/tool';
import { ContactForm, CurvePoint, PathShapeView } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ContactInit from '../Toolbar/ContactInit.vue';
import { Cursor } from '@/context/cursor';
import { PathEditor } from "@/transform/pathEdit";
import { CreatorExecute } from "./execute";

interface Props {
    context: Context,
    params: {
        visible: boolean
    }
}

const props = defineProps<Props>();

const dragActiveDis = 5;
let isDrag: boolean = false;
let just_search: boolean = false;

const cursor = ref<string>('');

const mode = ref<'normal' | 'pen'>('normal');

const dotXY = ref<XY>({ x: -10, y: -10 });
let pathEditor: PathEditor | undefined;

let creatorHdl: undefined | CreatorExecute = undefined;
let downXY: XY = { x: 0, y: 0 };

function down(e: MouseEvent) {
    if (e.button !== 0) return;

    downXY = e;

    const ctx = props.context;

    console.log('__DOWN_MODE__', mode.value);

    // creator 中的特殊场景之一，该场景需要交给 PathEditor 处理。
    if (mode.value === 'pen') {
        pathEditor = new PathEditor(ctx, e);
        pathEditor.createApiCaller(-1, -1, true);

        const vec = pathEditor.createVec();
        if (!vec) return;
        const page = ctx.selection.selectedPage!;
        ctx.nextTick(page, () => {
            const _vec = page.getShape(vec.id);
            if (!_vec) return;

            ctx.selection.selectShape(_vec);
            ctx.workspace.setPathEditMode(true);

            nextTick(() => {
                ctx.tool.setAction(Action.Pen);

                const path = ctx.path;

                path.setContactStatus(true);
                path.setBridgeParams({ handler: pathEditor!, segment: 0, index: 0, e });

                const point = (_vec as PathShapeView).segments[0].points[0] as CurvePoint;
                if (point) {
                    path.setLastPoint({ point, segment: 0, index: 0 });
                }

                mode.value = 'normal';
            })
        });
        return;
    }

    const action = ctx.tool.action;

    if (creatorHdl) return;

    creatorHdl = new CreatorExecute(ctx, e);

    if (action === Action.AddContact) {
        just_search = true;
        creatorHdl?.initContact();
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) return;

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

    isDrag = false;
    creatorHdl?.fulfil();
    creatorHdl = undefined;
    just_search = false;
}

const mouseMoveInput = (e: MouseEvent) => {
    e.stopPropagation()
}
const mouseUpCommentInput = (e: MouseEvent) => {
    document.removeEventListener('mousemove', mouseMoveInput);
    document.removeEventListener('mouseup', mouseUpCommentInput);
}

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
<div v-if="props.params.visible" @mousedown="down" @mousemove="move2" :class="`creator ${cursor}`">
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