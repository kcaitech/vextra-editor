<script setup lang="ts">
import { ContactForm, ContactShape, Shape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderContact as r } from "@kcdesign/data";
import { Context } from '@/context';

const props = defineProps<{ data: Shape, context: Context }>();
const reflush = ref(0);
let path = props.data.getPath().toString();
let stop1: any, stop2: any;
let from: undefined | Shape, to: undefined | Shape;
const watcher = () => {
    updateApex()
    path = props.data.getPath().toString();
    reflush.value++;
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
function updateApex() {
    const self: ContactShape = props.data as ContactShape;
    const page = props.context.selection.selectedPage!;
    if (self.from) {
        const nf = page.getShape((self.from as ContactForm).shapeId);
        if (from && nf) {
            if (from.id !== nf.id) {
                from.unwatch(watcher);
                stop1 = nf.watch(watcher);
            }
        }
        if (!from && nf) {
            stop1 = nf.watch(watcher);
        }
        from = nf;
    } else {
        if (from) {
            from.unwatch(watcher);
            stop1 = undefined;
        }
        from = undefined;
    }
    if (self.to) {
        const nt = page.getShape((self.to as ContactForm).shapeId);
        if (to && nt) {
            if (to.id !== nt.id) {
                to.unwatch(watcher);
                stop2 = nt.watch(watcher);
            }
        }
        if (!to && nt) {
            stop2 = nt.watch(watcher);
        }
        to = nt;
    } else {
        if (to) {
            to.unwatch(watcher);
            stop2 = undefined;
        }
        to = undefined;
    }
}
onMounted(() => {
    props.data.watch(watcher);
    updateApex();
    if (from) {
        stop1 = from.watch(watcher);
    }
    if (to) {
        stop2 = to.watch(watcher);
    }
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatch();
    stop1 && stop1();
    stop2 && stop2();
})
function render() {
    return r(h, props.data, path, reflush.value !== 0 ? reflush.value : undefined);
}
</script>

<template>
    <render></render>
</template>