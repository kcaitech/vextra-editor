<script setup lang="ts">
import { Context } from "@/context";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { Selection, XY } from "@/context/selection";
import { dbl_action } from "@/utils/mouse_interactive";
import Selector4PEM, { SelectorFrame } from "@/components/Document/Selection/Controller/PathEdit/Selector4PEM.vue";
import { Matrix } from "@kcdesign/data";
import { Action, Tool } from "@/context/tool";
import { root_scale, root_trans } from "@/utils/content";
import { WorkSpace } from "@/context/workspace";
import CtrlPathEdit from "@/components/Document/Selection/Controller/CtrlPathEdit.vue";
import PathAssist from "@/components/Document/Assist/PathAssist.vue";
import { add_move_and_up_for_document, remove_move_and_up_from_document } from "@/utils/mouse";

interface Props {
    context: Context
}

const props = defineProps<Props>();
const selector_mount = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({ top: 0, left: 0, width: 0, height: 0, includes: false });
const mousedownOnClientXY: XY = { x: 0, y: 0 }; // 鼠标在page中的坐标
const matrix: Matrix = reactive(props.context.workspace.matrix as any);
let matrix_inverse: Matrix = new Matrix();
let drag: boolean = false;
const clip_mode = ref<boolean>(false);
function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const { ctrlKey, metaKey, deltaX, deltaY } = e;
    if (ctrlKey || metaKey) { // 缩放
        root_scale(props.context, e);
    } else {
        if (Math.abs(deltaX) + Math.abs(deltaY) < 100) {
            matrix.trans(-deltaX, -deltaY);
        } else {
            root_trans(props.context, e, 50);
        }
    }
    props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function down(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    setMousedownXY(e);
    props.context.path.reset();
    if (dbl_action()) {
        exit();
    }
    add_move_and_up_for_document(move2, up);
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        e.stopPropagation();
    }
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

    if (_allow_to_select()) {
        select(e);
    }
}
function _allow_to_select() {
    const action = props.context.tool.action;
    return [Action.AutoV, Action.Curve].includes(action);
}
function up(e: MouseEvent) {
    clear_state();
}

function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const { x, y } = props.context.workspace.root;
    mousedownOnClientXY.x = e.clientX - x;
    mousedownOnClientXY.y = e.clientY - y; //页面坐标系上的点
}

function select(e: MouseEvent) {
    const { x: rx, y: ry } = props.context.workspace.root;
    const { x: mx, y: my } = { x: e.clientX - rx, y: e.clientY - ry };
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
    clip_mode.value = false;
    const action = props.context.tool.action;
    if (action === Action.PathClip) {
        clip_mode.value = true;
    }
}

function window_blur() {
    selector_mount.value = false;
    clear_state();
}

function selection_watcher(type: Number) {
    if (type === Selection.CHANGE_SHAPE) {
        props.context.workspace.setPathEditMode(false);
    }
}

function matrix_watcher(nm: Matrix) {
    matrix_inverse = new Matrix(nm.inverse);
}

function tool_watcher(type: Number) {
    if (type === Tool.CHANGE_ACTION) {
        modify_cursor();
    }
}

