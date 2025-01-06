<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { Color, Fill, FillType } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils';
import LableTootip from './LableTootip.vue';
import { useI18n } from 'vue-i18n'
import SvgIcon from "@/components/common/SvgIcon.vue";

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
interface FillItem {
    id: number,
    fill: Fill
}
const selectoption = ref(false);
const selsectedShow = ref(false);
const fillMenuItems = ref<string[]>(['HEX', 'RGB', 'HSL A', 'HSB A']);
const fill_i = ref(0);
const fills: FillItem[] = reactive([]);
const copy_text = ref(false);
const _visible = ref();
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
    if (args.length > 0 && args.includes('style')) getFillsData();
}

const getFillsData = () => {
    fills.length = 0;
    const shape = props.context.selection.selectedShapes[0];
    if (props.context.selection.selectedShapes.length === 1) {
        const fills1 = shape.getFills();
        for (let i = 0, len = fills1.length; i < len; i++) {
            const fill = fills1[i];
            const f = { id: i, fill };
            fills.unshift(f);
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
    getFillsData();
}
const selection_wather = (t: number | string) => {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watchShapes();
        getFillsData();
    }
}
onMounted(() => {
    update_by_shapes();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})

import down_icon from "@/assets/icons/svg/down.svg"
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.fill')">
            <template #select>
                <div class="fillunit-input" @click.stop="onSelected">
                    <span>{{ fillMenuItems[fill_i] }}</span>
                    <SvgIcon :icon="down_icon"/>
                    <LableDropMenu v-if="selsectedShow" :context="context" :Items="fillMenuItems" :choose="fill_i"
                        @close="close" @listMenuStatus="listMenuStatus"></LableDropMenu>
                </div>
            </template>

            <template #body>
                <div class="row" v-for="(f) in fills" :key="f.id">
                    <span class="named" style="height: 34px;"
                        v-if="!f.fill.fillType || f.fill.fillType === FillType.SolidColor">{{
            t('lable.pure_color') }}</span>
                    <span class="named" :style="{ height: `${28 * f.fill.gradient!.stops.length}px` }"
                        v-else-if="f.fill.fillType === FillType.Gradient">{{
            t(`color.${f.fill.gradient!.gradientType}`) }}</span>
                    <span class="named" style="height: 34px;" v-else-if="f.fill.fillType === FillType.Pattern">{{
            t(`pattern.image`) }}</span>
                    <div class="color_box" v-if="!f.fill.fillType || f.fill.fillType === FillType.SolidColor">
                        <div class="color"
                            :style="{ backgroundColor: toRGB(f.fill.color.red, f.fill.color.green, f.fill.color.blue) }">
                        </div>
                        <LableTootip :copy_text="copy_text" :visible="_visible === f.id + 'color'">
                            <span class="name hovered" @click="(e) => copyLable(e, f.id + 'color')"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ toColor(f.fill.color,
            fillMenuItems[fill_i]) }}</span>
                        </LableTootip>
                        <LableTootip :copy_text="copy_text" :visible="_visible === f.id + 'alpha'"
                            v-if="fillMenuItems[fill_i] === 'HEX'">
                            <span style="margin-left: 16px; cursor: pointer;" class="hovered"
                                @click="(e) => copyLable(e, f.id + 'alpha')"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{
            filterAlpha(f.fill.color.alpha * 100) + '%' }}</span>
                        </LableTootip>
                    </div>
                    <div v-else-if="f.fill.fillType === FillType.Gradient">
                        <div v-for="stop in f.fill.gradient!.stops" :key="stop.id" class="color_box"
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
    color: #000000;


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
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hovered {
    padding: 3px;
    border-radius: 3px;

    &:hover {
        border-radius: 2px;
        background-color: #EBEBEB;
    }
}
</style>