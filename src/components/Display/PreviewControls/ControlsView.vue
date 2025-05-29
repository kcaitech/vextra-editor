/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { Preview } from '@/context/preview';
import { Selection, XY } from '@/context/selection';
import { dbl_action } from '@/utils/mouse_interactive';
import { eventPriority, getPreviewMatrix, viewBox } from '@/utils/preview';
import {
    Matrix,
    PathShapeView,
    PrototypeEvents,
    PrototypeNavigationType,
    PrototypeTransitionType,
    sessionRefIdKey,
    ShapeView
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { delayAction, EventIndex, ProtoAction } from './actions';

interface Props {
    context: Context
    matrix: Matrix
    reflush: number
}

interface PathView {
    path: string,
    viewBox: string,
    height: number,
    width: number
}

const emit = defineEmits<{
    (e: "updateSearch", event?: MouseEvent): void;
}>();

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
let eventTypeZIndex = {
    click: false,
    dblclick: false,
    mousedown: false,
    mouseup: false,
    mouseenter: false,
    hover: false
}

function pathMousedown(e: MouseEvent) {
    emit('updateSearch', e);
    const selection = props.context.selection;
    if (props.context.workspace.isPageDragging) {
        return;
    }
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

    eventTypeZIndex.dblclick = false
    eventTypeZIndex.mousedown = false
    if (e.button === 0) {
        const protoActions = hoveredShape.prototypeInteractions;
        if (!protoActions) return;
        if (dbl_action()) {
            if (!eventTypeZIndex.dblclick && eventTypeIndex.click === -1 && eventTypeIndex.mousedown === -1 && eventTypeIndex.mouseup === -1) {
                for (let i = protoActions.length - 1; i > -1; i--) {
                    const protoAction = protoActions[i];
                    const type = protoAction.event.interactionType;
                    if (type === PrototypeEvents.DBCLICK) {
                        console.log('双击事件');
                        e.stopPropagation();
                        eventTypeZIndex.dblclick = true
                        protoActionFn.executeActionx(protoAction.actions, props.matrix);
                        break;
                    }
                }
            }
            return;
        }
        if (!eventTypeZIndex.mousedown) {
            for (let i = protoActions.length - 1; i > -1; i--) {
                const protoAction = protoActions[i];
                const type = protoAction.event.interactionType;
                if (type === PrototypeEvents.MOUSEDOWN) {
                    console.log('按下鼠标');
                    e.stopPropagation();
                    eventTypeZIndex.mousedown = true
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
        e.stopPropagation();
        isDragging = true;
    }
}

const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    emit('updateSearch', e);
    const hoveredShape = props.context.selection.hoveredShape;
    if (!hoveredShape) return;
    const protoActions = hoveredShape.prototypeInteractions;
    if (!protoActions) return;
    if (!protoActionFn) {
        protoActionFn = new ProtoAction(props.context);
    }
    eventTypeZIndex.click = false
    eventTypeZIndex.mouseup = false

    for (let i = protoActions.length - 1; i > -1; i--) {
        const protoAction = protoActions[i];
        const type = protoAction.event.interactionType;
        if (!eventTypeZIndex.mouseup && type === PrototypeEvents.MOUSEUP) {
            if (!isDragging && e.button === 0) {
                console.log('松开鼠标');
                eventTypeZIndex.mouseup = true
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
        if (!(Math.hypot(e.x - downXY.x, e.y - downXY.y) > 3)) {
            if (!eventTypeZIndex.click && type === PrototypeEvents.ONCLICK && eventTypeIndex.mousedown === -1 && eventTypeIndex.mouseup === -1) {
                if (!isDragging && e.button === 0) {
                    console.log('单击事件');
                    eventTypeZIndex.click = true
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                }
            }
        }
        if (type === PrototypeEvents.RIGHTCLICK) {
            if (!isDragging && e.button === 2) {
                console.log('右击事件');
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
        }
        if (isDragging) {
            if (type === PrototypeEvents.DRAG) {
                console.log('拖拽事件');
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
    eventTypeZIndex.hover = false;
    eventTypeZIndex.mouseenter = false;
    const hoveredShape = props.context.selection.hoveredShape;
    protoActionFn = new ProtoAction(props.context);
    if (hoveredShape) {
        const protoActions = hoveredShape.prototypeInteractions;
        if (!protoActions) return;
        eventTypeIndex = eventPriority(hoveredShape);
        for (let i = protoActions.length - 1; i > -1; i--) {
            const protoAction = protoActions[i];
            const type = protoAction.event.interactionType;
            if (type === PrototypeEvents.HOVER || type === PrototypeEvents.MOUSEENTER) {
                if (!eventTypeZIndex.hover && type === PrototypeEvents.HOVER && eventTypeIndex.mouseenter === -1) {
                    console.log('鼠标悬停');
                    eventTypeZIndex.hover = true;
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                    if (protoAction.actions.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
                        emit('updateSearch');
                    } else {
                        const time = protoAction.actions.transitionDuration ?? 0.3;
                        const timer = setTimeout(() => {
                            emit('updateSearch');
                        }, time * 1000);
                        props.context.preview.addSetTimeout(timer);
                    }
                } else if (!eventTypeZIndex.mouseenter && type === PrototypeEvents.MOUSEENTER) {
                    console.log('hoveredShape: 移入');
                    eventTypeZIndex.mouseenter = true
                    protoActionFn.executeActionx(protoAction.actions, props.matrix);
                    if (protoAction.actions.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
                        emit('updateSearch');
                    } else {
                        const time = protoAction.actions.transitionDuration ?? 0.3;
                        const timer = setTimeout(() => {
                            emit('updateSearch');
                        }, time * 1000);
                        props.context.preview.addSetTimeout(timer);
                    }
                }
            }
        }
        if (saveShape.value) {
            moveOutAction();
        }
        saveShape.value = hoveredShape;
    } else {
        if (!saveShape.value) return;
        moveOutAction();
        saveShape.value = undefined;
    }
}

const moveOutAction = () => {
    const shape = props.context.preview.saveShape;
    if (!shape) return;
    const protoActions = shape!.prototypeInteractions;
    if (!protoActions) return;
    for (let i = 0; i < protoActions.length; i++) {
        const protoAction = protoActions[i];
        const type = protoAction.event.interactionType;
        if (type === PrototypeEvents.MOUSELEAVE && protoActionFn) {
            console.log('saveShape.value: 移出');
            if (protoAction.actions.navigationType === PrototypeNavigationType.SWAPSTATE) {
                protoActionFn.symbolStateSwitch(protoAction.actions, protoAction.id, shape);
            } else {
                protoActionFn.executeActionx(protoAction.actions, props.matrix);
            }
            break;
        }
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
        props.context.preview.clearSetTimeout();
        props.context.preview.clearDelaySetTimeout();
        props.context.preview.setInteractionAction(undefined);
        props.context.preview.setSwapAction(undefined);
        props.context.sessionStorage.delete(sessionRefIdKey);
        delayAction(props.context, props.matrix);
    } else if (t === Selection.PREVIEW_HOVER_CHANGE) {
        createShapeTracing();
    }
}

const preview_watcher = (t: number) => {
    if (t === Preview.MATRIX_CHANGE) {
        createShapeTracing();
    } else if (t === Preview.SWAP_REF_STAT) {
        delayAction(props.context, props.matrix);
    }
}

watch(() => props.reflush, () => {
    createShapeTracing();
})

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
        <path :d="tracingFrame.path" :fill="tracing_class.hollow_fill ? 'none' : 'transparent'" stroke="transparent"
            stroke-width="1.5" @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>