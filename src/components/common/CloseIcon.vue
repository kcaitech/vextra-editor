/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div class="close" @click.stop="emits('close')">
        <SvgIcon :icon="close_icon"
            :style="{ width: size ? `${size}px` : '18px', height: size ? `${size}px` : '18px' }"/>
    </div>
</template>
<script setup lang="ts">
import close_icon from "@/assets/icons/close.svg"
import SvgIcon from "./SvgIcon.vue";

interface Props {
    size?: number
    width?: number
}
defineProps<Props>();
const emits = defineEmits<{
    (e: 'close'): () => void
}>();

</script>
<style lang="scss" scoped>
.close {
    display: flex;
    //padding: 4px;
    //margin: 2px 0 0 0;

    //&:hover {
    //    background-color: #f3f0ff;
    //    border-radius: 3px;
    //    cursor: pointer;
    //
    //    >svg {
    //        fill: #9775fa;
    //    }
    //}
    //
    //&:active>svg {
    //    transform: scale(0.9);
    //}
}
</style>
