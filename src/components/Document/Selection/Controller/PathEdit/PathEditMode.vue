<script setup lang="ts">
import { Context } from "@/context";
import { onUnmounted, ref, watch } from "vue";
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
import { PathEditor } from "@/transform/pathEdit";

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
    if (e.buttons !== 1) e.stopPropagation();
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
    if (type === Selection.CHANGE_SHAPE || type === Selection.CHANGE_PAGE) props.context.workspace.setPathEditMode(false);
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
        window.addEventListener('blur', window_blur);
        props.context.tool.notify(Tool.RULE_CLEAR);
    } else {
        props.context.selection.unwatch(selection_watcher);
        props.context.tool.unwatch(tool_watcher);
        props.context.tool.setAction(Action.AutoV);
        props.context.cursor.reset();
        const path = props.context.path;
        path.reset();
        window.removeEventListener('blur', window_blur);

        new PathEditor(props.context).sortSegment();
        path.setContactStatus(false);
        path.saveEvent(undefined);
        props.context.tool.notify(Tool.RULE_RENDER);
        clip_mode.value = false;
        penMode.value = false;
    }
}, { immediate: true });

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.context.tool.setAction(Action.AutoV);
    const path = props.context.path;
    path.reset();
    window.removeEventListener('blur', window_blur);

    new PathEditor(props.context).sortSegment();
    path.setContactStatus(false);
    path.saveEvent(undefined);
    props.context.tool.notify(Tool.RULE_RENDER);
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
    cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABDCAYAAAAs/QNwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUxSURBVHgB7VrPT6NVFL1taYFCS6kg8mPGdqSj4o/pDPFXNBFdGDVB0YS1uHJlAkYTXYH+BbjSuBDWJiZs3GgiYW8EN7oEo44LSAAHhyEzw5tzvvcelI92Ap3S9uu8k5y8Thnod+999557L4g4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODhUFhnDukNEzh4hsBNcBlvB38Abcp8gNDMzE8bZBCrDVfB9pVRIGhnGQBofzWQyLTjX5NAJB44AQw3pDBo1Pj7OFGsGE+APfHtsbEzBIX5HvCI6VRoKNIgOYN6zBnwDKqSEIubm5vyOmAcvSAM5goYw9+OJRKIL50egmpiYUBarq6tqenq60AnWEdlGSAvvBvT09LThpAPeAFU+n1d+0BF0jBx1xOfgBXxZggqvCA4MDDAF0uCLoEqlUqoUijjCFsqwBDA1bA2gAnS2traew/kfqNbW1tTdsLy87N0UOeqIicClhXlgqkAKDhjA+TvfXlxcVCdBkUJJR7wqAZJOPmSss7OzA2cv+D2o5ufn1WlQTDFaWlqyEoC04ANGwURbW9tDOL8E1eTkpCoHVIwi0lnXjrDNEJXgQfBjMc1QubiLYtStdEZ6e3u9XiASibyJf3tRvFcERTHsDfCkMBaLPSXmgSsFOmJkZKTojCH1AKWvpSeFIJXgbzmBFJ4WJRTjHX6+qnEz5SkBSCXoB38C1cLCgqo0Njc3/f0DuZBMJtNS4kaEpQoYHh5WXV1d+/F4nA/EZkhwA6RSWFpakqmpKclms7KysmLf5ud8DX6Vy+WuYQijA2qSFnYoaocU9uD8QnxDUbnRnp2d9ec/+Qv4Gfgk2C16FI+ZWnTMAU1y9rAJqEKh0L7oGiBbW1tSDhhtpI+gmSr8GTvgd+DPorvNPfAGblwTCm8E80d4fX19X2oIej8ueip8ScqQwhLR/hX8FHwNfA68AlJpLoLnzY1LDg4Osh1nsGujDNwLmqnwAfBhMQbwGp8EPr2/Bn4Lvgc+Dz4DXqbEgo/h9SPgOWN8SrTj2Y1Wpd6VQthEgQ/EqdCTQk59pzD+X/BD8AXR0R6ORqN5nE+AOdFr9/729nZ2nKz6zP1WFGAaX7voG9D7dEAS7AN/lBMMRT7j3wWfhdGXRV/zx0VH+7zoQasLuZ7iAsYsYWNImSY57Axr6oCDoQjkUDQnBftBP5gaBfl+FRwDr5hOkvmdAfvNNU9DYhNst80t4+dEzDq+flpiMesx89CfSAkp9DUzVzE/0Pi8ye+MFERb9JDFaEdttJXuPOtvKDIPaPeD3lDk3w/6jRcd+Uvgo6JrR3c6nU76o60CsBw5WJFjKqQSHNsPFjH+bfBSc3PzRbNN4ve1g83GmV5jo3SfH4jtEHPSDkVH9oNFjH9LdOSZ7zSeVZ23J8bcDkLEj8EUJSuFHIr+ELMf9BuPSs/I58z/S/PKi5ayQG6HLUJDQ0OcCq0UevtBpoEcjfzTonW9r6Ojg7clbrQ80MZbRClZOKkE3n5QihiPnO83xrN79Iw/q2tf7fZQbWxsKHRrNPov8x6N/wDX/k+cuxhg/t/d3b2+vb3NvyG4iSmOQwwHqdpuNSoAqwRxowT8Vdk/4Oui29lBGM/UYMHzIl9vzcw9o2A/yOs9BL5MmRO92u4z7/PrhU1NQ4ER9Qoh0qDb6LsdYLzJraDgVe2Bqgaluxbm9K2dnZ095jpeX8dr5vsejL85Ojp6Ww6XKGeOWlwxpkG44CRuG+4bNjRsMWyyZG0wBe++gf3rsXDDVXqHgOEONuYyL5lnAxQAAAAASUVORK5CYII=') 2x) 13 13, auto !important;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}

