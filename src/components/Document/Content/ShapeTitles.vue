<script lang="ts" setup>
import { watchEffect, onMounted, onUnmounted, computed, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";
import ArtboardName from "./ArtboardName.vue";

const props = defineProps<{
    context: Context
    data: Page,
    matrix: number[]
}>()
interface Title {
    id: string
    content: string
    x: number
    y: number
    width: number
    shape: Shape
    rotate: number
    maxWidth: number
    selected: boolean
}
const matrix = new Matrix(props.matrix);
const titles: Title[] = reactive([]);
const origin: ClientXY = { x: 0, y: 0 };
const watcher = () => {
    updater();
}

function updater() {
    watchShapes();
    setOrigin();
    setPosition();
}
function handleWorkspaceUpdate(t: any) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        setOrigin();
        setPosition();
    }
}
const setPosition = () => {
    const artboards: Shape[] = props.context.selection.selectedPage!.artboardList; // 只要遍历容器就可以了，直接拿这个，这个数组里面有全部容器，如果拿childs，会存在多余的遍历
    const len = artboards.length;
    if (len) {
        titles.length = 0;
        for (let i = 0; i < len; i++) {
            const artboard = artboards[i];
            if (artboard.parent?.type === ShapeType.Page && artboard.isVisible) { // 只给页面的直接子元素上标题
                const selecte = props.context.selection.selectedShapes;
                const hovered = props.context.selection.hoveredShape;
                let selected = false
                if (selecte[0] && artboard.id === selecte[0].id) {
                    selected = true
                } else if (hovered && artboard.id === hovered.id) {
                    selected = true
                } else {
                    selected = false
                }
                const m = artboard.matrix2Root(); // 图形到页面的转换矩阵
                const f2p = artboard.frame2Root(); // 
                const frame = artboard.frame;
                const matrix = props.context.workspace.matrix; // 页面坐标系转换矩阵
                let anchor = { x: 0, y: 0 }; // 锚点，其所在坐标系是page坐标系
                let rotate = artboard.rotation || 0;
                rotate = rotate < 0 ? rotate + 360 : rotate; // 这些关于角度的计算把图画出来就会比较清楚
                if (rotate < 135 && rotate >= 45) {
                    anchor = m.computeCoord({ x: 0, y: 0 + frame.height }); // 将 [图形坐标系] 的锚点通过 [图形到页面的转换矩阵] 转换到 [页面坐标系]，下面的也是
                    rotate -= 90;
                } else if (rotate < 225 && rotate >= 135) {
                    anchor = m.computeCoord({ x: 0 + frame.width, y: 0 + frame.height });
                    rotate -= 180;
                } else if (rotate < 315 && rotate >= 225) {
                    anchor = m.computeCoord({ x: 0 + frame.width, y: 0 });
                    rotate += 90;
                } else if (rotate < 360 && rotate > 315) {
                    anchor = m.computeCoord({ x: 0, y: 0 });
                } else if (rotate < 45 && rotate >= 0) {
                    anchor = m.computeCoord({ x: 0, y: 0 });
                }
                anchor = matrix.computeCoord({ x: anchor.x, y: anchor.y }); //将锚点从 [页面坐标系] 转换到 [窗口坐标系]
                anchor.y -= origin.y;
                anchor.x -= origin.x;
                anchor.y -= 16; // 顶上去16像素
                const width = f2p.width;
                const maxWidth = frame.width
                titles.push({ id: artboard.id, content: artboard.name, x: anchor.x, y: anchor.y, width, shape: artboard, rotate, maxWidth, selected });
            }
        }
    } else {
        titles.length = 0;
    }
}
function setOrigin() { // 这个动作是让container与页面坐标系重合
    matrix.reset(props.context.workspace.matrix);
    matrix.preTrans(props.data.frame.x, props.data.frame.y);
    origin.x = matrix.m02;
    origin.y = matrix.m12;
}

const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedPage?.childs;
    if (selection) {
        selection.forEach((v) => {
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

const rename = (value: string, shape: Shape) => {
    const editor = computed(() => {
        return props.context.editor4Shape(shape);
    });
    editor.value.setName(value)
    props.context.selection.rename();
}

function hover(shape: Shape) {
    const s = props.context.selection.selectedPage?.artboards.get(shape.id);
    if (s) {
        props.context.selection.hoverShape(s);
    }
}
function leave() {
    props.context.selection.unHoverShape();
}
onMounted(() => {
    props.context.workspace.watch(handleWorkspaceUpdate)
    props.context.selection.watch(updater);
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(handleWorkspaceUpdate);
    props.data.unwatch(watcher);
    props.context.selection.unwatch(updater);
})
watchEffect(() => updater());
</script>
<template>
    <!-- container -->
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div v-for="(t, index) in titles" class="title-container" :key="index"
            :style="{ top: `${t.y}px`, left: `${t.x}px`, 'max-width': `${t.maxWidth}px`, transform: `rotate(${t.rotate}deg)` }">
            <ArtboardName :context="props.context" :name="t.content" :index="index" :maxWidth="t.maxWidth" @rename="rename"
                @hover="hover" @leave="leave" :shape="t.shape" :selected="t.selected"></ArtboardName>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    position: absolute;
    overflow: visible;

    .title-container {
        display: flex;
        align-items: flex-end;
        min-width: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: absolute;
        font-size: var(--font-default-fontsize);
        height: 15px;
        transform-origin: bottom left;
        color: grey;
        z-index: 1;
    }
}
</style>