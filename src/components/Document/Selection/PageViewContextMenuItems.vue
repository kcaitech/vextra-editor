<script setup lang='ts'>
import { defineProps, reactive, ref, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import { AbsolutePosition } from '@/context/selection';
import { Shape } from "@kcdesign/data/data/shape";
import Layers from './Layers.vue';
import { Context } from '@/context';
const { t } = useI18n();
interface Props {
  context: Context,
  layers?: Shape[],
  items: string[],
  site:{ x: number, y: number }
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();
const layerSubMenuPosition: AbsolutePosition = reactive({ x: 0, y: 0 });
const layerSubMenuVisiable = ref<boolean>(false);

function showLayerSubMenu(e: MouseEvent) {
  const targetWidth = (e.target as Element).getBoundingClientRect().width;
  layerSubMenuPosition.x = targetWidth;
  layerSubMenuPosition.y = -10;
  layerSubMenuVisiable.value = true;

}
function closeLayerSubMenu(e: MouseEvent) {
  layerSubMenuVisiable.value = false;
}
</script>
<template>
  <div class="items-wrap">
    <div v-if="props.items.includes('layers')" class="item layer-select" @mouseenter="e => showLayerSubMenu(e)"
      @mouseleave="e => closeLayerSubMenu(e)">
      <span>{{ t('system.select_layer') }}</span>
      <div class="triangle"></div>
      <ContextMenu v-if="layerSubMenuVisiable" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180" :site="site">
        <Layers @close="emit('close')" :layers="props.layers" :context="props.context"></Layers>
      </ContextMenu>
    </div>
    <div class="line" v-if="props.items.includes('layers')"></div>
    <div class="item" v-if="props.items.includes('paste')">
      <span>{{ t('system.paste') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('copy')">{{ t('system.copy') }}</div>
  </div>
</template>
<style lang='scss' scoped>
.items-wrap {
  width: 100%;
  font-size: var(--font-default-fontsize);

  .item {
    position: relative;
    width: 100%;
    height: 28px;
    padding: 0 var(--default-padding);
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    background-color: var(--theme-color);

    >.triangle {
      margin-left: auto;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 10px solid var(--theme-color-anti);
    }
  }

  // .layer-select {

  // }

  .line {
    width: 100%;
    height: 17px;
    border-width: 8px 0 8px 0;
    border-style: solid;
    border-color: var(--theme-color);
    box-sizing: border-box;
    background-color: grey;
  }

  .item:hover {
    background-color: var(--active-color);
  }
}
</style>