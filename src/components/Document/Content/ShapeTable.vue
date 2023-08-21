<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { Shape, TableCell, TableShape, objectId } from "@kcdesign/data";
import { renderTable as r } from "@kcdesign/data";

const props = defineProps<{ data: TableShape }>();
const reflush = ref(0);
const consumed: Array<{ shape: Shape, stopWatch: Function } | undefined> = [];

const watcher = () => {
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i]?.stopWatch();
    }
    consumed.length = 0;
})
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i]?.stopWatch();
    }
    consumed.length = 0;
    stopWatch();
})

function cellWatcher(shape: TableCell) {
    return () => {
        reflush.value++;
        if (shape.isImageCell() && !shape.peekImage()) shape.loadImage().then(() => {
            reflush.value++;
        })
    }
}

function render() {
    const consumed0 = props.data.childs;

    const ret = r(h, props.data, reflush.value !== 0 ? reflush.value : undefined)

    if (consumed0.length < consumed.length) {
        for (let i = consumed0.length, len = consumed.length; i < len; i++) {
            consumed[i]?.stopWatch();
        }
    }
    consumed.length = consumed0.length;
    for (let i = 0, len = consumed.length; i < len; i++) {
        const s0 = consumed0[i];
        const s = consumed[i];
        if (s0 === s) { // undefined
            continue;
        }
        if (s && s0 && objectId(s.shape) === objectId(s0)) {
            continue;
        }
        if (s) s.stopWatch();
        if (s0) {
            const stopWatch = s0.watch(cellWatcher(s0));
            consumed[i] = {
                shape: s0,
                stopWatch
            };
        }
    }
    return ret;
}

</script>

<template>
    <render />
</template>
