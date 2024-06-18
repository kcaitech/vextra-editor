<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ShapeView } from "@kcdesign/data";
import { Context } from "@/context";
import { XY } from '@/context/selection';
import { permIsEdit } from '@/utils/content';
import { Perm } from '@/context/workspace';
import { forbidden_to_modify_frame } from '@/utils/common';
import { TranslateHandler } from '@/transform/translate';

const props = defineProps<{
    name: string,
    maxWidth: number,
    shape: ShapeView,
    selected: boolean,
    context: Context
}>()

const emit = defineEmits<{
    (e: 'rename', value: string, shape: ShapeView): void
    (e: 'hover', shape: ShapeView): void
    (e: 'leave'): void
}>()

const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const inputSpan = ref<HTMLSpanElement>()
const esc = ref<boolean>(false)
const inputWidth = ref(5)
const hover = ref(false)
let isDragging: boolean = false;
let transporter: TranslateHandler | undefined = undefined;

let startPosition: XY = { x: 0, y: 0 };

const onRename = () => {
    if (!permIsEdit(props.context) || props.context.tool.isLable) {
        return;
    }

    isInput.value = true
    nextTick(() => {
        if (!nameInput.value) {
           return;
        }
        if (inputSpan.value) {
            inputSpan.value.innerHTML = props.name
            inputWidth.value = inputSpan.value.offsetWidth + 5
        }
        (nameInput.value as HTMLInputElement).value = props.name.trim();
        nameInput.value.focus();
        nameInput.value.select();
        nameInput.value?.addEventListener('blur', stopInput);
        nameInput.value?.addEventListener('keydown', keySaveInput);
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
        let timer = setTimeout(() => {
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
        inputWidth.value = inputSpan.value.offsetWidth + 5
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (esc.value) return
    if (value.length === 0 || value.trim().length === 0) return
    emit('rename', value, props.shape)
}

const hoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('hover', props.shape)
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('leave')
    hover.value = false
}

function down(e: MouseEvent) {
    const context = props.context;

    if ((context.workspace.documentPerm !== Perm.isEdit)) {
        context.selection.selectShape(props.shape);
        return;
    }

    if (e.button === 0) {
        if (props.context.workspace.isPageDragging) {
            return;
        }

        e.stopPropagation();
        context.selection.selectShape(props.shape);

        if (context.tool.isLable || forbidden_to_modify_frame(props.shape)) {
            return;
        }

        startPosition = { x: e.x, y: e.y };
        transporter = new TranslateHandler(props.context, e, [props.shape],);

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        window.addEventListener('blur', windowBlur);
    } else if (e.button === 2) {
        e.stopPropagation();
        props.context.workspace.downArtboardTitle(e);
    }
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        return;
    }

    if (isDragging) {
        transporter?.execute(e);
    } else if (Math.hypot(e.x - startPosition.x, e.y - startPosition.y) > 3) {
        transporter?.createApiCaller();
        isDragging = true;
    }
}

function up(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }

    isDragging = false;
    transporter?.fulfil();
    transporter = undefined;

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur);
}

function move2(e: MouseEvent) {
    if (e.buttons === 0) {
        e.stopPropagation();
    }
}

function windowBlur() {
    isDragging = false;
    transporter?.fulfil();
    transporter = undefined;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur)
}
</script>

<template>
    <div class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown="down"
         @mousemove="move2" data-area="controller">
        <div v-if="!isInput" class="name" :class="{ selected, active: hover }"
             :style="{ maxWidth: props.maxWidth + 'px' }" @dblclick="onRename">{{ props.name }}
        </div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
               ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName" @mousedown.stop>
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0;" ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    .name {
        width: 100%;
        height: 22px;

        line-height: 22px;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        //padding-left: 2px;
        //background-color: transparent;
        background-color: rgba(255, 255, 0, 0.25);
        color: #bbb;
    }

    .rename {
        outline-style: none;
        font-size: var(--font-default-fontsize);
        border: 1px solid var(--active-color);
        padding: 0 1px;
        margin-right: 1px;
        margin-bottom: 4px;
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