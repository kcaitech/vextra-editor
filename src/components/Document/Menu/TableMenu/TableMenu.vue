<script setup lang='ts'>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/Document/Menu/ContextMenu.vue';
import { XY, Selection } from '@/context/selection';
import { Shape, ShapeView, TableShape, TableView } from "@kcdesign/data";
import { Context } from '@/context';
import { TableSelection } from '@/context/tableselection';

const { t } = useI18n();
interface Props {
  context: Context,
  layers?: ShapeView[],
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
  const { width, left } = (e.target as Element).getBoundingClientRect();
  const { width: width2, left: left2 } = props.context.workspace.root.element.getBoundingClientRect()
  layerSubMenuPosition.x = (width2 + left2) - (width + left) > width ? width : -width;
  layerSubMenuPosition.y = -4;
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
  <div class="line" v-if="props.items.includes('delete_column') && props.items.includes('only_text')"></div>
  <div v-if="props.items.includes('delete_column')" class="item layer-select"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'delete')" @mouseleave="isDeleteColumn = false">
    <span>{{ t('table.del_column') }}</span>
    <div class="layer-icon">
      <svg-icon :icon-class="isDeleteColumn ? 'white-down' : 'down'"></svg-icon>
    </div>
    <ContextMenu v-if="isDeleteColumn" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="174" :site="site"
      :context="props.context" :style="{ left: layerSubMenuPosition.x + 'px', top: layerSubMenuPosition.y + 'px' }">
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
  <div class="item layer-select" v-if="props.items.includes('split_cell')"
    @mouseenter="(e: MouseEvent) => showLayerSubMenu(e, 'split')" @mouseleave="isSplitCell = false">
    <span>{{ t('table.split_cell') }}</span>
    <div class="layer-icon">
      <svg-icon :icon-class="isSplitCell ? 'white-down' : 'down'"></svg-icon>
    </div>
    <ContextMenu v-if="isSplitCell" :x="layerSubMenuPosition.x" :y="layerSubMenuPosition.y" :width="174" :site="site"
      :context="props.context" :style="{ left: layerSubMenuPosition.x + 'px', top: layerSubMenuPosition.y + 'px' }">
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
  height: 32px;
  padding: 9px 24px 9px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;

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