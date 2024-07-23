<script setup lang="ts">
import { Context } from '@/context';
import { Preview } from '@/context/preview';
import { Selection, XY } from '@/context/selection';
import { dbl_action } from '@/utils/mouse_interactive';
import { eventPriority, getPreviewMatrix } from '@/utils/preview';
import { Matrix, PathShapeView, PrototypeEvents, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { ProtoAction } from './actions';


interface Props {
    context: Context
    matrix: Matrix
}

interface PathView {
    path: string,
    viewBox: string,
    height: number,
    width: number
}

export interface EventIndex {
    click: number,
    dblclick: number,
    mousedown: number,
    mouseup: number,
    mouseenter: number,
    hover: number
}

const props = defineProps<Props>();
const tracing_class = reactive({ thick_stroke: false, hollow_fill: false });
const tracingFrame = ref<PathView>({ path: '', viewBox: '', height: 0, width: 0 });
const tracing = ref<boolean>(false);
let downXY: XY = { x: 0, y: 0 };
let isDragging = false;
const saveShape = ref<ShapeView>();
let protoActionFn: ProtoAction | undefined = undefined;
let eventTypeIndex: EventIndex = {
    click: -1,
    dblclick: -1,
    mousedown: -1,
    mouseup: -1,
    mouseenter: -1,
    hover: -1
}

function pathMousedown(e: MouseEvent) {
    const selection = props.context.selection;
    if (props.context.workspace.isPageDragging) {
        return;
    }
    e.stopPropagation();

    if (props.context.preview.menuVisible) {
        props.context.preview.notify(Preview.MENU_VISIBLE);
    }

    const hoveredShape = selection.hoveredShape;
    if (!hoveredShape) {
        return;
    }
    if (!protoActionFn) {
        protoActionFn = new ProtoAction(props.context);
    }
    downXY = { x: e.x, y: e.y };
    if (e.button === 0) {
        const protoActions = hoveredShape.prototypeInterAction;
        if (!protoActions) return;
        if (dbl_action()) {
            if (eventTypeIndex.dblclick > eventTypeIndex.click && eventTypeIndex.dblclick > eventTypeIndex.mousedown && eventTypeIndex.dblclick > eventTypeIndex.mouseup) {
                for (let i = 0; i < protoActions.length; i++) {
                    const protoAction = protoActions[i];
                    const type = protoAction.event.interactionType;
                    if (type === PrototypeEvents.DBCLICK) {
                        console.log('双击事件');
                        protoActionFn.executeActionx(protoAction.actions, props.matrix);
                        break;
                    }
                }
            }
            return;
        }
        if (eventTypeIndex.mousedown > eventTypeIndex.click && eventTypeIndex.mousedown > eventTypeIndex.dblclick) {
            for (let i = 0; i < protoActions.length; i++) {
                const protoAction = protoActions[i];
                const type = protoAction.event.interactionType;
                if (type === PrototypeEvents.MOUSEDOWN) {
                    console.log('按下鼠标');
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                    break;
                }
            }
        }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
    } else if (Math.hypot(e.x - downXY.x, e.y - downXY.y) > 3) {
        const hoveredShape = props.context.selection.hoveredShape;
        if (!hoveredShape) return;
        const protoActions = hoveredShape.prototypeInterAction;
        if (!protoActions) return;
        if (!protoActionFn) {
            protoActionFn = new ProtoAction(props.context);
        }
        for (let i = 0; i < protoActions.length; i++) {
            const protoAction = protoActions[i];
            const type = protoAction.event.interactionType;
            if (type === PrototypeEvents.DRAG) {
                console.log('拖拽事件');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
                break;
            }
        }
        isDragging = true;
    }
}

const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    const hoveredShape = props.context.selection.hoveredShape;
    if (!hoveredShape) return;
    const protoActions = hoveredShape.prototypeInterAction;
    if (!protoActions) return;
    if (!protoActionFn) {
        protoActionFn = new ProtoAction(props.context);
    }
    for (let i = 0; i < protoActions.length; i++) {
        const protoAction = protoActions[i];
        const type = protoAction.event.interactionType;
        if (type === PrototypeEvents.ONCLICK && eventTypeIndex.click > eventTypeIndex.mouseup && eventTypeIndex.click > eventTypeIndex.mousedown && eventTypeIndex.click > eventTypeIndex.dblclick) {
            if (!isDragging && e.button === 0) {
                console.log('单击事件');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
        if (type === PrototypeEvents.MOUSEUP && eventTypeIndex.mouseup > eventTypeIndex.click && eventTypeIndex.mouseup > eventTypeIndex.dblclick) {
            if (!isDragging && e.button === 0) {
                console.log('松开鼠标');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
        if (type === PrototypeEvents.RIGHTCLICK) {
            if (!isDragging && e.button === 2) {
                console.log('右击事件');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
    }
    if (isDragging) {
        isDragging = false;
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

const onMouseenter = () => {
    if (props.context.workspace.isPageDragging) {
        return;
    }
    const hoveredShape = props.context.selection.hoveredShape;
    protoActionFn = new ProtoAction(props.context);
    if (hoveredShape) {
        const protoActions = hoveredShape.prototypeInterAction;
        if (!protoActions) return;
        eventTypeIndex = eventPriority(hoveredShape);
        for (let i = 0; i < protoActions.length; i++) {
            const protoAction = protoActions[i];
            const type = protoAction.event.interactionType;
            if (type === PrototypeEvents.HOVER || type === PrototypeEvents.MOUSEENTER) {
                if (type === PrototypeEvents.HOVER && eventTypeIndex.hover > eventTypeIndex.mouseenter) {
                    console.log('鼠标悬停');
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                } else if (type === PrototypeEvents.MOUSEENTER && eventTypeIndex.mouseenter > eventTypeIndex.hover) {
                    console.log('hoveredShape: 移入');
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                }
            }
            if (type === PrototypeEvents.AFTERTIMEOUT) {
                console.log('鼠标延迟');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
            if (type === PrototypeEvents.MOUSELEAVE) {
                console.log('saveShape.value: 移出');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
        saveShape.value = hoveredShape;
    } else {
        if (!saveShape.value) return;
        const protoActions = saveShape.value!.prototypeInterAction;
        if (!protoActions) return;
        for (let i = 0; i < protoActions.length; i++) {
            const protoAction = protoActions[i];
            const type = protoAction.event.interactionType;
            if (type === PrototypeEvents.MOUSELEAVE) {
                console.log('saveShape.value: 移出');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
                break;
            }
        }
        saveShape.value = undefined;
    }
}

function createShapeTracing() {
    const hoveredShape = props.context.selection.hoveredShape;
    tracing.value = false;

    if (!hoveredShape) {
        return;
    }
    const path = hoveredShape.getPath().clone();
    const m = getPreviewMatrix(hoveredShape);
    m.multiAtLeft(props.matrix.clone());
    path.transform(m);
    tracingFrame.value = { height: 10, width: 10, viewBox: `${0} ${0} ${10} ${10}`, path: path.toString() };
    tracing.value = true;
    modify_tracing_class(hoveredShape);
}

function modify_tracing_class(shape: ShapeView) {
    tracing_class.thick_stroke = false;
    tracing_class.hollow_fill = false;

    if (shape instanceof PathShapeView && !shape.isClosed) {
        tracing_class.hollow_fill = true;
        tracing_class.thick_stroke = true;
    }

    if (shape.getFills().length) {
        tracing_class.hollow_fill = false;
    }
}

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        onMouseenter()
        createShapeTracing();
    } else if (t === Selection.CHANGE_SHAPE) {
        props.context.preview.setInteractionAction(undefined);
    }
}

const preview_watcher = (t: number) => {
    if (t === Preview.MATRIX_CHANGE) {
        createShapeTracing();
    }
}

onMounted(() => {
    props.context.selection.watch(selected_watcher);
    props.context.preview.watch(preview_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    props.context.preview.unwatch(preview_watcher);
})
</script>

<template>
    <svg v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingFrame.width" :height="tracingFrame.height" :viewBox="tracingFrame.viewBox"
        style="position: absolute; top: 0; left: 0">
        <path :d="tracingFrame.path" fill="none" stroke="transparent" :stroke-width="context.selection.hoverStroke"
            @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
        <path :d="tracingFrame.path" :fill="tracing_class.hollow_fill ? 'none' : 'transparent'" stroke="red"
            stroke-width="1.5" @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>