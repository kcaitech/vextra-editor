<script lang="ts" setup>
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Loading from '@/components/common/Loading.vue';
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import ResultItem, { ItemData } from "./ResultItem.vue";
import TextResultItem, { TItemData } from "./TextResultItem.vue";

import { Context } from '@/context';
import { Shape, ShapeType, TextShape } from '@kcdesign/data';
import { isInner } from '@/utils/content';
import { is_shape_in_selection, selection_types } from '@/utils/shapelist';
import { debounce } from 'lodash';
interface Props {
  keywords: string
  context: Context
}
class Iter implements IDataIter<ItemData> {
  private __it: Shape[];
  private __index: number;
  constructor(it: Shape[], index: number) {
    this.__it = it;
    this.__index = index;
  }
  hasNext(): boolean {
    return this.__index < this.__it.length;
  }
  next(): ItemData {
    const shape: Shape = this.__it[this.__index];
    this.__index++;
    const item = {
      id: shape.id,
      shape,
      selected: props.context.selection.isSelectedShape(shape),
      context: props.context,
      keywords: props.keywords
    }
    return item;
  }
}
const props = defineProps<Props>();
const { t } = useI18n();
let result_by_shape: Shape[] = [];
let result_by_content: Shape[] = [];
const valid_result_by_shape = ref<boolean>(false);
const valid_result_by_content = ref<boolean>(false);
const loading_by_shape = ref<boolean>(false);
const loading_by_content = ref<boolean>(false);
const show_content = ref<boolean>(false);
const chartMenu = ref<boolean>(false);
const height_shpae = ref<string>('50%');
const height_content = ref<string>('0%');
let chartMenuItems: string[] = [];

let source_by_shape = new class implements IDataSource<ItemData> {

  private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

  length(): number {
    return result_by_shape.length;
  }
  iterAt(index: number): IDataIter<ItemData> {
    return new Iter(result_by_shape, index);
  }
  onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
    this.m_onchange = l;
  }

  notify(index: number, del: number, insert: number, modify: number) {
    this.m_onchange && this.m_onchange(index, del, insert, modify);
  }
}
let source_by_content = new class implements IDataSource<ItemData> {

  private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

  length(): number {
    return result_by_content.length;
  }
  iterAt(index: number): IDataIter<ItemData> {
    return new Iter(result_by_content, index);
  }
  onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
    this.m_onchange = l;
  }

  notify(index: number, del: number, insert: number, modify: number) {
    this.m_onchange && this.m_onchange(index, del, insert, modify);
  }
}
function selectShapeWhenShiftIsPressed(shape: Shape) {
  const to = result_by_shape.findIndex(i => i.id === shape.id);
  const selectedShapes = props.context.selection.selectedShapes;
  if (selectedShapes.length) {
    const selectShapesIndex = getSelectShapesIndex(selectedShapes);
    const from = selectShapesIndex.reduce((pre, cur) => {
      return Math.abs(to - cur) < Math.abs(to - pre) ? cur : pre;
    }, selectShapesIndex[0]);
    const shapes = getShapeRange(from, to);
    props.context.selection.rangeSelectShape(shapes);
  } else {
    props.context.selection.selectShape(shape);
  }
}
function getShapeRange(start: number, end: number): Shape[] {
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  const range: Map<string, Shape> = new Map();
  const it = source_by_shape.iterAt(from);
  for (let i = from; i <= to && it.hasNext(); i++) {
    const shape = it.next().shape;
    const childs = shape.childs;
    if (childs && childs.length) {
      for (let c_i = 0; c_i < childs.length; c_i++) {
        range.delete(childs[c_i].id);
      }
    }
    let need_set = true;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
      if (range.get(p.id)) {
        need_set = false;
        break;
      }
      p = p.parent;
    }
    if (need_set) {
      range.set(shape.id, shape);
    }
  }
  return Array.from(range.values());
}

