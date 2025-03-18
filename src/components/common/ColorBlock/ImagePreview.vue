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

import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ params: { data: string }, opacity: number }>();
const src = ref<string>('');

function draw() {
    src.value = props.params.data;
}

onMounted(draw);
onUnmounted(watch(() => props.params, draw));
</script>
<template>
    <div style="width: 100%; height: 100%; background-color: transparent; position: absolute;">
        <img :src="src" alt="fill-image" :style="{width: '100%', height: '100%','object-fit': 'cover', opacity}">
    </div>
</template>
