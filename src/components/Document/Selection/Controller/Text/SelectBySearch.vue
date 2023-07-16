<script setup lang='ts'>
import { Context } from '@/context';
import { TextShape } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { genRectPath } from '../../common';
const props = defineProps<{
  shape: TextShape
  matrix: number[]
  context: Context
}>();

const matrix = new Matrix();
const selectPath = ref("");
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox

function update() {
  const selection = props.context.selection;
  matrix.reset(props.matrix);
  const frame = props.shape.frame;
  const points = [
    { x: 0, y: 0 }, // left top
    { x: frame.width, y: 0 }, //right top
    { x: frame.width, y: frame.height }, // right bottom
    { x: 0, y: frame.height }, // left bottom
  ];

  const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
  boundrectPath.value = genRectPath(boundrect);

  const p0 = boundrect[0];
  bounds.left = p0.x;
  bounds.top = p0.y;
  bounds.right = p0.x;
  bounds.bottom = p0.y;
  boundrect.reduce((bounds, point) => {
    if (point.x < bounds.left) bounds.left = point.x;
    else if (point.x > bounds.right) bounds.right = point.x;
    if (point.y < bounds.top) bounds.top = point.y;
    else if (point.y > bounds.bottom) bounds.bottom = point.y;
    return bounds;
  }, bounds)
  const start = selection.cursorStart;
  const end = selection.cursorEnd;
  selectPath.value = genRectPath(props.shape.text.locateRange(start, end).map((point) => matrix.computeCoord(point.x, point.y)));
}

function selection_watcher(...args: any[]) {
  if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
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
  <path :d="selectPath" fill="#865dff" fill-opacity="0.35" stroke='none'></path>
</template>
<style lang='scss' scoped></style>