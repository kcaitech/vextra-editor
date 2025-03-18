/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import {
    Matrix,
    ShapeView,
} from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive } from 'vue';
import { Point } from "../../SelectionView.vue";
import { WorkSpace } from '@/context/workspace';
import { Translate2 } from "@/transform/translate/translate2";


interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    cFrame: Point[]
}

const props = defineProps<Props>();
const matrix = new Matrix();
let offest = -0.5;
const hidden = ref<boolean>(false);

let translate2: Translate2 | undefined = undefined;

function update() {
    matrix.reset(props.matrix);
    offest = matrix.m00 * -0.5;
    update_transform();
}

const box = reactive({
    x: 0,
    y: 0, 
    w: 0,
    h: 0
})

function update_transform() {
    const shape = props.shape, frame = shape.frame;
    let lt = matrix.computeCoord2(0, 0);
    let rt = matrix.computeCoord2(frame.width, 0);
    let rb = matrix.computeCoord2(frame.width, frame.height);
    let lb = matrix.computeCoord2(0, frame.height);

    box.x = lt.x;
    box.y = lt.y;
    box.w = rb.x - lt.x;
    box.h = rb.y - lt.y;

    const root = props.context.workspace.root;

    props.context.selection.setArea([
        { id: 'body', area: `M${lt.x} ${lt.y} L${rt.x} ${rt.y} L${rb.x} ${rb.y} L${lb.x} ${lb.y} z` },
        { id: 'content', area: `M0 0 h${root.width} v${root.height} h${-root.width} z` }
    ]);

    if (!props.context.workspace.shouldSelectionViewUpdate) {
        hidden.value = true;
    }
}

// let transporter: TranslateHandler | undefined = undefined;

// #endregion

function window_blur() {
    const workspace = props.context.workspace;
    // transporter?.fulfil();
    translate2?.fulfil();
    translate2 = undefined;
    workspace.scaling(false);
    workspace.setCtrl('page');
    props.context.cursor.reset();
}

function workspace_watcher(t: number, param1: MouseEvent) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        hidden.value = false;
        update();
    }
}

watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    window.addEventListener('blur', window_blur);
    props.context.workspace.watch(workspace_watcher);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
    window.removeEventListener('blur', window_blur);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <rect :x="box.x" :y="box.y" :width="box.w" :height="box.h" rx="2" ry="2" fill="none" stroke='#7F58F9' stroke-width="1.5px" />
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>