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
import { SymbolListItem } from '@/utils/symbol';
import { onMounted, ref } from 'vue';
interface Props {
    data: SymbolListItem
}
interface Slice {
    slice: string
    is_tail: boolean
}
const props = defineProps<Props>();
const title_slice = ref<Slice[]>([]);
function init_slice() {
    let slice: any[] = [props.data.title];
    let p = props.data.parent;
    while (p) {
        slice.unshift(p.title);
        p = p.parent;
    }
    if (slice.length > 4) {
        slice = [...slice.slice(0, 2), '...', ...slice.slice(slice.length - 2)];
    }
    if (slice.length > 1) {
        for (let i = 0, len = slice.length - 1; i < len; i++) {
            slice[i] = { slice: slice[i] + ` /`, is_tail: false };
        }
    }
    slice[slice.length - 1] = { slice: props.data.title, is_tail: true };
    title_slice.value = slice;
}
onMounted(init_slice);
</script>
<template>
    <div class="comp_title" >
        <span :class="slice.is_tail ? 'tail' : 'parent-node'" v-for="(slice, index) in title_slice" :key="index">{{ slice.slice }}</span>
    </div>
</template>
<style lang="scss" scoped>
.comp_title {
    display: flex;
    align-items: center;
    width: calc(100% - 14px);
}

.parent-node {
    color: #c0c0c0;
    padding-right: 4px;
}

.tail {
    flex: 1;
    font-size: 12px;
    line-height: 14px;
    color: #262626;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>