<script  lang="ts" setup>
import { Context } from '@/context';
import LableType from './LableType.vue'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { AttrGetter, Border, Color, Fill, Para, ShapeType, TextShape } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils';
import { useI18n } from 'vue-i18n';
import { isEqual, uniqWith } from 'lodash';
import LableTootip from './LableTootip.vue';
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
const content_visible = ref(false);
const font_visible = ref();
const size_visible = ref();
const weight_visible = ref();
const ker_visible = ref();
const line_visible = ref();
const para_visible = ref();
const color_visible = ref();
const alpha_visible = ref();
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
        const shape: TextShape = shapes[0] as TextShape;
        text.value = shape.text.getText(0, Infinity).replace(/\n/g, '');
        const paras = shape.text.paras;
        const spans: any = [];
        paras.map((item: Para) => {
            const lineH = item.attr?.minimumLineHeight || 24;
            const p_Spacing = item.attr?.paraSpacing || 0;
            const map_spans = item.spans.map((v: any) => {
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
                value.color = { alpha: value.color.alpha, blue: value.color.blue, green: value.color.green, red: value.color.red };
                return value;
            })
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
</script>

<template>
    <div class="container">
        <LableType title="文本">
            <template #select>
                <div class="fillunit-input" @click.stop="onSelected">
                    <span>{{ textMenuItems[text_i] }}</span>
                    <el-icon>
                        <ArrowDown
                            :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                    </el-icon>
                    <LableDropMenu v-if="selsectedShow" :context="props.context" :Items="textMenuItems" :choose="text_i"
                        @close="close" @listMenuStatus="listMenuStatus"></LableDropMenu>
                </div>
            </template>
            <template #body>
                <div class="row">
                    <div class="named">内容</div>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'content'">
                        <div class="name" style="flex: 1;">
                            <span style="width: 100%; cursor: pointer;" @click="(e) => copyLable(e, 'content')"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ text }}</span>
                        </div>
                    </LableTootip>
                </div>
                <div class="line"></div>
                <template v-for="(t, index) in textFormat" :key="index">
                    <div class="row">
                        <span class="named">字体</span>
                        <div class="name" style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'font' + index">
                                <span @click="(e) => copyLable(e, 'font' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.fontName }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">字号</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'size' + index">
                                <span @click="(e) => copyLable(e, 'size' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.fontSize }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">字重</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'weight' + index">
                                <span @click="(e) => copyLable(e, 'weight' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.bold ? 700 : 400
                                    }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row" v-if="t.kerning">
                        <span class="named">字间距</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'ker' + index">
                                <span @click="(e) => copyLable(e, 'ker' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.kerning ? t.kerning :
                                        0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">行高</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'line' + index">
                                <span @click="(e) => copyLable(e, 'line' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.line_height ?
                                        t.line_height : 0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row" v-if="t.paraSpacing">
                        <span class="named">段间距</span>
                        <div style="flex: 1;">
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'para' + index">
                                <span @click="(e) => copyLable(e, 'para' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ t.paraSpacing ?
                                        t.paraSpacing : 0 }}</span>
                            </LableTootip>
                        </div>
                    </div>
                    <div class="row">
                        <span class="named">纯色</span>
                        <div style="display: flex;">
                            <div class="color"
                                :style="{ backgroundColor: toRGB(t.color.red, t.color.green, t.color.blue) }">
                            </div>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'color' + index">
                                <span class="name" @click="(e) => copyLable(e, 'color' + index)" style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ toColor(t.color,
                                        textMenuItems[text_i]) }}</span>
                            </LableTootip>
                            <LableTootip v-if="textMenuItems[text_i] === 'HEX'" :copy_text="copy_text"
                                :visible="_visible === 'alpha' + index">
                                <span style="margin-left: 15px; cursor: pointer;"
                                    @click="(e) => copyLable(e, 'alpha' + index)" v-if="textMenuItems[text_i] === 'HEX'"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{
                                        filterAlpha(t.color.alpha * 100) + '%' }}</span>
                            </LableTootip>
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
    align-items: center;
    margin: 10px 0;

    .color {
        margin-right: 5px;
        width: 14px;
        height: 14px;
        border-radius: 2px;
        border: 1px solid var(--grey-dark);
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
</style>