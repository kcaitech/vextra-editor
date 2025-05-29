/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <svg style="width: 36px;height: 20px;" xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"
        fill="none">
        <path class="path-animation"
            d="M0 90C0 40.2944 40.2944 0 90 0H310C359.706 0 400 40.2944 400 90V110C400 159.706 359.706 200 310 200H90C40.2944 200 0 159.706 0 110V90Z"
            :fill="props.toggleoff ? props.bgcolor : '#8C8C8C'" />
        <circle class="circle-animation" :cx="props.toggleoff ? 290 : 110" cy="100" r="90" fill="#ffffff" />
    </svg>
</template>
  
<script setup lang="ts">
const props = defineProps<{
    bgcolor?: string,
    toggleoff: boolean
}>()

</script>
  
<style>

.circle-animation {
    transition: cx 0.2s ease-in-out;
}

.path-animation {
    transition: fill 0.2s ease-in-out;
}
</style>
  