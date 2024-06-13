<script setup lang='ts'>
import { Context } from '@/context';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { page_scale } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context,
    params: any
}
const props = defineProps<Props>();
const cus = ref<boolean>(false);
const input = ref<HTMLInputElement>();
const inputSpan = ref<HTMLSpanElement>()
const inputSpan2 = ref<HTMLSpanElement>()
const inputWidth = ref(32)
let scale = ref<string>('100');
function input_cus() {
    cus.value = !cus.value;
    nextTick(() => {
        if (input.value) {
            if (inputSpan2.value) {
                inputSpan2.value.innerHTML = scale.value
                inputWidth.value = inputSpan2.value.offsetWidth
            }
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
    if (inputSpan.value) {
        inputWidth.value = inputSpan.value.offsetWidth
    }
}
function watcher(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        scale.value = (props.context.workspace.matrix.toArray()[0] * 100).toFixed(0);
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (inputSpan2.value) {
        inputSpan2.value.innerHTML = value
        inputWidth.value = inputSpan2.value.offsetWidth
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
        <span v-if="!cus" @click="input_cus" ref="inputSpan" style="height: 15px;font-size: 13px;display: flex;
    align-items: center;justify-content: center;" :style="{ width: '100%', height: '100%', minWidth: '33px' }">{{ scale
    }}%</span>
        <input v-if="cus" type="text" ref="input" @input="onInputName"
            :style="{ width: inputWidth + 'px', minWidth: '32px' }">
        <span v-if="cus" style="position: absolute; visibility: hidden; top: 0px;" ref="inputSpan2"></span>
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
    //padding: 9px 19px 8px 20px;
    box-sizing: border-box;

    input {
        width: 33px;
        height: 15px;
        font-size: 13px;
        background-color: transparent;
        outline: none;
        border: none;
        color: var(--theme-color-anti);
        padding: 0;
        font-feature-settings: "kern" on;
    }
}
</style>