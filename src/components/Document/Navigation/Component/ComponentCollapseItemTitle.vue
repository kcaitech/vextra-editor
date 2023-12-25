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
            slice[i] = { slice: slice[i] + ' / ', is_tail: false };
        }
    }
    slice[slice.length - 1] = { slice: props.data.title, is_tail: true };
    title_slice.value = slice;
}
onMounted(init_slice);
</script>
<template>
    <div v-for="(slice, index) in title_slice" :key="index">
        <span :class="slice.is_tail ? 'tail' : 'parent-node'">{{ slice.slice }}</span>
    </div>
</template>
<scoped lang="scss" scoped>
div>span {
    
    white-space: pre;
}

.parent-node {
    color: #c0c0c0;
}

.tail {
    font-size: 12px;
    line-height: 14px;
    color: #262626;
}
</scoped>