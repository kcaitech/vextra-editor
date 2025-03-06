/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import Auto from '@/components/Document/Toolbar/PathEdit/Auto.vue'
import Curve from '@/components/Document/Toolbar/PathEdit/Curve.vue';
import PathClip from '@/components/Document/Toolbar/PathEdit/PathClip.vue';
import Pen from '@/components/Document/Toolbar/PathEdit/PathPen.vue';

import { Context } from "@/context";
import { Action } from "@/context/tool";
import { onMounted, onUnmounted } from "vue";

interface Props {
    context: Context
    selected: string
}

const emit = defineEmits<{
    (e: "select", action: string): void;
}>();

const props = defineProps<Props>();

function select(action: string) {
    emit("select", action);
}

function is_curve_active() {
    return props.selected === Action.Curve;
}

let o: string;

function keyboard_up_watcher(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || !props.context.workspace.is_path_edit_mode) return;
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        props.context.tool.setAction(o);
        document.removeEventListener('keyup', keyboard_up_watcher);
    }
}

function keyboard_down_watcher(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
    }
    if (e.repeat) {
        return;
    }
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        o = props.context.tool.action;

        if (o === Action.PathClip) {
            return;
        }

        if (o !== Action.Curve) {
            props.context.tool.setAction(Action.Curve);
            document.addEventListener('keyup', keyboard_up_watcher);
        }
    }
}

onMounted(() => {
    document.addEventListener('keydown', keyboard_down_watcher);
})
onUnmounted(() => {
    document.removeEventListener('keydown', keyboard_down_watcher);
})
</script>
<template>
<div class="wrapper">
    <Auto :active="props.selected === Action.AutoV" @select="select"></Auto>
    <Pen :active="props.selected === Action.Pen" @select="select"></Pen>
    <Curve :active="is_curve_active()" @select="select"></Curve>
    <PathClip :active="props.selected === Action.PathClip" @select="select"></PathClip>
</div>
</template>
<style scoped lang="scss">
.wrapper {
    height: 100%;
}
</style>