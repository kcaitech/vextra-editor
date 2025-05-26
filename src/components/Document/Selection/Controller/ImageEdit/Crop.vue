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
import { Context } from '@/context';

interface Props {
    context: Context
}
const props = defineProps<Props>();
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" overflow="visible"
         :width="100" :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g></g>
    </svg>
</template>

<style scoped lang="scss"></style>