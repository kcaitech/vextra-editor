<script setup lang='ts'>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import { XY } from '@/context/selection';
import { Shape, TableShape } from "@kcdesign/data";
import { Context } from '@/context';

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
const isDeleteColumn = ref<boolean>(false);
const isSplitCell = ref<boolean>(false);
const splitCellOpen = ref(false);
function showLayerSubMenu(e: MouseEvent, show: string) {
  e.stopPropagation();
  const targetWidth = (e.target as Element).getBoundingClientRect().width;
  layerSubMenuPosition.x = targetWidth;
  layerSubMenuPosition.y = -4;
  if (show === 'split') {
    isSplitCell.value = true;
  } else {
    isDeleteColumn.value = true;
  }
}

const splitCell = (column: string) => {
  const shape = props.context.selection.selectedShapes[0]
  const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
  if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
    const cell = (Array.from(table.getSelectedCells()))[0]
    const editor = props.context.editor4Table(shape as TableShape)
    if (column === 'row') {
      editor.horSplitCell(cell)
    } else {
      editor.verSplitCell(cell)
    }
  }
  emit('close');
};
const openInsertCell = (value: string) => {
  splitCellOpen.value = true;
  props.context.menu.setSplitCell(value);
  emit('close');
};

const mergeCell = () => {
  const shape = props.context.selection.selectedShapes[0]
  const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
  if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
    const editor = props.context.editor4Table(shape as TableShape)
    editor.mergeCells(table.tableRowStart, table.tableRowEnd, table.tableColStart, table.tableColEnd)
  }
  emit('close');
}
const spliceRow = () => {
  const shape = props.context.selection.selectedShapes[0];
  const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
  if (table.tableColEnd === table.tableColStart && table.tableColStart !== -1) {
    const editor = props.context.editor4Table(shape as TableShape);
    editor.removeRow(table.tableRowStart, table.tableRowStart);
  }
  emit('close');
}

const spliceCol = () => {
  const shape = props.context.selection.selectedShapes[0];
  const table = props.context.selection.getTableSelection(shape as TableShape, props.context);
  if (table.tableColEnd === table.tableColStart && table.tableColStart !== -1) {
    const editor = props.context.editor4Table(shape as TableShape);
    editor.removeCol(table.tableColEnd, table.tableColEnd);
  }
  emit('close');
}

const deleteTable = () => {
  const shape = props.context.selection.selectedShapes[0]
  const editor = props.context.editor4Shape(shape);
  editor.delete();
  props.context.selection.resetSelectShapes();
  emit('close');
}

// /**
//  * 关闭图层菜单 
//  */
function closeLayerSubMenu() {
  isDeleteColumn.value = false;
}

</script>
<template>
  <div class="line" v-if="props.items.includes('delete_column') && props.items.includes('only_text')"></div>
  <div v-if="props.items.includes('delete_column')" class="item layer-select"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'delete')" @mouseleave="isDeleteColumn = false">
    <span>{{ t('table.del_column') }}</span>
    <div class="triangle"></div>
    <ContextMenu v-if="isDeleteColumn" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180" :site="site"
      :context="props.context">
      <div class="item" @click="spliceRow">
        <span>{{ t('table.del_select_row') }}</span>
        <span></span>
      </div>
      <div class="item" @click="spliceCol">
        <span>{{ t('table.del_select_col') }}</span>
        <span></span>
      </div>
      <div class="item" @click="deleteTable">
        <span>{{ t('table.del_table') }}</span>
        <span></span>
      </div>
    </ContextMenu>
  </div>
  <div class="item" v-if="props.items.includes('split_cell')"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'split')" @mouseleave="isSplitCell = false">
    <span>{{ t('table.split_cell') }}</span>
    <div class="triangle"></div>
    <ContextMenu v-if="isSplitCell" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="180" :site="site"
      :context="props.context">
      <div class="item" @click="splitCell('row')">
        <span>{{ t('table.split_towrow') }}</span>
        <span></span>
      </div>
      <div class="item" @click="splitCell('col')">
        <span>{{ t('table.split_towcol') }}</span>
        <span></span>
      </div>
    </ContextMenu>
  </div>
  <div class="item" v-if="props.items.includes('insert_column')" @click="openInsertCell('insert')">
    <span>{{ t('table.insert_column') }}</span>
    <span></span>
  </div>
  <div class="item" v-if="props.items.includes('merge_cell')" @click="mergeCell">
    <span>{{ t('table.merge_cell') }}</span>
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