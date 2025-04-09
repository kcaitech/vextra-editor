<template>
    <div id="modify-text-panel" class="modify-text-panel">
        <PanelHeader :title="data ? t('stylelib.editor_text') : t('stylelib.create_text')" @close="emits('close')" />
        <MaskBaseInfo :name="name" :desc="desc" @modify-name="modifyName" @modify-desc="modifyDesc"
            @change-name-input="changeNameInput" @change-desc-input="changeDescInput" />
        <div v-if="data" class="data-panel">
            <div class="title">
                <ListHeader style="padding:0;" :title="t('stylelib.text')" create />
                <TextAdvancedSettings :context="context" :manager="manager" :data="data" @transform="modifyTransform" @strikethrough="modifyStrikethrough" @underline="modifyUnderline">
                </TextAdvancedSettings>
            </div>
            <div class="text-container">
                <div class="text-font">
                    <div class="select-font" ref="fontNameEl" @click="showFontList($event)">
                        <span>{{ fontName }}</span>
                        <div class="down">
                            <SvgIcon :icon="down_text_icon" />
                        </div>
                    </div>
                    <SelectFont v-if="fontlistStatus.visible" :fontname="fontName" :context="context" :manager="manager"
                        @set-font="modifyfontname" @set-font-weight="modifyfontweight">
                    </SelectFont>
                </div>
                <div class="text-size">
                    <FontWeightSelected class="weight" :context="context" :manager="manager" :data="data"
                        :selected="fontWeight" :fontName="fontName" @set-font-weight="modifyfontweight">
                    </FontWeightSelected>
                    <div class="set-size">
                        <div class="size_input">
                            <input v-select v-blur type="text" v-model="fontSize" class="input">
                            <div class="down" @click="onShowSize">
                                <SvgIcon :icon="down_text_icon" />
                            </div>
                        </div>
                        <div class="select-size" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
                            v-if="showSize">
                            <div v-for="(item, i) in textSizes" :key="i" @click="modifyfontsize(item)"
                                @mouseover="sizeHoverIndex = i" @mouseleave="sizeHoverIndex = -1">
                                {{ item }}
                                <div class="icon">
                                    <SvgIcon v-if="sizeSelectIndex === i"
                                        :icon="sizeHoverIndex === i ? white_select_icon : page_select_icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-space">
                    <div class="row-height">
                        <div>
                            <SvgIcon :icon="word_space_icon" />
                        </div>
                        <input v-select v-blur type="text" class="input" :placeholder="row_height" v-model="rowHeight"
                            @change="modifyrowheight">
                    </div>
                    <div class="char-space">
                        <div>
                            <SvgIcon :icon="row_height_icon" />
                        </div>
                        <input v-select v-blur type="text" class="input" v-model="wordSpace" @change="modifyKerning">
                    </div>
                </div>

            </div>
        </div>
        <div v-else :class="{ 'create-style': true, disabled: !name }" @click="createStyle">
            {{ t('stylelib.add_style') }}
        </div>
    </div>
</template>
<script setup lang="ts">
import SvgIcon from '@/components/common/SvgIcon.vue';
import down_text_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import word_space_icon from '@/assets/icons/svg/word-space.svg';
import row_height_icon from '@/assets/icons/svg/row-height.svg';
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import ListHeader from "@/components/Document/Attribute/StyleLib/ListHeader.vue";

import { Context } from '@/context';
import { TextShapeView, AsyncTextAttrEditor, TextMask, UnderlineType,StrikethroughType, TextTransformType } from '@kcdesign/data';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, is_mac } from '@/utils/common';
import TextAdvancedSettings from '../TextAdvancedSettings.vue'
import SelectFont from '../SelectFont.vue'
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { fontWeightConvert } from '../FontNameList';
import FontWeightSelected from '../FontWeightSelected.vue';
import { sortValue } from '@/components/Document/Attribute/BaseAttr/oval';
import { Attribute } from '@/context/atrribute';
import { TextContextMgr } from '../ctx';
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';

