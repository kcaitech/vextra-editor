/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import { Text, Shape, TextShape, TableCell, ShapeView, TextShapeView, TableCellView } from '@kcdesign/data';
import { Matrix } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { genRectPath } from '../../common';
const props = defineProps<{
  shape: TextShapeView | TableCellView,
  matrix: number[]
  context: Context
}>();
// function getText(shape: ShapeView & { text: Text }): Text {
//     if (shape.isVirtualShape) return shape.text;
//     return (shape as TextShapeView | TableCellView).getText();
// }
const matrix = new Matrix();
const selectPath = ref<string[]>([]);
function update() {
  selectPath.value.length = 0;
  matrix.reset(props.matrix);
  const slice = props.context.navi.focusText?.slice;
  if (!slice) return;
  for (let i = 0; i < slice.length; i++) {
    const s = slice[i];
    selectPath.value.push(genRectPath(props.shape.locateRange(s[0], s[1]).map((point) => matrix.computeCoord(point.x, point.y))));
  }
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