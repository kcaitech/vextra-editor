<script setup lang="ts">
import { Repository } from "@/data/transact";
import { ref } from "@vue/reactivity";
import { defineProps, onBeforeUpdate, onUnmounted } from "vue"
import Icon from "@/components/common/Icon.vue";
const redosvg = require("@/assets/redo.svg")
const undosvg = require("@/assets/undo.svg")
const props = defineProps<{ repo?: Repository }>();
let watcher: ((...args: any[]) => void) | undefined;
// function watcher() {
//     // repo.value = props.context.repo;
// }
const reflush = ref(0);
if (props.repo && watcher === undefined) {
    watcher = () => {
        reflush.value++;
    }
    props.repo.watch(watcher);
}
// onMounted(() => {
//     props.repo.watch(watcher);
// })
onUnmounted(() => {
    if (props.repo && watcher) {
        props.repo.unwatch(watcher);
        watcher = undefined;
    }
})
onBeforeUpdate(() => {
    if (props.repo && watcher === undefined) {
        watcher = () => {
            reflush.value++;
        }
        props.repo.watch(watcher);
    }
})
const undoValid = (() => {
    return props.repo !== undefined && props.repo.canUndo();
})
const redoValid = (() => {
    return props.repo !== undefined && props.repo.canRedo();
})
function undoClick() {
    console.log("undo")
    if (props.repo && props.repo.canUndo()) {
        props.repo.undo();
    }
}
function redoClick() {
    console.log("redo")
    if (props.repo && props.repo.canRedo()) {
        props.repo.redo();
    }
}
</script>

<template>
    <div class="undoredo" :reflush="reflush">
        <Icon :onclick="undoClick" :valid="undoValid()" :selected="false" :icon="undosvg"></Icon>
        <Icon :onclick="redoClick" :valid="redoValid()" :selected="false" :icon="redosvg"></Icon>
    </div>
</template>

<style scoped>
div.undoredo {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
}
</style>
