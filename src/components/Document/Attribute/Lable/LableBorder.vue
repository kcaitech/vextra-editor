<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { Border, BorderPosition, BorderSideSetting, BorderStyle, Color, CornerType, FillType, SideType, StrokePaint } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils';
import { useI18n } from 'vue-i18n';
import LableTootip from './LableTootip.vue';
import { Menu } from '@/context/menu';
import SvgIcon from "@/components/common/SvgIcon.vue";
const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
interface BorderItem {
    id: number
    border: Border
}
interface StrokePaintItem {
    id: number
    strokePaint: StrokePaint
}
interface BorderData {
    position: BorderPosition
    cornerType: CornerType
    borderStyle: BorderStyle
    sideSetting: BorderSideSetting
}

const selectoption = ref(false);
const selsectedShow = ref(false);
const fillMenuItems = ref<string[]>(['HEX', 'RGB', 'HSL A', 'HSB A']);
const fill_i = ref(0);
const strokePaints: StrokePaintItem[] = reactive([]);
const border = ref<BorderData>();
const copy_text = ref(true);
const _visible = ref();

const multiple = ref(props.context.menu.isMulriple);
const onSelected = () => {
    if (selsectedShow.value) {
        props.context.menu.lableMenuMount('fill');
    } else {
        props.context.menu.lableMenuMount();
    }
    selsectedShow.value = !selsectedShow.value;
}
const listMenuStatus = (i: number) => {
    fill_i.value = i;
}
const close = () => {
    selsectedShow.value = false;
}
const watchedShapes = new Map();
function watchShapes() {
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

const watcher = (...args: any[]) => {
    if (args.length > 0 && args.includes('style')) getBordersData();
}

const getBordersData = () => {
    strokePaints.length = 0;
    const shape = props.context.selection.selectedShapes[0];
    if (props.context.selection.selectedShapes.length === 1) {
        const borders1 = shape.getBorders();
        for (let i = 0, l = borders1.strokePaints.length; i < l; i++) {
            const s = borders1.strokePaints[i];
            const b: StrokePaintItem = {
                id: i,
                strokePaint: s
            }
            strokePaints.unshift(b);
        }
        if (borders1.strokePaints.length) {
            const initBorder = {
                position: borders1.position,
                cornerType: borders1.cornerType,
                borderStyle: borders1.borderStyle,
                sideSetting: borders1.sideSetting
            }
            border.value = initBorder;
        }
    }
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

const update_by_shapes = () => {
    watchShapes();
    getBordersData();
}
const selection_wather = (t: number | string) => {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watchShapes();
        getBordersData();
    }
}

const menu_watcher = (t: number) => {
    if (t === Menu.LABLE_MULRIPLE) {
        multiple.value = props.context.menu.isMulriple;
    }
}
onMounted(() => {
    update_by_shapes();
    props.context.selection.watch(selection_wather);
    props.context.menu.watch(menu_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.menu.unwatch(menu_watcher);
})
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.border')">
            <template #select>
                <div class="fillunit-input" @click.stop="onSelected">
                    <span>{{ fillMenuItems[fill_i] }}</span>
                    <svg-icon icon-class="down"></svg-icon>
                    <LableDropMenu v-if="selsectedShow" :context="context" :Items="fillMenuItems" :choose="fill_i"
                        @close="close" @listMenuStatus="listMenuStatus"></LableDropMenu>
                </div>
            </template>

            <template #body>
                <div class="row" v-if="border">
                    <span class="named">{{ t('lable.position') }}</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'address'">
                        <div><span @click="(e) => copyLable(e, 'address')" style="cursor: pointer;font-weight: 500"
                                class="hovered" @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    t(`attr.${border.position}`) }}</span></div>
                    </LableTootip>
                </div>
                <div class="row" v-if="border">
                    <span class="named">{{ t('lable.thickness') }}</span>
                    <div style="font-weight: 500" class="thickness">
                        <LableTootip :copy_text="copy_text" :visible="_visible === 'top'">
                            <span @click="(e) => copyLable(e, 'top')" style="cursor: pointer;" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    border.sideSetting.thicknessTop *
                                    multiple + 'px' }}&nbsp;</span>
                        </LableTootip>
                        <LableTootip :copy_text="copy_text" :visible="_visible === 'right'">
                            <span @click="(e) => copyLable(e, 'right')" style="cursor: pointer;" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    border.sideSetting.thicknessRight
                                    * multiple + 'px' }}&nbsp;</span>
                        </LableTootip>
                        <LableTootip :copy_text="copy_text" :visible="_visible === 'bottom'">
                            <span @click="(e) => copyLable(e, 'bottom')" style="cursor: pointer;" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    border.sideSetting.thicknessBottom * multiple + 'px' }}&nbsp;</span>
                        </LableTootip>
                        <LableTootip :copy_text="copy_text" :visible="_visible === 'left'">
                            <span @click="(e) => copyLable(e, 'left')" style="cursor: pointer;" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    border.sideSetting.thicknessLeft *
                                    multiple + 'px' }}</span>
                        </LableTootip>
                    </div>
                </div>
                <div class="row" v-if="border">
                    <span class="named">{{ t('lable.style') }}</span>
                    <div style="display: flex;" class="thickness">
                        <LableTootip :copy_text="copy_text" :visible="_visible === 'line'">
                            <span style="color: #000000; cursor: pointer;font-weight: 500"
                                @click="(e) => copyLable(e, 'line')" class="hovered"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                    border.borderStyle.gap > 0 ? `${t('lable.dotted_line')}` :
                                        `${t('lable.solid_line')}`
                                }}</span>
                        </LableTootip>
                        <span v-if="border.borderStyle.gap > 0" style="margin-left: 10px;color: #000000;">{{
                            border.borderStyle.gap
                            }}</span>
                        <span v-if="border.borderStyle.gap > 0" style="margin-left: 10px;color: #000000;">{{
                            border.borderStyle.length }}</span>
                    </div>
                </div>
                <template v-for="(b, i) in strokePaints" :key="b.id">
                    <div class="color_row">
                        <span class="color_name" style="height: 34px;"
                            v-if="!b.strokePaint.fillType || b.strokePaint.fillType === FillType.SolidColor">{{
                                t('lable.pure_color') }}</span>
                        <span class="color_name" :style="{ height: `${28 * b.strokePaint.gradient!.stops.length}px` }"
                            v-else>{{ t(`color.${b.strokePaint.gradient!.gradientType}`) }}</span>
                        <div class="color_box"
                            v-if="!b.strokePaint.fillType || b.strokePaint.fillType === FillType.SolidColor">
                            <div class="color"
                                :style="{ backgroundColor: toRGB(b.strokePaint.color.red, b.strokePaint.color.green, b.strokePaint.color.blue) }">
                            </div>
                            <LableTootip :copy_text="copy_text" :visible="_visible === b.id + 'color'">
                                <span class="name hovered" style="cursor: pointer;"
                                    @click="(e) => copyLable(e, b.id + 'color')"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                        toColor(b.strokePaint.color, fillMenuItems[fill_i]) }}</span>
                            </LableTootip>
                            <LableTootip v-if="fillMenuItems[fill_i] === 'HEX'" :copy_text="copy_text"
                                :visible="_visible === b.id + 'alpha'">
                                <span style="margin-left: 15px; cursor: pointer;" class="hovered"
                                    v-if="fillMenuItems[fill_i] === 'HEX'" @click="(e) => copyLable(e, b.id + 'alpha')"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                        filterAlpha(b.strokePaint.color.alpha * 100) + '%' }}</span>
                            </LableTootip>
                        </div>
                        <div v-else>
                            <div v-for="stop in b.strokePaint.gradient!.stops" :key="stop.id" class="color_box"
                                style="height: 28px;">
                                <div class="color"
                                    :style="{ backgroundColor: toRGB(stop.color.red, stop.color.green, stop.color.blue) }">
                                </div>
                                <LableTootip :copy_text="copy_text" :visible="_visible === stop.id + 'color'">
                                    <span class="name hovered" @click="(e) => copyLable(e, stop.id + 'color')"
                                        @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                            toColor(stop.color as Color,
                                                fillMenuItems[fill_i]) }}</span>
                                </LableTootip>
                                <LableTootip :copy_text="copy_text" :visible="_visible === stop.id + 'alpha'"
                                    v-if="fillMenuItems[fill_i] === 'HEX'">
                                    <span style="margin-left: 16px; cursor: pointer;" class="hovered"
                                        @click="(e) => copyLable(e, stop.id + 'alpha')"
                                        @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                            filterAlpha(stop.color.alpha * 100) + '%' }}</span>
                                </LableTootip>
                            </div>
                        </div>
                    </div>
                    <div class="line" v-if="strokePaints.length > 1 && i !== strokePaints.length - 1"></div>
                </template>
            </template>
        </LableType>
    </div>
</template>

<style lang="scss" scoped>
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

.row {
    display: flex;
    align-items: center;
    height: 34px;
}

.thickness {
    height: 100%;
    display: flex;
    align-items: center;
}

.color_row {
    display: flex;
    color: #000;

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

    .color {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
    }
}

.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.line {
    width: 100%;
    height: 11px;
    border-width: 5px 0 5px 0;
    border-style: solid;
    border-color: #fff;
    box-sizing: border-box;
    background-color: rgb(0, 0, 0, .05);
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