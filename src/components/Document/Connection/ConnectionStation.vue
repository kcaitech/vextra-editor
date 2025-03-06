<script setup lang="ts">
import { Context } from "@/context";
import { ContactShape } from "@kcdesign/data";
import { ref } from "vue";
import { v4 } from "uuid";

const props = defineProps<{ context: Context }>();
const lines = props.context.selection.selectedPage!.connections as unknown as ContactShape[];

const mocks = ref<{ data: string, id: string, color: string }[]>([]);

function getMocks() {
    for (let i = 0; i < 3; i++) {
        mocks.value.push({ id: v4(), color: 'red', data: '' });
    }
    mocks.value[0].data = 'M0 10 h50';
    mocks.value[0].color = 'blue';
    mocks.value[1].data = 'M0 0 l50 50';
    mocks.value[1].color = 'yellow';
    mocks.value[2].data = 'M0 50 h 60'
}

getMocks();

function change() {
    const v = Math.round(Math.random() * 100);
    mocks.value[2].data = 'M0 50 h ' + v;
}

document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.altKey) change();
});
</script>

<template>
    <svg class="connection-container" viewBox="0 0 100 100" width="100" height="100">
        <path v-for="p in mocks" :key="p.id" :d="p.data" :stroke="p.color"/>
    </svg>
</template>

<style scoped lang="scss">
.connection-container {
    pointer-events: none;
    overflow: visible;
    background-color: #1E1E1E;
}
</style>