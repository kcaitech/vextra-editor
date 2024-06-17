<script setup lang='ts'>
import { onMounted, onUnmounted, ref, reactive, watch } from 'vue';
import { Matrix, TextShape, Shape, ShapeView, TextShapeView } from '@kcdesign/data';
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import SelectView from './Controller/Text/SelectBySearch.vue';
import { Navi } from '@/context/navigate';

interface Props {
  context: Context,
  params: {
    matrix: Matrix
  }
}
const props = defineProps<Props>();
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const focus_shape = ref<ShapeView>();
const visible = ref<boolean>(true);
function update() {
  const shape = props.context.navi.focusText?.shape;
  if (shape) {
    shape.watch(update);
  } else {
    focus_shape.value && focus_shape.value.unwatch(update);
  }
  focus_shape.value = shape;
  if (!shape) return;
  const m2p = shape.matrix2Root();
  matrix.reset(m2p);
  matrix.multiAtLeft(props.params.matrix);
  if (!submatrix.equals(matrix)) {
    submatrix.reset(matrix);
  }
  const frame = shape.frame;
  const points = [
    { x: 0, y: 0 }, // left top
    { x: frame.width, y: 0 }, //right top
    { x: frame.width, y: frame.height }, // right bottom
    { x: 0, y: frame.height }, // left bottom
  ];
  const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
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
}

function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
  return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top)
}
function workspace_watcher(t?: number) {
  if (t === WorkSpace.TRANSLATING) {
    if (props.context.workspace.isTranslating) {
      visible.value = false;
    } else {
      visible.value = true;
    }
  }
}
function navi_watcher(t?: number) {
  if (t === Navi.TEXT_SELECTION_CHANGE) update();
}
watch(() => props.params.matrix, update, { deep: true })
onMounted(() => {
  props.context.workspace.watch(workspace_watcher);
  props.context.navi.watch(navi_watcher);
  update();
})
onUnmounted(() => {
  props.context.workspace.unwatch(workspace_watcher);
  props.context.navi.unwatch(navi_watcher);
})
</script>

<template>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
    id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
    :viewBox=genViewBox(bounds) :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
    :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
    overflow="visible" :class="{ 'un-visible': !visible }">
    <SelectView v-if="focus_shape" :context="props.context" :shape="(focus_shape as TextShapeView)"
      :matrix="submatrix.toArray()"></SelectView>
  </svg>
</template>

<style lang='scss' scoped>
.un-visible {
  opacity: 0;
}
</style>