watch(() => matrix, matrix_watcher, { deep: true });
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.tool.watch(tool_watcher);
    window.addEventListener('blur', window_blur);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tool.unwatch(tool_watcher);
    props.context.tool.setAction(Action.AutoV);
    window.removeEventListener('blur', window_blur);
})
</script>
<template>
    <div :class="{wrapper: true, 'clip-mode': clip_mode}" @wheel.stop @mousedown.stop="down" @mousemove="move" @wheel="onMouseWheel">
        
        <CtrlPathEdit :context="props.context"></CtrlPathEdit>
        <Selector4PEM v-if="selector_mount" :context="props.context" :selector-frame="selectorFrame"></Selector4PEM>
        <PathAssist :context="props.context"></PathAssist>
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
    cursor: -webkit-image-set(url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIgogICAgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgICA8ZGVmcz4KICAgICAgICA8Y2xpcFBhdGggaWQ9Im1hc3Rlcl9zdmcwX3NhODUxXzgzNjMiPgogICAgICAgICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIwIiAvPgogICAgICAgIDwvY2xpcFBhdGg+CiAgICA8L2RlZnM+CiAgICA8ZyBjbGlwLXBhdGg9InVybCgjbWFzdGVyX3N2ZzBfc2E4NTFfODM2MykiPgogICAgICAgIDxnPgogICAgICAgICAgICA8ZWxsaXBzZSBjeD0iNC41ODMzMzMyNTM4NjA0NzQiIGN5PSIxNS40MTY2NDYyNDIxNDE3MjQiIHJ4PSIyLjA4MzMzMzI1Mzg2MDQ3MzYiCiAgICAgICAgICAgICAgICByeT0iMi4wODMzMzMyNTM4NjA0NzM2IiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZS1vcGFjaXR5PSIxIiBzdHJva2U9IiNGRkZGRkYiCiAgICAgICAgICAgICAgICBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuMzk5OTk5OTc2MTU4MTQyIiBzdHJva2UtbGluZWNhcD0iUk9VTkQiCiAgICAgICAgICAgICAgICBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPGVsbGlwc2UgY3g9IjE1LjQxNjcwNzI3NzI5Nzk3NCIgY3k9IjE1LjQxNjY0NjI0MjE0MTcyNCIgcng9IjIuMDgzMzMzMjUzODYwNDczNiIKICAgICAgICAgICAgICAgIHJ5PSIyLjA4MzMzMzI1Mzg2MDQ3MzYiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlLW9wYWNpdHk9IjEiIHN0cm9rZT0iI0ZGRkZGRiIKICAgICAgICAgICAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMS4zOTk5OTk5NzYxNTgxNDIiIHN0cm9rZS1saW5lY2FwPSJST1VORCIKICAgICAgICAgICAgICAgIHN0cm9rZS1saW5lam9pbj0icm91bmQiIC8+CiAgICAgICAgPC9nPgogICAgICAgIDxnCiAgICAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KC0wLjg2NjAyNTM4ODI0MDgxNDIsLTAuNSwwLjUsLTAuODY2MDI1NDQ3ODQ1NDU5LDMuNzY3NzE2MjU2NTY2OTI3OCwzMy44NzAzOTcxMjI2OTMyNSkiPgogICAgICAgICAgICA8cGF0aAogICAgICAgICAgICAgICAgZD0iTTUuNzIxNjMwODU5Mzc1LDE4LjE3MDU1OTkyMTg3NUw1LjcyMTYzMDg1OTM3NSwzMi4zMzcyMTk5MjE4NzUwMDRRNS43MjE2MzA4NTkzNzUsMzIuNDA2MTE5OTIxODc1LDUuNzM1MDgwODU5Mzc1LDMyLjQ3MzgxOTkyMTg3NVE1Ljc0ODUzMTg1OTM3NSwzMi41NDE0MTk5MjE4NzUwMDQsNS43NzQ5MTQ4NTkzNzUsMzIuNjA1MTE5OTIxODc1UTUuODAxMjk4ODU5Mzc1LDMyLjY2ODgxOTkyMTg3NSw1LjgzOTYwMTg1OTM3NSwzMi43MjYxMTk5MjE4NzVRNS44Nzc5MDU4NTkzNzUsMzIuNzgzNDE5OTIxODc1LDUuOTI2NjU1ODU5Mzc1LDMyLjgzMjIxOTkyMTg3NVE1Ljk3NTQwNjg1OTM3NSwzMi44ODA5MTk5MjE4NzUwMDUsNi4wMzI3MzE4NTkzNzUsMzIuOTE5MjE5OTIxODc1UTYuMDkwMDU2ODU5Mzc1LDMyLjk1NzUxOTkyMTg3NTAwNCw2LjE1Mzc1Mjg1OTM3NSwzMi45ODM5MTk5MjE4NzVRNi4yMTc0NDg4NTkzNzUsMzMuMDEwMzE5OTIxODc0OTk1LDYuMjg1MDY3ODU5Mzc1LDMzLjAyMzgxOTkyMTg3NVE2LjM1MjY4Njg1OTM3NSwzMy4wMzcyMTk5MjE4NzUsNi40MjE2MzA4NTkzNzUsMzMuMDM3MjE5OTIxODc1UTYuNDkwNTc0ODU5Mzc1LDMzLjAzNzIxOTkyMTg3NSw2LjU1ODE5Mzg1OTM3NSwzMy4wMjM4MTk5MjE4NzVRNi42MjU4MTI4NTkzNzUsMzMuMDEwMzE5OTIxODc0OTk1LDYuNjg5NTA4ODU5Mzc1LDMyLjk4MzkxOTkyMTg3NVE2Ljc1MzIwNDg1OTM3NSwzMi45NTc1MTk5MjE4NzUwMDQsNi44MTA1Mjk4NTkzNzUsMzIuOTE5MjE5OTIxODc1UTYuODY3ODU0ODU5Mzc1LDMyLjg4MDkxOTkyMTg3NTAwNSw2LjkxNjYwNTg1OTM3NSwzMi44MzIyMTk5MjE4NzVRNi45NjUzNTU4NTkzNzUsMzIuNzgzNDE5OTIxODc1LDcuMDAzNjU5ODU5Mzc1LDMyLjcyNjExOTkyMTg3NVE3LjA0MTk2Mjg1OTM3NSwzMi42Njg4MTk5MjE4NzUsNy4wNjgzNDY4NTkzNzUsMzIuNjA1MTE5OTIxODc1UTcuMDk0NzI5ODU5Mzc1LDMyLjU0MTQxOTkyMTg3NTAwNCw3LjEwODE4MDg1OTM3NSwzMi40NzM4MTk5MjE4NzVRNy4xMjE2MzA4NTkzNzUsMzIuNDA2MTE5OTIxODc1LDcuMTIxNjMwODU5Mzc1LDMyLjMzNzIxOTkyMTg3NTAwNEw3LjEyMTYzMDg1OTM3NSwxOC4xNzA1NTk5MjE4NzVMNy4xMzgyMDE4NTkzNzUsMTYuNDM3MjgzMjYxODc1TDcuMTM4MjAzODU5Mzc1LDE2LjQzNzA5OTI3MTg3NUw3LjEzODIzNTg1OTM3NSwxNi40MzA0MjAwMzcxNDhRNy4xMzgyMzU4NTkzNzUsMTYuMzY5NTYzMTIxODc1LDcuMTI3NzMzODU5Mzc1LDE2LjMwOTYxOTkyMTg3NVE3LjExNzIyODg1OTM3NSwxNi4yNDk2NjI5MjE4NzUsNy4wOTY1MzM4NTkzNzUwMDA1LDE2LjE5MjQxOTkyMTg3NVE3LjA3NTgzNzg1OTM3NDk5OTUsMTYuMTM1MTc2OTIxODc1LDcuMDQ1NTcxODU5Mzc1LDE2LjA4MjM2NDkyMTg3NVE3LjAxNTMwNjg1OTM3NSwxNi4wMjk1NTI5MjE4NzUsNi45NzYzNzk4NTkzNzUsMTUuOTgyNzU3OTIxODc1UTYuOTM3NDUxODU5Mzc1LDE1LjkzNTk2MjkyMTg3NSw2Ljg5MTAzMTg1OTM3NSwxNS44OTY1ODg5MjE4NzVRNi44NDQ2MTE4NTkzNzUsMTUuODU3MjE0OTIxODc1LDYuNzkyMDkyODU5Mzc1LDE1LjgyNjQ0NDkyMTg3NVE2LjczOTU3Mjg1OTM3NSwxNS43OTU2NzQ5MjE4NzUsNi42ODI1MzA4NTkzNzUsMTUuNzc0NDMxOTIxODc1UTYuNjI1NDg3ODU5Mzc1LDE1Ljc1MzE4ODkyMTg3NSw2LjU2NTYzNDg1OTM3NSwxNS43NDIxMTA5MjE4NzVRNi41MDU3ODIwNTkzNzUsMTUuNzMxMDMyOTIxODc1LDYuNDQ0OTE1MjU5Mzc1LDE1LjczMDQ1MTkyMTg3NUw2LjQzODIzNjA1OTM3NSwxNS43MzA0MTk5MjE4NzVRNi4zNzczNzkxNTkzNzUsMTUuNzMwNDE5OTIxODc1LDYuMzE3NDM1ODU5Mzc1LDE1Ljc0MDkyMTkyMTg3NVE2LjI1NzQ3ODg1OTM3NSwxNS43NTE0MjY5MjE4NzUsNi4yMDAyMzU4NTkzNzUsMTUuNzcyMTIxOTIxODc1UTYuMTQyOTkyODU5Mzc1LDE1Ljc5MjgxNzkyMTg3NSw2LjA5MDE4MDg1OTM3NSwxNS44MjMwODM5MjE4NzVRNi4wMzczNjg4NTkzNzUsMTUuODUzMzQ4OTIxODc1LDUuOTkwNTczODU5Mzc1LDE1Ljg5MjI3NTkyMTg3NTAwMVE1Ljk0Mzc3ODg1OTM3NSwxNS45MzEyMDM5MjE4NzUsNS45MDQ0MDQ4NTkzNzUsMTUuOTc3NjIzOTIxODc1UTUuODY1MDMxODU5Mzc1LDE2LjAyNDA0MzkyMTg3NSw1LjgzNDI2MDg1OTM3NSwxNi4wNzY1NjI5MjE4NzVRNS44MDM0OTA4NTkzNzUsMTYuMTI5MDgyOTIxODc1LDUuNzgyMjQ3ODU5Mzc0OTk5NSwxNi4xODYxMjQ5MjE4NzVRNS43NjEwMDQ4NTkzNzUsMTYuMjQzMTY3OTIxODc1LDUuNzQ5OTI2ODU5Mzc1LDE2LjMwMzAyMDkyMTg3NVE1LjczODg0ODg1OTM3NSwxNi4zNjI4NzM3MjE4NzUsNS43MzgyNjc4NTkzNzUsMTYuNDIzNzQwNTcxODc1TDUuNzM4MjY1ODU5Mzc1LDE2LjQyMzkyNDQzMTg3NUw1LjcyMTYzMDg1OTM3NSwxOC4xNzA1NTk5MjE4NzVaIgogICAgICAgICAgICAgICAgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjEiIC8+CiAgICAgICAgPC9nPgogICAgICAgIDxnCiAgICAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuODY2MDI1Mzg4MjQwODE0MiwtMC41LDAuNSwwLjg2NjAyNTMyODYzNjE2OTQsLTAuNTQwOTYzNTgwMzU4OTQ4MSwzLjE0ODQ1NDcwMDUzMTE0NykiPgogICAgICAgICAgICA8cGF0aAogICAgICAgICAgICAgICAgZD0iTTQuOTA0NjY0MjU3ODEyNSwxOC41NTQ1NzkxOTkyMTg3NUw0LjkwNDY2MzI1NzgxMjUsMTguNTU0Njc5MTk5MjE4NzVMNC45MDQ2MTQyNTc4MTI1LDE4LjU2Mjk3OTE5OTIxODc1MlE0LjkwNDYxNDI1NzgxMjUsMTguNTc1Njc5MTk5MjE4NzUsNC45MDUwNzUyNTc4MTI1LDE4LjU4ODM3OTE5OTIxODc1UTQuOTA5ODA5MjU3ODEyNSwxOC43MTg3NzkxOTkyMTg3NSw0Ljk2MTIzMDI1NzgxMjUsMTguODM4Nzc5MTk5MjE4NzVRNS4wMTI2NTEyNTc4MTI1LDE4Ljk1ODY3OTE5OTIxODc1LDUuMTAzODQ3MjU3ODEyNSwxOS4wNTIwNzkxOTkyMTg3NVE1LjIwMTEzODI1NzgxMjUsMTkuMTUxNjc5MTk5MjE4NzUsNS4zMjkxNDEyNTc4MTI1LDE5LjIwNjQ3OTE5OTIxODc1UTUuNDU3MTQ1MjU3ODEyNSwxOS4yNjEyNzkxOTkyMTg3NSw1LjU5NjM3Mzk0NzgxMjUsMTkuMjYyODc5MTk5MjE4NzVMNS42MDQ2MTQyNTc4MTI1LDE5LjI2Mjk3OTE5OTIxODc1UTUuNjY0Njg0NzU3ODEyNSwxOS4yNjI5NzkxOTkyMTg3NSw1LjcyMzg3NzI1NzgxMjUsMTkuMjUyNjc5MTk5MjE4NzVRNS43ODM4NTYyNTc4MTI1LDE5LjI0MjM3OTE5OTIxODc1LDUuODQxMTQ2MjU3ODEyNSwxOS4yMjE3NzkxOTkyMTg3NVE1Ljg5ODQzNTI1NzgxMjUsMTkuMjAxMTc5MTk5MjE4NzUsNS45NTEzMTQyNTc4MTI1LDE5LjE3MTA3OTE5OTIxODc1UTYuMDA0MTkzMjU3ODEyNSwxOS4xNDA4NzkxOTkyMTg3NSw2LjA1MTA3NTI1NzgxMjUsMTkuMTAyMDc5MTk5MjE4NzVRNi4wOTc5NTcyNTc4MTI1LDE5LjA2MzI3OTE5OTIxODc1LDYuMTM3NDM0MjU3ODEyNSwxOS4wMTY5NzkxOTkyMTg3NVE2LjE3NjkxMTI1NzgxMjUsMTguOTcwNTc5MTk5MjE4NzUsNi4yMDc3OTgyNTc4MTI1LDE4LjkxODE3OTE5OTIxODc1UTYuMjM4Njg1MjU3ODEyNTAwNSwxOC44NjU2NzkxOTkyMTg3NSw2LjI2MDA1NTI1NzgxMjUsMTguODA4Njc5MTk5MjE4NzVRNi4yODE0MjYyNTc4MTI1LDE4Ljc1MTY3OTE5OTIxODc1LDYuMjkyNjM3MjU3ODEyNSwxOC42OTE4NzkxOTkyMTg3NVE2LjMwMzg0OTI1NzgxMjUsMTguNjMyMDc5MTk5MjE4NzUsNi4zMDQ1NjUyNTc4MTI1LDE4LjU3MTE3OTE5OTIxODc1TDYuMzA0NTY3MjU3ODEyNSwxOC41NzEwNzkxOTkyMTg3NUw2LjMyNTkwNTI1NzgxMjUsMTYuNzU4NTc5MTk5MjE4NzVMNi4zMjU5NTMyNTc4MTI1LDIuNTgzNjc5MTk5MjE4NzVRNi4zMjU5NTMyNTc4MTI1LDIuNTE0NzM1MTk5MjE4NzUsNi4zMTI1MDMyNTc4MTI1LDIuNDQ3MTE2MTk5MjE4NzUwMlE2LjI5OTA1MzI1NzgxMjUsMi4zNzk0OTcxOTkyMTg3NSw2LjI3MjY2OTI1NzgxMjUsMi4zMTU4MDExOTkyMTg3NVE2LjI0NjI4NTI1NzgxMjUsMi4yNTIxMDUxOTkyMTg3NSw2LjIwNzk4MjI1NzgxMjUsMi4xOTQ3ODAxOTkyMTg3NVE2LjE2OTY3OTI1NzgxMjUsMi4xMzc0NTUxOTkyMTg3NSw2LjEyMDkyODI1NzgxMjUsMi4wODg3MDQxOTkyMTg3NVE2LjA3MjE3NzI1NzgxMjUsMi4wMzk5NTQxOTkyMTg3NDk4LDYuMDE0ODUyMjU3ODEyNSwyLjAwMTY1MDE5OTIxODc1UTUuOTU3NTI3MjU3ODEyNSwxLjk2MzM0NzE5OTIxODc1MDEsNS44OTM4MzIyNTc4MTI1LDEuOTM2OTYzMTk5MjE4NzVRNS44MzAxMzYyNTc4MTI1LDEuOTEwNTgwMTk5MjE4NzQ5OSw1Ljc2MjUxNjI1NzgxMjUsMS44OTcxMjkxOTkyMTg3NVE1LjY5NDg5NzQ1NzgxMjUsMS44ODM2NzkxOTkyMTg3NSw1LjYyNTk1MzQ1NzgxMjUsMS44ODM2NzkxOTkyMTg3NVE1LjU1NzAwOTU1NzgxMjUsMS44ODM2NzkxOTkyMTg3NSw1LjQ4OTM5MDI1NzgxMjUwMDUsMS44OTcxMjkxOTkyMTg3NVE1LjQyMTc3MTI1NzgxMjUsMS45MTA1ODAxOTkyMTg3NDk5LDUuMzU4MDc1MjU3ODEyNSwxLjkzNjk2MzE5OTIxODc1UTUuMjk0Mzc5MjU3ODEyNSwxLjk2MzM0NzE5OTIxODc1MDEsNS4yMzcwNTQyNTc4MTI1LDIuMDAxNjUwMTk5MjE4NzVRNS4xNzk3MjkyNTc4MTI1LDIuMDM5OTU0MTk5MjE4NzQ5OCw1LjEzMDk3OTI1NzgxMjUsMi4wODg3MDQxOTkyMTg3NVE1LjA4MjIyODI1NzgxMjUsMi4xMzc0NTUxOTkyMTg3NSw1LjA0MzkyNTI1NzgxMjUsMi4xOTQ3ODAxOTkyMTg3NVE1LjAwNTYyMTI1NzgxMjUsMi4yNTIxMDUxOTkyMTg3NSw0Ljk3OTIzODI1NzgxMjUsMi4zMTU4MDExOTkyMTg3NVE0Ljk1Mjg1NDI1NzgxMjUsMi4zNzk0OTcxOTkyMTg3NSw0LjkzOTQwNDI1NzgxMjUsMi40NDcxMTYxOTkyMTg3NTAyUTQuOTI1OTUzMjU3ODEyNSwyLjUxNDczNTE5OTIxODc1LDQuOTI1OTUzMjU3ODEyNSwyLjU4MzY3OTE5OTIxODc1TDQuOTI2MDAyMjU3ODEyNSwxNi43NDIwNzkxOTkyMTg3NUw0LjkwNDY2NDI1NzgxMjUsMTguNTU0NTc5MTk5MjE4NzVaIgogICAgICAgICAgICAgICAgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjEiIC8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=') 2x) 13 13, auto !important;
}
</style>