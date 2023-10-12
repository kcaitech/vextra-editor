<script setup lang="ts">
import { Context } from '@/context';
import LableType from './LableType.vue'
import { onMounted, onUnmounted, ref } from 'vue';
import { Selection } from '@/context/selection';
import { get_rotation } from '@/utils/attri_setting';
import { GroupShape, PathShape, PathShape2, RectShape, Shape, ShapeType, TextShape } from '@kcdesign/data';
import { Menu } from '@/context/menu';
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
const platfrom = ref(props.context.menu.isPlatfrom);
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
        xy.value = shape.matrix2Root().computeCoord2(0, 0);
        rotate.value = get_rotation(shape);
        getRadius(shape);
        const frame = shape.frame;
        size.value.w = frame.width;
        size.value.h = frame.height;
        if (shape.type === ShapeType.Line) {
            size.value.h = 0;
        }
        name.value = shape.name;
    }
}

const getRadius = (shape: Shape) => {
    if (shape instanceof RectShape) {
        radius.value = (shape as RectShape).getRectRadius();
    } else if (shape instanceof GroupShape ||
        shape instanceof PathShape ||
        shape instanceof PathShape2 ||
        shape instanceof TextShape) {
        const fixedRadius = shape.fixedRadius ?? 0;
        radius.value.lt = fixedRadius;
        radius.value.lb = fixedRadius;
        radius.value.rt = fixedRadius;
        radius.value.rb = fixedRadius;
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
const menu_watcher = (t: number) => {
    if(t === Menu.LABLE_PLATFROM_CHANGE) {
        platfrom.value = props.context.menu.isPlatfrom;
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
                    <div><span class="name">{{ name }}</span></div>
                </div>
                <div class="row">
                    <span class="named">位置</span>
                    <div style="display: flex;">
                        <span style="display: block; width: 50%;"><span style="color: gray;">X</span> {{ xy.x }}{{ unit[platfrom] }}</span>
                        <span style="display: block; width: 50%;"><span style="color: gray;">Y</span> {{ xy.y }}{{ unit[platfrom] }}</span>
                    </div>
                </div>
                <div class="row">
                    <span class="named">大小</span>
                    <div style="display: flex;">
                        <span style="display: block; width: 50%;"><span style="color: gray;">W</span> {{ size.w }}{{ unit[platfrom] }}</span>
                        <span style="display: block; width: 50%;"><span style="color: gray;">H</span> {{ size.h }}{{ unit[platfrom] }} </span>
                    </div>
                </div>
                <div class="row" v-if="rotate > 0">
                    <span class="named">角度</span>
                    <div><span>{{ rotate }}deg</span></div>
                </div>
                <!-- <div class="row">
                    <span class="named">不透明度</span>
                    <div></div>
                </div> -->
                <div class="row" v-if="innerRaduis(radius, unit[platfrom], true)">
                    <span class="named">圆角</span>
                    <div><span>{{ innerRaduis(radius, unit[platfrom]) }}</span></div>
                </div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.named {
    display: block;
    width: 50px;
    color: gray;
}

.row {
    display: flex;
    margin: 10px 0;
    color: #000;

    >div {
        flex: 1;

        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>