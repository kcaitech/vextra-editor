<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, reactive } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";

const props = defineProps<{ context: Context, matrix: number[] }>();
interface ShapeSelectArgs {
    width: number,
    height: number,
    x: number,
    y: number,
    radius: number[],
}
const args = reactive<{
    isHover: boolean,
    isSelect: boolean,
    shapes: ShapeSelectArgs[],
}>({
    isHover: false,
    isSelect: false,
    shapes: []
});

const _m = new Matrix();

function updater(t: number) {

}

onMounted(() => {
    props.context.selection.watch(updater);
})

onUnmounted(() => {
    props.context.selection.unwatch(updater);
})

</script>

<template>

</template>

<style scoped>
.circle {
    width: 5px;
    height: 5px;
    background-color: blue;
    border-radius: 5px;
    -webkit-border-radius: 5px;
}

.select-rect {
    background-color: none;
    border-radius: 5px;
    border-style: solid;
    border-color: blue;
    border-width: 2px;
}

.hover-rect {
    background-color: none;
    border-radius: 5px;
    border-style: solid;
    border-color: blue;
    border-width: 2px;
}
</style>