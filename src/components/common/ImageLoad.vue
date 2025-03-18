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
interface Props {
    status: 'loading' | 'failed'
    x: number
    y: number
    height: number
    width: number
}
const props = defineProps<Props>()
</script>
<template>
    <svg :width="props.width" :height="props.height" class="container" :style="{ left: props.x, top: props.y }">
        <g>
            <svg v-if="props.status === 'loading'" class="svg" x="10%" y="10%" width="80%" height="80%" viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12.5 10c1.38 0 2.5-1.12 2.5-2.5C15 6.12 13.88 5 12.5 5 11.12 5 10 6.12 10 7.5c0 1.38 1.12 2.5 2.5 2.5zM14 7.5c0 .828-.672 1.5-1.5 1.5-.828 0-1.5-.672-1.5-1.5 0-.828.672-1.5 1.5-1.5.828 0 1.5.672 1.5 1.5zM17 1H1v16h16V1zm-1 1v14h-1.293L6 7.293l-4 4V2h14zM2 16v-3.293l4-4L13.293 16H2z"
                    fill-rule="evenodd" fill-opacity="1" fill="grey" stroke="none">
                </path>
            </svg>
            <svg v-else-if="props.status === 'failed'" class="svg" x="10%" y="10%" width="80%" height="80%"
                viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M776 328m-72 0a72 72 0 1 0 144 0 72 72 0 1 0-144 0Z" stroke="grey" stroke-width="50"
                      fill="none"/>
                <path fill="grey"
                      d="M999.904 116.608a32 32 0 0 0-21.952-10.912l-456.192-31.904a31.552 31.552 0 0 0-27.2 11.904l-92.192 114.848a32 32 0 0 0 0.672 40.896l146.144 169.952-147.456 194.656 36.48-173.376a32 32 0 0 0-11.136-31.424L235.616 245.504l79.616-125.696a32 32 0 0 0-29.28-49.024l-240.192 16.768a32 32 0 0 0-29.696 34.176l55.808 798.016a32.064 32.064 0 0 0 34.304 29.696l176.512-13.184c17.632-1.312 30.848-16.672 29.504-34.272s-16.576-31.04-34.304-29.536l-144.448 10.784-6.432-92.512 125.312-12.576a32 32 0 0 0 28.672-35.04 32.16 32.16 0 0 0-35.04-28.672l-123.392 12.416L82.144 149.184l145.152-10.144-60.96 96.224a32 32 0 0 0 6.848 41.952l198.4 161.344-58.752 279.296a30.912 30.912 0 0 0 0.736 14.752 31.68 31.68 0 0 0 1.408 11.04l51.52 154.56a31.968 31.968 0 0 0 27.456 21.76l523.104 47.552a32.064 32.064 0 0 0 34.848-29.632L1007.68 139.84a32.064 32.064 0 0 0-7.776-23.232z m-98.912 630.848l-412.576-39.648a31.52 31.52 0 0 0-34.912 28.768 32 32 0 0 0 28.8 34.912l414.24 39.808-6.272 89.536-469.728-42.72-39.584-118.72 234.816-310.016a31.936 31.936 0 0 0-1.248-40.192L468.896 219.84l65.088-81.056 407.584 28.48-40.576 580.192z"/>
            </svg>
        </g>
    </svg>
</template>
<style scoped>
.container {
    position: absolute;
}
</style>