const { context, manager, data } = defineProps<{
    context: Context;
    manager: TextContextMgr;
    data?: TextMask;
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const name = ref<string>(data?.name ?? t('stylelib.format'));
const desc = ref<string>('');

const textSizes = ref([10, 12, 14, 16, 18, 24, 36, 48, 64]);
const sizeSelectIndex = ref(2);
const showSize = ref<boolean>(false);
const sizeHoverIndex = ref(-1);

const row_height = ref(`${t('attr.auto')}`)
const DefaultFontName = is_mac() ? 'PingFang SC' : '微软雅黑';
const fontName = ref<string>(DefaultFontName);
const fontWeight = ref<string>('');
const fontSize = ref<string | number>();
const rowHeight = ref<string | number>('');
const wordSpace = ref<string | number>('');


const fontlistStatus = reactive<ElementStatus>({ id: '#font-container', visible: false });
const fontPanelStatusMgr = new ElementManager(
    context,
    fontlistStatus,
    { whiteList: ['.font-container', '.select-font'] }
);

const showFontList = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('select-font')) {
            fontPanelStatusMgr.showBy(e, { once: { offsetLeft: -236 } });
            break;
        }
        e = e.parentElement;
    }
}

const onShowSize = () => {
    if (showSize.value) {
        return showSize.value = false
    }
    const index = textSizes.value.findIndex(item => item === fontSize.value);
    if (index > -1) sizeSelectIndex.value = index;
    showSize.value = true

    context.escstack.save('onShowSize', () => {
        const isAchieve = showSize.value;
        showSize.value = false;
        return isAchieve
    })

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

function modifyName(value: string) {
    name.value = value;
    if (!data) return;
    manager.modifyMaskName(data.sheet, data.id, value);
}

function modifyDesc(value: string) {
    desc.value = value;
    if (!data) return;
    manager.modifyMaskDesc(data.sheet, data.id, value);
}

function modifyfontname(value: string) {
    fontName.value = value;
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskFontName(data.sheet, data.id, value)
    fontPanelStatusMgr.close()
}

function modifyfontweight(weight: number, italic: boolean) {
    fontWeight.value = fontWeightConvert(weight, italic ?? false);
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskFontkWeight(data.sheet, data.id, weight, italic ?? false)
}

function modifyfontsize(value: number) {
    fontSize.value = value;
    showSize.value = false;
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskFontSize(data.sheet, data.id, value)
}

const regex = /^(auto|自动|0|([1-9]\d*)(?:\.\d+)?|0\.\d+|(?:0|[1-9]\d*)(?:\.\d+)?%|)$/i
const isAuto = computed(() => {
    return rowHeight.value?.toString().toLowerCase() === 'auto' || rowHeight.value?.toString().toLowerCase() === '自动' || rowHeight.value?.toString().toLowerCase() === ''
})
function modifyrowheight() {
    if (data && !(regex.test(rowHeight.value + ''))) {
        return rowHeight.value = weight.value;
    }
    if (!data) return;
    const editor = context.editor4Doc()
    if (isAuto.value) {
        editor.modifyTextMaskLineheight(data.sheet, data.id, undefined, true)
    } else {
        const value = parseFloat(rowHeight.value?.toString().replace('%', ''));
        if (rowHeight.value.toString().includes('%')) {
            editor.modifyTextMaskLineheight(data.sheet, data.id, value, true)
            rowHeight.value = format_value(value) + '%';
        } else {
            editor.modifyTextMaskLineheight(data.sheet, data.id, value, false)
            rowHeight.value = format_value(value);
        }

    }
}

const k_regex = /^(0(?:\.\d+)?|([1-9]\d*)(?:\.\d+)?)$/

function modifyKerning() {
    if (data && !(k_regex.test(wordSpace.value + ''))) {
        return wordSpace.value = format_value(data.text.kerning || 0);
    };
    if (!data) return;
    const editor = context.editor4Doc()
    const value = Number(parseFloat(wordSpace.value?.toString()).toFixed(2));
    editor.modifyTextMaskKerning(data.sheet, data.id, value)
    wordSpace.value = format_value(value);
}

function modifyUnderline(type: UnderlineType | undefined) {
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskUnderline(data.sheet, data.id, type)
}

function modifyStrikethrough(type: StrikethroughType | undefined) {
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskStrikethrough(data.sheet, data.id, type)
}

function modifyTransform(type: TextTransformType | undefined) {
    if (!data) return;
    const editor = context.editor4Doc()
    editor.modifyTextMaskTransform(data.sheet, data.id, type)
}

function changeNameInput(value: string) {
    name.value = value;
}

function changeDescInput(value: string) {
    desc.value = value;
}

function createStyle() {
    manager.createStyleLib(name.value, desc.value);
}

const weight = computed(() => {
    return data?.text.autoLineHeight ?? true ? data?.text.minimumLineHeight !== undefined ? format_value(data.text.minimumLineHeight || 0) + '%' : 'Auto' : format_value(data?.text.minimumLineHeight || 0)
})

function initData() {
    name.value = data?.name ?? t('stylelib.format');
    desc.value = data?.description ?? '';
    fontName.value = data?.text.fontName || DefaultFontName;
    fontWeight.value = fontWeightConvert(data?.text.weight, data?.text.italic ?? false);
    fontSize.value = data?.text.fontSize;
    rowHeight.value = data?.text.autoLineHeight ?? true ? data?.text.minimumLineHeight !== undefined ? format_value(data.text.minimumLineHeight || 0) + '%' : 'Auto' : format_value(data?.text.minimumLineHeight || 0)
    wordSpace.value = format_value(data?.text.kerning || 0)
}

function checkEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && name.value && !data) {
        createStyle();
    }
}

