/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { ClientXY, Selection, SelectionTheme } from '@/context/selection';
import { Matrix, TextShapeView } from '@kcdesign/data';
import { Context } from '@/context';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import { genRectPath } from '../common';
import { useController } from '../Controller/controller';
import { Point } from "../SelectionView.vue";
import { WorkSpace } from '@/context/workspace';
import BarsContainer from "./Bars/BarsContainer.vue";
import PointsContainer from "./Points/PointsContainer.vue";
import { getAxle } from '@/utils/common';
import { CursorType } from "@/utils/cursor";

interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: TextShapeView
    theme: SelectionTheme
}

type ProtoInput = InstanceType<typeof TextInput>;

const props = defineProps<Props>();
const { isDblClick } = useController(props.context);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const editing = ref<boolean>(false); // 是否进入路径编辑状态
const selection_hidden = ref<boolean>(false);
const input = ref<ProtoInput>();
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})
let downIndex: { index: number, before: boolean };

function update() {
    // if (!props.context.workspace.shouldSelectionViewUpdate) return;
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p.toMatrix());
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];
    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);
    props.context.workspace.setCtrlPath(boundrectPath.value);
    const p0 = boundrect[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    boundrect.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds)
}

function clear_null_shape(shape: TextShapeView) {
    props.context.editor4Shape(shape).delete();
}

function onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
        const workspace = props.context.workspace;
        props.context.menu.menuMount();
        if (!editing.value && isDblClick()) {
            if (props.context.navi.focusText) {
                props.context.navi.set_focus_text();
            }
            editing.value = true;
            workspace.contentEdit(editing.value);
            props.context.cursor.setType(CursorType.Text, 0);
        }
        if (!editing.value) return;
        e.stopPropagation();
        const selection = props.context.textSelection;
        workspace.setCtrl('controller');
        const root = workspace.root
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(e.clientX - root.x, e.clientY - root.y);
        downIndex = selection.locateText(xy.x, xy.y);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else if (e.button === 2) {
        if (!(e.target as Element).closest('#text-selection')) {
            e.stopPropagation();
        }
    }
}

function dblFromPart(e: MouseEvent) {
    if (e.button === 0 && !editing.value) {
        const workspace = props.context.workspace;
        if (props.context.navi.focusText) {
            props.context.navi.set_focus_text();
        }
        editing.value = true;
        workspace.contentEdit(editing.value);
        props.context.cursor.setType(CursorType.Text, 0);
        const selection = props.context.textSelection;
        workspace.setCtrl('controller');
        const root = workspace.root
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(e.clientX - root.x, e.clientY - root.y);
        downIndex = selection.locateText(xy.x, xy.y);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }
}

function onMouseMove(e: MouseEvent) {
    e.stopPropagation();
    if (!editing.value) return;
    const workspace = props.context.workspace;
    const selection = props.context.textSelection;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) {
            selection.setCursor(locate.index + 1, false);
        } else {
            selection.setCursor(locate.index, locate.before);
        }
    } else {
        selection.selectText(downIndex.index, locate.index);
    }
}

function onMouseUp(e: MouseEvent) {
    e.stopPropagation();
    if (!editing.value) return;
    const selection = props.context.textSelection;
    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) selection.setCursor(locate.index + 1, false);
        else selection.setCursor(locate.index, locate.before);
    } else {
        selection.selectText(downIndex.index, locate.index);
    }
    props.context.workspace.setCtrl('page');
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (input.value) input.value.attention();
}

let hidden_holder: any = null;

function modify_selection_hidden() {
    if (hidden_holder) {
        clearTimeout(hidden_holder);
    }

    hidden_holder = setTimeout(() => {
        selection_hidden.value = false;
        clearTimeout(hidden_holder);
        hidden_holder = null;
    }, 1000);

    selection_hidden.value = true;
}

function reset_hidden() {
    selection_hidden.value = false;
    clearTimeout(hidden_holder);
    hidden_holder = null;
}

function mouseenter() {
    if (editing.value) props.context.cursor.setType(CursorType.Text, 0);
}

function mouseleave() {
    props.context.cursor.reset();
}

function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value
}

function be_editor(index?: number) {
    const workspace = props.context.workspace;
    const selection = props.context.textSelection;
    editing.value = true;
    workspace.contentEdit(editing.value);
    props.context.cursor.setType(CursorType.Text, 0);
    if (index !== undefined) {
        downIndex = { index, before: true };
        selection.setCursor(index, true);
    }
}

function workspace_watcher(t?: number, index?: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
    } else if (t === WorkSpace.INIT_EDITOR) {
        be_editor(index);
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update();
    }
}

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) {
        update();
    } else if (args.indexOf(Selection.CHANGE_SHAPE) >= 0) {
        editing.value = false;
        check_status();
        reset_hidden();
    } else if (args.indexOf(Selection.SELECTION_HIDDEN) >= 0) {
        modify_selection_hidden();
    }
}

function check_status() {
    if (props.context.selection.isNewShapeSelection) {
        be_editor(0);
        props.context.selection.setSelectionNewShapeStatus(false);
    }
}

watch(() => props.matrix, update, { deep: true });

watch(() => props.shape, (value, old) => {
    if (old.text.length === 1) {
        clear_null_shape(old);
    }
    old.unwatch(update);
    value.watch(update);
    update();
});

onMounted(() => {
    props.shape.watch(update);
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspace_watcher);
    update();
    check_status();
});
onUnmounted(() => {
    props.shape.unwatch(update);
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspace_watcher);
    props.context.cursor.reset();
    reset_hidden();
});
onBeforeUnmount(() => {
    if (props.shape.text.length === 1) {
        clear_null_shape(props.shape);
    }
});
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         data-area="controller"
         id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
         :viewBox=genViewBox(bounds) :width="width" :height="height"
         :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)` }" @mousedown="onMouseDown"
         overflow="visible"
         @mouseenter="mouseenter" @mouseleave="mouseleave" :class="{ hidden: selection_hidden }">
        <SelectView :context="props.context" :shape="(props.shape)" :matrix="submatrix.toArray()"
                    :main-notify="Selection.CHANGE_TEXT"
                    :selection="props.context.selection.getTextSelection(props.shape)">
        </SelectView>
        <path v-if="editing" :d="boundrectPath" fill="none" :stroke="theme" stroke-dasharray="2,2"></path>
        <BarsContainer v-if="!editing" :context="props.context" :shape="props.shape"
                       :c-frame="props.controllerFrame" :theme="theme" @dblclick="dblFromPart">
        </BarsContainer>
        <PointsContainer v-if="!editing" :context="props.context" :shape="props.shape"
                         :c-frame="props.controllerFrame" :axle="axle" :theme="theme" @dblclick="dblFromPart">
        </PointsContainer>
    </svg>
    <TextInput ref="input" :context="props.context" :shape="(props.shape)" :matrix="submatrix.toArray()"
               :main-notify="Selection.CHANGE_TEXT"
               :selection="props.context.selection.getTextSelection(props.shape)"></TextInput>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}

svg {
    position: absolute;
}
</style>