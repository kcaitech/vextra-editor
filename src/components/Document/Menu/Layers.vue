<script setup lang='ts'>
import { Shape } from "@kcdesign/data";
import { computed } from 'vue';
import { Context } from '@/context'
interface Props {
  context: Context,
  layers?: Shape[],
}
const emit = defineEmits<{
  (e: 'close'): void
}>();
const selectedShapes = computed(() => props.context.selection.selectedShapes);
const props = defineProps<Props>();
function select(shape: Shape) {
  props.context.selection.selectShape(shape);
  emit('close');
}
function mouseenter(shape: Shape) {
  props.context.selection.hoverShape(shape);
}
function mouseout() {
  props.context.selection.unHoverShape();
}
</script>
<template>
  <div class="items-wrap">
    <div class="item" v-for="shape in props.layers" :key="shape.id" @click="select(shape)"
      @mouseenter="() => mouseenter(shape)" @mouseleave="() => mouseout">
      <div>
        <div class="check" v-if="selectedShapes.find(i => i.id === shape.id)"></div>
      </div>
      <span>{{ shape.name }}</span>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.items-wrap {
  width: 100%;
  font-size: var(--font-default-fontsize);

  .item {
    height: 28px;
    width: 100%;
    background-color: var(--theme-color);
    color: var(--theme-color-anti);
    box-sizing: border-box;
    padding: 0 var(--default-padding);
    display: flex;
    align-items: center;

    >div {
      width: 10px;

      >.check {
        box-sizing: border-box;
        width: 10px;
        height: 6px;
        border-width: 0 0 2px 2px;
        border-style: solid;
        border-color: var(--theme-color-anti);
        left: 6px;
        transform: rotate(-45deg) translateY(-20%);
      }
    }

    >span {
      margin-left: var(--default-margin-half);
      display: inline-block;
      overflow: hidden;
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .item:hover {
    background-color: var(--active-color);
  }
}
</style>