watch(() => data, (v) => {
    if (v) initData()
})

onMounted(() => {
    initData();
    data?.watch(initData);
    document.addEventListener('keydown', checkEnter);
})
onUnmounted(() => {
    data?.unwatch(initData);
    document.removeEventListener('keydown', checkEnter);
});


</script>
<style lang="scss" scoped>
.disable {
    pointer-events: none;
    opacity: 0.4;
}

.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
}

.modify-text-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .data-panel {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;

        .text-container {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .text-font {
                width: 100%;
                padding: 0 8px;
                box-sizing: border-box;

                .select-font {
                    height: 32px;
                    border-radius: var(--default-radius);
                    background-color: var(--input-background);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 6px;

                    span {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .down {
                        width: 12px;
                        height: 12px;

                        img {
                            width: 100%;
                            height: 100%;
                        }
                    }

                    &:hover {
                        background-color: #e5e5e5;
                    }
                }




            }

            .text-size {
                display: flex;
                align-items: center;
                height: 32px;
                padding: 0 8px;
                box-sizing: border-box;
                gap: 8px;

                .set-size {
                    flex: 0.5;
                    display: flex;
                    align-items: center;
                    background-color: var(--input-background);
                    height: 32px;
                    box-sizing: border-box;
                    border-radius: 6px;
                    position: relative;

                    .size_input {
                        position: relative;
                        display: flex;
                        align-items: center;
                        padding: 0 2px 0 8px;
                        box-sizing: border-box;
                        justify-content: space-between;

                        .input {
                            outline: none;
                            padding: 0;
                            margin: 0;
                            width: 100%;
                            background-color: transparent;
                            border: none;
                        }

                        .down {
                            display: flex;
                            min-width: 26px;
                            height: 26px;
                            align-items: center;
                            justify-content: center;
                            border-radius: 4px;

                            >img {
                                width: 12px;
                                height: 12px;
                            }

                            &:hover {
                                background-color: #EBEBEB;
                            }
                        }
                    }


                }


                .select-size {
                    position: absolute;
                    left: 0px;
                    width: 100%;
                    border-radius: 6px;
                    background-color: #fff;
                    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                    border: 1px solid #EBEBEB;
                    color: #262626;
                    padding: 4px 0;
                    z-index: 100;

                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        padding-left: 10px;
                        height: 32px;
                        box-sizing: border-box;

                        .icon {
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            >img {
                                width: 12px;
                                height: 12px;
                            }
                        }

                        &:hover {
                            background-color: #1878F5;
                            color: #fff;
                        }
                    }
                }
            }

            .text-space {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 0 8px;

                .row-height,
                .char-space {
                    flex: 0.5;
                    display: flex;
                    align-items: center;
                    background-color: #f5f5f5;
                    height: 32px;
                    border-radius: 6px;
                    gap: 8px;
                    padding: 0 8px;
                    box-sizing: border-box;

                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;

                        >img {
                            cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto !important;
                            width: 14px;
                            height: 14px;
                        }
                    }

                    .input {
                        width: 100%;
                        background-color: transparent;
                        border: none;
                        padding: 0;
                        outline: none;
                    }

                    input[type="text"]::-webkit-inner-spin-button,
                    input[type="text"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }

                    input[type="text"] {
                        -moz-appearance: textfield;
                        appearance: textfield;
                        font-size: var(--font-default-fontsize);
                    }

                    input:focus {
                        outline: none;
                    }
                }
            }
        }

    }

    .create-style {
        width: 100px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 8px auto;
        font-size: 12px;
        color: #fff;
        border-radius: 6px;
        background-color: #1878f5;
    }

    .disabled {
        opacity: 0.3;
        pointer-events: none;
    }
}
</style>
