/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>

interface Props {
    size?: number
    width?: number
    color?: string
}

defineProps<Props>();

</script>
<template>
<div class="container"
     :style="{ width: size ? `${size}px` : '60px', height: size ? `${size}px` : '60px', 'border-width': width ? `${width}px` : '4px' }">
    <div class="loader" :style="{ borderTopColor: color, borderLeftColor: color }"></div>
</div>
</template>

<style scoped lang="scss">
.container {
    width: 12px;
    height: 12px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;

    > .loader {
        width: 100%;
        height: 100%;
        border: solid transparent;
        border-top: solid var(--active-color);
        border-left: solid var(--active-color);
        border-radius: 50%;
        box-sizing: border-box;

        & {
            animation: spin 1s linear infinite;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
}
</style>