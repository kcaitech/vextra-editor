<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape } from '@kcdesign/data';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { genRectPath } from '../../common';
const props = defineProps<{
  matrix: number[],
  context: Context,
  shape: Shape
}>();

const matrix = new Matrix();
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const paths = ref<string[]>([]);
function update() {
  paths.value.length = 0;
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
  }, bounds);
  get_dot_path();
}
function get_dot_path() {
  paths.value.length = 0;
  const frame = props.shape.frame;
  const bit_v = 4 / props.context.workspace.matrix.m00;
  // lt
  let lt = { x: 0, y: 0 };
  lt = matrix.computeCoord(lt.x, lt.y)
  let point1_dot = [{ x: lt.x - 4, y: lt.y - 4 }, { x: lt.x + 4, y: lt.y - 4 }, { x: lt.x + 4, y: lt.y + 4 }, { x: lt.x - 4, y: lt.y + 4 }];
  const path1 = get_path_by_dot(point1_dot);
  //rt
  let rt = { x: frame.width, y: 0 };
  rt = matrix.computeCoord(rt.x, rt.y);
  let point2_dot = [{ x: rt.x - 4, y: rt.y - 4 }, { x: rt.x + 4, y: rt.y - 4 }, { x: rt.x + 4, y: rt.y + 4 }, { x: rt.x - 4, y: rt.y + 4 }];
  const path2 = get_path_by_dot(point2_dot);
  //rb
  let rb = { x: frame.width, y: frame.height };
  rb = matrix.computeCoord(rb.x, rb.y);
  let point3_dot = [{ x: rb.x - 4, y: rb.y - 4 }, { x: rb.x + 4, y: rb.y - 4 }, { x: rb.x + 4, y: rb.y + 4 }, { x: rb.x - 4, y: rb.y + 4 }];
  const path3 = get_path_by_dot(point3_dot);
  //lb
  let lb = { x: 0, y: frame.height };
  lb = matrix.computeCoord(lb.x, lb.y)
  let point4_dot = [{ x: lb.x - 4, y: lb.y - 4 }, { x: lb.x + 4, y: lb.y - 4 }, { x: lb.x + 4, y: lb.y + 4 }, { x: lb.x - 4, y: lb.y + 4 }];
  const path4 = get_path_by_dot(point4_dot);

  paths.value.push(path1, path2, path3, path4);
}
function get_path_by_dot(ps: { x: number, y: number }[]): string {
  const [p0, p1, p2, p3] = ps;
  return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} z`;
}
function selectionWatcher(...args: any[]) {
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
  selection.watch(selectionWatcher);
  update();
})

onUnmounted(() => {
  const selection = props.context.selection;
  props.shape.unwatch(update);
  selection.unwatch(selectionWatcher);
})
</script>
<template>
  <g>
    <path :d="paths[0]" fill="#fff" stroke='#2561D9' stroke-width="1px">
    </path>
    <path :d="paths[1]" fill="#fff" stroke='#2561D9' stroke-width="1px">
    </path>
    <path :d="paths[2]" fill="#fff" stroke='#2561D9' stroke-width="1px">
    </path>
    <path :d="paths[3]" fill="#fff" stroke='#2561D9' stroke-width="1px">
    </path>
  </g>
</template>
<style lang='scss' scoped></style>