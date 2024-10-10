<script setup lang="ts">
import { ref, nextTick, toRaw } from 'vue'
import { ShapeType, ShapeView, SymbolView } from "@kcdesign/data";
import { Context } from "@/context";
import { XY } from '@/context/selection';
import { permIsEdit } from '@/utils/content';
import { Translate2 } from "@/transform/translate2";

import { TitleAttri } from "@/components/Document/Content/titleRenderer";

const props = defineProps<{
    data: TitleAttri;
    context: Context;
}>()

const emit = defineEmits<{
    (e: 'rename', value: string, shape: ShapeView): void
    (e: 'hover', shape: ShapeView): void
    (e: 'leave'): void
}>()

const isInput = ref<boolean>(false);
const nameInput = ref<HTMLInputElement>();
const inputSpan = ref<HTMLSpanElement>();
const esc = ref<boolean>(false)
const inputWidth = ref(5)
const hover = ref(false)
let isDragging: boolean = false;
let translate2: Translate2 | undefined = undefined;

let startPosition: XY = { x: 0, y: 0 };

const onRename = () => {
    if (!permIsEdit(props.context) || props.context.tool.isLable) return;

    isInput.value = true
    nextTick(() => {
        if (!nameInput.value) return;

        if (inputSpan.value) {
            inputSpan.value.innerHTML = props.data.name
            inputWidth.value = inputSpan.value.offsetWidth + 5
        }
        (nameInput.value as HTMLInputElement).value = props.data.name.trim();

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
    emit('rename', value, props.data.shape);
    emit('hover', props.data.shape);
}

const hoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('hover', props.data.shape)
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('leave')
    hover.value = false
}

function down(e: MouseEvent) {
    const context = props.context;
    const shape = toRaw(props.data.shape);

    if (context.readonly) {
        context.selection.selectShape(shape);
        e.stopPropagation();
        return;
    }

    if (e.button === 0) {
        if (props.context.workspace.isPageDragging) return;

        e.stopPropagation();

        if (e.shiftKey) {
            context.selection.rangeSelectShape([...context.selection.selectedShapes, shape]);
        } else {
            if (!context.selection.isSelectedShape(shape)) {
                context.selection.selectShape(shape);
            }
        }

        if (context.tool.isLable) return;

        startPosition = { x: e.x, y: e.y };
        translate2 = new Translate2(context, e, context.selection.selectedShapes);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        window.addEventListener('blur', windowBlur);
    } else if (e.button === 2) {
        e.stopPropagation();
        props.context.workspace.downArtboardTitle(e);
    }
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) return;

    if (isDragging) {
        translate2?.execute(e);
    } else if (Math.hypot(e.x - startPosition.x, e.y - startPosition.y) > 3) {
        translate2?.connect();
        isDragging = true;
    }
}

function up(e: MouseEvent) {
    if (e.button !== 0) return;

    isDragging = false;

    translate2?.fulfil();
    translate2 = undefined;

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur);
}

function move2(e: MouseEvent) {
    if (e.buttons === 0) e.stopPropagation();
}

function windowBlur() {
    isDragging = false;
    translate2?.fulfil();
    translate2 = undefined;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur)
}
</script>

<template>
<div
    class="container-name"
    data-area="controller"
    @mouseenter="hoverShape"
    @mouseleave="unHoverShape"
    @mousedown="down"
    @mousemove="move2"
