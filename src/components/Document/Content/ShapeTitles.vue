<script lang="ts" setup>
import { onMounted, onUnmounted, computed, reactive, ref, nextTick } from "vue";
import { Context } from "@/context";
import { Matrix, PageView, ShapeType, ShapeView } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { ClientXY } from "@/context/selection";
import ArtboardName from "./ArtboardName.vue";
import { is_shape_out, pre_modify_anchor, shape_title_width } from "@/utils/content";
import { TitleAttri, TitleRenderer } from "@/components/Document/Content/titleRenderer";

const props = defineProps<{
    context: Context;
    data: PageView;
}>()

interface Title {
    id: string
    content: string
    x: number
    y: number
    width: number

    shape(): ShapeView

    rotate: number
    maxWidth: number
    selected: boolean
}

const titles: Title[] = reactive([]);
const origin: ClientXY = { x: 0, y: 0 };

const titlesList = ref<TitleAttri[]>([]);
const titleRenderer = new TitleRenderer(props.context, titlesList.value as TitleAttri[]);

const watcher = () => {
    updater();
    titleRenderer.fullUpdate();
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
    } else if (t === WorkSpace.ROOT_UPDATE) {
        titleRenderer.updateUnderRootContainerMap();
        titleRenderer.fullUpdate();
    }
}

const setPosition = () => {
    const artboards: ShapeView[] = props.data.artboardList; // 只要遍历容器就可以了，直接拿这个，这个数组里面有全部容器，如果拿childs，会存在多余的遍历
    const len = artboards.length;
    if (len) {
        titles.length = 0;
        for (let i = 0; i < len; i++) {
            const artboard = artboards[i];
            if (artboard.parent?.type === ShapeType.Page && artboard.isVisible) { // 只给页面的直接子元素上标题
                const select = props.context.selection.selectedShapes;
                const hovered = props.context.selection.hoveredShape;

                let selected = false

                selected = Boolean(
                    (select[0] && artboard.id === select[0].id)
                    || (hovered && artboard.id === hovered.id)
                );

                const f2p = artboard.frame2Root();

                const matrix_artboard_root = artboard.matrix2Root(); // 图形到页面的转换矩阵
                const matrix = props.context.workspace.matrix; // 页面到屏幕的转换矩阵

                const matrix_artboard = new Matrix(matrix_artboard_root);
                matrix_artboard.multiAtLeft(matrix);

                if (is_shape_out(props.context, artboard, matrix_artboard)) continue;

                const maxWidth = shape_title_width(artboard, matrix_artboard);
                if (maxWidth < 24) continue;

                let anchor = modify_anchor(artboard, matrix_artboard_root);
                anchor = matrix.computeCoord({ x: anchor.x, y: anchor.y }); //将锚点从 [页面坐标系] 转换到 [窗口坐标系]

                anchor.y -= 16; // 顶上去16像素
                const width = f2p.width;
                titles.push({
                    id: artboard.id,
                    content: artboard.name,
                    x: anchor.x,
                    y: anchor.y,
                    width,
                    shape: () => artboard,
                    rotate: modify_rotate(artboard),
                    maxWidth,
                    selected
                });
            }
        }
    } else {
        titles.length = 0;
    }
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

function setOrigin() { // 这个动作是让container与页面坐标系重合
    const matrix = new Matrix(props.context.workspace.matrix);
    matrix.preTrans(props.data.frame.x, props.data.frame.y);
    origin.x = matrix.m02;
    origin.y = matrix.m12;
}

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.data.childs;
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

const rename = (value: string, shape: ShapeView) => {
    const editor = computed(() => {
        return props.context.editor4Shape((shape));
    });
    editor.value.setName(value)
    props.context.selection.rename();
}

function hover(shape: ShapeView) {
    const page = props.data;
    const s = page.data.artboards.get(shape.id);
    const _s = s && page.getShape(s.id);
    if (_s) {
        props.context.selection.hoverShape(_s);
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
    props.context.selection.unwatch(updater);

    props.data.unwatch(watcher);
})
</script>
<template>
    <div class="container">
        <div
            v-for="(title, index) in titlesList"
            class="title-container"
            :key="index"
            :style="{  transform:  title.transform}"
        >
            <ArtboardName
                :context="props.context"
                :name="title.name"
                :index="index"
                :maxWidth="title.width"
                @rename="rename"
                @hover="hover"
                @leave="leave"
                :shape="title.shape as ShapeView"
                :selected="title.active"
            ></ArtboardName>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    position: absolute;
    overflow: visible;
    background-color: grey;
    height: 100px;
    width: 100px;

    .title-container {
        position: absolute;

        display: flex;
        align-items: flex-end;

        min-width: 14px;
        height: 20px;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        font-size: var(--font-default-fontsize);
        color: grey;

        z-index: 1;
    }
}
</style>