.clip-mode {
    cursor: -webkit-image-set(url('data:image/png;base64,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') 3x) 15 15, auto !important;
}

.pen-mode {
    cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJESURBVHgB7Zm9jcJAFIRHuojMJTi9jJBwSyC87NwBdIBLcAe4A64D3AEhISVAB3s7sGuWHxvzI7Rr3ieNZARYmrdv3voHEARBEARBEARBEARBEARBEARBEIRXMzTaWi2MMqMUH8TGSF/R0miKQ4F6DVe+Nq6UulYMFmluNMab+ML7+Ia3ykmSYL1eYzQaYTAYYLfbUYn9zY9Rbo8HRjurqFFGOk3TvXg8HA71drvVjtVqpYuiaOqOlVFhzxMlXN19DGi0qQiOzWaj5/O5Ho/H2nRLW1QSRERptF9lGrxVBJ/lcqmzLKv/g8tBmiGCXUXBDkC3yvcUoUNU2GEpAqaOgTP7aBEc/D2j4hWjQOCUsDHw8/5MEQgjgmMXBI2CF4NXFsEblgoBcxGDVxVhOp3GG4OmIlD8zI7hd21EH4NrRfDFFucO0Eb0MXA07Pf7a4E2ehEDgut3jo1d4+hNDJh9PNABpBcxWCwWF+YZi1uDkPQmBmxndgi7gSvfxbz7H/oQg2fAsXN+ETA3d4NHYLfgND5BF6FESwweNc9BOJlMoiiCwoti4Jt3F0yz2cyfB0E+eK1j0HXIdTXv8HaFPwRKCbvN3TPtu5gnPB8C3xVSowpnV3xlWT5tnnDAIpJtMcWhG+p3CG1d0cU84RMje74KkcC5kOHsbRKfEFdVdZd5fuddGmeIEAU7I+DdFuN+8zkiJ8VZV7TdGPXN/Dk5bBHyPP84844cXhE46SneRX6CeUeOhgcn+ADzDoXTawgeZxAEQejAP1zPK4aP9mgsAAAAAElFTkSuQmCC') 2x) 13 13, auto !important;
}
</style>