<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, watch, watchEffect } from "vue";
import { Context } from "@/context";
import { Matrix, Page, PageView, Shape, ShapeType, ShapeView, adapt2Shape } from "@kcdesign/data";
import { ClientXY, Selection } from "@/context/selection";
import ComponentTitle from "./ComponentTitle.vue"
import { is_shape_out, pre_modify_anchor } from "@/utils/content";
import { is_symbol_or_union } from "@/utils/symbol";

interface Props {
    context: Context
    data: PageView
    matrix: number[]
}

const props = defineProps<Props>();

interface Title {
    id: string
    content: string
    x: number
    y: number
    shape: ShapeView
    rotate: number
    maxWidth: number
}

const matrix = new Matrix(props.matrix);
const titles: Title[] = reactive([]);
const origin: ClientXY = { x: 0, y: 0 };

function updater(t?: any) {
    setOrigin();
    setPosition();
    if (t === 'childs') watchShapes()
}

// 代码样例
const setPosition = () => {
    // const st = Date.now();
    titles.length = 0;
    const components: ShapeView[] = props.data.childs;
    const l = components.length;
    for (let i = 0; i < l; i++) {
        const compo = components[i];
        if (!(is_symbol_or_union(compo)) || !compo.isVisible) continue;
        const matrix_compo_root = compo.matrix2Root();
        const matrix_page_client = props.context.workspace.matrix;
        const matrix_compo = new Matrix(matrix_compo_root);
        matrix_compo.multiAtLeft(matrix_page_client);
        if (is_shape_out(props.context, compo, matrix_compo)) continue;
        const maxWidth = shape_title_width(compo, matrix_compo);
        if (maxWidth < 24) continue;
        let anchor = modify_anchor(compo, matrix_compo_root);
        anchor = matrix_page_client.computeCoord3(anchor);
        anchor.y = anchor.y - origin.y - 16;
        anchor.x -= origin.x;
        titles.push({
            id: compo.id,
            content: compo.name,
            x: anchor.x,
            y: anchor.y,
            maxWidth,
            shape: compo,
            rotate: modify_rotate(compo)
        });
    }
    // console.log('计算位置：(ms)', Date.now() - st);
}

function modify_anchor(shape: ShapeView, m2r: Matrix) {
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

function modify_rotate(shape: ShapeView) {
    let rotate = shape.rotation || 0;
    // if (shape.isFlippedHorizontal) rotate = 180 - rotate;
    // if (shape.isFlippedVertical) rotate = 360 - rotate;
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
function shape_title_width(shape: ShapeView, matrix: Matrix) {
    let rotate = pre_modify_anchor(shape);
    // if (shape.isFlippedHorizontal) rotate = rotate + 270;
    // if (shape.isFlippedVertical) {
    //     rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    // }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    const f = shape.frame;
    let width = 0;
    const lt = matrix.computeCoord2(0, 0);
    const rt = matrix.computeCoord2(f.width, 0);
    const lb = matrix.computeCoord2(0, f.height);
    if (rotate >= 0 && rotate < 45) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    } else if (rotate >= 45 && rotate < 135) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 135 && rotate < 225) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    } else if (rotate >= 225 && rotate < 315) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 315 && rotate <= 360) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    }
    return width;
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
    const children_of_page = props.context.selection.selectedPage?.childs;
    if (children_of_page) {
        for (let i = 0, len = children_of_page.length; i < len; i++) {
            const compo = children_of_page[i];
            if (is_symbol_or_union(compo)) {
                needWatchShapes.set(compo.id, compo);
            }
        }
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

const rename = (value: string, shape: ShapeView) => {
    const editor = props.context.editor4Shape((shape));
    editor.setName(value)
    props.context.selection.rename();
}

function hover(shape: ShapeView) {
    const s = props.context.selection.selectedPage!.shapes.get(shape.id);
    if (s) props.context.selection.hoverShape(s);
}

function leave() {
    props.context.selection.unHoverShape();
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) watchShapes();
}

watch(() => props.matrix, updater);
onMounted(() => {
    watchShapes();
    props.context.selection.watch(selection_watcher);
    props.data.watch(updater);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.data.unwatch(updater);
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