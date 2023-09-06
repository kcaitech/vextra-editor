<script setup lang="ts">
import { ContactForm, ContactShape, ContactType, Matrix, Shape } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderContact as r } from "@kcdesign/data";
import { Context } from '@/context';

const props = defineProps<{ data: Shape, context: Context }>();
const reflush = ref(0);
let path = init_path();
const watcher = () => {
    modify_path();
    reflush.value++;
}
function init_path() {
    const self: ContactShape = props.data as ContactShape;
    const page = props.context.selection.selectedPage;
    let path = props.data.getPath().toString();
    if (!page) return path;
    let selfm: any;
    if (self.from) {
        const fromShape = page.getShape((self.from as ContactForm).shapeId);
        if (fromShape) {
            const p = get_pagexy(fromShape, self.from.contactType, fromShape.matrix2Root());
            if (p) {
                if (!selfm) selfm = new Matrix(self.matrix2Root().inverse);
                const p2 = selfm.computeCoord3(p);
                const idx = path.indexOf('L');
                path = `M ${p2.x} ${p2.y} ` + path.slice(idx);
            }
        }
    }
    if (self.to) {
        const toShape = page.getShape((self.to as ContactForm).shapeId);
        if (toShape) {
            const p = get_pagexy(toShape, self.to.contactType, toShape.matrix2Root());
            if (p) {
                if (!selfm) selfm = new Matrix(self.matrix2Root().inverse);
                const p2 = selfm.computeCoord3(p);
                const idx = path.lastIndexOf('L');
                path = path.slice(0, idx + 2) + ` ${p2.x} ${p2.y}`;
            }
        }
    }
    return path;
}
function modify_path() {
    const self: ContactShape = props.data as ContactShape;
    const page = props.context.selection.selectedPage;
    if (!page) return;
    path = props.data.getPath().toString();
    let selfm: any;
    if (self.from) {
        const fromShape = page.getShape((self.from as ContactForm).shapeId);
        if (fromShape) {
            const p = get_pagexy(fromShape, self.from.contactType, fromShape.matrix2Root());
            if (p) {
                if (!selfm) selfm = new Matrix(self.matrix2Root().inverse);
                const p2 = selfm.computeCoord3(p);
                const idx = path.indexOf('L');
                path = `M ${p2.x} ${p2.y} ` + path.slice(idx);
            }
        }
    }
    if (self.to) {
        const toShape = page.getShape((self.to as ContactForm).shapeId);
        if (toShape) {
            const p = get_pagexy(toShape, self.to.contactType, toShape.matrix2Root());
            if (p) {
                if (!selfm) selfm = new Matrix(self.matrix2Root().inverse);
                const p2 = selfm.computeCoord3(p);
                const idx = path.lastIndexOf('L');
                path = path.slice(0, idx + 2) + ` ${p2.x} ${p2.y}`;
            }
        }
    }
    reflush.value++;
}
function get_pagexy(shape: Shape, type: ContactType, m2r: Matrix) {
    const f = shape.frame;
    switch (type) {
        case ContactType.Top: return m2r.computeCoord2(f.width / 2, 0);
        case ContactType.Right: return m2r.computeCoord2(f.width, f.height / 2);
        case ContactType.Bottom: return m2r.computeCoord2(f.width / 2, f.height);
        case ContactType.Left: return m2r.computeCoord2(0, f.height / 2);
        default: return false
    }
}
const stopWatch = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
})
let stop1: any, stop2: any;
onMounted(() => {
    props.data.watch(watcher);
    const self: ContactShape = props.data as ContactShape;
    const page = props.context.selection.selectedPage;
    if ((!self.from && !self.to) || !page) return;
    const fromShape = page.getShape((self?.from as ContactForm)?.shapeId);
    if (fromShape) {
        stop1 = fromShape.watch(modify_path);
    }
    const toShape = page.getShape((self?.to as ContactForm)?.shapeId);
    if (toShape) {
        stop2 = toShape.watch(modify_path);
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