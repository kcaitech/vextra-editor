<script setup lang="ts">
import { Document } from "@/data/document";
import { defineProps, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{ data: Document; select: Function }>();
const list = ref({ val: new Array<{ name: string; i: number }>() });

const updater = () => {
    const pagesMgr = props.data.pagesMgr;
    const pc = pagesMgr.pageCount;
    const l = [];
    for (let i = 0; i < pc; i++) {
        const id = pagesMgr.getPageIdByIndex(i);
        const name = pagesMgr.getPageNameById(id);
        l.push({ name, i });
    }
    list.value.val = l;
};

onMounted(() => {
    props.data.watch(updater);
    updater();
});

onUnmounted(() => {
    props.data.unwatch(updater);
});

function onClick(idx: number) {
    props.select(idx);
}
</script>

<template>
    <div v-for="item in list.val" v-on:click="onClick(item.i)" :key="item.i">
        {{ item.name }}
    </div>
</template>

<style scoped>
div {
    width: 100px;
    height: 30px;
    line-height: 30px;
    color: var(--theme-font-color-col);
    background-color: var(--theme-color-col);
    font-size: 10px;
    text-align: center;
}
div:hover {
    cursor: default;
    background-color: var(--theme-color-col-hover);
}
div.selected {
    background-color: var(--theme-color-col-hover);
}
</style>
