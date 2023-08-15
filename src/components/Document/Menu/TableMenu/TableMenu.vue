<script setup lang='ts'>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import Key from '@/components/common/Key.vue';
import { XY } from '@/context/selection';
import { Artboard, GroupShape, Shape, ShapeType, TableShape, TextShape } from "@kcdesign/data";
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Selection } from '@/context/selection';
import { Menu } from '@/context/menu';
import CellSetting from './CellSetting.vue';
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
const splitCellOpen = ref(false);
const modalTop = ref(100);
const modalLeft = ref(100);
function showLayerSubMenu(e: MouseEvent) {
  const targetWidth = (e.target as Element).getBoundingClientRect().width;
  layerSubMenuPosition.x = targetWidth;
  layerSubMenuPosition.y = -4;
  layerSubMenuVisiable.value = true;
}

const openSplitCell = (value: string) => {
  splitCellOpen.value = true;
  props.context.menu.setSplitCell(value);
  emit('close');
};
const openInsertCell = (value: string) => {
  splitCellOpen.value = true;
  props.context.menu.setSplitCell(value);
  emit('close');
};

// /**
//  * 关闭图层菜单 
//  */
function closeLayerSubMenu() {
  layerSubMenuVisiable.value = false;
}

</script>
<template>
    <div class="line" v-if="props.items.includes('delete_column') && props.items.includes('only_text')"></div>
    <div v-if="props.items.includes('delete_column')" class="item layer-select"
      @mouseenter="(e: MouseEvent) => showLayerSubMenu(e)" @mouseleave="closeLayerSubMenu">
      <span>删除行列</span>
      <div class="triangle"></div>
      <ContextMenu v-if="layerSubMenuVisiable" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180"
        :site="site" :context="props.context">
        <div class="item" v-if="props.items.includes('split_cell')">
          <span>删除选中行</span>
          <span></span>
        </div>
        <div class="item" v-if="props.items.includes('split_cell')">
          <span>删除选中列</span>
          <span></span>
        </div>
        <div class="item" v-if="props.items.includes('split_cell')">
          <span>删除整个表格</span>
          <span></span>
        </div>
      </ContextMenu>
    </div>
    <div class="item" v-if="props.items.includes('insert_column')" @click="openInsertCell('insert')">
      <span>插入行列</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('merge_cell')">
      <span>合并单元格</span>
      <span></span>
    </div>
    <div class="item" v-if="props.items.includes('split_cell')" @click="openSplitCell('split')">
      <span>拆分单元格</span>
      <span></span>
    </div>
</template>
<style lang='scss' scoped>
  .item {
    position: relative;
    width: 100%;
    height: 28px;
    padding: 0 var(--default-padding) 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;

    >.triangle {
      margin-left: auto;
      width: 0;
      height: 0;
      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;
      border-left: 6px solid var(--theme-color-anti);
      transition: 0.35s;
    }

    >.shortkey {
      margin-left: auto;
    }
  }

  .line {
    width: 100%;
    height: 8px;
    border-bottom: 1px solid gray;
    margin-bottom: 8px;
    box-sizing: border-box;
  }

  .item:hover {
    background-color: var(--active-color);

    >.triangle {
      margin-left: auto;
      width: 0;
      height: 0;
      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;
      border-left: 6px solid var(--theme-color-anti);
      transform: rotate(90deg);
    }
  }

  .invalid {
    position: relative;
    width: 100%;
    height: 28px;
    padding: 0 var(--default-padding) 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    background-color: var(--theme-color);
    color: grey;

    >.shortkey {
      margin-left: auto;
    }
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
    transform: rotate(-45deg) translateY(-4%);
  }

</style>