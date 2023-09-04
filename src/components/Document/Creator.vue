<script setup lang="ts">
import { Context } from '@/context';
import { ClientXY, PageXY } from '@/context/selection';
import { Action } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';
import { collect } from '@/utils/artboardFn';
import { getHorizontalAngle } from '@/utils/common';
import { init_contact_shape, init_insert_shape, init_shape } from '@/utils/content';
import { get_direction } from '@/utils/controllerFn';
import { EffectType, Wheel, fourWayWheel } from '@/utils/wheel';
import { Artboard, AsyncCreator, ContactForm, Matrix, Shape, ShapeFrame, ShapeType } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const commentInput = ref<boolean>(false);
const dragActiveDis = 4; // 拖动 4px 后开始触发移动
const t = useI18n().t;
let newShape: Shape | undefined;
let wheel: Wheel | undefined;
let asyncCreator: AsyncCreator | undefined;
let apex: ContactForm | undefined;
let temp: PageXY | undefined;
let stickedX: boolean = false;
let stickedY: boolean = false;
let sticked_x_v: number = 0;
let sticked_y_v: number = 0;
let page_xy_1: PageXY = { x: 0, y: 0 };
let client_xy_1: ClientXY = { x: 0, y: 0 };
let matrix1: Matrix = new Matrix(props.context.workspace.matrix.inverse);
let isDrag: boolean = false;
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
    if (e.buttons === 0) {
        search_apex(e);
    } else if (e.buttons === 1) {
        if (newShape) {
            modify_new_shape_frame(e);
        } else if (Math.hypot(e.clientX - client_xy_1.x, e.clientY - client_xy_1.y) > dragActiveDis) {
            gen_new_shape(e);
            isDrag = true;
        }
    }
}
function up() {
    removeWheel();
    if (commentInput.value) commentInput.value = false;
    if (isDrag && newShape) {
        shapeCreateEnd();
    }else if (props.context.tool.action.startsWith('add')) {
        init_insert_shape(props.context, page_xy_1, t);
    }
    isDrag = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
}
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
function search_apex(e: MouseEvent) {
    if (props.context.workspace.transforming) return;
    const { x, y } = props.context.workspace.root;
    const xy = matrix1.computeCoord2(e.clientX - x, e.clientY - y);
    const shapes = props.context.selection.getShapesByXY(xy, true); // xy: PageXY
    if (shapes.length) {
        props.context.tool.setContactApex(shapes[0]);
    } else {
        props.context.tool.resetContactApex();
    }
}
function gen_new_shape(e: MouseEvent) {
    const root = props.context.workspace.root;
    const { x, y } = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const shapeFrame = new ShapeFrame(x, y, 1, 1);
    if (props.context.tool.action === Action.AddContact) {
        const result = init_contact_shape(props.context, shapeFrame, page_xy_1, t, apex, temp);
        if (result) {
            asyncCreator = result.asyncCreator;
            newShape = result.new_shape;
        }
    } else {
        const result = init_shape(props.context, shapeFrame, page_xy_1, t);
        if (result) {
            asyncCreator = result.asyncCreator;
            newShape = result.new_shape;
            props.context.assist.setTransTarget([newShape!]);
        }
    }
}
function modify_new_shape_frame(e: MouseEvent) {
    const root = props.context.workspace.root;
    const { x, y } = matrix1.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    if (wheel && asyncCreator) {
        const isOut = wheel.moving(e, { type: EffectType.NEW_SHAPE, effect: asyncCreator.setFrameByWheel });
        if (!isOut) {
            if (e.shiftKey) {
                er_frame(asyncCreator, x, y);
            } else {
                asyncCreator.setFrame(correct_page_xy(x, y));
            }
        }
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
        newShape = undefined, apex = undefined, temp = undefined;
    }
}
function removeCreator() {
    if (asyncCreator) asyncCreator = asyncCreator.close();
    props.context.workspace.creating(false);
    props.context.tool.setAction(Action.AutoV);
    props.context.cursor.setType("auto-0");
}
function windowBlur() {
    shapeCreateEnd();
    removeWheel();
    isDrag = false;
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
    <div @mousedown.stop="down" class="creator">
    </div>
</template>
<style scoped lang="scss">
.creator {
    cursor: -webkit-image-set(url('data:image/png;base64,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') 2x) 13 13, auto !important;
    background-color: rgba($color: #006600, $alpha: 0.2);
    width: 100%;
    height: 100%;
    position: absolute;
}
</style>