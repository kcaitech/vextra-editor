/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from "@/context";
import { nextTick, onUnmounted, ref, watch } from "vue";
import { Selection, XY } from "@/context/selection";
import { dbl_action } from "@/utils/mouse_interactive";
import Selector4PEM, { SelectorFrame } from "@/components/Document/Selection/Controller/PathEdit/Selector4PEM.vue";
import { Action, Tool } from "@/context/tool";
import CtrlPathEdit from "@/components/Document/Selection/Controller/CtrlPathEdit.vue";
import PathAssist from "@/components/Document/Assist/PathAssist.vue";
import { add_move_and_up_for_document, remove_move_and_up_from_document } from "@/utils/mouse";
import ClipMode from "../../Controller/ClipMode.vue";
import PenMode from "@/components/Document/Selection/Controller/PathEdit/PenMode.vue";
import { scout_once } from "@/utils/common";
import { PathEditor } from "@/path/pathEdit";
import { usePen } from "@/components/Document/Creator/execute";

interface Props {
    context: Context;
    params: {
        visible: boolean;
    }
}

const props = defineProps<Props>();

const selector_mount = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0, includes: false });
const clip_mode = ref<boolean>(false);
const penMode = ref<boolean>(false);

let mousedownOnClientXY: XY = { x: 0, y: 0 };
let drag: boolean = false;

function down(e: MouseEvent) {
    if (e.button) return;
    setMousedownXY(e);
    props.context.path.reset();
    if (dbl_action()) {
        scout_once(props.context, e);
        exit();
    }

    add_move_and_up_for_document(move2, up);
}

function move(e: MouseEvent) {
    if (penMode.value) return;
    // if (e.buttons !== 1) e.stopPropagation();
}

function move2(e: MouseEvent) {
    if (!drag) {
        const root = props.context.workspace.root;
        if (Math.hypot(e.clientX - root.x - mousedownOnClientXY.x, e.clientY - root.y - mousedownOnClientXY.y) > 9) {
            drag = true;
            props.context.path.selecting(true);
        }
        return;
    }

    if (_allow_to_select()) select(e);
}

function _allow_to_select() {
    const action = props.context.tool.action;
    return [Action.AutoV, Action.Curve].includes(action);
}

function up() {
    clear_state();
}

function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    mousedownOnClientXY = { ...props.context.workspace.getContentXY(e) };
}

function select(e: MouseEvent) {
    const { x: mx, y: my } = props.context.workspace.getContentXY(e);
    const { x: sx, y: sy } = mousedownOnClientXY;

    const left = Math.min(sx, mx);
    const right = Math.max(mx, sx);
    const top = Math.min(my, sy);
    const bottom = Math.max(my, sy);

    selectorFrame.value.top = top;
    selectorFrame.value.left = left;
    selectorFrame.value.width = right - left;
    selectorFrame.value.height = bottom - top;

    selectorFrame.value.includes = e.altKey;
    selector_mount.value = true;
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}

function clear_state() {
    selector_mount.value = false;
    if (drag) {
        drag = false;
        props.context.path.clear_highlight();
        props.context.path.selecting(false);
    }
    remove_move_and_up_from_document(move2, up);
}

function modify_cursor() {
    if (!props.params.visible) return;

    clip_mode.value = false;
    penMode.value = false;

    const action = props.context.tool.action;
    if (action === Action.PathClip) {
        switch_to_clip_mode();
    } else if (action === Action.Pen) {
        penMode.value = true;
    }
}

function switch_to_clip_mode() {
    props.context.path.reset();
    clip_mode.value = true;
    props.context.escstack.save('clip-to-auto', quit);
}

function quit() {
    const action = props.context.tool.action;
    props.context.tool.setAction(Action.AutoV);
    return action !== Action.AutoV;
}

function window_blur() {
    selector_mount.value = false;
    clear_state();
}

function selection_watcher(type: number | string) {
    if (type === Selection.CHANGE_SHAPE) exit();
}

function tool_watcher(type: number) {
    if (type === Tool.CHANGE_ACTION) {
        modify_cursor();
    } else if (type === Tool.LABLE_CHANGE) {
        props.context.workspace.setPathEditMode(false);
    }
}

const stopWatchVisible = watch(() => props.params.visible, (v) => {
    if (v) {
        props.context.selection.watch(selection_watcher);
        props.context.tool.watch(tool_watcher);
        props.context.tool.notify(Tool.RULE_CLEAR);
        props.context.selection.unHoverShape();
        window.addEventListener('blur', window_blur);
    } else {
        props.context.selection.unwatch(selection_watcher);
        props.context.tool.unwatch(tool_watcher);
        props.context.tool.setAction(Action.AutoV);
        props.context.cursor.reset();
        props.context.path.reset();
        props.context.path.setContactStatus(false);
        props.context.path.saveEvent(undefined);
        props.context.tool.notify(Tool.RULE_RENDER);
        window.removeEventListener('blur', window_blur);
        new PathEditor(props.context).sortSegment();
        clip_mode.value = false;
        penMode.value = false;
        if (!props.context.selection.selectedShapes.length
            && props.context.path.fixedAction === Action.Pen) nextTick(() => usePen(props.context));
        props.context.path.fixedAction = undefined;
    }
}, { immediate: true });
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.context.tool.setAction(Action.AutoV);
    props.context.tool.notify(Tool.RULE_RENDER);
    props.context.path.reset();
    props.context.path.setContactStatus(false);
    props.context.path.saveEvent(undefined);
    window.removeEventListener('blur', window_blur);
    new PathEditor(props.context).sortSegment();
    stopWatchVisible();
})
</script>
<template>
<div v-if="params.visible"
     :class="{ wrapper: true, 'clip-mode': clip_mode, 'pen-mode': penMode }"
     @mousedown.stop="down"
     @mousemove="move"
