/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
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
import { KeyboardMgr } from '@/keyboard';
import { onMounted, onUnmounted } from "vue";
import { useAuto, usePen } from "@/components/Document/Creator/execute";

const props = defineProps<{
    context: Context;
    selected: string;
}>();

let o: string;

function keyboard_up_watcher(e: KeyboardEvent) {
    if (!props.context.workspace.is_path_edit_mode) return;
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        props.context.tool.setAction(o);
        document.removeEventListener('keyup', keyboard_up_watcher);
    }
}

function keyboard_down_watcher(e: KeyboardEvent) {
    if (e.repeat) return;
    if (['MetaLeft', 'ControlLeft'].includes(e.code)) {
        o = props.context.tool.action;

        if (o === Action.PathClip) return;

        if (o !== Action.Curve) {
            props.context.tool.setAction(Action.Curve);
            document.addEventListener('keyup', keyboard_up_watcher);
        }
    }
}
const boardMgr = new KeyboardMgr(props.context);
onMounted(() => {
    boardMgr.addEventListener('keydown', keyboard_down_watcher);
})
onUnmounted(() => {
    boardMgr.removeEventListener('keydown', keyboard_down_watcher);
})
</script>
<template>
<div style="height: 100%;">
    <Auto :active="props.selected === Action.AutoV" @click="() => useAuto(context)"/>
    <Pen :active="props.selected === Action.Pen" @click="() => usePen(context)"/>
    <Curve :active="props.selected === Action.Curve" @click="() => props.context.tool.setAction(Action.Curve)"/>
    <PathClip :active="props.selected === Action.PathClip"
              @click="() => props.context.tool.setAction(Action.PathClip)"/>
</div>
</template>