<script setup lang="ts">
import { Document } from '@/data/document';
import { Page } from '@/data/page';
import { defineProps, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ data: Document, select: Function }>();
const list = ref({ val: new Array<{ name: string, i: number }>() });
const updater = () => {
    const pc = props.data.pageCount;
    const l = [];
    for (let i = 0; i < pc; i++) {
        const page: Page = props.data.peekPageByIndex(i);
        const name = page ? page.name : "";
        l.push({ name, i });
    }
    list.value.val = l;
}

onMounted(() => {
    props.data.watch(updater);
    updater();
})

onUnmounted(() => {
    props.data.unwatch(updater);
})

function onClick(idx: number) {
    props.select(idx);
}

</script>

<template>

    <div>
        <button v-for="item in list.val" v-on:click="onClick(item.i)" :key="item.i">{{ item.name }}</button>
    </div>

</template>

<style scoped>
button {
    width: 100px;
    height: 30px;
}
</style>