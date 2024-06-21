<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ShapeType, ShapeView, SymbolView } from "@kcdesign/data";
import { Context } from "@/context";
import { permIsEdit } from '@/utils/content';
import { XY } from '@/context/selection';
import { forbidden_to_modify_frame } from '@/utils/common';
import { TranslateHandler } from "@/transform/translate";

interface Props {
    name: string
    index: number
    maxWidth: number
    shape: ShapeView
    context: Context
}

interface Emits {
    (e: 'rename', value: string, shape: ShapeView): void

    (e: 'hover', shape: ShapeView): void

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
let isDragging: boolean = false;
const reflush = ref<number>(0);

let transporter: TranslateHandler | undefined = undefined;
let startPosition: XY = { x: 0, y: 0 };

const watcher = (t: any) => {
    if (t !== 'frame') reflush.value++;
};
const onRename = () => {
    if (!permIsEdit(props.context) || props.context.tool.isLable) {
        return;
    }
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            if (inputSpan.value) {
                inputSpan.value.innerHTML = props.name
                inputWidth.value = inputSpan.value.offsetWidth + 6
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
        inputWidth.value = inputSpan.value.offsetWidth + 6;
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (esc.value) return;
    if (value.length === 0 || value.trim().length === 0) return;
    emit('rename', value, props.shape)
}

const hoverShape = () => {
    if (isDragging) return;
    if (props.context.workspace.isPageDragging) return;
    emit('hover', props.shape)
    hover.value = true
}

const unHoverShape = () => {
    if (isDragging) return;
    if (props.context.workspace.isPageDragging) return;
    emit('leave')
    hover.value = false;
}

// 鼠标按下
function down(e: MouseEvent) {
    const context = props.context; // 组件通信中心，里面包含负责各种功能的通信模组
    if (context.workspace.isPageDragging) {
        return;
    }
    e.stopPropagation();

    if (isInput.value) {
        return;
    }

    if (!permIsEdit(context)) {
        context.selection.selectShape(props.shape);
        return;
    }

    if (e.button === 0) {
        context.selection.selectShape(props.shape);

        if (forbidden_to_modify_frame(props.shape) || context.tool.isLable) {
            return;
        }

        startPosition = { x: e.x, y: e.y };

        transporter = new TranslateHandler(props.context, e, [props.shape]);

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        window.addEventListener('blur', windowBlur);
    } else if (e.button === 2) { // 右键是打开菜单
        props.context.workspace.downArtboardTitle(e);
    }
}

// 按下后移动
async function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        return;
    }

    if (isDragging) {
        transporter?.execute(e)
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

// #endregion
function move2(e: MouseEvent) {
    if (e.buttons === 0) e.stopPropagation();
}

function move3(e: MouseEvent) {
    if (e.buttons === 1) e.stopPropagation();
}

function windowBlur() {
    isDragging = false;
    transporter?.fulfil();
    transporter = undefined;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    window.removeEventListener('blur', windowBlur)
}

onMounted(() => {
    props.shape.watch(watcher);
})
onUnmounted(() => {
    props.shape.unwatch(watcher);
})
</script>

<template>
    <div :reflush="reflush" class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown="down"
         @mousemove="move2" data-area="controller" data-title="symbol-title">
        <div class="name-wrap" :style="{ maxWidth: props.maxWidth + 'px' }" @dblclick="onRename" v-if="!isInput">
            <div class="icon">
                <svg v-if="(props.shape as SymbolView).isSymbolUnionShape" xmlns="http://www.w3.org/2000/svg"
                     xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
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
                <svg v-else-if="(props.shape.type === ShapeType.Symbol)" xmlns="http://www.w3.org/2000/svg"
                     xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
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
            </div>
            <div class="content">
                {{ props.name }}
            </div>
        </div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
               ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName" @mousemove="move3">
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0; font-size: 10px;"
              ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    .name-wrap {
        display: flex;
        align-items: center;

        > svg {
            width: 16px;
            height: 16px;
            padding: 0 2px 0 0;
        }

        .content {
            width: calc(100% - 12px);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
            background-color: transparent;
            color: var(--component-color);
        }
    }

    .rename {
        height: 15px;
        outline-style: none;
        font-size: 10px;
        border: 1px solid var(--active-color);
        padding: 0 1px;
        margin-right: 1px;
        box-sizing: border-box;
    }
}
</style>