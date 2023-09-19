<script lang="ts" setup>
import { watchEffect, onMounted, onUnmounted, computed, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";
import ComponentTitle from "./ComponentTitle.vue"
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
    const components: Shape[] = props.context.selection.selectedPage!.childs;
    const len = components.length;
    if (len) {
        titles.length = 0;
        for (let i = 0; i < len; i++) {
            const compo = components[i];
            if (compo.type === ShapeType.SymbolRef && compo.parent?.type === ShapeType.Page && compo.isVisible) {
                const shapes = props.context.selection.selectedShapes;
                const hovered = props.context.selection.hoveredShape;
                let selected = false
                if (shapes[0] && compo.id === shapes[0].id) {
                    selected = true
                } else if (hovered && compo.id === hovered.id) {
                    selected = true
                } else {
                    selected = false
                }
                const m = compo.matrix2Root(); // 图形到页面的转换矩阵
                const f2p = compo.frame2Root();
                const frame = compo.frame;
                const matrix = props.context.workspace.matrix;
                let anchor = { x: 0, y: 0 };
                let rotate = compo.rotation || 0;
                rotate = rotate < 0 ? rotate + 360 : rotate;
                if (rotate < 135 && rotate >= 45) {
                    anchor = m.computeCoord2(0, frame.height);
                    rotate -= 90;
                } else if (rotate < 225 && rotate >= 135) {
                    anchor = m.computeCoord2(frame.width, frame.height);
                    rotate -= 180;
                } else if (rotate < 315 && rotate >= 225) {
                    anchor = m.computeCoord2(frame.width, 0);
                    rotate += 90;
                } else if (rotate < 360 && rotate > 315) {
                    anchor = m.computeCoord2(0, 0);
                } else if (rotate < 45 && rotate >= 0) {
                    anchor = m.computeCoord2(0, 0);
                }
                anchor = matrix.computeCoord3(anchor);
                anchor.y = anchor.y - origin.y - 16;
                anchor.x -= origin.x;
                const width = f2p.width;
                const maxWidth = frame.width
                titles.push({ id: compo.id, content: compo.name, x: anchor.x, y: anchor.y, width, shape: compo, rotate, maxWidth, selected });
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
    const s = props.context.selection.selectedPage!.shapes.get(shape.id);
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
    <!-- 组件标题 -->
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div class="title-container" v-for="(t, index) in titles" :key="index"
            :style="{ top: `${t.y}px`, left: `${t.x}px`, 'max-width': `${t.maxWidth}px`, transform: `rotate(${t.rotate}deg)` }">
            <ComponentTitle :context="props.context" :name="t.content" :index="index" :maxWidth="t.maxWidth"
                @rename="rename" @hover="hover" @leave="leave" :shape="t.shape" :selected="t.selected"></ComponentTitle>
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
        z-index: 1;
    }
}
</style>