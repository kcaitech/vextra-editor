<script setup lang='ts'>
import { Context } from '@/context';
import { onMounted, onUnmounted, ref } from 'vue';
interface Props {
    context: Context
}
const props = defineProps<Props>();
let scale = ref<string>('100');
function init() {
    scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0);
}
function watcher() {
    scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0);
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
        <span>{{ scale }}%</span>
    </div>
</template>
<style lang='scss' scoped>
.scale-display-warp {
    min-width: 32px;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: var(--theme-color-anti);
    font-size: var(--font-default-fontsize);
}
</style>