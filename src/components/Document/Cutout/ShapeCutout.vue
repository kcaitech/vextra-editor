/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Matrix, PageView, CutoutShapeView, CutoutShape, ShapeView, ShapeType } from '@kcaitech/vextra-core';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Context } from '@/context';
import renderCutout from './renderCutout.vue';
import { Selection } from '@/context/selection';
import { throttle } from 'lodash';

const props = defineProps<{
    context: Context
    data: PageView,
    matrix: Matrix,
    transform: number[],
}>()
const cutoutShapes = ref<CutoutShapeView[]>([]);
const reflush = ref(0);

const _getCutoutShape = () => {
    const page = props.context.selection.selectedPage;
    if (page) {
        cutoutShapes.value = Array.from(page.cutoutList).filter(i => isVisible(i));
        nextTick(() => {
            reflush.value++;
        })
    }
    function isVisible(cut: CutoutShapeView) {
        let cs: ShapeView | undefined = cut;
        while (cs) {
            if (!cs.isVisible) return false;
            cs = cs.parent;
        }
        return true;
    }
}
const getCutoutShape = throttle(_getCutoutShape, 200);
const watcher = (...args: any[]) => {
    if (args.includes('shape-frame')) return;
    getCutoutShape();
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
        props.context.nextTick(props.data, () => {
            _getCutoutShape();
        })
        getCutoutShape();
    } else if (t === Selection.CHANGE_PAGE) {
        _getCutoutShape();
    }
}

const update_by_shapes = (...args: any[]) => {
    if (args.length === 1 && args[0] === 'isVisible') {
        getCutoutShape();
    }
    reflush.value++;
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听

function watch_shapes() {
    const map = new Map<string, ShapeView>();

    const cutoutList = props.context.selection.selectedPage!.cutoutList;

    for (const cut of cutoutList) {
        map.set(cut.id, cut);

        let p: ShapeView | undefined = cut;

        while(p) {
            map.set(p.id, p);
            p = p.parent;
        }
    }

    map.delete(props.context.selection.selectedPage!.id);

    watchedShapes.forEach((v, k) => {
        if (map.delete(k)) return;
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    map.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}


onMounted(() => {
    watcher();
    watch_shapes();
    props.data.watch(watcher);
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    props.context.selection.unwatch(selected_watcher);
    stopWatch();
})

</script>

<template>
    <component v-for="item in cutoutShapes" :key="item.id" :is="renderCutout" :context="context"
        :data="(item as CutoutShapeView)" :matrix="matrix" :reflush="reflush"></component>
</template>

<style lang="scss" scoped></style>