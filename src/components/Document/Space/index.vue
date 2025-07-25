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
import { onMounted, onUnmounted, ref, watch } from "vue";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";

const props = defineProps<{ context: Context, visible: boolean }>();
const cursorClass = ref<'grab' | 'grabbing'>('grab');

let lastXY: XY = { x: 0, y: 0 };

function down(event: MouseEvent) {
    if (event.button !== 0) return;
    event.stopPropagation();
    lastXY = event;
    cursorClass.value = "grabbing";

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}

function move(event: MouseEvent) {
    if (event.button !== 0) return;

    const dx = event.x - lastXY.x;
    const dy = event.y - lastXY.y;

    const workspace = props.context.workspace;
    workspace.matrix.trans(dx, dy);
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    lastXY = event;
}

function up() {
    clear()
}

function blur() {
    clear()
}

function clear() {
    cursorClass.value = 'grab';
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

function move2(event: MouseEvent) {
    if (!event.buttons) event.stopPropagation();
}

const stopWatchVisible = watch(() => props.visible, (v) => {
    if (v) {
        cursorClass.value = "grab";
        props.context.workspace.setCtrl('page');
        props.context.workspace.pageDragging(true);
        props.context.selection.unHoverShape();
    } else {
        props.context.workspace.pageDragging(false);
    }
});

onMounted(() => {
    window.addEventListener('blur', blur);
});
onUnmounted(() => {
    stopWatchVisible();
    window.removeEventListener('blur', blur);
});
</script>
<template>
<div
    :class="cursorClass"
    v-if="visible"
    style="width: 100%; height: 100%;position: absolute; top: 0;z-index: 10;"
    @mousedown="down"
    @mousemove="move2"
/>
</template>
<style scoped lang="scss">
.grab {
    cursor: grab;
}

.grabbing {
    cursor: grabbing;
}
</style>