/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <img :src="icon" :class="svgClass" aria-hidden="true"/>
</template>
 
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ icon: string, className?: string }>();
const svgClass = computed(() => {
    if (props.className) {
        return 'svg-icon ' + props.className
    } else {
        return 'svg-icon'
    }
})
</script>