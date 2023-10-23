<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, ref } from 'vue';
import { Selection } from '@/context/selection';
import { get_rotation } from '@/utils/attri_setting';
import { GroupShape, PathShape, PathShape2, RectShape, Shape, ShapeType, TextShape } from '@kcdesign/data';
import { Menu } from '@/context/menu';
import Tooltip from '@/components/common/Tooltip.vue';
import LableTootip from './LableTootip.vue';
const props = defineProps<{
    context: Context
}>();
const name = ref('');
const xy = ref({ x: 0, y: 0 });
const size = ref({ w: 0, h: 0 });
const rotate = ref(0);
const radius = ref<{ lt: number, rt: number, rb: number, lb: number }>({ lt: 0, rt: 0, rb: 0, lb: 0 });
const watchedShapes = new Map();
const unit = ['pt', 'px', 'dp', 'rpx'];
const copy_text = ref(false);
const name_visible = ref(false)
const x_visible = ref(false)
const y_visible = ref(false)
const w_visible = ref(false)
const h_visible = ref(false)
const _visible = ref();
const radius_visible = ref(false)
const rotate_visible = ref(false)
const platfrom = ref(props.context.menu.isPlatfrom);
const multiple = ref(props.context.menu.isMulriple);
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(getShapeInfo);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(getShapeInfo); });
    }
}
const getShapeInfo = () => {
    const len = props.context.selection.selectedShapes.length;
    if (len === 1) {
        const shape = props.context.selection.selectedShapes[0];
        const posi = shape.matrix2Root().computeCoord2(0, 0);
        xy.value.x = +(posi.x * multiple.value).toFixed(2);
        xy.value.y = +(posi.y * multiple.value).toFixed(2);
        rotate.value = get_rotation(shape);
        getRadius(shape);
        const frame = shape.frame;
        size.value.w = +(frame.width * multiple.value).toFixed(2);
        size.value.h = +(frame.height * multiple.value).toFixed(2);
        if (shape.type === ShapeType.Line) {
            size.value.h = 0;
        }
        name.value = shape.name;
    }
}

const getRadius = (shape: Shape) => {
    if (shape instanceof RectShape) {
        const { lb, lt, rb, rt } = (shape as RectShape).getRectRadius();
        radius.value.lb = lb * multiple.value;
        radius.value.lt = lt * multiple.value;
        radius.value.rb = rb * multiple.value;
        radius.value.rt = rt * multiple.value;
    } else if (shape instanceof GroupShape ||
        shape instanceof PathShape ||
        shape instanceof PathShape2 ||
        shape instanceof TextShape) {
        const fixedRadius = shape.fixedRadius ?? 0;
        radius.value.lt = fixedRadius * multiple.value;
        radius.value.lb = fixedRadius * multiple.value;
        radius.value.rt = fixedRadius * multiple.value;
        radius.value.rb = fixedRadius * multiple.value;
    }
}
function selection_wather(t: any) {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        getShapeInfo();
    }
}
const innerRaduis = (r: { lt: number, rt: number, rb: number, lb: number }, type: string, bool?: boolean) => {
    const { lt, rt, rb, lb } = r
    if (lt === rt && lt === rb && lt === lb) {
        if (bool) {
            return lt > 0;
        } else {
            return lt + `${type}`;
        }
    } else {
        return `${lt}${type} ${rt}${type} ${rb}${type} ${lb}${type}`;
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

const menu_watcher = (t: number) => {
    if (t === Menu.LABLE_PLATFROM_CHANGE) {
        platfrom.value = props.context.menu.isPlatfrom;
        getShapeInfo();
    }
    if (t === Menu.LABLE_MULRIPLE) {
        multiple.value = props.context.menu.isMulriple;
        getShapeInfo();
    }
}

// hooks
onMounted(() => {
    watch_shapes();
    getShapeInfo();
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
        <LableType title="图层信息">
            <template #body>
                <div class="row">
                    <span class="named">名称</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'name'">
                        <div><span class="name" @click="(e) => copyLable(e, 'name')"  style="cursor: pointer;"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ name }}</span></div>
                    </LableTootip>
                </div>
                <div class="row">
                    <span class="named">位置</span>
                    <div style="display: flex;">
                        <span style="display: block; width: 50%;"><span class="name"
                                style="color: #a5a5a5; margin-right: 5px;">X</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'x'">
                                <span @click="(e) => copyLable(e, 'x')"  style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ xy.x }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                        <span style="display: block; width: 50%;"><span class="name"
                                style="color: #a5a5a5; margin-right: 5px">Y</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'y'">
                                <span @click="(e) => copyLable(e, 'y')"  style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">{{ xy.y }}{{ unit[platfrom]
                                    }}</span>
                            </LableTootip>
                        </span>
                    </div>
                </div>
                <div class="row">
                    <span class="named">大小</span>
                    <div style="display: flex;">
                        <span style="display: block; width: 50%;"><span class="name"
                                style="color: #a5a5a5; margin-right: 5px">W</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'w'">
                                <span @click="(e) => copyLable(e, 'w')"  style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ size.w }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                        <span style="display: block; width: 50%;"><span class="name"
                                style="color: #a5a5a5; margin-right: 5px">H</span>
                            <LableTootip :copy_text="copy_text" :visible="_visible === 'h'">
                                <span @click="(e) => copyLable(e, 'h')"  style="cursor: pointer;"
                                    @mouseleave.stop="_visible = undefined, copy_text = false">
                                    {{ size.h }}{{ unit[platfrom] }}
                                </span>
                            </LableTootip>
                        </span>
                    </div>
                </div>
                <div class="row" v-if="rotate > 0">
                    <span class="named">角度</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'rotate'">
                        <div><span @click="(e) => copyLable(e, 'rotate')"  style="cursor: pointer;"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ rotate }}deg</span></div>
                    </LableTootip>
                </div>
                <!-- <div class="row">
                    <span class="named">不透明度</span>
                    <div></div>
                </div> -->
                <div class="row" v-if="innerRaduis(radius, unit[platfrom], true)">
                    <span class="named">圆角</span>
                    <LableTootip :copy_text="copy_text" :visible="_visible === 'radius'">
                        <div><span class="name" @click="(e) => copyLable(e, 'radius')"  style="cursor: pointer;"
                                @mouseleave.stop="_visible = undefined, copy_text = false">{{ innerRaduis(radius,
                                    unit[platfrom]) }}</span></div>
                    </LableTootip>
                </div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.named {
    display: block;
    width: 58px;
    color: #a5a5a5;
}

.row {
    display: flex;
    margin: 10px 0;
    color: #000;

    >div {
        flex: 1;
    }
}

.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>