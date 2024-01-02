<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import {AsyncOpacityEditor, ShapeView, adapt2Shape} from '@kcdesign/data';
import {useI18n} from 'vue-i18n';
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import {Context} from '@/context';
import {Selection} from '@/context/selection'

interface Props {
    context: Context
    shapes: ShapeView[]
}

const props = defineProps<Props>();
const {t} = useI18n();
const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const selectedOption = ref('');
let opacity_editor: AsyncOpacityEditor | undefined = undefined;

function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    popoverVisible.value = true;
    nextTick(() => {
        if (!popover.value) return;
        popover.value.style.left = 80 + 'px';
        popover.value.style.top = 20 + 'px';
    })
    document.addEventListener('click', onMenuBlur)
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.icon')) {
        let timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}

function selectOption(event: MouseEvent) {
    selectedOption.value = (event.target as HTMLSpanElement).innerText;
    popoverVisible.value = false;
}

function limitValue(value: number): number {
    if (value < 0) {
        return 0;
    } else if (value > 100) {
        return 100;
    } else {
        return value;
    }
}

const opacity = ref<number | string>(1);
const range = () => {
    if (typeof opacity.value === 'number') {
        return (opacity.value * 100).toFixed(0);
    } else {
        return 100;
    }
}
const ipt = () => {
    if (typeof opacity.value === 'number') {
        return (opacity.value * 100).toFixed(0);
    } else {
        return opacity.value;
    }
}

function opacityChange(value: number) {
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const selected = props.context.selection.selectedShapes;
    editor.modifyShapesContextSettingOpacity(selected.map(s => adapt2Shape(s)), value);
}

function change(e: Event) {
    const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
    if (isNaN(value) || value === 1 || value === 0) {
        (e.target as HTMLInputElement).value =
            typeof opacity.value === 'string'
                ? ipt()
                : `${ipt()}%`;

        if (isNaN(value)) return;
    }
    opacity.value = value;
    opacityChange(opacity.value);
}

function down(e: MouseEvent) {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!selected.length || !page) return;
    const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
    if (isNaN(value)) return;
    opacity.value = limitValue(Number(value));
    opacity_editor = props.context.editor
        .controller()
        .asyncOpacityEditor(selected.map(s => adapt2Shape(s)), page);
    opacity_editor.execute(value);
}

function mouseup(e: MouseEvent) {
    if (opacity_editor) {
        opacity_editor.close();
        opacity_editor = undefined;
    }
}

function input(e: Event) {
    const value = limitValue(Number((e.target as HTMLInputElement).value)) / 100;
    if (isNaN(value) || !opacity_editor) return;
    opacity.value = limitValue(Number(value));
    opacity_editor.execute(value);
}

function change2(e: Event) {
    if (opacity_editor) {
        opacity_editor = opacity_editor.close();
    } else {
        change(e);
    }
}

const focus = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
        event.target.select();
    }
}

// 你还需要做的是todo，选区监听已经处理好了
function update() {
    // 更新组件状态
    const shapes = props.context.selection.selectedShapes
    if (!shapes.length) return;
    let firstOpacity = shapes[0].contextSettings?.opacity;
    firstOpacity = firstOpacity === undefined ? 1 : firstOpacity;
    let difference = false;
    if (shapes.length > 1) {
        for (let i = 1; i < shapes.length; i++) {
            const randomOpacity = shapes[i].contextSettings?.opacity;
            if (randomOpacity !== firstOpacity) {
                difference = true;
                break;
            }
        }
        opacity.value = difference ? `${t('attr.more_value')}` : firstOpacity;
    } else {
        opacity.value = firstOpacity;
    }
}

function range_keyboard(e: KeyboardEvent) {
    if (e.repeat) return;
    if (['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight'].includes(e.code)) {
        if (opacity_editor) {
            opacity_editor = opacity_editor.close();
        }
        (e.target as HTMLInputElement).blur();
    }
}

/**
 * @description 调整监听对象
 * eg: 第一次选中了A、B,这个时候组件监听了A、B。
 *     第二次从A、B到C、D，这个时候所选图形发生了变化，监听对象从A、B调整为C、D。
 *     在调整过程中对C、D挂载(watch)监听的同时，还对A、B的监听进行了卸载(unwatch);
 */
const watchedShapes = new Map();

