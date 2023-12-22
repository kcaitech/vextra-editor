<script setup lang="ts">
import { ContactForm, ContactShape, Shape, ShapeType } from '@kcdesign/data';
import { h, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderContact as r, Page } from "@kcdesign/data";

interface Props {
    data: Shape;
}

const props = defineProps<Props>();
const reflush = ref(1);

let path = props.data
    .getPath()
    .toString();

let stop1: any;
let stop2: any;

let from: undefined | Shape;
let to: undefined | Shape;

let page: Page | undefined = undefined;

const watcher = () => {
    updateApex();

    path = props.data
        .getPath()
        .toString();

    reflush.value++;
}
const stopWatch = watch(
    () => props.data,

    (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
    }
);
function wathcer_sides() {
    updateApex();

    path = props.data
        .getPath()
        .toString();

    reflush.value++;
}
function setParent(shape: Shape) {
    let p = shape.parent;

    while (p && p.type !== ShapeType.Page) {
        p.watch(wathcer_sides);
        p = p.parent;
    }
}

function get_page() {
    if (!page) {
        page = props.data.getPage() as Page;
    }

    return page;
}

function remove_from_watch() {
    if (from) {
        from.unwatch(wathcer_sides);
        stop1 = undefined;
    }
    from = undefined;
}

function remove_to_watch() {
    if (to) {
        to.unwatch(wathcer_sides);
        stop2 = undefined;
    }
    to = undefined;
}

function modify_from(f: ContactForm | undefined) {
    if (!f) {
        remove_from_watch();
        return;
    }

    const page = get_page();

    const nf = page.getShape(f.shapeId);

    if (!nf) {
        remove_from_watch();
        return;
    }

    if (from) {
        if (from.id !== nf.id) {
            from.unwatch(wathcer_sides);
            stop1 = nf.watch(wathcer_sides);
        }
    } else {
        stop1 = nf.watch(wathcer_sides);
    }

    setParent(nf);

    from = nf;
}

function modify_to(t: ContactForm | undefined) {
    if (!t) {
        remove_to_watch();
        return;
    }

    const page = get_page();

    const nt = page.getShape(t.shapeId);

    if (!nt) {
        remove_to_watch();
        return;
    }

    if (to) {
        if (to.id !== nt.id) {
            to.unwatch(wathcer_sides);
            stop2 = nt.watch(wathcer_sides);
        }
    } else {
        stop2 = nt.watch(wathcer_sides);
    }

    setParent(nt);

    to = nt;
}

function updateApex() {
    const self = props.data as ContactShape;

    modify_from(self.from);

    modify_to(self.to);
}

function render() {
    return r(h, props.data, path, reflush.value);
}

onMounted(() => {
    props.data.watch(watcher);

    updateApex();
})
onUnmounted(() => {
    props.data.unwatch(watcher);

    stopWatch();

    stop1 && stop1();
    stop2 && stop2();
})
</script>

<template>
    <render></render>
</template>