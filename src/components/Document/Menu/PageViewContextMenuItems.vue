<script setup lang='ts'>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ContextMenu from '@/components/common/ContextMenu.vue';
import Key from '@/components/common/Key.vue';
import { XY } from '@/context/selection';
import { Artboard, GroupShape, Shape, ShapeType, TextShape } from "@kcdesign/data";
import Layers from './Layers.vue';
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Selection } from '@/context/selection';
import { adapt_page, getName } from '@/utils/content';
import { message } from '@/utils/message';
import { paster, paster_inner_shape, replace, identity, paras } from '@/utils/clipboard';
import { sort_by_layer } from '@/utils/group_ungroup';
import { Menu } from '@/context/menu';
import TableMenu from "./TableMenu/TableMenu.vue"
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
const isComment = ref<boolean>(props.context.comment.isVisibleComment);
const isTitle = ref<boolean>(props.context.tool.isShowTitle);
const isCursor = ref<boolean>(props.context.menu.isUserCursorVisible);
const invalid_items = ref<string[]>([]);
function showLayerSubMenu(e: MouseEvent) {
  const targetWidth = (e.target as Element).getBoundingClientRect().width;
  layerSubMenuPosition.x = targetWidth;
  layerSubMenuPosition.y = -10;
  layerSubMenuVisiable.value = true;
}
function is_inner_textshape() {
  const selected = props.context.selection.selectedShapes;
  const isEditing = props.context.workspace.isEditing;
  return (selected.length === 1 && selected[0].type === ShapeType.Text && isEditing);
}
function copy() {
  if (is_inner_textshape()) {
    const shape = props.context.selection.selectedShapes[0] as TextShape;
    const selection = props.context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const s = Math.min(start, end);
    const len = Math.abs(start - end);
    if (s === end) return emit('close');
    const text = shape.text.getTextWithFormat(s, len);
    props.context.workspace.clipboard.write_html(text);
  } else {
    props.context.workspace.clipboard.write_html();
  }
  emit('close');
}
async function cut() {
  if (is_inner_textshape()) {
    const shape = props.context.selection.selectedShapes[0] as TextShape;
    const selection = props.context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    if (start === end) return emit('close');
    // const shape = selection.selectedShapes[0];
    const text = shape.text.getTextWithFormat(Math.min(start, end), Math.abs(start - end));
    const copy_result = await props.context.workspace.clipboard.write_html(text);
    if (copy_result) {
      const editor = props.context.editor4TextShape(shape as TextShape);
      if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
        selection.setCursor(Math.min(start, end), false);
      }
    }
  }
  emit('close');
}
function paste() {
  if (invalid_items.value.includes('paste')) return;
  if (is_inner_textshape()) {
    const shape = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4TextShape(shape as TextShape);
    paster_inner_shape(props.context, editor);
  } else {
    paster(props.context, t);
  }
  emit('close');
}
function paste_text() {
  if (invalid_items.value.includes('paste-text')) return;
  if (is_inner_textshape()) {
    const shape = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4TextShape(shape as TextShape);
    paster_inner_shape(props.context, editor, true);
  }
  emit('close');
}
function paste_here() {
  if (invalid_items.value.includes('paste-here')) return;
  props.context.workspace.notify(WorkSpace.PASTE_RIGHT);
  emit('close');
}
function _replace() {
  if (invalid_items.value.includes('replace')) return;
  const selection = props.context.selection;
  const selected = selection.selectedShapes;
  if (selected.length) {
    replace(props.context, t, selected);
  }
  emit('close');
}
function selectAll() {
  if (is_inner_textshape()) {
    const selection = props.context.selection;
    const end = selection.selectedShapes[0].text.length;
    selection.selectText(0, end);
  } else {
    props.context.workspace.keydown_a(true, true);
  }
  emit('close');
}
/**
 * 50%视图
 */
function half(e: MouseEvent) {
  e.preventDefault();
  page_scale(e, 0.5);
  emit('close');
}
/**
 * 全比例视图
 */
function hundred(e: MouseEvent) {
  e.preventDefault();
  page_scale(e, 1);
  emit('close');
}
/**
 * 两倍视图
 */
function double(e: MouseEvent) {
  e.preventDefault();
  page_scale(e, 2);
  emit('close');
}
/**
 * 页面缩放
 * @param scale 缩放倍数 > 0
 */
function page_scale(e: MouseEvent, scale: number) {
  const workspace = props.context.workspace;
  const root = workspace.root;
  const matrix = workspace.matrix;
  const offsetX = e.x - root.x;
  const offsetY = e.y - root.y;
  matrix.trans(-offsetX, -offsetY);
  matrix.scale(scale / matrix.m00);
  matrix.trans(offsetX, offsetY);
  workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}
/**
 * 使整个page在可视区域
 */
