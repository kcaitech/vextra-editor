<script setup lang="ts">
import { ContactForm, ContactShape, Shape, ShapeType } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderContact as r, Page } from "@kcdesign/data";
const props = defineProps<{ data: Shape }>();
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
function wathcer_sides(t: any) {
    updateApex();
    path = props.data.getPath().toString();
    reflush.value++;
}
function setParent(shape: Shape) {
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        p.watch(wathcer_sides);
        p = p.parent;
    }
}
function updateApex() {
    const self: ContactShape = props.data as ContactShape;
    const page = props.data.getPage() as Page;
    if (self.from) {
        const nf = page.getShape((self.from as ContactForm).shapeId);
        if (nf) {
            if (from) {
                if (from.id !== nf.id) {
                    from.unwatch(wathcer_sides);
                    stop1 = nf.watch(wathcer_sides);
                }
            } else {
                stop1 = nf.watch(wathcer_sides);
            }
            setParent(nf);
        }
        from = nf;
    } else {
        if (from) {
            from.unwatch(wathcer_sides);
            stop1 = undefined;
        }
        from = undefined;
    }
    if (self.to) {
        const nt = page.getShape((self.to as ContactForm).shapeId);
        if (nt) {
            if (to) {
                if (to.id !== nt.id) {
                    to.unwatch(wathcer_sides);
                    stop2 = nt.watch(wathcer_sides);
                }
            } else {
                stop2 = nt.watch(wathcer_sides);
            }
            setParent(nt);
        }
        to = nt;
    } else {
        if (to) {
            to.unwatch(wathcer_sides);
            stop2 = undefined;
        }
        to = undefined;
    }
}
onMounted(() => {
    props.data.watch(watcher);
    updateApex();
    if (from) {
        stop1 = from.watch(wathcer_sides);
    }
    if (to) {
        stop2 = to.watch(wathcer_sides);
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