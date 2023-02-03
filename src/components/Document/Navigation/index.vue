<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue"
import Sash from "@/components/common/sash.vue"
const props = defineProps<{ context: Context }>();
const width = ref(100);
let saveWidth = 0;

function onDragStart() {
    saveWidth = width.value;
}
function onDragOffset(offset: number) {
    // console.log('offset', offset)
    width.value = saveWidth + offset;
}
</script>

<template>
    <section :style="`width: ${width}px;`">
        <PageList class="page-navi" :context="props.context" v-bind="$attrs"></PageList>
        <div class="line" />
        <ShapeList class="shape-navi" :context="props.context"></ShapeList>
        <Sash side="right" @dragStart="onDragStart" @offset="onDragOffset" />
    </section>
</template>

<style scoped>
section {
    position: relative;
}
.page-navi {
    flex: 0 0 auto;
    max-height: 50%;
}

.shape-navi {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
}

div.line {
    width: 100%;
    height: 1px;
    background-color: var(--theme-color-line);
    flex: 0 0 auto;
}
</style>
