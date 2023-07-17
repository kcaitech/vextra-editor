<script setup lang='ts'>
import { Context } from '@/context';
import { TextShape } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { genRectPath } from '../../common';
const props = defineProps<{
  shape: TextShape
  matrix: number[]
  context: Context
}>();

const matrix = new Matrix();
const selectPath = ref<string[]>([]);
function update() {
  selectPath.value.length = 0;
  matrix.reset(props.matrix);
  const words = props.context.navi.keywords;
  const len = (props.shape as TextShape).text.length;
  const text = (props.shape as TextShape).text.getText(0, len).replaceAll('\n', '');
  const _b = text.indexOf(words);
  selectPath.value.push(genRectPath(props.shape.text.locateRange(_b, _b + words.length).map((point) => matrix.computeCoord(point.x, point.y))));
}

function selection_watcher(t?: any[]) {
}

watch(() => props.matrix, () => {
  update();
})

watch(() => props.shape, (value, old) => {
  old.unwatch(update);
  value.watch(update);
  update();
})

onMounted(() => {
  const selection = props.context.selection;
  props.shape.watch(update);
  selection.watch(selection_watcher);
  update();
})
onUnmounted(() => {
  const selection = props.context.selection;
  props.shape.unwatch(update);
  selection.unwatch(selection_watcher);
})
</script>
<template>
  <path v-for="(p, i) in selectPath" :key="i" :d="p" fill="orange" fill-opacity="0.5" stroke='none'></path>
</template>
<style lang='scss' scoped></style>