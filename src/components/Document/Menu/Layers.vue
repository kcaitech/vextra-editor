<script setup lang='ts'>
import { Shape, ShapeView } from "@kcdesign/data";
import { computed, ref } from 'vue';
import { Context } from '@/context'
interface Props {
  context: Context,
  layers?: ShapeView[],
}
const emit = defineEmits<{
  (e: 'close'): void
}>();
const selectedShapes = computed(() => props.context.selection.selectedShapes);
const props = defineProps<Props>();
const hoverItem = ref('');
function select(shape: ShapeView) {
  console.log(shape, 'shape');
  
  props.context.selection.selectShape(shape);
  emit('close');
}
function mouseenter(shape: ShapeView) {
  props.context.selection.hoverShape(shape);
  hoverItem.value = shape.id;
}
function mouseout() {
  props.context.selection.unHoverShape();
  hoverItem.value = '';
}
</script>
<template>
  <div class="items-wrap">
    <div class="item" v-for="shape in props.layers" :key="shape.id" @click.stop="select(shape)"
      @mouseenter="() => mouseenter(shape)" @mouseleave="mouseout">
      <div>
          <svg-icon :icon-class="hoverItem === shape.id ? 'white-select' : 'page-select'" v-if="selectedShapes.find(i => i.id === shape.id)"></svg-icon>
      </div>
      <span :style="{ marginLeft: selectedShapes ? '8px' : '20px'}">{{ shape.name }}</span>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.items-wrap {
  width: 100%;
  font-size: var(--font-default-fontsize);

  .item {
    height: 32px;
    width: 100%;
    color: #262626;
    box-sizing: border-box;
    padding: 9px 0 9px 8px;
    display: flex;
    align-items: center;

    >div {
      width: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      >svg {
        width: 12px;
        height: 12px;
      }
    }

    >span {
      //margin-left: var(--default-margin-half);
      display: inline-block;
      overflow: hidden;
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .item:hover {
    background-color: var(--active-color);
    color: #FFFFFF;
  }
}
</style>