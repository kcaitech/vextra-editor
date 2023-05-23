<script lang="ts" setup>
import { defineProps, watchEffect, onMounted, onUnmounted, ref, nextTick, computed } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";

const props = defineProps<{
    context: Context
    data: Page,
    matrix: number[]
}>()
interface Title {
    id: string
    content: string
}
const matrix = new Matrix(props.matrix);
const reflush = ref(0);
const index = ref(-1)
const isInput = ref(false)
const inputWidth = ref(0)
const selectTitle = ref(false)
const esc = ref<boolean>(false)
const titles: Title[] = [];
const origin: ClientXY = { x: 0, y: 0 };

const watcher = () => {
    reflush.value++;
    updater();
}

function updater() {
    watchShapes();
    setPosition()
}

const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedPage?.childs;

    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }

    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

const setPosition = () => {
    const shapes = props.data.childs

}
const onRename = (e: Event, shape: Shape, i: number) => {
    index.value = i
    isInput.value = true
    nextTick(() => {
        const select = document.querySelector(`[data-index="${i}"]`);
        const dataSpan = document.querySelector(`[data-span="${i}"]`);
        if (select) {
            const curInput = (select as HTMLInputElement)
            curInput.value = shape.name;
            if (dataSpan) {
                dataSpan.innerHTML = shape.name
                inputWidth.value = (dataSpan as HTMLSpanElement).offsetWidth + 2
            }
            curInput.focus();
            curInput.select();
            curInput.addEventListener('blur', stopInput);
            curInput.addEventListener('keydown', keySaveInput);
        }
    })
}
const onChangeName = (e: Event, i: number) => {
    const value = (e.target as HTMLInputElement).value
    const dataSpan = document.querySelector(`[data-span="${i}"]`);
    if (dataSpan) {
        dataSpan.innerHTML = value
        inputWidth.value = (dataSpan as HTMLSpanElement).offsetWidth + 2
    }
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
}
const reName = (e: Event, shape: Shape) => {
    const value = (e.target as HTMLInputElement).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.setName(value)
    props.context.selection.rename();
}
const stopInput = () => {
    esc.value = false
    isInput.value = false
    index.value = -1
}

const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
        index.value = -1
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
        index.value = -1
    }
}
function handleWorkspaceUpdate(t: any) {
    const workspace = props.context.workspace;
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        matrix.reset(workspace.matrix);
        matrix.preTrans(props.data.frame.x, props.data.frame.y);
        origin.x = matrix.m02;
        origin.y = matrix.m12;
    }
}

onMounted(() => {
    props.context.workspace.watch(handleWorkspaceUpdate)
    props.context.selection.watch(updater);
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(handleWorkspaceUpdate);
    props.data.unwatch(watcher);
    props.context.selection.unwatch(updater);
})
watchEffect(() => updater());
</script>
<template>
    <div class="container" :reflush="reflush !== 0 ? reflush : undefined"
        :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div class="title-container"></div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    position: absolute;
    font-size: var(--font-default-fontsize);
    background-color: rgba(0, 0, 55, 0.1);
    border: 1px solid salmon;

    .title-container {
        position: relative;
        height: 28px;
        width: 106px;
        background-color: aquamarine;
        opacity: 0;
    }
}
</style>