<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
interface Props {
  matrix: number[]
  context: Context
  shape: Shape
}
const props = defineProps<Props>();
const matrix = new Matrix();
const paths = ref<string[]>([]);
function update() {
  matrix.reset(props.matrix);
  update_dot_path();
}
function update_dot_path() {
  paths.value.length = 0;
  const frame = props.shape.frame;
  // const bit_v = 4 / props.context.workspace.matrix.m00;
  const bit_v = 4;
  // lt
  let lt = { x: 0, y: 0 };
  lt = matrix.computeCoord(lt.x, lt.y)
  let point1_dot = [{ x: lt.x - bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y - bit_v }, { x: lt.x + bit_v, y: lt.y + bit_v }, { x: lt.x - bit_v, y: lt.y + bit_v }];
  const path1 = get_path_by_dot(point1_dot);
  //rt
  let rt = { x: frame.width, y: 0 };
  rt = matrix.computeCoord(rt.x, rt.y);
  let point2_dot = [{ x: rt.x - bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y - bit_v }, { x: rt.x + bit_v, y: rt.y + bit_v }, { x: rt.x - bit_v, y: rt.y + bit_v }];
  const path2 = get_path_by_dot(point2_dot);
  //rb
  let rb = { x: frame.width, y: frame.height };
  rb = matrix.computeCoord(rb.x, rb.y);
  let point3_dot = [{ x: rb.x - bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y - bit_v }, { x: rb.x + bit_v, y: rb.y + bit_v }, { x: rb.x - bit_v, y: rb.y + bit_v }];
  const path3 = get_path_by_dot(point3_dot);
  //lb
  let lb = { x: 0, y: frame.height };
  lb = matrix.computeCoord(lb.x, lb.y)
  let point4_dot = [{ x: lb.x - bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y - bit_v }, { x: lb.x + bit_v, y: lb.y + bit_v }, { x: lb.x - bit_v, y: lb.y + bit_v }];
  const path4 = get_path_by_dot(point4_dot);

  paths.value.push(path1, path2, path3, path4);
}
function get_path_by_dot(ps: { x: number, y: number }[]): string {
  const [p0, p1, p2, p3] = ps;
  return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} z`;
}
function selection_watcher(t?: number) {
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
  props.shape.watch(update);
  props.context.selection.watch(selection_watcher);
  update();
})
onUnmounted(() => {
  props.shape.unwatch(update);
  props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
  <g>
    <path :d="paths[0]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
    </path>
    <path :d="paths[1]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
    </path>
    <path :d="paths[2]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
    </path>
    <path :d="paths[3]" fill="#ffffff" stroke='#865dff' stroke-width="1.5px">
    </path>
  </g>
</template>
<style lang='scss' scoped></style>