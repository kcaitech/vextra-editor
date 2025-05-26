/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    valid?: boolean;
    selected?: boolean;

    width?: number;
    height?: number;
}>();
const toolButtonEl = ref<HTMLDivElement>();
defineExpose({ toolButtonEl });
</script>
<template>
<div ref="toolButtonEl" :style="{
        width: width ? width +'px' : 'fix-content',
        height: height ? height +'px' : '32px',
    }"
     :class="{ 'tool-button': true, 'tool-button-invalid': !!valid, 'tool-button-selected': !!selected }">
    <slot/>
</div>
</template>

<style scoped>
.tool-button {
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    color: #ffffff;
    border-radius: 4px;
    cursor: pointer;
}

.tool-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.tool-button-invalid {
    color: var(--grey-light);
}

.tool-button-selected {
    background-color: var(--active-color) !important;
}
</style>
