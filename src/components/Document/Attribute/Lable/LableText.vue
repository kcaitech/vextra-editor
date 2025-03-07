/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { Color, Para, ShapeType, TextShape, TextShapeView, Stop, FillType } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils';
import { isEqual, uniqWith } from 'lodash';
import LableTootip from './LableTootip.vue';

import { useI18n } from 'vue-i18n'
import SvgIcon from "@/components/common/SvgIcon.vue";

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();

const text = ref('');
const watchedShapes = new Map();
const textFormat = ref<any[]>([]);
const selectoption = ref(false);
const selsectedShow = ref(false);
const textMenuItems = ref<string[]>(['HEX', 'RGB', 'HSL A', 'HSB A']);
const text_i = ref(0);
const copy_text = ref(false);

const _visible = ref();
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(getTextFormat);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(getTextFormat); });
    }
}

const getTextFormat = () => {
    textFormat.value.length = 0;
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length === 1 && shapes[0].type === ShapeType.Text) {
        const shape: TextShapeView = shapes[0] as TextShapeView;
        text.value = shape.text.getText(0, Infinity).replace(/\n/g, '');
        const paras = shape.text.paras;
        const spans: any = [];

        paras.map((item: Para) => {
            const item_len = item.text.replace(/\n/g, '').length;
            if (!item_len) return;
            const lineH = item.attr?.minimumLineHeight || 24;
            const p_Spacing = item.attr?.paraSpacing || 0;
            let span_len = 0;
            const map_spans = item.spans.map((v: any) => {
                span_len += v.length;
                if (item.spans.length === 1) span_len -= 1;
                if (span_len > item_len) return;
                const value = { ...v };
                if (!value.line_height || value.paraSpacing === undefined) {
                    value.line_height = lineH
                    value.paraSpacing = p_Spacing
                }
                delete value.__uuid;
                delete value.__id_684FF842426D409B89503DB15A3042AE;
                delete value.__parent;
                delete value.length;
                delete value.underline;
                delete value.italic;
                delete value.transform;
                delete value.strikethrough;
                delete value.highlight;
                delete value.__propKey;
                delete value.typeId;
                if (value.fillType && value.fillType === FillType.Gradient && value.gradient) {
                    const stops = value.gradient.stops.map((v: Stop) => {
                        return { alpha: v.color.alpha, blue: v.color.blue, green: v.color.green, red: v.color.red };
                    })
                    value.gradient = {
                        gradientType: value.gradient.gradientType,
                        stops: stops
                    }
                    delete value.gradient.stops.__uuid;
                } else {
                    delete value.gradient;
                }
                value.color = { alpha: value.color.alpha, blue: value.color.blue, green: value.color.green, red: value.color.red };
                return value;
            }).filter(v => v);
            spans.push(...map_spans);
        })
        const newSpans = uniqWith(spans, isEqual);
        textFormat.value = newSpans;
    }

}
function selection_wather(t: any) {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        getTextFormat();
    }
}

const listMenuStatus = (i: number) => {
    text_i.value = i;
}
const close = () => {
    selsectedShow.value = false;
}

const onSelected = () => {
    if (selsectedShow.value) {
        props.context.menu.lableMenuMount('text');
    } else {
        props.context.menu.lableMenuMount();
    }
    selsectedShow.value = !selsectedShow.value;
}

const toColor = (options: Color, type: string) => {
    let color = '';
    if (type === 'HEX') {
        color = toHex(options.red, options.green, options.blue);
    } else if (type === 'RGB') {
        color = toRGBA(options.red, options.green, options.blue, options.alpha);
    } else if (type === 'HSL A') {
        color = toHSL(options);
    }
    else if (type === 'HSB A') {
        color = toHSB(options);
    }
    return color;
}

