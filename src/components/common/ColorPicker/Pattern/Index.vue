/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { PatternCatch } from "@/components/common/ColorPicker/Editor/patternlineareditor";
import { useI18n } from "vue-i18n";
import { ImageScaleMode } from "@kcdesign/data";
import rotate90_icon from "@/assets/icons/svg/rotate90.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import SelectBanana from "@/components/common/Select/SelectBanana.vue";
import { ref } from "vue";
import { fixedZero } from "@/utils/common";
import PatternFilter from "@/components/common/ColorPicker/Pattern/PatternFilter.vue";

const props = defineProps<{
    editor: ColorPickerEditor;
    data: PatternCatch;
}>();
const t = useI18n().t;
const imageModeOptions = [
    {label: t(`pattern.${ImageScaleMode.Fill}`), value: ImageScaleMode.Fill},
    {label: t(`pattern.${ImageScaleMode.Fit}`), value: ImageScaleMode.Fit},
    {label: t(`pattern.${ImageScaleMode.Stretch}`), value: ImageScaleMode.Stretch},
    {label: t(`pattern.${ImageScaleMode.Tile}`), value: ImageScaleMode.Tile},
];
const picker = ref<HTMLInputElement>();
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml';

function modifyObjectFit(val: ImageScaleMode) {
    props.editor.modifyObjectFit(val);
}
function selectImage() {
    if (picker.value) picker.value.click();
}

function pick(e: Event) {
    props.editor.modifyRef(e);
    (picker.value as HTMLInputElement).value = '';
}


function rotate() {
    props.editor.rotateImg();
}

function scale(event: Event) {
    props.editor.modifyTileScale(event);
    (event.target as HTMLInputElement).blur();
}

function focus(event: Event) {
    (event.target as HTMLInputElement).select();
}
</script>

<template>
    <div class="pattern-modifier-wrapper">
        <div class="header">
            <SelectBanana class="select" :context="editor.context" :options="imageModeOptions" :value="data.objectFit"
                          @change="modifyObjectFit"/>
            <div v-if="data.objectFit === ImageScaleMode.Tile" class="scale">
                <input type="text" :value="fixedZero((data.scale ?? 0.5) * 100) + '%'" @change="scale" @focus="focus">
            </div>
            <div class="rotate" @click="rotate">
                <SvgIcon :icon="rotate90_icon"/>
            </div>
        </div>
        <div class="body">
            <div class="mask" @click="selectImage">
                <img :src="data.media" alt="pattern">
                <div class="pic-picker">
                    <div> {{ t('attr.selected_picture') }}</div>
                </div>
                <input type="file" ref="picker" :accept="accept" :multiple="false" id="fill-file-picker"
                       @change.stop="pick"/>
            </div>
        </div>
        <PatternFilter :editor="editor" :data="data.filter"/>
    </div>
</template>

<style scoped lang="scss">
.pattern-modifier-wrapper {
    padding: 8px 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .header {
        width: 100%;
        height: 32px;
        display: flex;
        gap: 6px;

        .select {
            flex: 1;
        }

        .scale {
            flex: 0 0 68px;
            height: 100%;
            width: 68px;
            border-radius: 4px;
            background-color: #f4f5f5;
            display: flex;
            padding: 6px;
            box-sizing: border-box;

            input {
                width: 100%;
                color: #000000;
                text-overflow: ellipsis;
                background-color: transparent;
                border: none;
                font-size: var(--font-default-fontsize);
                outline: none;
                box-sizing: border-box;
            }

            input::selection {
                color: #FFFFFF;
                background: #1878F5;
            }

            input::-moz-selection {
                color: #FFFFFF;
                background: #1878F5;
            }

            .input-text {
                border: none;
                outline: none;
            }
        }

        .rotate {
            flex: 0 0 32px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            cursor: pointer;

            &:hover {
                background-color: #f5f5f5;
            }

            svg {
                width: 14px;
                height: 14px;
                outline: none;
            }
        }

    }

    .body {
        width: 100%;
        height: 190px;
        box-sizing: border-box;

        .mask {
            border: solid 1px #efefef;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: conic-gradient(#eee 25%, white 0deg 50%, #eee 0deg 75%, white 0deg) 0 / 15px 15px;
            box-sizing: border-box;

            img {
                position: absolute;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            > .pic-picker {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;

                div {
                    width: 100px;
                    height: 32px;
                    text-align: center;
                    line-height: 32px;
                    visibility: hidden;
                    color: #fff;
                    border: 1px solid #fff;
                    border-radius: 6px;
                    background-color: rgba(0, 0, 0, 0.2);
                    transition: 0.2s;
                }
            }

            #fill-file-picker {
                display: none;
            }
        }

        .mask:hover {
            > .pic-picker {
                background-color: rgba(0, 0, 0, 0.1);

                div {
                    visibility: visible;
                }
            }
        }
    }
}
</style>