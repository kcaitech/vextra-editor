<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from './SelectFont.vue';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import TextAdvancedSettings from './TextAdvancedSettings.vue'
import { Context } from '@/context';
import { TextShape, Shape, AttrGetter } from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign } from "@kcdesign/data";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
interface Props {
    context: Context
    shape: Shape
}
const props = defineProps<Props>();
const { t } = useI18n();
const fonstSize = ref<any>(14)
const showSize = ref(false)
const sizeList = ref<HTMLDivElement>()
const showFont = ref(false)
const isBold = ref(false)
const isTilt = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)
const selectLevel = ref('left')
const selectVertical = ref('top')
const fontName = ref('微软雅黑')
const fontNameIsMulti = ref(false)
const fontSizeIsMulti = ref(false)
const colorIsMulti = ref(false)
const alignmentIsMulti = ref(false)
const paraSpacingIsMulti = ref(false)
const kerningIsMulti = ref(false)
const selection = computed(() => props.context.selection)
const textShape = computed(() => props.context.selection.selectedShapes)

const onShowFont = () => {
    if (showFont.value) return showFont.value = false
    showFont.value = true
    document.addEventListener('click', onShowFontBlur);
}

const onShowFontBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.font-container') && !e.target.closest('.select-font')) {
        var timer = setTimeout(() => {
            showFont.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onShowFontBlur);
        }, 10)
    }
}

const onShowSize = () => {
    if (showSize.value) return showSize.value = false
    showSize.value = true
    document.addEventListener('click', onShowSizeBlur);
}

const onShowSizeBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.text-size')) {
        var timer = setTimeout(() => {
            showSize.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onShowSizeBlur);
        }, 10)
    }
}

const onBold = () => {
    isBold.value = !isBold.value
    const { textIndex, selectLength } = getTextIndexAndLen()
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    if(isSelectText()) {
        editor.setTextBold(isBold.value, 0, Infinity)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultBold(isBold.value)
        }else {
            editor.setTextBold(isBold.value, textIndex,selectLength)
        }
    }
}
const onTilt = () => {
    isTilt.value = !isTilt.value
    const { textIndex, selectLength } = getTextIndexAndLen()
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    if(isSelectText()) {
        editor.setTextItalic(isTilt.value, 0, Infinity)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultItalic(isTilt.value)
        }else {
            editor.setTextItalic(isTilt.value, textIndex,selectLength)
        }
    }
}
const onUnderlint = () => {
    isUnderline.value = !isUnderline.value
    const { textIndex, selectLength } = getTextIndexAndLen()
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    if(isSelectText()) {
        editor.setTextUnderline(isUnderline.value, 0, Infinity)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultUnderline(isUnderline.value)
        }else {
            editor.setTextUnderline(isUnderline.value, textIndex,selectLength)
        }
    }
}
const onDeleteline = () => {
    isDeleteline.value = !isDeleteline.value
    const { textIndex, selectLength } = getTextIndexAndLen()
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    if(isSelectText()) {
        editor.setTextStrikethrough(isUnderline.value, 0,Infinity)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultStrikethrough(isUnderline.value)
        }else {
            editor.setTextStrikethrough(isUnderline.value, textIndex,selectLength)
        }
    }
}
// 设置水平对齐
const onSelectLevel = (icon: TextHorAlign) => {
    selectLevel.value = icon
    const { textIndex, selectLength } = getTextIndexAndLen()
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    if(isSelectText()) {
        // editor.value.setTextDefaultHorAlign(icon)
        editor.setTextHorAlign(icon, 0, Infinity)
    } else {
        editor.setTextHorAlign(icon, textIndex, selectLength)
    }
}
//设置垂直对齐
const onSelectVertical = (icon: TextVerAlign) => {
    selectVertical.value = icon
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    editor.setTextVerAlign(icon)
}
//设置字体大小
const changeTextSize = (size: number) => {
    fonstSize.value = size
    showSize.value = false;
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    const { textIndex, selectLength } = getTextIndexAndLen()
    if(isSelectText()) {
        editor.setTextFontSize(0, Infinity, size)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultFontSize(size)
        }else {
            editor.setTextFontSize(textIndex, selectLength, size)
        }
    }
}
//设置字体
const setFont = (font: string) => {
    fontName.value = font
    showFont.value = false;
    const editor = props.context.editor4TextShape((textShape.value[0] as TextShape))
    const { textIndex, selectLength } = getTextIndexAndLen()
    if(isSelectText()) {
        editor.setTextFontName(0, Infinity, font)
    }else {
        if(selectLength === 0) {
            editor.setTextDefaultFontName(font)
        }else {
            editor.setTextFontName(textIndex, selectLength, font)
        }
    }
}