const toHex = (r: number, g: number, b: number) => {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return '#' + hex(r) + hex(g) + hex(b);
}
const toRGB = (r: number, g: number, b: number) => {
    return "rgb(" + r + "," + g + "," + b + ")";
}
const toRGBA = (r: number, g: number, b: number, a?: number) => {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}
const toHSL = (color: Color) => {
    const { h, s, l } = RGB2HSL(color);
    return "hsla(" + Math.round(h) + ", " + Math.round(s * 100) + "%, " + Math.round(l * 100) + "%, " + color.alpha + ")";
}
const toHSB = (color: Color) => {
    const { h, s, b } = RGB2HSB(color);
    return "hsba(" + Math.round(h) + ", " + Math.round(s * 100) + "%, " + Math.round(b * 100) + "%, " + color.alpha + ")";
}

const filterAlpha = (a: number) => {
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

const copyLable = async (e: MouseEvent, v: string) => {
    const clickedDiv = e.target as HTMLDivElement; // 获取点击的<div>元素
    const text = clickedDiv.textContent;
    if (text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => {
                copy_text.value = true;
                _visible.value = v;
            }, () => {
                console.log(`${t('lable.copyfailure')}`);
            })
        } else {
            const textArea = document.createElement('textarea')
            textArea.value = text;
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            copy_text.value = true;
            _visible.value = v;
            textArea.remove()
        }
    }
}

