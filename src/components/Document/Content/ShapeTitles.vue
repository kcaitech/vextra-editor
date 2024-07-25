<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { Context } from "@/context";
import { PageView, ShapeView } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { Selection } from "@/context/selection"
import { TitleAttri, TitleRenderer } from "@/components/Document/Content/titleRenderer";
import ArtboardName from "./ArtboardName.vue";

const props = defineProps<{
    context: Context;
    data: PageView;
}>()


const titlesList = reactive<TitleAttri[]>([]);
const titleRenderer = new TitleRenderer(props.context, titlesList as TitleAttri[]);

function pageWatcher(...args: any[]) {
    if (args.length === 1 && args[0] === 'childs') {
        titleRenderer.updateUnderRootContainerMap();
        watch_shapes();
    }
}

function workspaceWatcher(t: number | string) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        titleRenderer.fullUpdate();
    } else if (t === WorkSpace.ROOT_UPDATE) {
        titleRenderer.updateUnderRootContainerMap();
        titleRenderer.fullUpdate();
    }
}

function selectionWatcher(t: number | string) {
    if (t === Selection.CHANGE_PAGE) {
        titleRenderer.updateUnderRootContainerMap();
        watch_shapes();
    }
}

const rename = (value: string, shape: ShapeView) => {
    props.context.editor4Shape((shape)).setName(value)
    props.context.selection.unHoverShape();
    props.context.selection.hoverShape(shape);
}

function hover(shape: ShapeView) {
    const page = props.data;

    const _s = page.getShape(shape.id);
    if (_s) {
        props.context.selection.hoverShape(_s);
    }
}

const stopDataWatcher = watch(() => props.data, (n, o) => {
    n.watch(pageWatcher);
    o.unwatch(pageWatcher);
});

function leave() {
    props.context.selection.unHoverShape();
}

const update_by_shapes = (...args: any[]) => {
    if (args.length === 1 && args[0] === 'isVisible') {
        titleRenderer.fullUpdate();
    }
    
}
const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const artboardList = props.data.childs;
    artboardList.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    props.context.workspace.watch(workspaceWatcher)
    props.context.selection.watch(selectionWatcher);
    watch_shapes();
    props.data.watch(pageWatcher);

    titleRenderer.updateUnderRootContainerMap();
    titleRenderer.fullUpdate();
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);

    props.data.unwatch(pageWatcher);

    titleRenderer.clearContainerWatcher();

    stopDataWatcher()
})
</script>
<template>
    <div class="container">
        <div v-for="(title, index) in titlesList" class="title-container" :key="index"
            :style="{ transform: title.transform }">
            <ArtboardName :context="props.context" :data="title as TitleAttri" @rename="rename" @hover="hover"
                @leave="leave" />
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    position: absolute;
    overflow: visible;
    height: 100px;
    width: 100px;
    pointer-events: none;

    .title-container {
        transform-origin: left top;
        pointer-events: auto;

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