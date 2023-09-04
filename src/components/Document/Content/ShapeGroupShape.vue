<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { Shape, GroupShape, OverridesGetter } from "@kcdesign/data";
import { renderBoolOpShape as opr } from "@kcdesign/data";
import { renderGroup as normalR } from "@kcdesign/data";
import comsMap from './comsmap';

const props = defineProps<{ data: GroupShape, overrides?: OverridesGetter  }>();
const reflush = ref(0);
const consumed: Array<Shape> = [];

const watcher = () => {
    reflush.value++;
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
    const consumed0: Array<Shape> = [];

    const isBoolOpShape = props.data.isBoolOpShape;

    const ret = isBoolOpShape ?
        opr(h, props.data, reflush.value !== 0 ? reflush.value : undefined, consumed0) :
        normalR(h, props.data, comsMap, props.overrides, reflush.value !== 0 ? reflush.value : undefined);

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
