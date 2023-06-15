<script setup lang='ts'>
import { reactive, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import { XY } from '@/context/selection';
import { Shape } from "@kcdesign/data";
import Layers from './Layers.vue';
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { clipboard_write } from '@/utils/clipaboard';
const { t } = useI18n();
interface Props {
  context: Context,
  layers?: Shape[],
  items: string[],
  site?: { x: number, y: number }
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();
const layerSubMenuPosition: XY = reactive({ x: 0, y: 0 });
const layerSubMenuVisiable = ref<boolean>(false);
const isLock = ref<boolean>()
const isVisible = ref<boolean>()
function showLayerSubMenu(e: MouseEvent) {
  const targetWidth = (e.target as Element).getBoundingClientRect().width;
  layerSubMenuPosition.x = targetWidth;
  layerSubMenuPosition.y = -10;
  layerSubMenuVisiable.value = true;
}
function copy() {
  // clipboard_write(props.context.selection.selectedShapes);
  props.context.workspace.clipboard.write_html();
}
function paste() {
  props.context.workspace.notify(WorkSpace.PASTE_RIGHT);
  emit('close');
}
function selectAll() {

}
function half() {

}
function hundred() {

}
function double() {

}
function canvas() {

}
function cursor() {

}
function comment() {

}
function ruler() {

}
function pixel() {

}
function operation() {

}
function forward() {

}
function back() {

}
function top() {

}
function bottom() {

}
function groups() {

}
function container() {

}
function unGroup() {

}
function component() {

}
function instance() {

}
function reset() {

}
function edit() {

}
function visible() {
  const visible = props.context.selection.selectedShapes;
  const editor = computed(() => {
    return props.context.editor4Shape(visible[0]);
  });
  editor.value.toggleVisible();
  isVisible.value = props.context.selection.selectedShapes[0].isVisible
}
function lock() {
  const lock = props.context.selection.selectedShapes;
  const editor = computed(() => {
    return props.context.editor4Shape(lock[0]);
  });
  editor.value.toggleLock();
  isLock.value = props.context.selection.selectedShapes[0].isLocked
}
function closeLayerSubMenu(e: MouseEvent) {
  layerSubMenuVisiable.value = false;
}
</script>
<template>
  <div class="items-wrap">
    <div v-if="props.items.includes('layers')" class="item layer-select"
      @mouseenter="(e: MouseEvent) => showLayerSubMenu(e)" @mouseleave="(e: MouseEvent) => closeLayerSubMenu(e)">
      <span>{{ t('system.select_layer') }}</span>
      <div class="triangle"></div>
      <ContextMenu v-if="layerSubMenuVisiable" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180"
        :site="site" :context="props.context">
        <Layers @close="emit('close')" :layers="props.layers" :context="props.context"></Layers>
      </ContextMenu>
    </div>
    <div class="line" v-if="props.items.includes('layers')"></div>
    <!-- 常用功能 -->
    <div class="item" v-if="props.items.includes('all')" @click="selectAll">
      <span>{{ t('system.select_all') }}</span>
      <span class="shortkey"></span>
    </div>
    <div class="item" v-if="props.items.includes('copy')" @click="copy">
      <span>{{ t('system.copy') }}</span>
      <span class="shortkey">Ctrl + C</span>
    </div>
    <div class="item" v-if="props.items.includes('paste')" @click="paste">
      <span>{{ t('system.paste') }}</span>
      <span class="shortkey">Ctrl + V</span>
    </div>

    <!-- 视图比例 -->
    <div class="line" v-if="props.items.includes('half')"></div>
    <div class="item" v-if="props.items.includes('half')" @click="half"><span>50%</span></div>
    <div class="item" v-if="props.items.includes('hundred')" @click="hundred"><span>100%</span></div>
    <div class="item" v-if="props.items.includes('double')" @click="double"><span>200%</span></div>
    <div class="item" v-if="props.items.includes('canvas')" @click="canvas">
      <span>{{ t('system.fit_canvas') }}</span>
    </div>
    <!-- 协作 -->
    <div class="line" v-if="props.items.includes('cursor')"></div>
    <div class="item" v-if="props.items.includes('cursor')" @click="cursor">
      <div class="choose"></div>
      <span>{{ t('system.show_many_cursor') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('comment')" @click="comment">
      <div class="choose"></div>
      <span>{{ t('system.show_comment') }}</span>
      <span></span>
    </div>
    <!-- 界面显示 -->
    <div class="line" v-if="props.items.includes('ruler')"></div>
    <div class="item" v-if="props.items.includes('ruler')" @click="ruler">
      <div class="choose"></div>
      <span>{{ t('system.show_ruler') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('pixel')" @click="pixel">
      <div class="choose"></div>
      <span>{{ t('system.show_pixel_network') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('operation')" @click="operation">
      <div class="choose"></div>
      <span>{{ t('system.hide_operation_interface') }}</span>
      <span></span>
    </div>
    <!-- 顺序调整 -->
    <div class="line" v-if="props.items.includes('forward')"></div>
    <div class="item" v-if="props.items.includes('forward')" @click="forward">
      <span>{{ t('system.bring_forward') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('back')" @click="back">
      <span>{{ t('system.send_backward') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('top')" @click="top">
      <span>{{ t('system.bring_to_top') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('bottom')" @click="bottom">
      <span>{{ t('system.send_to_bottom') }}</span>
      <span></span>
    </div>
    <!-- 组合容器 -->
    <div class="line" v-if="props.items.includes('groups')"></div>
    <div class="item" v-if="props.items.includes('groups')" @click="groups">
      <span>{{ t('system.creating_groups') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('container')" @click="container">
      <span>{{ t('system.create_container') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('un_group')" @click="unGroup">
      <span>{{ t('system.un_group') }}</span>
      <span></span>
    </div>
    <!-- 组件操作 -->
    <div class="line" v-if="props.items.includes('component')"></div>
    <div class="item" v-if="props.items.includes('component')" @click="component">
      <span>{{ t('system.create_component') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('instance')" @click="instance">
      <span>{{ t('system.unbind_instance') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('reset')" @click="reset">
      <span>{{ t('system.reset_instance_roperties') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('edit')" @click="edit">
      <span>{{ t('system.edit_component') }}</span>
      <span></span>
    </div>
    <!-- 隐藏/锁定 -->
    <div class="line" v-if="props.items.includes('visible')"></div>
    <div class="item" v-if="props.items.includes('visible')" @click="visible">
      <div class="choose" :style="{ visibility: isVisible ? 'visible' : 'hidden' }"></div>
      <span>{{ t('system.visible') }}</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('lock')" @click="lock">
      <div class="choose" :style="{ visibility: isLock ? 'visible' : 'hidden' }"></div>
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
    padding: 0 var(--default-padding) 0 20px;
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

  .choose {
    position: absolute;
    left: 7px;
    box-sizing: border-box;
    width: 10px;
    height: 6px;
    border-width: 0 0 2px 2px;
    border-style: solid;
    border-color: var(--theme-color-anti);
    transform: rotate(-45deg) translateY(-30%);
  }
}
</style>