function canvas() {
  adapt_page(props.context);
  emit('close');
}
function cursor() { 
  const status = props.context.menu.isUserCursorVisible;
  isCursor.value = !status;
  props.context.menu.setVisibleCursor(isCursor.value);
  emit('close');
}
function comment() {
  const status = props.context.comment.isVisibleComment;
  isComment.value = !status;
  props.context.comment.setVisibleComment(isComment.value);
  emit('close');
}
function ruler() { }
function pixel() { }
function operation() {
  props.context.workspace.notify(WorkSpace.HIDDEN_UI);
  emit('close');
}
/**
 * 上移一层
 */
function forward() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const result = editor.uppper_layer(selection.selectedShapes[0], 1);
    if (!result) {
      message('info', props.context.workspace.t('homerightmenu.unable_upper'));
    } else {
      emit('close');
    }
  }

}
/**
 * 下移一层
 */
function back() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const result = editor.lower_layer(selection.selectedShapes[0], 1);
    if (!result) {
      message('info', props.context.workspace.t('homerightmenu.unable_lower'));
    } else {
      emit('close');
    }
  }
}
/**
 * 置于顶层
 */
function top() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const result = editor.uppper_layer(selection.selectedShapes[0]);
    if (!result) {
      message('info', props.context.workspace.t('homerightmenu.unable_upper'));
    } else {
      emit('close');
    }
  }
}
/**
 * 置于底层
 */
function bottom() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const result = editor.lower_layer(selection.selectedShapes[0]);
    if (!result) {
      message('info', props.context.workspace.t('homerightmenu.unable_lower'));
    } else {
      emit('close');
    }
  }
}
/**
 * 创建编组
 */
function groups() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const shapes = sort_by_layer(props.context, selection.selectedShapes);
    const group = editor.group(shapes, getName(ShapeType.Group, page.childs, t));
    if (group) {
      selection.selectShape(group);
      selection.notify(Selection.EXTEND, group);
    }
  }
  emit('close');
}
/**
 * 创建容器
 */
function container() {
  const selection = props.context.selection;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const shapes = sort_by_layer(props.context, selection.selectedShapes);
    const artboard = editor.create_artboard(shapes, getName(ShapeType.Artboard, page.childs, t));
    if (artboard) {
      selection.selectShape(artboard);
      selection.notify(Selection.EXTEND, artboard);
    }
  }
  emit('close');
}
/**
 * 解除容器
 */
function dissolution_container() {
  const selection = props.context.selection;
  if (selection.selectedShapes[0].type !== ShapeType.Artboard) return;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const shapes = editor.dissolution_artboard(selection.selectedShapes[0] as Artboard);
    if (shapes) {
      selection.rangeSelectShape(shapes);
    }
  }
  emit('close');
}
/**
 * 解除编组
 */
function unGroup() {
  const selection = props.context.selection;
  if (selection.selectedShapes[0].type !== ShapeType.Group) return;
  const page = selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    const shapes = editor.ungroup(selection.selectedShapes[0] as GroupShape);
    if (shapes) {
      selection.rangeSelectShape(shapes);
    }
  }
  emit('close');
}
function component() {

}
function instance() {

}
function reset() {

}
function edit() {

}
/**
 * 隐藏图层
 */
function visible() {
  const shapes = props.context.selection.selectedShapes;
  const page = props.context.selection.selectedPage;
  if (!page) return emit('close');
  const editor = props.context.editor4Page(page);
  editor.toggleShapesVisible(shapes);
  props.context.selection.resetSelectShapes();
  emit('close');
}
/**
 * 解锁
 */
function lock() {
  const shapes = props.context.selection.selectedShapes;
  const page = props.context.selection.selectedPage;
  if (!page) return emit('close');
  const editor = props.context.editor4Page(page);
  editor.toggleShapesLock(shapes);
  props.context.selection.resetSelectShapes();
  emit('close');
}
/**
 * 关闭图层菜单 
 */