>
    <div
        v-if="!isInput"
        class="name"
        :class="{  active: hover }"
        :style="{ maxWidth: data.width + 'px' }"
        @dblclick="onRename"
    >
        <svg v-if="(data.shape as SymbolView).isSymbolUnionShape" xmlns="http://www.w3.org/2000/svg" fill="none"
             width="16" height="16" viewBox="0 0 16 16">
            <defs>
                <clipPath id="master_svg0_747_09671">
                    <rect x="0" y="0" width="16" height="16" rx="0"/>
                </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_747_09671)">
                <g>
                    <path
                        d="M15.1858,8Q15.1858,7.33726,14.7172,6.86863L9.13137,1.282843Q8.66274,0.814214,8,0.814214Q7.33726,0.814214,6.86863,1.282843L1.282843,6.86863Q0.814214,7.33726,0.814214,8Q0.814214,8.66274,1.282843,9.13137L6.86863,14.7172Q7.33726,15.1858,8,15.1858Q8.66274,15.1858,9.13137,14.7172L14.7172,9.13137Q15.1858,8.66274,15.1858,8ZM8.28284,2.13137L13.8686,7.71716Q14.1515,8,13.8686,8.28284L8.28284,13.8686Q8,14.1515,7.71716,13.8686L2.13137,8.28284Q2.0142100000000003,8.16569,2.0142100000000003,8Q2.0142100000000003,7.83431,2.13137,7.71716L7.71716,2.13137Q7.83431,2.0142100000000003,8,2.0142100000000003Q8.16569,2.0142100000000003,8.28284,2.13137Z"
                        fill-rule="evenodd" fill="#7F58F9" fill-opacity="1"/>
                </g>
                <g
                    transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,4.538494595686643,-4.75560098247297)">
                    <rect x="8.009765625" y="3.10064697265625" width="3" height="3" rx="0.5" fill="#B7A4F3"
                          fill-opacity="1"/>
                </g>
                <g
                    transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,5.693277989414128,-1.9677502472059132)">
                    <rect x="5.221923828125" y="5.888519287109375" width="3" height="3" rx="0.5" fill="#B7A4F3"
                          fill-opacity="1"/>
                </g>
                <g
                    transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,7.306647318680916,-5.902135808926687)">
                    <rect x="10.77783203125" y="5.86883544921875" width="3" height="3" rx="0.5" fill="#B7A4F3"
                          fill-opacity="1"/>
                </g>
                <g
                    transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,8.461502219544855,-3.1144577071481763)">
                    <rect x="7.990234375" y="8.656707763671875" width="3" height="3" rx="0.5" fill="#B7A4F3"
                          fill-opacity="1"/>
                </g>
            </g>
        </svg>
        <svg v-if="(data.shape.type === ShapeType.Symbol)" xmlns="http://www.w3.org/2000/svg"
             fill="none"
             width="16" height="16" viewBox="0 0 16 16">
            <defs>
                <clipPath id="master_svg0_747_6025">
                    <rect x="0" y="0" width="16" height="16" rx="0"/>
                </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_747_6025)">
                <g>
                    <path
                        d="M15.1858,8Q15.1858,7.33726,14.7172,6.86863L9.13137,1.282843Q8.66274,0.814214,8,0.814214Q7.33726,0.814214,6.86863,1.282843L1.282843,6.86863Q0.814214,7.33726,0.814214,8Q0.814214,8.66274,1.282843,9.13137L6.86863,14.7172Q7.33726,15.1858,8,15.1858Q8.66274,15.1858,9.13137,14.7172L14.7172,9.13137Q15.1858,8.66274,15.1858,8ZM8.28284,2.13137L13.8686,7.71716Q14.1515,8,13.8686,8.28284L8.28284,13.8686Q8,14.1515,7.71716,13.8686L2.13137,8.28284Q2.0142100000000003,8.16569,2.0142100000000003,8Q2.0142100000000003,7.83431,2.13137,7.71716L7.71716,2.13137Q7.83431,2.0142100000000003,8,2.0142100000000003Q8.16569,2.0142100000000003,8.28284,2.13137Z"
                        fill-rule="evenodd" fill="#7F58F9" fill-opacity="1"/>
                </g>
                <g
                    transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,4.540654637874468,-4.75025670389914)">
                    <rect x="8.00439453125" y="3.105926513671875" width="6.921310901641846"
                          height="6.9352264404296875"
                          rx="0.5" fill="#B7A4F3" fill-opacity="1"/>
                </g>
            </g>
        </svg>
        <span :class="{'force-theme':data.isSymbol }">
                 {{ data.name }}
            </span>
    </div>
    <input
        v-if="isInput"
        ref="nameInput"
        type="text"
        :style="{ maxWidth: data.width + 'px' }"
        class="rename"
        @input="onInputName"
        @change="ChangeReName"
        @mousedown.stop
    />
    <span
        v-if="isInput"
        ref="inputSpan"
        style="position: absolute; visibility: hidden;  top: 0;"
    />
</div>
</template>

<style scoped lang="scss">
.container-name {
    .name {
        width: 100%;
        height: 22px;

        line-height: 22px;
        background-color: transparent;
        color: #bbb;

        display: flex;
        align-items: center;
        gap: 2px;

        box-sizing: border-box;

        span {
            display: block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
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

    .force-theme {
        color: var(--component-color) !important;
    }
}
</style>