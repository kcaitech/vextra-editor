<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { Shape, TableShape } from "@kcdesign/data";
import { renderTable as r } from "@kcdesign/data";

const props = defineProps<{ data: TableShape }>();
const reflush = ref(0);
const consumed: Array<Shape> = [];

const watcher = () => {
    reflush.value++;

    // load image // todo
    props.data.childs.forEach((cell) => {
        if (cell.isImageCell() && !cell.peekImage()) cell.loadImage().then(() => { reflush.value++ })
    })
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i].unwatch(watcher);
    }
    consumed.length = 0;
})
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i].unwatch(watcher);
    }
    consumed.length = 0;
    stopWatch();
})

function render() {
    const consumed0: Array<Shape> = props.data.childs;

    const ret = r(h, props.data, reflush.value !== 0 ? reflush.value : undefined)

    if (consumed0.length < consumed.length) {
        for (let i = consumed0.length, len = consumed.length; i < len; i++) {
            consumed[i].unwatch(watcher);
        }
    }
    consumed.length = consumed0.length;
    for (let i = 0, len = consumed.length; i < len; i++) {
        const s0 = consumed0[i];
        const s = consumed[i];
        if (s && s.id == s0.id) {
            continue;
        }
        if (s) s.unwatch(watcher);
        s0.watch(watcher);
        consumed[i] = s0;
    }
    return ret;
}

</script>

<template>
    <render />
</template>
