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
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Selection } from "@/context/selection";

const props = defineProps<{
    context: Context
}>();

const insertPath = ref<string>();

function selectionWatcher(t: any, params?: any) {
    if (t === Selection.PRE_INSERT) {
        if (typeof params === 'string') {
            insertPath.value = params;
        } else {
            insertPath.value = '';
        }
    }
}

onMounted(() => {
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatcher);
})
</script>
<template>
<svg v-if="insertPath" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"
     overflow="visible" width="100" height="100" viewBox="0 0 100 100"
     style="pointer-events: none;transform: translate(0px, 0px); position: absolute;">
    <path v-if="insertPath" class="blinking" :d="insertPath" stroke-linecap="round"/>
</svg>
</template>
<style scoped lang="scss">
@keyframes blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

.blinking {
    transition: 0.1s;
    stroke: var(--active-color);
    stroke-width: 4px;
    animation: blink 0.75s infinite;
}
</style>