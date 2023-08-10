<script setup lang='ts'>
import { Context } from '@/context';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { page_scale } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const cus = ref<boolean>(false);
const input = ref<HTMLInputElement>();
let scale = ref<string>('100');
function input_cus() {
    cus.value = !cus.value;
    nextTick(() => {
        if (input.value) {
            input.value.value = scale.value;
            input.value.select();
            input.value.addEventListener('blur', blur);
            document.addEventListener('keydown', enter)
        }
    })
}
function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (input.value) {
            page_scale(props.context, (Number(input.value.value) || props.context.workspace.matrix.m00 * 100) / 100);
        }
        cus.value = false;
        document.removeEventListener('keydown', enter);
    }
}
function blur() {
    if (input.value) {
        page_scale(props.context, (Number(input.value.value) || props.context.workspace.matrix.m00 * 100) / 100);
    }
    cus.value = false;
    document.removeEventListener('keydown', enter);
}
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
        <span v-if="!cus" @click="input_cus">{{ scale }}%</span>
        <input v-if="cus" type="text" ref="input">
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
    cursor: pointer;

    input {
        background-color: transparent;
        outline: none;
        border: none;
        width: 100%;
        color: var(--theme-color-anti);
        font-size: var(--font-default-fontsize);
        width: 48px;
    }
}
</style>