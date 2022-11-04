<script setup lang="ts">
import { Repository } from "@/data/transact";
import { computed, ref } from "@vue/reactivity";
import { defineProps, onBeforeUpdate, onMounted, onUnmounted } from "vue"
import Icon from "../common/Icon.vue";
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
        <Icon maskclass="icon-undomask" :onclick="undoClick" :valid="undoValid()" :selected="false"></Icon>
        <Icon maskclass="icon-redomask" :onclick="redoClick" :valid="redoValid()" :selected="false"></Icon>
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

<style>
.icon-redomask {
    mask: url("@/assets/redo.svg") no-repeat center / 100%;
}

.icon-undomask {
    mask: url("@/assets/undo.svg") no-repeat center / 100%;
}
</style>