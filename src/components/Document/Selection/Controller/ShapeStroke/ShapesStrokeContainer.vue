<script setup lang='ts'>
import { Context } from '@/context';
import { ref, onMounted, onUnmounted } from 'vue';
import { Selection, SelectionTheme } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { reactive } from 'vue';
import { is_symbol_class } from '@/utils/controllerFn';
import { adapt2Shape } from "@kcdesign/data";

const watchedShapes = new Map();

interface Props {
    context: Context
}

const props = defineProps<Props>();
const paths = ref<{ path: string, theme: SelectionTheme }[]>([]);
const theme_map = reactive<Map<string, SelectionTheme>>(new Map());

function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(update_paths);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(update_paths);
        watchedShapes.set(k, v);
    })
}

function selection_watcher(t?: number) {
    if (t === Selection.CHANGE_SHAPE) {
        watchShapes();
        update_themes();
        update_paths();
    }
}

function update_paths() {
    // if ((window as any).__context.workspace.transforming && (window as any).__context.selection.selectedShapes.length > 50) return; @@@
    const shapes = props.context.selection.selectedShapes;
    const workspace = props.context.workspace;
    if (!workspace.shouldSelectionViewUpdate) {
        return;
    }
    const m = workspace.matrix;
    paths.value.length = 0;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const path = shape.getPath().clone();
        const m2r = shape.matrix2Root();
        m2r.multiAtLeft(m);
        path.transform(m2r);
        paths.value.push({ path: path.toString(), theme: theme_map.get(shape.id) || SelectionTheme.Normal });
    }
    if (shapes.length === 1 && paths.value.length === 1) {
        workspace.setCtrlPath(paths.value[0].path);
    }
}

function update_themes() {
    const shapes = props.context.selection.selectedShapes;
    theme_map.clear();
    for (let i = 0; i < shapes.length; i++) {
        const shape = adapt2Shape(shapes[i]);
        const theme = is_symbol_class(shape) ? SelectionTheme.Symbol : SelectionTheme.Normal;
        theme_map.set(shape.id, theme);
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        passive_update();
    } else if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        passive_update();
    }
}

function passive_update() {
    paths.value.length = 0;
    const shapes = props.context.selection.selectedShapes;
    const m = props.context.workspace.matrix;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const path = shape.getPath().clone();
        const m2r = shape.matrix2Root();
        m2r.multiAtLeft(m);
        path.transform(m2r);
        paths.value.push({ path: path.toString(), theme: theme_map.get(shape.id) || SelectionTheme.Normal });
    }
    if (shapes.length === 1 && paths.value.length === 1) {
        props.context.workspace.setCtrlPath(paths.value[0].path);
    }
}

function page_watcher() {
    const page = props.context.selection.selectedPage;

    if (page) {
        page.watch(update_paths);
    }
}

function remove_page_watcher() {
    const page = props.context.selection.selectedPage;

    if (page) {
        page.unwatch(update_paths);
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    watchShapes();
    page_watcher();
    update_themes();
    update_paths();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    watchedShapes.forEach(v => v.unwatch(update_paths));
    remove_page_watcher();
})
</script>
<template>
    <g>
        <path v-for="(p, i) in paths" :key="i" :d="p.path" :stroke="p.theme" fill="none"></path>
    </g>
</template>
<style lang='scss' scoped></style>