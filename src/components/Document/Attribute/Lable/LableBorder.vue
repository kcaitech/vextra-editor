<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { Border, Color } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils';
import { useI18n } from 'vue-i18n';
import LableTootip from './LableTootip.vue';
const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
interface BorderItem {
    id: number
    border: Border
}
const selectoption = ref(false);
const selsectedShow = ref(false);
const fillMenuItems = ref<string[]>(['HEX', 'RGB', 'HSL A', 'HSB A']);
const fill_i = ref(0);
const borders: BorderItem[] = reactive([]);
const copy_text = ref(false);
const address_visible = ref();
const b_top_visible = ref();
const b_right_visible = ref();
const b_bottoms_visible = ref();
const line_visible = ref();
const color_visible = ref();
const alpha_visible = ref();
const b_left_visible = ref();
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
    borders.length = 0;
    const shape = props.context.selection.selectedShapes[0];
    if (props.context.selection.selectedShapes.length === 1) {
        const style = shape.style;
        for (let i = 0, l = style.borders.length; i < l; i++) {
            const border = style.borders[i];
            const b: BorderItem = {
                id: i,
                border: border
            }
            borders.unshift(b);
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

const copyLable = async (e: MouseEvent) => {
    const clickedDiv = e.target as HTMLDivElement; // 获取点击的<div>元素
    const text = clickedDiv.textContent;
    if (text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => {
                copy_text.value = true;

            }, () => {
                console.log('复制失败');
            })
        } else {
            const textArea = document.createElement('textarea')
            textArea.value = text;
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            copy_text.value = true;
            textArea.remove()
        }
    }
}

const update_by_shapes = () => {
    watchShapes();
    getBordersData();
}
const selection_wather = (t: number) => {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watchShapes();
        getBordersData();
    }
}
onMounted(() => {
    update_by_shapes();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
</script>

<template>
    <div class="container">
        <LableType title="边框">
            <template #select>
                <div class="fillunit-input" @click.stop="onSelected">
                    <span>{{ fillMenuItems[fill_i] }}</span>
                    <el-icon>
                        <ArrowDown
                            :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                    </el-icon>
                    <LableDropMenu v-if="selsectedShow" :context="context" :Items="fillMenuItems" :choose="fill_i"
                        @close="close" @listMenuStatus="listMenuStatus"></LableDropMenu>
                </div>
            </template>
            <template #body>
                <template v-for="(b, i) in borders" :key="b.id">
                    <div class="row">
                        <span class="named">位置</span>
                        <LableTootip :copy_text="copy_text" :visible="address_visible === b.id + 'address'">
                            <div><span @click="copyLable" @mouseenter.stop="address_visible = b.id + 'address'"
                                    @mouseleave.stop="address_visible = undefined, copy_text = false">{{
                                        t(`attr.${b.border.position}`) }}</span></div>
                        </LableTootip>
                    </div>
                    <div class="color_row">
                        <span class="named">纯色</span>
                        <div style="display: flex;">
                            <div class="color"
                                :style="{ backgroundColor: toRGB(b.border.color.red, b.border.color.green, b.border.color.blue) }">
                            </div>
                            <LableTootip :copy_text="copy_text" :visible="color_visible === b.id + 'color'">
                                <span class="name" @click="copyLable" @mouseenter.stop="color_visible = b.id + 'color'"
                                    @mouseleave.stop="color_visible = undefined, copy_text = false">{{
                                        toColor(b.border.color, fillMenuItems[fill_i]) }}</span>
                            </LableTootip>
                            <LableTootip :copy_text="copy_text" :visible="alpha_visible === b.id + 'alpha'">
                                <span style="margin-left: 15px;" v-if="fillMenuItems[fill_i] === 'HEX'" @click="copyLable"
                                    @mouseenter.stop="alpha_visible = b.id + 'alpha'"
                                    @mouseleave.stop="alpha_visible = undefined, copy_text = false">{{
                                        filterAlpha(b.border.color.alpha * 100) + '%' }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">粗细</span>
                        <div>
                            <LableTootip :copy_text="copy_text" :visible="b_top_visible === b.id + 'top'">
                                <span @click="copyLable" @mouseenter.stop="b_top_visible = b.id + 'top'"
                                    @mouseleave.stop="b_top_visible = undefined, copy_text = false">{{ b.border.thickness +
                                        'px' }}&nbsp;</span>
                            </LableTootip>
                            <LableTootip :copy_text="copy_text" :visible="b_right_visible === b.id + 'right'">
                                <span @click="copyLable" @mouseenter.stop="b_right_visible = b.id + 'right'"
                                    @mouseleave.stop="b_right_visible = undefined, copy_text = false">{{ b.border.thickness +
                                        'px' }}&nbsp;</span>
                            </LableTootip>
                            <LableTootip :copy_text="copy_text" :visible="b_bottoms_visible === b.id + 'bottom'">
                                <span @click="copyLable" @mouseenter.stop="b_bottoms_visible = b.id + 'bottom'"
                                    @mouseleave.stop="b_bottoms_visible = undefined, copy_text = false">{{ b.border.thickness +
                                        'px' }}&nbsp;</span>
                            </LableTootip>
                            <LableTootip :copy_text="copy_text" :visible="b_left_visible === b.id + 'left'">
                                <span @click="copyLable" @mouseenter.stop="b_left_visible = b.id + 'left'"
                                    @mouseleave.stop="b_left_visible = undefined, copy_text = false">{{ b.border.thickness +
                                        'px' }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">样式</span>
                        <div style="display: flex;">
                            <LableTootip :copy_text="copy_text" :visible="line_visible === b.id + 'line'">
                                <span style="color: #a5a5a5;" @click="copyLable"
                                    @mouseenter.stop="line_visible = b.id + 'line'"
                                    @mouseleave.stop="line_visible = undefined, copy_text = false">{{
                                        b.border.borderStyle.gap > 0 ? '虚线' : '实线' }}</span>
                            </LableTootip>
                            <span v-if="b.border.borderStyle.gap > 0" style="margin-left: 10px;">{{ b.border.borderStyle.gap
                            }}</span>
                            <span v-if="b.border.borderStyle.gap > 0" style="margin-left: 10px;">{{
                                b.border.borderStyle.length }}</span>
                        </div>
                    </div>
                    <div class="line" v-if="borders.length > 1 && i !== borders.length - 1"></div>
                </template>
            </template>
        </LableType>
    </div>
</template>

<style lang="scss" scoped>
.fillunit-input {
    position: relative;
    height: 30px;
    border-radius: 4px;
    padding-left: 11px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    span {
        flex: 1;
    }

    .el-icon {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.named {
    display: block;
    width: 58px;
    color: #a5a5a5;
}

.row {
    display: flex;
    margin: 10px 0;
}

.color_row {
    display: flex;
    margin: 10px 0;
    color: #000;

    .color {
        margin-right: 5px;
        width: 14px;
        height: 14px;
        border-radius: 2px;
        border: 1px solid var(--grey-dark);
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
}</style>