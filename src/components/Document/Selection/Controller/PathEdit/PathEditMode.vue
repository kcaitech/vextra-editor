<script setup lang="ts">
import {Context} from "@/context";
import {onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {Selection, XY} from "@/context/selection";
import {dbl_action} from "@/utils/mouse_interactive";
import Selector4PEM, {SelectorFrame} from "@/components/Document/Selection/Controller/PathEdit/Selector4PEM.vue";
import {Matrix} from "@kcdesign/data";
import {Action} from "@/context/tool";
import {root_scale, root_trans} from "@/utils/content";
import {WorkSpace} from "@/context/workspace";
import CtrlPathEdit from "@/components/Document/Selection/Controller/CtrlPathEdit.vue";

interface Props {
    context: Context
}

const props = defineProps<Props>();
const selector_mount = ref<boolean>(false);
const selectorFrame = ref<SelectorFrame>({top: 0, left: 0, width: 0, height: 0, includes: false});
const mousedownOnClientXY: XY = {x: 0, y: 0}; // 鼠标在page中的坐标
const matrix: Matrix = reactive(props.context.workspace.matrix as any);
let matrix_inverse: Matrix = new Matrix();
let main_button_is_down: boolean = false;

function onMouseWheel(e: WheelEvent) { // 滚轮、触摸板事件
    e.preventDefault();
    const {ctrlKey, metaKey, deltaX, deltaY} = e;
    if (ctrlKey || metaKey) { // 缩放
        root_scale(props.context, e);
    } else {
        if (Math.abs(deltaX) + Math.abs(deltaY) < 100) { // 临时适配方案，需根据使用设备进一步完善适配
            matrix.trans(-deltaX, -deltaY);
        } else {
            root_trans(props.context, e, 50);
        }
    }
    props.context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function down(e: MouseEvent) {
    if (e.button !== 0) return;
    setMousedownXY(e);
    main_button_is_down = true;
    props.context.path.reset_points();
    dbl_action() && exit();
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        e.stopPropagation();
    }
    if (main_button_is_down && props.context.tool.action === Action.AutoV) {
        select(e);
    }
}

function up() {
    selector_mount.value = false;
    main_button_is_down = false;
}

function setMousedownXY(e: MouseEvent) { // 记录鼠标在页面上的点击位置
    const {x, y} = props.context.workspace.root;
    mousedownOnClientXY.x = e.clientX - x;
    mousedownOnClientXY.y = e.clientY - y; //页面坐标系上的点
}

function select(e: MouseEvent) {
    const {x: rx, y: ry} = props.context.workspace.root;
    const {x: mx, y: my} = {x: e.clientX - rx, y: e.clientY - ry};
    const {x: sx, y: sy} = mousedownOnClientXY;
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

function selection_watcher(type: Number) {
    if (type === Selection.CHANGE_SHAPE) {
        props.context.workspace.setPathEditMode(false);
    }
}

function matrix_watcher(nm: Matrix) {
    matrix_inverse = new Matrix(nm.inverse);
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}

function window_blur() {
    selector_mount.value = false;
    // todo
}

watch(() => matrix, matrix_watcher, {deep: true});
onMounted(() => {
    console.log('PATH-EDIT-MODE');
    props.context.selection.watch(selection_watcher);
    window.addEventListener('blur', window_blur);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    window.removeEventListener('blur', window_blur);
    console.log('EXIT-PATH-EDIT-MODE');
})
</script>
<template>
    <div class="wrapper" @wheel.stop @mousedown.stop="down" @mousemove="move" @mouseup="up" @wheel="onMouseWheel">
        <CtrlPathEdit :context="props.context"></CtrlPathEdit>
        <Selector4PEM v-if="selector_mount" :context="props.context" :selector-frame="selectorFrame"></Selector4PEM>
    </div>
</template>
<style scoped lang="scss">
.wrapper {
    cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABDCAYAAAAs/QNwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUxSURBVHgB7VrPT6NVFL1taYFCS6kg8mPGdqSj4o/pDPFXNBFdGDVB0YS1uHJlAkYTXYH+BbjSuBDWJiZs3GgiYW8EN7oEo44LSAAHhyEzw5tzvvcelI92Ap3S9uu8k5y8Thnod+999557L4g4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODhUFhnDukNEzh4hsBNcBlvB38Abcp8gNDMzE8bZBCrDVfB9pVRIGhnGQBofzWQyLTjX5NAJB44AQw3pDBo1Pj7OFGsGE+APfHtsbEzBIX5HvCI6VRoKNIgOYN6zBnwDKqSEIubm5vyOmAcvSAM5goYw9+OJRKIL50egmpiYUBarq6tqenq60AnWEdlGSAvvBvT09LThpAPeAFU+n1d+0BF0jBx1xOfgBXxZggqvCA4MDDAF0uCLoEqlUqoUijjCFsqwBDA1bA2gAnS2traew/kfqNbW1tTdsLy87N0UOeqIicClhXlgqkAKDhjA+TvfXlxcVCdBkUJJR7wqAZJOPmSss7OzA2cv+D2o5ufn1WlQTDFaWlqyEoC04ANGwURbW9tDOL8E1eTkpCoHVIwi0lnXjrDNEJXgQfBjMc1QubiLYtStdEZ6e3u9XiASibyJf3tRvFcERTHsDfCkMBaLPSXmgSsFOmJkZKTojCH1AKWvpSeFIJXgbzmBFJ4WJRTjHX6+qnEz5SkBSCXoB38C1cLCgqo0Njc3/f0DuZBMJtNS4kaEpQoYHh5WXV1d+/F4nA/EZkhwA6RSWFpakqmpKclms7KysmLf5ud8DX6Vy+WuYQijA2qSFnYoaocU9uD8QnxDUbnRnp2d9ec/+Qv4Gfgk2C16FI+ZWnTMAU1y9rAJqEKh0L7oGiBbW1tSDhhtpI+gmSr8GTvgd+DPorvNPfAGblwTCm8E80d4fX19X2oIej8ueip8ScqQwhLR/hX8FHwNfA68AlJpLoLnzY1LDg4Osh1nsGujDNwLmqnwAfBhMQbwGp8EPr2/Bn4Lvgc+Dz4DXqbEgo/h9SPgOWN8SrTj2Y1Wpd6VQthEgQ/EqdCTQk59pzD+X/BD8AXR0R6ORqN5nE+AOdFr9/729nZ2nKz6zP1WFGAaX7voG9D7dEAS7AN/lBMMRT7j3wWfhdGXRV/zx0VH+7zoQasLuZ7iAsYsYWNImSY57Axr6oCDoQjkUDQnBftBP5gaBfl+FRwDr5hOkvmdAfvNNU9DYhNst80t4+dEzDq+flpiMesx89CfSAkp9DUzVzE/0Pi8ye+MFERb9JDFaEdttJXuPOtvKDIPaPeD3lDk3w/6jRcd+Uvgo6JrR3c6nU76o60CsBw5WJFjKqQSHNsPFjH+bfBSc3PzRbNN4ve1g83GmV5jo3SfH4jtEHPSDkVH9oNFjH9LdOSZ7zSeVZ23J8bcDkLEj8EUJSuFHIr+ELMf9BuPSs/I58z/S/PKi5ayQG6HLUJDQ0OcCq0UevtBpoEcjfzTonW9r6Ojg7clbrQ80MZbRClZOKkE3n5QihiPnO83xrN79Iw/q2tf7fZQbWxsKHRrNPov8x6N/wDX/k+cuxhg/t/d3b2+vb3NvyG4iSmOQwwHqdpuNSoAqwRxowT8Vdk/4Oui29lBGM/UYMHzIl9vzcw9o2A/yOs9BL5MmRO92u4z7/PrhU1NQ4ER9Qoh0qDb6LsdYLzJraDgVe2Bqgaluxbm9K2dnZ095jpeX8dr5vsejL85Ojp6Ww6XKGeOWlwxpkG44CRuG+4bNjRsMWyyZG0wBe++gf3rsXDDVXqHgOEONuYyL5lnAxQAAAAASUVORK5CYII=') 2x) 13 13, auto !important;
    background-color: rgba(0, 0, 255, 0.1);
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
}
</style>