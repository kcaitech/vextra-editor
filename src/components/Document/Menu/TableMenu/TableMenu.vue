<script setup lang='ts'>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { XY, Selection } from '@/context/selection';
import { TableView } from "@kcdesign/data";
import { Context } from '@/context';
import { TableSelection } from '@/context/tableselection';
import { MenuItemType } from "@/components/Document/Menu/index";

const { t } = useI18n();
interface Props {
  context: Context,
  items: Set<MenuItemType>,
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
  const { width, right } = (e.target as Element).getBoundingClientRect();
  const { right: right2 } = props.context.workspace.root;
  layerSubMenuPosition.x = right2 - (right + 4) >= width ? -174 : width;
  layerSubMenuPosition.y = -6;
  if (show === 'split') {
    isSplitCell.value = true;
  } else {
    isDeleteColumn.value = true;
  }
}

const splitCell = (column: string) => {
  const shape = props.context.selection.selectedShapes[0]
  const table = props.context.tableSelection;
  const editor = props.context.editor4Table(shape as TableView)
  if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
    if (column === 'row') {
      editor.horSplitCell(table.tableRowStart, table.tableColStart);
    } else {
      editor.verSplitCell(table.tableRowStart, table.tableColStart);
    }
  } else if (table.editingCell) {
    if (column === 'row') {
      editor.horSplitCell(table.editingCell.index.row, table.editingCell.index.col);
    } else {
      editor.verSplitCell(table.editingCell.index.row, table.editingCell.index.col);
    }
  }
  reset(table, props.context);
  emit('close');
};

function reset(table: TableSelection, context: Context) {
  table.resetSelection();
  table.setEditingCell();
}
const openInsertCell = (value: string) => {
  splitCellOpen.value = true;
  props.context.menu.setSplitCell(value);
  emit('close');
};

const mergeCell = () => {
  const shape = props.context.selection.selectedShapes[0]
  const table = props.context.tableSelection;
  if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
    const editor = props.context.editor4Table(shape as TableView)
    editor.mergeCells(table.tableRowStart, table.tableRowEnd, table.tableColStart, table.tableColEnd)
  }
  reset(table, props.context);
  emit('close');
}
const spliceRow = () => {
  const shape = props.context.selection.selectedShapes[0];
  const table = props.context.tableSelection;
  const editor = props.context.editor4Table(shape as TableView);
  let result: any = 0;
  if (table.editingCell) {
    result = editor.removeRow(table.editingCell.index.row);
  } else {
    result = editor.removeRow(table.tableRowStart, table.tableRowEnd);
  }
  if (result === 1) props.context.selection.resetSelectShapes();
  reset(table, props.context);
  emit('close');
}

const spliceCol = () => {
  const shape = props.context.selection.selectedShapes[0];
  const table = props.context.tableSelection;
  const editor = props.context.editor4Table(shape as TableView);
  let result: any = 0;
  if (table.editingCell) {
    result = editor.removeCol(table.editingCell.index.col);
  } else {
    result = editor.removeCol(table.tableColStart, table.tableColEnd);
  }
  if (result === 1) props.context.selection.resetSelectShapes();
  reset(table, props.context);
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
  <div class="line" v-if="items.has(MenuItemType.DeleteCol) && items.has(MenuItemType.OnlyText)"></div>
    <!-- 删除行列 -->
  <div v-if="items.has(MenuItemType.DeleteCol)" class="item layer-select"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'delete')" @mouseleave="isDeleteColumn = false">
    <span>{{ t('table.del_column') }}</span>
    <div class="layer-icon">
      <svg-icon :icon-class="isDeleteColumn ? 'white-down' : 'down'"></svg-icon>
    </div>
    <div class="context_menu" v-if="isDeleteColumn"
      :style="{ top: layerSubMenuPosition.y + 'px', right: layerSubMenuPosition.x + 'px' }">
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
    </div>
  </div>
  <!-- 拆分单元格 -->
  <div class="item layer-select" v-if="items.has(MenuItemType.SplitCell)"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'split')" @mouseleave="isSplitCell = false">
    <span>{{ t('table.split_cell') }}</span>
    <div class="layer-icon">
      <svg-icon :icon-class="isSplitCell ? 'white-down' : 'down'"></svg-icon>
    </div>
    <div class="context_menu" v-if="isSplitCell"
      :style="{ top: layerSubMenuPosition.y + 'px', right: layerSubMenuPosition.x + 'px' }">
      <div class="item" @click="splitCell('row')">
        <span>{{ t('table.split_towrow') }}</span>
        <span></span>
      </div>
      <div class="item" @click="splitCell('col')">
        <span>{{ t('table.split_towcol') }}</span>
        <span></span>
      </div>
    </div>
  </div>
  <div class="item" v-if="items.has(MenuItemType.InsertCol)" @click="openInsertCell('insert')">
    <span>{{ t('table.insert_column') }}</span>
    <span></span>
  </div>
  <div class="item" v-if="items.has(MenuItemType.MergeCell)" @click="mergeCell">
    <span>{{ t('table.merge_cell') }}</span>
    <span></span>
  </div>
</template>
<style lang='scss' scoped>
.item {
  position: relative;
  width: 100%;
  height: 32px;
  padding: 9px 24px 9px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  font-size: var(--font-default-fontsize);

  >span {
    margin-left: 20px;
  }

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
  height: 4px;
  border-bottom: 1px solid #EBEBEB;
  box-sizing: border-box;
}

.item:hover {
  background-color: var(--active-color);
  color: white;

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

.layer-icon {
  svg {
    width: 12px;
    height: 12px;
  }

  transform: rotate(270deg);
}

.layer-select {
  display: flex;
  justify-content: space-between;
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

.context_menu {
  position: absolute;
  z-index: 99;
  color: #262626;
  width: 174px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
  background-color: #FFFFFF;
  border: 1px solid #EBEBEB;
  padding: 6px 0;

  cursor: auto !important;
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