function closeLayerSubMenu() {
  layerSubMenuVisiable.value = false;
}
function show_placement(val: boolean) {
  if (invalid_items.value.includes('paste-here')) return;
  props.context.menu.notify(val ? Menu.SHOW_PLACEMENT : Menu.HIDE_PLACEMENT);
}
function toggle_title() {
  props.context.tool.setTitleVisibale(!props.context.tool.isShowTitle);
  emit('close');
}
function menu_watcher() {
  // check();
}
const stop = watch(() => props.items, menu_watcher, { deep: true, immediate: true })
onUnmounted(() => {
  stop();
})
</script>
<template>
  <div class="items-wrap">
    <div v-if="props.items.includes('layers')" class="item layer-select"
      @mouseenter="(e: MouseEvent) => showLayerSubMenu(e)" @mouseleave="closeLayerSubMenu">
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
      <span class="shortkey">
        <Key code="Ctrl A"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('copy')" @click="copy">
      <span>{{ t('system.copy') }}</span>
      <span class="shortkey">
        <Key code="Ctrl C"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('cut')" @click="cut">
      <span>{{ t('system.cut') }}</span>
      <span class="shortkey">
        <Key code="Ctrl X"></Key>
      </span>
    </div>
    <div :class="invalid_items.includes('paste') ? 'invalid' : 'item'" v-if="props.items.includes('paste')"
      @click="paste">
      <span>{{ t('system.paste') }}</span>
      <span class="shortkey">
        <Key code="Ctrl V"></Key>
      </span>
    </div>
    <div :class="invalid_items.includes('only_text') ? 'invalid' : 'item'" v-if="props.items.includes('only_text')"
      @click="paste_text">
      <span>{{ t('system.only_text') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Alt V"></Key>
      </span>
    </div>
    <div :class="invalid_items.includes('paste-here') ? 'invalid' : 'item'" v-if="props.items.includes('paste-here')"
      @click="paste_here" @mouseenter="() => { show_placement(true) }" @mouseleave="() => { show_placement(false) }">
      <span>{{ t('system.paste_here') }}</span>
    </div>
    <div :class="invalid_items.includes('replace') ? 'invalid' : 'item'" v-if="props.items.includes('replace')"
      @click="_replace">
      <span>{{ t('system.replace') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Shift R"></Key>
      </span>
    </div>

    <!-- 视图比例 -->
    <div class="line" v-if="props.items.includes('half')"></div>
    <div class="item" v-if="props.items.includes('half')" @click="(e: MouseEvent) => half(e)">
      <span>50%</span>
    </div>
    <div class="item" v-if="props.items.includes('hundred')" @click="(e: MouseEvent) => hundred(e)">
      <span>100%</span>
      <span class="shortkey">
        <Key code="Ctrl 0"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('double')" @click="(e: MouseEvent) => double(e)">
      <span>200%</span>
    </div>
    <div class="item" v-if="props.items.includes('canvas')" @click="canvas">
      <span>{{ t('system.fit_canvas') }}</span>
      <span class="shortkey">
        <Key code="Ctrl 1"></Key>
      </span>
    </div>
    <!-- 协作 -->
    <div class="line" v-if="props.items.includes('cursor')"></div>
    <div class="item" v-if="props.items.includes('cursor')" @click="cursor">
      <div class="choose" v-show="isCursor"></div>
      <span>{{ t('system.show_many_cursor') }}</span>
    </div>
    <div class="item" v-if="props.items.includes('comment')" @click="comment">
      <div class="choose" v-show="isComment"></div>
      <span>{{ t('system.show_comment') }}</span>
      <span class="shortkey">
        <Key code="Shift C"></Key>
      </span>
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
      <span>{{ t('system.hide_operation_interface') }}</span>
      <span class="shortkey">
        <Key code="Ctrl(Shift) \"></Key>
      </span>
    </div>
    <!-- 顺序调整 -->
    <div class="line" v-if="props.items.includes('forward')"></div>
    <div class="item" v-if="props.items.includes('forward')" @click="forward">
      <span>{{ t('system.bring_forward') }}</span>
      <span class="shortkey">
        <Key code="+"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('back')" @click="back">
      <span>{{ t('system.send_backward') }}</span>
      <span class="shortkey">- </span>
    </div>
    <div class="item" v-if="props.items.includes('top')" @click="top">
      <span>{{ t('system.bring_to_top') }}</span>
      <span class="shortkey">]</span>
    </div>
    <div class="item" v-if="props.items.includes('bottom')" @click="bottom">
      <span>{{ t('system.send_to_bottom') }}</span>
      <span class="shortkey">[</span>
    </div>
    <!-- 组合容器 -->
    <div class="line" v-if="props.items.includes('groups')"></div>
    <div class="item" v-if="props.items.includes('groups')" @click="groups">
      <span>{{ t('system.creating_groups') }}</span>
      <span class="shortkey">
        <Key code="Ctrl G"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('container')" @click="container">
      <span>{{ t('system.create_container') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Alt G"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('un_group')" @click="unGroup">
      <span>{{ t('system.un_group') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Shift G"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('dissolution')" @click="dissolution_container">
      <span>{{ t('system.dissolution') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Shift G"></Key>
      </span>
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
      <span>{{ t('system.visible') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Shift H"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('lock')" @click="lock">
      <span>{{ t('system.Lock') }}</span>
      <span class="shortkey">
        <Key code="Ctrl Shift L"></Key>
      </span>
    </div>
    <div class="item" v-if="props.items.includes('title')" @click="toggle_title">
      <div class="choose" v-show="isTitle"></div>
      <span>{{ t('system.artboart_title_visible') }}</span>
    </div>
    <TableMenu :context="context" :layers="layers" :items="items" :site="site" @close="emit('close')"></TableMenu>
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
}
</style>