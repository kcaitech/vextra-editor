<script setup lang="ts">
import {Context} from "@/context";
import {onMounted, onUnmounted} from "vue";
import PathEdit from "@/components/Document/Selection/Controller/Points/PathEdit.vue";
import {Selection} from "@/context/selection";
import {dbl_action} from "@/utils/mouse_interactive";

interface Props {
    context: Context
}

const props = defineProps<Props>();

function down() {
    dbl_action() && exit();
}

function move() {

}

function up() {

}

function selection_watcher(type: Number) {
    if (type === Selection.CHANGE_SHAPE) {
        props.context.workspace.setPathEditMode(false);
    }
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}

onMounted(() => {
    console.log('PATH-EDIT-MODE');
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    console.log('EXIT-PATH-EDIT-MODE');
})
</script>
<template>
    <div class="wrapper" @wheel.stop @mousedown.stop="down" @mousemove="move" @mouseup="up">
        <PathEdit :context="props.context"></PathEdit>
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