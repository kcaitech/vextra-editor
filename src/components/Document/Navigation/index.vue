<script setup lang="ts">
import { defineProps, ref, computed, defineEmits } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
import Sash from "@/components/common/Sash.vue";
const props = defineProps<{ context: Context, width: number, minWidth: number, maxWidth: number }>();
const emit = defineEmits<{
    (e: 'dragWidth', width: number): void;
}>();
const userOffset = ref(0);
// const minWidth = 80;
let curOffset = 0;

function onDragStart() {
    const w = userOffset.value + props.width;
    const wFix =  Math.min(Math.max(w, props.minWidth), props.maxWidth);
    curOffset = wFix - props.width;
}
function onDragOffset(offset: number) {
    // console.log('offset', offset)
    const w = curOffset + props.width + offset;
    const wFix = Math.min(Math.max(w, props.minWidth), props.maxWidth);
    emit("dragWidth", wFix);
    userOffset.value = wFix - props.width;
}

const fixedWidth = computed(() => {
    const w = userOffset.value + props.width;
    return Math.min(Math.max(w, props.minWidth), props.maxWidth);
})
</script>

<template>
    <section :style="`width:${fixedWidth}px; minWidth:${fixedWidth}px`">
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
