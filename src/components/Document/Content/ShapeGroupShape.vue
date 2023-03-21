<script setup lang="ts">
import { h, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { Shape, GroupShape } from "@kcdesign/data/data/shape";
import { render as r } from "@/render/shapegroup";

const props = defineProps<{ data: GroupShape }>();
const reflush = ref(0);
const consumed: Array<Shape> = [];

const watcher = () => {
    reflush.value++;
}
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    for (let i = 0, len = consumed.length; i < len; i++) {
        consumed[i].unwatch(watcher);
    }
    consumed.length = 0;
})
function render() {
    const consumed0: Array<Shape> = [];
    const ret = r(h, props.data, reflush.value !== 0 ? reflush.value : undefined, consumed0);
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