onMounted(() => {
    getTextFormat();
    watch_shapes();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
import down_icon from "@/assets/icons/svg/down.svg"
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.text')">
            <template #select>
                <div class="fillunit-input" @click.stop="onSelected">
                    <span>{{ textMenuItems[text_i] }}</span>
                    <SvgIcon :icon="down_icon"/>
                    <LableDropMenu v-if="selsectedShow" :context="props.context" :Items="textMenuItems" :choose="text_i"
                        @close="close" @listMenuStatus="listMenuStatus"></LableDropMenu>
                </div>
            </template>

            <template #body>
                <div class="row">
                    <div class="named">{{ t('lable.content') }}</div>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'content'">
                        <div style="display: flex; width: calc(100% - 58px);">
                            <span style="cursor: pointer;font-weight: 500;" class="hovered name"
                                @click="(e) => copyLable(e, 'content')"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ text }}</span>
                        </div>
                    </LableTootip>
                </div>
                <!--                <div class="line"></div>-->
                <template v-for="(item, index) in textFormat" :key="index">
                    <div class="row">
                        <span class="named">{{ t('lable.font') }}</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'font' + index">
                                <div style="display: flex; width: calc(100% - 58px);">
                                <span @click="(e) => copyLable(e, 'font' + index)" class="hovered name"
                                    style="cursor: pointer;font-weight: 500;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.fontName
                                    }}</span>
                                </div>
                            </LableTootip>
                    </div>
                    <div class="row">
                        <span class="named">{{ t('lable.type_size') }}</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'size' + index">
                                <span @click="(e) => copyLable(e, 'size' + index)" class="hovered"
                                    style="cursor: pointer;font-weight: 500"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.fontSize
                                    }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">{{ t('lable.word_weight') }}</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'weight' + index">
                                <span @click="(e) => copyLable(e, 'weight' + index)" class="hovered"
                                    style="cursor: pointer;font-weight: 500"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.bold || 400
                                    }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row" v-if="item.kerning">
                        <span class="named">{{ t('lable.word_space') }}</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'ker' + index">
                                <span @click="(e) => copyLable(e, 'ker' + index)" style="cursor: pointer;" class="hovered"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.kerning ?
            item.kerning :
            0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">{{ t('lable.line_height') }}</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'line' + index">
                                <span @click="(e) => copyLable(e, 'line' + index)" class="hovered"
                                    style="cursor: pointer;font-weight: 500"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.line_height ?
            item.line_height : 0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row" v-if="item.paraSpacing">
                        <span class="named">{{ t('lable.para_spacing') }}</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'para' + index">
                                <span @click="(e) => copyLable(e, 'para' + index)" class="hovered"
                                    style="cursor: pointer;font-weight: 500"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ item.paraSpacing ?
            item.paraSpacing : 0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row" style="padding: 0;">
                        <span class="color_name" style="height: 34px;"
                            v-if="!item.fillType || item.fillType === FillType.SolidColor">{{
            t('lable.pure_color') }}</span>
                        <span class="color_name" :style="{ height: `${28 * item.gradient!.stops.length}px` }" v-else>{{
            t(`color.${item.gradient!.gradientType}`) }}</span>
                        <div class="color_box" v-if="!item.fillType || item.fillType === FillType.SolidColor">
                            <div class="color"
                                :style="{ backgroundColor: toRGB(item.color.red, item.color.green, item.color.blue) }">
                            </div>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'color' + index">
                                <span class="name hovered" @click="(e) => copyLable(e, 'color' + index)"
                                    style="cursor: pointer;font-weight: 500"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ toColor(item.color,
            textMenuItems[text_i]) }}</span>
                            </LableTootip>
                            <LableTootip v-if="textMenuItems[text_i] === 'HEX'" :copy_text="copy_text"
                                :visible="_visible === 'alpha' + index">
                                <span style="margin-left: 15px; cursor: pointer;font-weight: 500" class="hovered"
                                    @click="(e) => copyLable(e, 'alpha' + index)" v-if="textMenuItems[text_i] === 'HEX'"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{
            filterAlpha(item.color.alpha * 100) + '%' }}</span>
                            </LableTootip>
                        </div>
                        <div v-else>
                            <div v-for="(stop, si) in item.gradient!.stops" :key="si" class="color_box"
                                style="height: 28px;">
                                <div class="color" :style="{ backgroundColor: toRGB(stop.red, stop.green, stop.blue) }">
                                </div>
                                <LableTootip :copy_text="copy_text" :visible="_visible === 'color' + (index + si)">
                                    <span class="name hovered" @click="(e) => copyLable(e, 'color' + (index + si))"
                                        style="cursor: pointer;font-weight: 500"
                                        @mouseleave.stop="_visible = undefined, copy_text = false">{{
            toColor(stop,
                textMenuItems[text_i]) }}</span>
                                </LableTootip>
                                <LableTootip v-if="textMenuItems[text_i] === 'HEX'" :copy_text="copy_text"
                                    :visible="_visible === 'alpha' + (index + si)">
                                    <span style="margin-left: 15px; cursor: pointer;font-weight: 500" class="hovered"
                                        @click="(e) => copyLable(e, 'alpha' + (index + si))"
                                        v-if="textMenuItems[text_i] === 'HEX'"
                                        @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                        filterAlpha(stop.alpha * 100) + '%' }}</span>
                                </LableTootip>
                            </div>
                        </div>
                    </div>
                    <div class="line" v-if="textFormat.length > 1 && index !== textFormat.length - 1"></div>
                </template>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.fillunit-input {
    position: relative;
    height: 16px;
    border-radius: 4px;
    padding-left: 11px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    span {
        flex: 1;
        color: #8C8C8C;
        margin-right: 4px;
    }

    >svg {
        width: 12px;
        height: 12px;
        color: #BFBFBF;
        margin-right: 4px;
    }
}

.named {
    display: block;
    width: 58px;
    color: #8C8C8C;
}

.color_name {
    display: flex;
    align-items: center;
    width: 58px;
    color: #8C8C8C;
}

.color_box {
    display: flex;
    font-weight: 500;
    height: 34px;
    align-items: center;
}

.row {
    display: flex;
    align-items: center;
    height: 34px;

    .color {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
    }
}

.text_color {
    justify-content: space-between;
    margin: 0;
}

.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.line {
    width: 100%;
    height: 1px;
    border-style: solid;
    border-color: transparent;
    border-bottom: 1px solid rgba($color: #ccc, $alpha: 0.5);
    margin: 5px 0;
}
.hovered {
    padding: 3px;
    border-radius: 4px;
    &:hover {
        border-radius: 2px;
        background-color: #EBEBEB;
    }
}
</style>