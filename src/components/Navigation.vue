<script setup lang="ts">
import { Document } from "@/data/document";
import { Selection } from "@/edit/selection"
import { defineProps, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{ data: Document, selection: Selection, select: Function }>();
const list = ref({ val: new Array<{ name: string; id: string, selected: boolean }>() });

const updater = () => {
    const pagesMgr = props.data.pagesMgr;
    const pc = pagesMgr.pageCount;
    const l = [];
    for (let i = 0; i < pc; i++) {
        const page = pagesMgr.peekPageByIndex(i);
        const id = pagesMgr.getPageIdByIndex(i);
        const name = pagesMgr.getPageNameById(id);
        const selected = page !== undefined && page === props.selection.selectedPage;
        // console.log(i, selected);
        l.push({ name, id, selected});
    }
    list.value.val = l;
};

const selectionChange = (t: number) => {
    if (t !== Selection.CHANGE_PAGE) {
        return;
    }
    updater();
}

onMounted(() => {
    props.data.watch(updater);
    props.selection.watch(selectionChange);
    updater();
});

onUnmounted(() => {
    props.data.unwatch(updater);
    props.selection.unwatch(selectionChange);
});

function onClick(id: string) {
    props.select(id);
    // const page = props.data.pagesMgr.getPageById(id);
    // props.selection.selectPage(page);
    // updater();
}
</script>

<template>
    <div v-for="item in list.val" v-on:click="onClick(item.id)" :key="item.id" :class="{selected: item.selected}">
        {{ item.name }}
    </div>
</template>

<style scoped>
div {
    width: 100px;
    height: 30px;
    line-height: 30px;
    color: var(--left-navi-font-color);
    background-color: var(--left-navi-bg-color);
    font-size: 10px;
    text-align: center;
}
div:hover {
    cursor: default;
    background-color: var(--left-navi-button-hover-color);
}
div .selected {
    background-color: var(--left-navi-button-hover-color);
}
</style>
