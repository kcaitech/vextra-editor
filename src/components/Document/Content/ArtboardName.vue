<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Shape } from "@kcdesign/data";
import { Context } from "@/context";
const props = defineProps<{
    name: string,
    index: number,
    maxWidth: number,
    shape: Shape,
    selected: boolean,
    context: Context
}>()
const emit = defineEmits<{
    (e: 'rename', value: string, shape: Shape): void
    (e: 'hover', shape: Shape): void
    (e: 'leave'): void
}>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const inputSpan = ref<HTMLSpanElement>()
const esc = ref<boolean>(false)
const inputWidth = ref(5)
const hover = ref(false)

const onRename = () => {
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            if (inputSpan.value) {
                inputSpan.value.innerHTML = props.name
                inputWidth.value = inputSpan.value.offsetWidth + 2
            }
            (nameInput.value as HTMLInputElement).value = props.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur)
}

const stopInput = () => {
    esc.value = false
    isInput.value = false
}

const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
    }
}

const onInputBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.rename')) {
        var timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur()
            }
            clearTimeout(timer)
            document.removeEventListener('click', onInputBlur);
        }, 10)
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (inputSpan.value) {
        inputSpan.value.innerHTML = value
        inputWidth.value = inputSpan.value.offsetWidth + 2
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (esc.value) return
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
    emit('rename', value, props.shape)
}

const hoverShape = (e: MouseEvent) => {
    emit('hover', props.shape)
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    emit('leave')
    hover.value = false
}

const selectShape = (e: MouseEvent) => {
    props.context.menu.menuMount(false)
    props.context.selection.selectShape(props.shape);
    if (e.button === 2) {
        props.context.workspace.downArboardTitle(e)
    }
}
</script>

<template>
    <div class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown.stop="selectShape"
        @mousemove.stop data-area="controller">
        <div class="name" :class="{ selected: selected, active: hover }" :style="{ maxWidth: props.maxWidth + 'px' }"
            @dblclick="onRename">{{ props.name }}</div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
            ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName">
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0px;" ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    z-index: 2;

    .name {
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
        background-color: transparent;
    }

    .rename {
        height: 15px;
        outline-style: none;
        font-size: 9px;
        border: 1px solid var(--active-color);
        padding: 0 1px;
        margin-right: 1px;
        box-sizing: border-box;
    }

    .selected {
        color: var(--active-color);
    }

    .active {
        color: var(--active-color);
    }
}
</style>