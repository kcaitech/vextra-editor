<script lang="ts" setup>
import { defineProps, watchEffect, onMounted, onUnmounted, ref, reactive, nextTick, computed } from "vue";
import { Context } from "@/context";
import { Page } from '@kcdesign/data';
import { Shape, ShapeFrame } from "@kcdesign/data";
import { Matrix } from '@kcdesign/data';
import { Selection } from "@/context/selection";

const props = defineProps<{
    context: Context,
    matrix: number[],
    data: Page
}>()
type Posi = {
    x: number,
    y: number,
    width: number,
    name: string,
    shape: Shape,
    rotate: number | undefined,
    select: boolean,
    maxW: number
}
const reflush = ref(0);
const index = ref(-1)
const isInput = ref(false)
const inputWidth = ref(0)
const selectTitle = ref(false)
const esc = ref<boolean>(false)
let position: Posi[] = reactive([])

const watcher = () => {
    updater();
}
const matrix = new Matrix();

function updater(t?: number) {
    matrix.reset(props.matrix);
    watchShapes();
    // selectShape()
    // SET POSITION
    setPosition()
    reflush.value++;
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
    let titleArr = shapes.filter(t => {
        return t.type === 'group' || t.type === 'artboard'
    })
    if (titleArr) (
        position = titleArr.map((item: Shape, i: number) => {
            const selected = props.context.selection.selectedShapes;
            const hovered = props.context.selection.hoveredShape;
            const minWidth = document.querySelector(`[data-minW="${i}"]`);
            let minW = item.frame.width
            if(minWidth){
                minWidth.innerHTML = item.name
                minW = (minWidth as HTMLSpanElement).offsetWidth + 4
            }
            let select = false
            if(selected[0] && item.id === selected[0].id) {
                select = true
            }else if(hovered && item.id === hovered.id) {
                select = true
            }else{
                select = false   
            }
            const { x: sx, y: sy, height, width } = item.frame2Page();
            let x = sx
            let y = sy
            let name = item.name
            let rotate = item.rotation
            let maxW = minW
            const shape: Shape = item
            return { x, y, width, name, shape, rotate, select, maxW };
        })
    )
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
const unHoverShape = () => {
    // props.context.selection.unHoverShape();
}

const hoverShape = (shape: Shape, e: MouseEvent) => {
    props.context.selection.hoverShape(shape)
}

const selectShape = (shape: Shape, e:Event) => {
    e.stopPropagation()
    props.context.selection.selectShape(shape);
}


onMounted(() => {
    props.context.selection.watch(updater)
})
onUnmounted(() => {
    props.context.selection.unwatch(updater)
})
watchEffect(() => updater())
</script>
<template>
    <div class="shapeName" :style="{ transform: matrix.toString() }" :reflush="reflush !== 0 ? reflush : undefined">
        <div class="text" v-for="(c, i) in position" :key="i" :style="{
            position: 'absolute', width: c.shape.frame.width + 'px', maxWidth: c.shape.frame.width + 'px',
            transform: `translate(${c.x}px, ${c.y - 17}px) rotate(${c.rotate}deg)`
        }">
            <!-- 标题 -->
            <span v-if="index !== i" :style="{width: c.maxW+ 'px', maxWidth: c.shape.frame.width + 'px',}" @dblclick="e => onRename(e, c.shape, i)" :class="{selected:c.select}"
                @mouseenter="(e) => hoverShape(c.shape, e)" @mouseleave="unHoverShape" @click="e => selectShape(c.shape, e)">{{ c.name }}</span>
            <span v-if="index !== i"  :data-minW="i" style="position: relative; visibility: hidden; top: 0px;">{{ c.name }}</span>
            <!-- 输入框 -->
            <input v-if="isInput && index === i" class="input" @change="e => reName(e, c.shape)" @input="e => onChangeName(e, i)"
                :style="{ maxWidth: c.shape.frame.width + 'px', width: inputWidth + 'px' }" :data-index="i" type="text">
            <span :data-span="i" v-if="isInput && index === i" style="position: relative; visibility: hidden; top: 0px;"></span>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.shapeName {
    position: absolute;
    font-size: var(--font-default-fontsize);

    .text {
        // text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
        background-color: transparent;

        .input {
            height: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            outline-style: none;
            font-size: var(--font-default-fontsize);
            border: 1px solid var(--active-color);
            transform: translate(0, 0);

        }
        .selected {
            color: var(--active-color)
        }
    }
}
</style>