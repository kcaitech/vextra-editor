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

interface Props {
    x: number
    y: number
    size: number
}
const props = defineProps<Props>();
</script>

<template>
    <div class="percent_container" :style="{ transform: `translate(${x}px, ${y}px)` }">
        <span>{{size}}%</span>
    </div>
</template>

<style scoped lang="scss">
.percent_container {
    position: absolute;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;
    span {
        padding: 6px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0);
    }
}
</style>