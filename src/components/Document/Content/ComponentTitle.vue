<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Shape } from "@kcdesign/data";
import { Context } from "@/context";
interface Props {
    name: string
    index: number
    maxWidth: number
    shape: Shape
    selected: boolean
    context: Context
}
interface Emits {
    (e: 'rename', value: string, shape: Shape): void
    (e: 'hover', shape: Shape): void
    (e: 'leave'): void
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
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
            nameInput.value.addEventListener('blur', stopInput);
            nameInput.value.addEventListener('keydown', keySaveInput);
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
        const timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur();
            }
            clearTimeout(timer);
            document.removeEventListener('click', onInputBlur);
        }, 10)
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (inputSpan.value) {
        inputSpan.value.innerHTML = value;
        inputWidth.value = inputSpan.value.offsetWidth + 2;
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (esc.value) return;
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return;
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
    props.context.menu.menuMount()
    props.context.selection.selectShape(props.shape);
    if (e.button === 2) {
        // props.context.workspace.downArboardTitle(e) // ***
    }
}
</script>

<template>
    <div class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown.stop="selectShape"
        @mousemove.stop data-area="controller">
        <div class="name" :style="{ maxWidth: props.maxWidth + 'px' }" @dblclick="onRename">
            <svg width="305" height="305" viewBox="0 0 305 305" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7.07106" y="152.895" width="90" height="90" transform="rotate(-45.0629 7.07106 152.895)"
                    fill="#5607F6" stroke="#5607F6" stroke-width="10" />
                <rect x="89.0054" y="70.7804" width="90" height="90" transform="rotate(-45.0629 89.0054 70.7804)"
                    fill="#5607F6" stroke="#5607F6" stroke-width="10" />
                <rect x="87.7697" y="233.416" width="90" height="90" transform="rotate(-45.0629 87.7697 233.416)"
                    fill="#5607F6" stroke="#5607F6" stroke-width="10" />
                <rect x="169.704" y="151.302" width="90" height="90" transform="rotate(-45.0629 169.704 151.302)"
                    fill="#5607F6" stroke="#5607F6" stroke-width="10" />
            </svg>
            {{ props.name }}
        </div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
            ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName">
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0px;" ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    .name {
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
        background-color: transparent;
        color: var(--component-color);
        display: inline-flex;
        align-items: center;

        >svg {
            width: 10px;
            height: 10px;
            padding: 0 2px 0 0;
        }
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
}
</style>