function getSelectShapesIndex(shapes: Shape[]): number[] {
  return shapes.map(s => result_by_shape.findIndex(i => i.id === s.id));
}
function selectShape(shape: Shape, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
  if (shiftKey) {
    selectShapeWhenShiftIsPressed(shape);
  } else {
    if (ctrlKey || metaKey) {
      const selected_map: Map<string, Shape> = new Map();
      const selected = props.context.selection.selectedShapes;
      for (let i = 0; i < selected.length; i++) {
        if (selected[i].id === shape.id) {
          props.context.selection.unSelectShape(shape); // 元素本身被选中的话就取消选中
          return;
        }
        selected_map.set(selected[i].id, selected[i]);
      }
      let p = shape.parent;
      while (p && p.type !== ShapeType.Page) { // 元素有父级被选中就不需要在选中了
        if (selected_map.get(p.id)) {
          return;
        }
        p = p.parent;
      }
      selected.push(shape);
      selected_map.set(shape.id, shape);
      for (let i = 0; i < selected.length; i++) {
        const s = selected[i];
        let need_remove = false;
        let p = s.parent;
        while (p && p.type !== ShapeType.Page) {
          if (selected_map.get(p.id)) {
            need_remove = true;
            break;
          }
          p = p.parent;
        }
        if (need_remove) selected_map.delete(s.id);
      }
      props.context.selection.rangeSelectShape(Array.from(selected_map.values()));
    } else {
      props.context.selection.selectShape(shape);
    }
  }
}
function hoverShape(shape: Shape) {
  if (props.context.workspace.transforming) return;
  props.context.selection.hoverShape(shape);
}
function unHovershape() {
  props.context.selection.unHoverShape();
}
function shapeScrollToContentView(shape: Shape) {
  if (isInner(props.context, shape)) {
    props.context.selection.selectShape(shape);
    return;
  }
  const workspace = props.context.workspace;
  const { x: sx, y: sy, height, width } = shape.frame2Root();
  const shapeCenter = workspace.matrix.computeCoord(sx + width / 2, sy + height / 2); // 计算shape中心点相对contenview的位置
  const { x, y, bottom, right } = workspace.root;
  const contentViewCenter = { x: (right - x) / 2, y: (bottom - y) / 2 }; // 计算contentview中心点的位置
  const transX = contentViewCenter.x - shapeCenter.x, transY = contentViewCenter.y - shapeCenter.y;
  if (transX || transY) {
    props.context.selection.unHoverShape();
    props.context.selection.selectShape();
    const pageViewEl = props.context.workspace.pageView;
    if (pageViewEl) {
      pageViewEl.classList.add('transition-400');
      props.context.workspace.translating(true);
      workspace.matrix.trans(transX, transY);
      const timer = setTimeout(() => {
        props.context.selection.selectShape(shape);
        pageViewEl.classList.remove('transition-400');
        props.context.workspace.translating(false);
        clearTimeout(timer);
      }, 400);
    } else {
      workspace.matrix.trans(transX, transY);
    }
    workspace.matrixTransformation();
  }

}
function rename(value: string, shape: Shape) {
  const editor = props.context.editor4Shape(shape);
  editor.setName(value)
}
function isLock(lock: boolean, shape: Shape) {
  const editor = props.context.editor4Shape(shape);
  editor.toggleLock();
  source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
}
function selectshape_right(shape: Shape, shiftKey: boolean) {
  const selection = props.context.selection;
  if (is_shape_in_selection(selection.selectedShapes, shape)) return;
  if (shiftKey) {
    selectShapeWhenShiftIsPressed(shape);
  } else {
    selection.selectShape(shape);
  }
}
function list_mousedown(e: MouseEvent, shape: Shape) {
  const menu = props.context.menu;
  menu.menuMount(false);
  chartMenu.value = false;
  if (e.button === 2) {
    e.stopPropagation(); // 右键事件到这就不上去了
    menu.menuMount(false);
    if (e.target instanceof Element && e.target.closest('.__context-menu')) return;
    selectshape_right(shape, e.shiftKey);
    const selected = props.context.selection.selectedShapes;
    chartMenuItems = ['all', 'replace', 'visible', 'lock', 'copy', 'groups', 'container'];
    if (selected.length === 1) {
      chartMenuItems.push('forward', 'back', 'top', 'bottom');
    }
    const types = selection_types(selected);
    if (types & 1) chartMenuItems.push('un_group');
    if (types & 2) chartMenuItems.push('dissolution');
    chartMenuMount(e);
  }
}
function chartMenuMount(e: MouseEvent) {
  e.stopPropagation()
  //  todo
}
function isRead(read: boolean, shape: Shape) {
  let timer: any;
  timer && clearTimeout(timer);
  const editor = props.context.editor4Shape(shape);
  editor.toggleVisible();
  if (!read) {
    props.context.selection.unSelectShape(shape);
    props.context.selection.unHoverShape();
    props.context.workspace.translating(true);
    timer = setTimeout(() => {
      props.context.workspace.translating(false);
      clearTimeout(timer);
      timer = null;
    }, 350)
  }
  source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
}
function _update() {
  loading_by_shape.value = true;
  loading_by_content.value = true;
  show_content.value = false;
  valid_result_by_shape.value = false;
  valid_result_by_content.value = false;
  result_by_shape = [];
  result_by_content = [];
  height_shpae.value = '50%';
  height_content.value = '50%';
  // 找到所有名称包含关键字的图形result_by_shape、找到所有文本内容包含关键字的图形result_by_content
  const reg = new RegExp(`${props.keywords}`, 'img');
  const shapes = props.context.selection.selectedPage?.shapes;
  if (shapes) {
    shapes.forEach((v) => {
      if (v.name.search(reg) > -1) {
        result_by_shape.push(v);
      }
      if (v.type === ShapeType.Text) {
        const length = (v as TextShape).text.length;
        const text = (v as TextShape).text.getText(0, length);
        if (text.search(reg) > -1) {
          result_by_content.push(v);
        }
      }
    })
  }

  if (result_by_shape.length) {
    valid_result_by_shape.value = true;
    if (!result_by_content.length) {
      height_shpae.value = '100%';
    }
  }
  if (result_by_content.length) {
    valid_result_by_content.value = true;
    show_content.value = true;
    if (!result_by_shape.length) {
      height_shpae.value = '10%';
      height_content.value = '90%';
    }
  }
  console.log('---', result_by_content.map(i => i.name).toString());

  source_by_shape.notify(0, 0, 0, Number.MAX_VALUE);
  source_by_content.notify(0, 0, 0, Number.MAX_VALUE);
  loading_by_shape.value = false;
  loading_by_content.value = false;
}
const update = debounce(_update, 300, { leading: true })
function menu_unmount(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    close();
  }
}
function close() {
  document.removeEventListener('keydown', menu_unmount);
  chartMenu.value = false;
}