function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length) {
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            const v = selection.selectedShapes[i];
            needWatchShapes.set(v.id, v)
        }
    }
    watchedShapes.forEach((v, k) => {
        if (!needWatchShapes.has(k)) {
            v.unwatch(update);
            watchedShapes.delete(k);
        }
    })
    needWatchShapes.forEach((v, k) => {
        if (!watchedShapes.has(k)) {
            v.watch(update);
            watchedShapes.set(k, v);
        }
    })
}

/**
 * @description
 * @param type 选区的变化类型
 *              Selection.CHANGE_PAGE 切换页面
 *              Selection.CHANGE_SHAPE 切换所选图形，即更新context.selection.selectedShapes (这里要用的是这个)
 *              ...
 */
function selection_watcher(type: number) {
    if (type === Selection.CHANGE_SHAPE) { // 切换了所选图形
        update(); // 更新组件状态
        watchShapes(); // 调整监听对象。
    }
}

onMounted(() => {
    // 给选区挂载 监听函数 --selection_watcher
    props.context.selection.watch(selection_watcher); // selection.watch 类似于 document.addEventListener
    watchShapes(); // 组件产生，立马需要一次调整监听对象(第一次调整监听对象是从无 到 任意图形)
    update();
})
onUnmounted(() => {
    // selection.unwatch 类似于 document.removeEventListener，大部分场景下，在挂载监听的时候都需要考虑移除监听的时机和处理
    props.context.selection.unwatch(selection_watcher);
    if (opacity_editor) opacity_editor.close();
})
// function updateBackgroundSize(event: MouseEvent) {
//     const range = event.target as HTMLInputElement | null;
//     if (range) {
//         range.style.backgroundSize = `${range.value}% 100%`;
//     }
// }
// interface RangeSliderConfig {
//     min?: number;
//     max?: number;
//     step?: number;
//     callback?: (input: HTMLInputElement) => void;
// }
//
// class RangeSlider {
//     private input: HTMLInputElement;
//
//     constructor(element: HTMLInputElement, config: RangeSliderConfig) {
//         this.input = element;
//         this.init(config);
//     }
//
//     private init(config: RangeSliderConfig): void {
//         const {min = 0, max = 100, step = 1, callback} = config;
//
//         this.input.setAttribute('min', min.toString());
//         this.input.setAttribute('max', max.toString());
//         this.input.setAttribute('step', step.toString());
//
//         this.input.addEventListener('input', (e) => {
//             this.input.setAttribute('value', (e.target as HTMLInputElement).value);
//             this.input.style.backgroundSize = (e.target as HTMLInputElement).value + '% 100%';
//             if (callback) {
//                 callback(this.input);
//             }
//         });
//     }
// }
//
// window.onload = function rangeSlider() {
//     const myRangeInput = document.getElementById('Range2') as HTMLInputElement;
//     if (myRangeInput) {
//         const rangeSlider = new RangeSlider(myRangeInput, {
//             min: 0,
//             max: 100,
//             step: 1,
//             callback: (input) => {
//                 console.log('Current value:', input.value);
//             },
//         });
//     }
// };
</script>
<template>
    <div class="opacity-panel">
        <TypeHeader :title="t('attr.opacity')" class="mt-24" :active="true">
            <template #tool>
                <!--                <div class="icon" @click="showMenu" ref="trigger">-->
                <!--                    <input v-model="selectedOption">-->
                <!--                    <svg-icon icon-class="down"></svg-icon>-->
                <!--                </div>-->
                <!--                <div ref="popover" class="popover-f" v-if="popoverVisible">-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.normal') }">{{-->
                <!--                        t('opacity.normal') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.become_dark') }">{{-->
                <!--                        t('opacity.become_dark') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.multiply') }">{{-->
                <!--                        t('opacity.multiply') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color_deepening') }">{{-->
                <!--                        t('opacity.color_deepening') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.become_bright') }">{{-->
                <!--                        t('opacity.become_bright') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.filter') }">{{-->
                <!--                        t('opacity.filter') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color_dodge') }">{{-->
                <!--                        t('opacity.color_dodge') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.superpose') }">{{-->
                <!--                        t('opacity.superpose') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.soft_light') }">{{-->
                <!--                        t('opacity.soft_light') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.strong_light') }">{{-->
                <!--                        t('opacity.strong_light') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.difference') }">{{-->
                <!--                        t('opacity.difference') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.exclude') }">{{-->
                <!--                        t('opacity.exclude') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.hue') }">{{-->
                <!--                        t('opacity.hue') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.saturation') }">{{-->
                <!--                        t('opacity.saturation') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.color') }">{{-->
                <!--                        t('opacity.color') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.lightness') }">{{-->
                <!--                        t('opacity.lightness') }}</span>-->
                <!--                    <div class="line"></div>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.darken') }">{{-->
                <!--                        t('opacity.darken') }}</span>-->
                <!--                    <span @click="selectOption" :class="{ 'selected': selectedOption === t('opacity.brighten') }">{{-->
                <!--                        t('opacity.brighten') }}</span>-->
                <!--                </div>-->
            </template>
        </TypeHeader>
        <div class="opacity-container">
            <div class="slider">
                <input type="range" class="input-range" :value="range()" @mousedown="down" @mouseup="mouseup" @mouseleave="mouseup" @input="input"
                       @change="change2"
                       @keydown="range_keyboard" min="0" max="100" step="1"/>
                                <div class="track"></div>
        </div>
            <input type="text" class="input-text" :value="typeof opacity === 'string' ? ipt() : `${ipt()}%`"
                   @click="focus" @change="change"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.opacity-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 8px 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .clear {
        overflow: hidden;
    }

    .icon {
        width: 10px;
        height: 28px;
        display: flex;
        padding-right: 4px;
        margin-right: 2px;
        justify-content: center;
        align-items: center;
        color: #000000;
        transition: 0.3s;

        > input {
            width: 55px;
            height: 15px;
            margin-left: -79px;
            text-align: center;
            background-color: white;
            border: none;
            font-size: 12px;
        }

        > svg {
            width: 80%;
            height: 60%;
            margin-left: -2px;
        }
    }

    .popover-f {
        position: absolute;
        color: #ffffff;
        z-index: 999;
        width: 150px;
        height: auto;
        font-size: var(--font-default-fontsize);
        background-color: var(--theme-color);
        border-radius: 4px;
        outline: none;
        padding: var(--default-padding-half) 0;

        .selected::before {
            content: '';
            position: absolute;
            left: 3px;
            box-sizing: border-box;
            width: 10px;
            height: 6px;
            border-width: 0 0 2px 2px;
            border-style: solid;
            border-color: var(--theme-color-anti);
            transform: rotate(-45deg) translateY(-4%);
        }

        .line {
            width: 100%;
            height: 8px;
            border-bottom: 1px solid gray;
            margin-bottom: 8px;
            box-sizing: border-box;
        }

        > span {
            position: relative;
            width: 100%;
            height: 28px;
            padding: 0 var(--default-padding);
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;

            &:hover {
                background-color: var(--active-color);
            }
        }
    }

    .opacity-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: -14px;
        margin-bottom: 3px;

        .aj_tempt {
            display: contents;
        }
    }

    input[type="text"] {
        width: 54px;
        height: 32px;
        text-align: center;
        margin-left: 4px;
        margin-top: 10px;
        border: none;
        background-color: #F4F5F5;
        border-radius: var(--default-radius);
    }

    .input-text {
        border: none;
        outline: none;
    }

    input[type="range"]:focus {
        outline: none;
    }

    input[type="range"] {
        -webkit-appearance: none !important;
        appearance: none !important;
        outline: 0;
        background-color: transparent;
        width: 150px;
        margin-right: 10px;
    }

    /* 火狐 外背景色 */
    input[type=range]::-moz-range-progress {
        background: #1878F5;
        height: 3px;
    }

    /* 定义range控件容器的样式 */
    input[type="range" i]::-webkit-slider-container {
        height: 20px;
        overflow: hidden;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        appearance: none !important;
        width: 12px;
        height: 12px;
        border-radius: 8px;
        background-color: #FFFFFF;
        border: 1px solid transparent;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.12);
        border-image: linear-gradient(#1878F5, #1878F5) 0 fill / 8 20 8 0 / 0px 0px 0 2000px;
    }

    .track {
        width: 150px;
        height: 2px;
        background-color: #D9D9D9;
        margin-left: 2px;
        margin-top: -14px
    }
}

.opacity-container .el-slider {
    margin-top: 9px;
    margin-left: 12px;
}

</style>