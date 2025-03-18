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
import { TransactDataGuard } from "@kcdesign/data";
import { ref } from "@vue/reactivity";
import { onBeforeUpdate, onMounted, onUnmounted } from "vue"
// import Icon from "@/components/common/Icon.vue";
import ToolButton from "./Buttons/ToolButton.vue"
const props = defineProps<{ repo?: TransactDataGuard }>();
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

import undo_icon from "@/assets/icons/svg/undo.svg";
import redo_icon from "@/assets/icons/svg/redo.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";

</script>

<template>
    <div class="undoredo" :reflush="reflush">
        <ToolButton :onclick="undoClick" :valid="undoValid()" :selected="false">
            <SvgIcon :icon="undo_icon"/>
        </ToolButton>
        <ToolButton :onclick="redoClick" :valid="redoValid()" :selected="false">
            <SvgIcon :icon="redo_icon"/>
        </ToolButton>
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