>
    <ClipMode v-if="clip_mode" :context="context"/>
    <PenMode v-else-if="penMode" :context="context"/>
    <CtrlPathEdit v-else :context="context"/>
    <Selector4PEM v-if="selector_mount" :context="context" :selector-frame="selectorFrame"/>
    <PathAssist :context="context"/>
</div>
</template>
<style scoped lang="scss">
.wrapper {
    cursor: -webkit-image-set(url("data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(%23filter0_d_328_9)'><path d='M9.00003 6.00005L10.543 24.0826L15.5 17.0001L23.7339 15.1138L9.00003 6.00005Z' fill='%23141414'/><path fill-rule='evenodd' clip-rule='evenodd' d='M8.00365 6.08507C7.99455 5.97809 8.00246 5.87204 8.02742 5.76761C8.05237 5.66318 8.09309 5.56531 8.14958 5.474C8.21933 5.36122 8.30802 5.26609 8.41563 5.18859C8.52323 5.11109 8.64157 5.05713 8.77064 5.02672C8.89972 4.9963 9.0297 4.99174 9.16058 5.01303C9.29147 5.03432 9.41331 5.07984 9.52608 5.1496L24.2599 14.2634C24.3737 14.3337 24.4694 14.4232 24.5472 14.532C24.625 14.6407 24.6788 14.7602 24.7086 14.8905C24.7233 14.9545 24.7316 15.0194 24.7335 15.085C24.7354 15.1506 24.7309 15.2158 24.7199 15.2805C24.709 15.3453 24.6918 15.4083 24.6684 15.4697C24.6451 15.5311 24.616 15.5896 24.581 15.6452C24.5462 15.7008 24.5062 15.7525 24.4611 15.8002C24.4161 15.848 24.3668 15.8909 24.3132 15.9289C24.2597 15.967 24.203 15.9994 24.1431 16.0263C24.0832 16.0531 24.0212 16.0739 23.9572 16.0886L16.0986 17.8889L11.3623 24.656C11.3203 24.7158 11.2718 24.7712 11.2178 24.8206C11.1638 24.8699 11.1052 24.9128 11.0418 24.9494C10.9784 24.9858 10.9118 25.015 10.842 25.0369C10.7722 25.0587 10.7009 25.0728 10.628 25.079C10.5626 25.0846 10.4973 25.0837 10.432 25.0764C10.3667 25.0691 10.3028 25.0555 10.2402 25.0357C10.1777 25.0158 10.1176 24.99 10.0601 24.9583C10.0026 24.9266 9.94878 24.8896 9.89857 24.8473C9.84836 24.8049 9.80276 24.7581 9.76177 24.7069C9.72078 24.6555 9.68519 24.6007 9.655 24.5425C9.6248 24.4841 9.60059 24.4234 9.58235 24.3604C9.56411 24.2973 9.5522 24.233 9.54662 24.1676L8.00365 6.08507ZM15.5 17.0001L10.543 24.0826L9.00003 6.00005L23.7339 15.1138L15.5 17.0001Z' fill='white'/></g><defs><filter id='filter0_d_328_9' x='6' y='3.99988' width='20.7344' height='24.0828' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset dy='1'/><feGaussianBlur stdDeviation='1'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_328_9'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_328_9' result='shape'/></filter></defs></svg>") 2x) 13 13, auto;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}

.clip-mode {
    cursor: -webkit-image-set(url('data:image/png;base64,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') 3x) 15 15, auto;
}

.pen-mode {
    cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJESURBVHgB7Zm9jcJAFIRHuojMJTi9jJBwSyC87NwBdIBLcAe4A64D3AEhISVAB3s7sGuWHxvzI7Rr3ieNZARYmrdv3voHEARBEARBEARBEARBEARBEARBEIRXMzTaWi2MMqMUH8TGSF/R0miKQ4F6DVe+Nq6UulYMFmluNMab+ML7+Ia3ykmSYL1eYzQaYTAYYLfbUYn9zY9Rbo8HRjurqFFGOk3TvXg8HA71drvVjtVqpYuiaOqOlVFhzxMlXN19DGi0qQiOzWaj5/O5Ho/H2nRLW1QSRERptF9lGrxVBJ/lcqmzLKv/g8tBmiGCXUXBDkC3yvcUoUNU2GEpAqaOgTP7aBEc/D2j4hWjQOCUsDHw8/5MEQgjgmMXBI2CF4NXFsEblgoBcxGDVxVhOp3GG4OmIlD8zI7hd21EH4NrRfDFFucO0Eb0MXA07Pf7a4E2ehEDgut3jo1d4+hNDJh9PNABpBcxWCwWF+YZi1uDkPQmBmxndgi7gSvfxbz7H/oQg2fAsXN+ETA3d4NHYLfgND5BF6FESwweNc9BOJlMoiiCwoti4Jt3F0yz2cyfB0E+eK1j0HXIdTXv8HaFPwRKCbvN3TPtu5gnPB8C3xVSowpnV3xlWT5tnnDAIpJtMcWhG+p3CG1d0cU84RMje74KkcC5kOHsbRKfEFdVdZd5fuddGmeIEAU7I+DdFuN+8zkiJ8VZV7TdGPXN/Dk5bBHyPP84844cXhE46SneRX6CeUeOhgcn+ADzDoXTawgeZxAEQejAP1zPK4aP9mgsAAAAAElFTkSuQmCC') 2x) 13 13, auto;
}
</style>