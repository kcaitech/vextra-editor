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
  items: string[]
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
function copy() {
  const copyObj = props.context.selection.selectedShapes;
  props.context.workspace.setClipBoard(copyObj);
}
function paste() {

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
      <ContextMenu v-if="layerSubMenuVisiable" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180">
        <Layers @close="emit('close')" :layers="props.layers" :context="props.context"></Layers>
      </ContextMenu>
    </div>
    <div class="line" v-if="props.items.includes('layers')"></div>
    <div class="item" v-if="props.items.includes('paste')" @click="paste">
      <span>{{ t('system.paste') }}</span>
      <span class="shortkey">Ctrl + V</span>
    </div>
    <div class="item" v-if="props.items.includes('copy')" @click="copy">
      <span>{{ t('system.copy') }}</span>
      <span class="shortkey">Ctrl + C</span>
    </div>
    <div class="line" v-if="props.items.includes('forward')"></div>
    <div class="item" v-if="props.items.includes('forward')">
      <span>{{ t('system.bring_forward') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('back')">
      <span>{{ t('system.send_backward') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('top')">
      <span>{{ t('system.bring_to_top') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('bottom')">
      <span>{{ t('system.send_to_bottom') }}</span>
      <span></span>
    </div>
    <div class="line" v-if="props.items.includes('visible')"></div>
    <div class="item" v-if="props.items.includes('visible')">
      <span>{{ t('system.visible') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('visible')">
      <span>{{ t('system.Lock') }}</span>
      <span></span>
    </div>
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
    >.shortkey {
      margin-left: auto;
    }
  }

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