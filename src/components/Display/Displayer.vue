/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RefreshTiming } from "./react";
import { Context } from "@/context";

const props = withDefaults(
    defineProps<{
        context: Context;
        refreshTiming?: RefreshTiming;
        backgroundColor?: string;
    }>(),
    {
        backgroundColor: '#000',
        refreshTiming: RefreshTiming.Focus
    }
);

const root = ref<HTMLDivElement>();

function refresh() {
    console.log('__refresh__');
}

function __init() {
    const rootEL = root.value;
    if (rootEL) {
        rootEL.style.backgroundColor = props.backgroundColor;
    }
    if (props.refreshTiming === RefreshTiming.Focus) {
        console.log('__focus__');
        window.addEventListener('focus', refresh);
    }
}

function destroy() {
    window.removeEventListener('focus', refresh);
}

onMounted(__init);
onUnmounted(destroy);
</script>
<template>
<div ref="root" class="root">

</div>
</template>
<style lang="scss">
.root {
    width: 600px;
    height: 600px;
}
</style>