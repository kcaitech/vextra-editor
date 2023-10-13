<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { Selection } from '@/context/selection';
import LableDropMenu from "./LableDropMenu.vue";
import { ArrowDown } from '@element-plus/icons-vue';
import { Color, Fill } from '@kcdesign/data';
import { RGB2HSL, RGB2HSB } from '@/components/common/ColorPicker/utils'
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
        const style = shape.style;
        for (let i = 0, len = style.fills.length; i < len; i++) {
            const fill = style.fills[i];
            const f = { id: i, fill };
            fills.unshift(f);
        }
    }
}

const toColor = (options: Color, type: string) => {
    let color = '';
    if (type === 'HEX') {
        color = toHex(options.red, options.green, options.blue);
    }else if (type === 'RGB') {
        color = toRGBA(options.red, options.green, options.blue, options.alpha);
    }else if(type === 'HSL A') {
        color = toHSL(options);
    }
    else if(type === 'HSB A') {
        color = toHSB(options);
    }
    return color;
}

const toHex = (r: number, g: number, b: number) => {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return '#' + hex(r) + hex(g) + hex(b);
}
const toRGB = (r: number, g: number, b: number) => {
  return "rgb(" +r + "," + g + "," + b + ")";
}
const toRGBA = (r: number, g: number, b: number, a?: number) => {
  return "rgba(" +r + "，" + g + "，" + b + "，" + a + ")";
}
const toHSL = (color: Color) => {
    const {h, s, l} = RGB2HSL(color);
    return "hsla(" +Math.round(h) + "，" + Math.round(s * 100) + "%，" + Math.round(l * 100) + "%，" + color.alpha + ")";
}
const toHSB = (color: Color) => {
    const {h, s, b} = RGB2HSB(color);
    return "hsba(" +Math.round(h) + "，" + Math.round(s * 100) + "%，" + Math.round(b * 100) + "%，" + color.alpha + ")";
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

const update_by_shapes = () => {
    watchShapes();
    getFillsData();
}
const selection_wather = (t: number) => {
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
</script>

<template>
    <div class="container">
        <LableType title="填充">
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
                <div class="row" v-for="(f) in fills" :key="f.id">
                    <span class="named">纯色</span>
                    <div style="display: flex;">
                        <div class="color" :style="{ backgroundColor: toRGB(f.fill.color.red, f.fill.color.green, f.fill.color.blue) }"></div>
                        <span class="name">{{ toColor(f.fill.color, fillMenuItems[fill_i]) }}</span>
                        <span style="margin-left: 15px;" v-if="fillMenuItems[fill_i] === 'HEX'">{{ filterAlpha(f.fill.color.alpha * 100) + '%' }}</span>
                    </div>
                </div>
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
</style>