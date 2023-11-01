<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { Context } from "@/context";
import { Matrix, Page, Shape, ShapeType } from "@kcdesign/data";
import { ClientXY, Selection } from "@/context/selection";
import ComponentTitle from "./ComponentTitle.vue"
import { is_shape_out, top_side } from "@/utils/content";
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
    shape: Shape
    rotate: number
    maxWidth: number
}
const matrix = new Matrix(props.matrix);
const titles: Title[] = reactive([]);
const origin: ClientXY = { x: 0, y: 0 };
function updater() {
    setOrigin();
    setPosition();
}
// 代码样例
const setPosition = () => {
    // const st = Date.now();
    titles.length = 0;
    const components: Shape[] = props.data.childs;
    const len = components.length;
    if (len) {
        for (let i = 0; i < len; i++) {
            const compo = components[i];
            if (compo.type === ShapeType.Symbol && compo.isVisible) {
                const matrix_compo_root = compo.matrix2Root();
                const matrix_page_client = props.context.workspace.matrix;
                const matrix_compo = new Matrix(matrix_compo_root);
                matrix_compo.multiAtLeft(matrix_page_client);
                if (is_shape_out(props.context, compo, matrix_compo)) continue;
                const top_side_l = top_side(compo, matrix_compo);
                if (top_side_l < 72) continue;
                let anchor = modify_anchor(compo, matrix_compo_root);
                anchor = matrix_page_client.computeCoord3(anchor);
                anchor.y = anchor.y - origin.y - 16;
                anchor.x -= origin.x;
                const maxWidth = top_side_l;
                titles.push({
                    id: compo.id,
                    content: compo.name,
                    x: anchor.x, y: anchor.y,
                    maxWidth,
                    shape: compo,
                    rotate: modify_rotate(compo)
                });
            }
        }
    }
    // console.log('计算位置：(ms)', Date.now() - st);
}
function pre_modify_anchor(shape: Shape) {
    let rotate = shape.rotation || 0;
    if (shape.isFlippedHorizontal) rotate = rotate + 270;
    if (shape.isFlippedVertical) {
        rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    return rotate;
}
function modify_anchor(shape: Shape, m2r: Matrix) {
    const rotate = pre_modify_anchor(shape);
    const frame = shape.frame;
    let anchor = { x: 0, y: 0 };
    if (rotate >= 0 && rotate < 45) {
        anchor = m2r.computeCoord2(0, 0);
    } else if (rotate >= 45 && rotate < 135) {
        anchor = m2r.computeCoord2(0, frame.height);
    } else if (rotate >= 135 && rotate < 225) {
        anchor = m2r.computeCoord2(frame.width, frame.height);
    } else if (rotate >= 225 && rotate < 315) {
        anchor = m2r.computeCoord2(frame.width, 0);
    } else if (rotate >= 315 && rotate <= 360) {
        anchor = m2r.computeCoord2(0, 0);
    }
    return anchor;
}
function modify_rotate(shape: Shape) {
    let rotate = shape.rotation || 0;
    if (shape.isFlippedHorizontal) rotate = 180 - rotate;
    if (shape.isFlippedVertical) rotate = 360 - rotate;
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    if (rotate >= 0 && rotate < 45) {
    } else if (rotate >= 45 && rotate < 135) {
        rotate -= 90;
    } else if (rotate >= 135 && rotate < 225) {
        rotate -= 180;
    } else if (rotate >= 225 && rotate < 315) {
        rotate += 90;
    } else if (rotate > 315 && rotate <= 360) {
    }
    return rotate;
}
// ↑
function setOrigin() { // 这个动作是让container与页面坐标系重合
    matrix.reset(props.context.workspace.matrix);
    matrix.preTrans(props.data.frame.x, props.data.frame.y);
    origin.x = matrix.m02;
    origin.y = matrix.m12;
}
const watchedShapes = new Map();
function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const childs_of_page = props.data.childs;
    for (let i = 0, len = childs_of_page.length; i < len; i++) {
        const compo = childs_of_page[i];
        if (compo.type === ShapeType.Symbol && compo.isVisible) needWatchShapes.set(compo.id, compo);
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(updater);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(updater);
        watchedShapes.set(k, v);
    })
}
const rename = (value: string, shape: Shape) => {
    const editor = props.context.editor4Shape(shape);
    editor.setName(value)
    props.context.selection.rename();
}
function hover(shape: Shape) {
    const s = props.context.selection.selectedPage!.shapes.get(shape.id);
    if (s) props.context.selection.hoverShape(s);
}
function leave() {
    props.context.selection.unHoverShape();
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) watchShapes();
}
watch(() => props.matrix, updater);
onMounted(() => {
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <div class="container" :style="{ top: `${origin.y}px`, left: `${origin.x}px` }">
        <div class="title-container" v-for="(t, index) in titles" :key="t.id"
            :style="{ top: `${t.y}px`, left: `${t.x}px`, 'max-width': `${t.maxWidth}px`, transform: `rotate(${t.rotate}deg)` }">
            <ComponentTitle :context="props.context" :name="t.content" :index="index" :maxWidth="t.maxWidth"
                @rename="rename" @hover="hover" @leave="leave" :shape="t.shape"></ComponentTitle>
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