const stop = watch(() => props.keywords, update, { immediate: true });
onUnmounted(() => {
  stop();
})
</script>
<template>
  <div class="result-wrap">
    <div class="result-by-name" :style="{ height: height_shpae }">
      <Loading v-if="loading_by_shape" :size="20"></Loading>
      <div v-else>
        <ListView v-if="valid_result_by_shape" ref="by_name" :source="source_by_shape" :item-view="ResultItem"
          :item-height="30" :item-width="0" :first-index="0" :context="props.context" @selectshape="selectShape"
          @hovershape="hoverShape" @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename"
          @isRead="isRead" draging="shapeList" @isLock="isLock" @item-mousedown="list_mousedown" orientation="vertical">
        </ListView>
        <div v-else class="null-result">
          {{ t('search.search_results') }}
        </div>
      </div>
    </div>
    <div class="result-by-context" :style="{ height: height_content }">
      <span class="tips">{{ t('system.content_includes') }} <span style="font-weight: 700;">“{{ props.keywords
      }}”</span></span>
      <Loading v-if="loading_by_content" :size="20" :width="2"></Loading>
      <div v-else>
        <ListView v-if="valid_result_by_content" ref="by_name" :source="source_by_content" :item-view="TextResultItem"
          :item-height="30" :item-width="0" :first-index="0" :context="props.context" @selectshape="selectShape"
          @hovershape="hoverShape" @unhovershape="unHovershape" @scrolltoview="shapeScrollToContentView" @rename="rename"
          @isRead="isRead" draging="shapeList" @isLock="isLock" @item-mousedown="list_mousedown" orientation="vertical">
        </ListView>
        <div v-else class="null-result">
          {{ t('search.search_results') }}
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.result-wrap {
  width: 100%;
  height: 100%;

  >.result-by-name {
    height: 60%;
    position: relative;

    >div>.container {
      height: 100%;
    }

    >div>.null-result {
      font-size: var(--font-default-fontsize);
      width: 100%;
      text-align: center;
      margin-top: 16px;
    }
  }

  >.result-by-context {
    height: 40%;
    position: relative;

    >div>.null-result {
      font-size: var(--font-default-fontsize);
      width: 100%;
      text-align: center;
      margin-top: 16px;
    }

    >.tips {
      display: block;
      font-size: var(--font-default-fontsize);
      width: 100%;
      text-align: center;
      padding: 0 16px;
      box-sizing: border-box;
    }
  }
}
</style>