//获取选中字体的长度和开始下标
const getTextIndexAndLen = () => {
    const textIndex = Math.min(selection.value.cursorEnd, selection.value.cursorStart)
    const selectLength = Math.abs(selection.value.cursorEnd - selection.value.cursorStart)
    return { textIndex, selectLength }
}
//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
    if((selection.value.cursorEnd !== -1) && (selection.value.cursorStart !== -1)) {
        return false
    }else {
        return true
    }
}

//输入框设置字体大小
const setTextSize = () => {
    fonstSize.value = fonstSize.value.trim()
    if (fonstSize.value.length < 1) {
        fonstSize.value = 1
    }
    if (!isNaN(Number(fonstSize.value))) {
        changeTextSize(fonstSize.value)
    }else {
        textFormat()
    }

}

// 获取当前文字格式
const textFormat = () => {
    if(!(textShape.value[0] as TextShape) || !(textShape.value[0] as TextShape).text) return
    const { textIndex, selectLength } = getTextIndexAndLen();
    let format: AttrGetter
    if(textIndex !== -1 && textIndex !== 0 && selectLength === 0) {
        format = (textShape.value[0] as TextShape).text.getTextFormat(textIndex - 1, selectLength + 1)
    }else if (textIndex !== -1 && textIndex === 0 && selectLength === 0) {
        format = (textShape.value[0] as TextShape).text.getTextFormat(textIndex, selectLength + 1)
    }else if (textIndex === -1) {
        format = (textShape.value[0] as TextShape).text.getTextFormat(0, Infinity)
    }else {
        format = (textShape.value[0] as TextShape).text.getTextFormat(textIndex, selectLength)
    }
    fontNameIsMulti.value = format.fontNameIsMulti
    fontSizeIsMulti.value = format.fontSizeIsMulti
    colorIsMulti.value = format.colorIsMulti
    alignmentIsMulti.value = format.alignmentIsMulti
    paraSpacingIsMulti.value = format.paraSpacingIsMulti
    kerningIsMulti.value = format.kerningIsMulti
    selectLevel.value = format.alignment || 'left'
    selectVertical.value = format.verAlign || 'top'
    fontName.value = format.fontName || 'PingFangSC-Regular'
    fonstSize.value = format.fontSize || 14
    if(fontNameIsMulti.value) fontName.value = '多值'
    if(fontSizeIsMulti.value) fonstSize.value = '多值'
    console.log(format,'format');
}
// 获取默认文字格式
const textDefaultFormat = () => {
    const defaultFormat = (textShape.value[0] as TextShape).text.getDefaultTextFormat()
}
function selection_wather(t: number) {
    if(t === Selection.CHANGE_TEXT) {
        textFormat()
    }
    if(t === Selection.CHANGE_SHAPE) {
        textFormat()
    }
}
function workspace_wather(t: number) {
    if(t === WorkSpace.BOLD) {
        onBold()
    }else if(t === WorkSpace.UNDER_LINE) {
        onUnderlint()
    }else if(t === WorkSpace.DELETE_LINE) {
        onDeleteline()
    }else if(t === WorkSpace.ITALIC) {
        onTilt()
    }
}
onMounted(() => {
    textFormat()
    textDefaultFormat()
    props.context.selection.watch(selection_wather);
    props.context.workspace.watch(workspace_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_wather);
})
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24">
            <template #tool>
                <TextAdvancedSettings :context="props.context" :textShape="textShape"></TextAdvancedSettings>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text" @click="onShowFont">
                    <span>{{ fontName }}</span>
                    <svg-icon icon-class="down"></svg-icon>
                </div>
                <SelectFont v-if="showFont" @set-font="setFont" :fontName="fontName" :context="props.context"></SelectFont>
                <div class="perch"></div>
            </div>
            <div class="text-middle">
                <div class="text-middle-size">
                    <div class="text-size jointly-text">
                        <input type="text" v-model="fonstSize" class="input" @change="setTextSize">
                        <svg-icon icon-class="down" @click="onShowSize"></svg-icon>
                        <div class="font-size-list" ref="sizeList" v-if="showSize">
                            <div @click="changeTextSize(10)">10</div>
                            <div @click="changeTextSize(12)">12</div>
                            <div @click="changeTextSize(14)">14</div>
                            <div @click="changeTextSize(16)">16</div>
                            <div @click="changeTextSize(18)">18</div>
                            <div @click="changeTextSize(24)">24</div>
                            <div @click="changeTextSize(36)">36</div>
                            <div @click="changeTextSize(48)">48</div>
                            <div @click="changeTextSize(64)">64</div>
                        </div>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isBold }" @click="onBold">
                        <Tooltip :content="`${t('attr.bold')} &nbsp;&nbsp; Ctrl+B`" :offset="15">
                            <svg-icon icon-class="text-bold"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isTilt }" @click="onTilt">
                        <Tooltip :content="`${t('attr.tilt')} &nbsp;&nbsp; Ctrl+I`" :offset="15">
                            <svg-icon icon-class="text-tilt"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isUnderline }" @click="onUnderlint">
                        <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl+U`" :offset="15">
                            <svg-icon icon-class="text-underline"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isDeleteline }" @click="onDeleteline">
                        <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl+Shift+X`" :offset="15">
                            <svg-icon icon-class="text-deleteline"></svg-icon>
                        </Tooltip>
                    </div>
                </div>
                <div class="perch"></div>
            </div>
            <div class="text-bottom">
                <div class="text-bottom-align">
                    <div class="level-aligning jointly-text">
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'left' }"
                            @click="onSelectLevel(TextHorAlign.Left)">
                            <Tooltip :content="t('attr.align_left')" :offset="15">
                                <svg-icon icon-class="text-left"></svg-icon>
                            </Tooltip>
                        </i>
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'centered' }"
                            @click="onSelectLevel(TextHorAlign.Centered)">
                            <Tooltip :content="t('attr.align_center')" :offset="15">
                                <svg-icon icon-class="text-center"></svg-icon>
                            </Tooltip>
                        </i>
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'right' }"
                            @click="onSelectLevel(TextHorAlign.Right)">
                            <Tooltip :content="t('attr.align_right')" :offset="15">
                                <svg-icon icon-class="text-right"></svg-icon>
                            </Tooltip>
                        </i>
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectLevel === 'justified' }"
                            @click="onSelectLevel(TextHorAlign.Justified)">
                            <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                                <svg-icon icon-class="text-justify"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                    <div class="vertical-aligning jointly-text">
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'top' }"
                            @click="onSelectVertical(TextVerAlign.Top)">
                            <Tooltip :content="t('attr.align_top')" :offset="15">
                                <svg-icon icon-class="align-top"></svg-icon>
                            </Tooltip>
                        </i>
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'middle' }"
                            @click="onSelectVertical(TextVerAlign.Middle)">
                            <Tooltip :content="t('attr.align_middle')" :offset="15">
                                <svg-icon icon-class="align-middle"></svg-icon>
                            </Tooltip>
                        </i>
                        <i class="jointly-text font-posi" :class="{ selected_bgc: selectVertical === 'bottom' }"
                            @click="onSelectVertical(TextVerAlign.Bottom)">
                            <Tooltip :content="t('attr.align_bottom')" :offset="15">
                                <svg-icon icon-class="align-bottom"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                </div>
                <div class="perch"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;

    .trigger {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;

        >svg {
            width: 50%;
            height: 50%;
            transition: 0.5s;
        }

        svg:hover {
            transform: rotate(90deg);
        }
    }

    .text-container {
        font-size: var(--font-default-fontsize);

        .jointly-text {
            height: 25px;
            border-radius: 4px;
            background-color: var(--input-background);
            display: flex;
            justify-content: space-between;
            align-items: center;

            >svg {
                width: 12px;
                height: 12px;
                overflow: visible !important;
            }
        }

        .text-top {
            position: relative;
            margin-bottom: 10px;
            display: flex;

            .select-font {
                flex: 1;
                padding: 0 10px;
            }
        }

        .text-middle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;

            .text-middle-size {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }

            .text-size {
                position: relative;
                width: 70px;
                padding: 0 10px;

                .input {
                    width: 55px;
                    background-color: transparent;
                    border: none;
                }

                input[type="text"]::-webkit-inner-spin-button,
                input[type="text"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                input[type="text"] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                    font-size: 10px;
                }

                input:focus {
                    outline: none;
                }

                .font-size-list {
                    position: absolute;
                    top: 30px;
                    left: 0px;
                    width: 90px;
                    height: 225px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
                    padding: 10px 0;
                    z-index: 100;

                    >div {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 0 10px;
                        height: 25px;
                        box-sizing: border-box;

                        &:hover {
                            background-color: var(--input-background);
                        }
                    }
                }
            }

            .overbold {
                width: 25px;
                display: flex;
                justify-content: center;
            }
        }

        .text-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .text-bottom-align {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }

            .level-aligning {
                width: 50%;
                padding: 0 5px;
            }

            .vertical-aligning {
                width: 38%;
                padding: 0 5px;
            }

            .font-posi {
                width: 25px;
                height: 25px;
                display: flex;
                justify-content: center;
            }
        }

        .perch {
            width: 22px;
            height: 22px;
        }
    }

    .selected_bgc {
        background-color: var(--left-navi-button-select-color) !important;
    }
}

:deep(.el-tooltip__trigger:focus) {
    outline: none !important;
}</style>