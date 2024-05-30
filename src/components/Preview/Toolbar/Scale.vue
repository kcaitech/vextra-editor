<script setup lang='ts'>
import { Context } from '@/context';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { page_scale } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
}
const props = defineProps<Props>();
let scale = ref<string>('100');

function init() {
    scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0);
}
function watcher(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0);
    }
}

onMounted(() => {
    props.context.workspace.watch(watcher);
    init();
})
onUnmounted(() => {
    props.context.workspace.watch(watcher);
})
</script>
<template>
    <div class="scale-display-warp">
        <span ref="inputSpan">{{ scale }}%</span>
    </div>
</template>
<style lang='scss' scoped>
.scale-display-warp {
    min-width: 32px;
    width: 72px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--default-radius);
    box-sizing: border-box;

    span {
        height: 15px;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>