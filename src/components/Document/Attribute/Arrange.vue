<script lang="ts" setup>
import {Context} from '@/context';
import {ArtboradView, ShapeType, ShapeView} from '@kcdesign/data';
import {PositonAdjust} from "@kcdesign/data";
import {onMounted, onUnmounted, watch} from 'vue';
import {
  align_left,
  align_cneter_x,
  align_right,
  align_top,
  align_cneter_y,
  align_bottom,
  distribute_horizontally,
  vertical_uniform_distribution,
  is_container
} from '@/utils/arrange';
import {useI18n} from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import {Arrange} from '@/context/arrange';
import {reactive} from 'vue';
import {debounce, throttle} from 'lodash';
import {Selection} from '@/context/selection';
import {string_by_sys} from "@/utils/common";

interface Props {
  context: Context;
  shapes: ShapeView[];
  trigger: any[];
  selectionChange: number;
}

const props = defineProps<Props>();
const {t} = useI18n();
const model_enable = reactive<{ hv: boolean, o: boolean }>({hv: false, o: false});

// 靠左对齐
function flex_start() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_left(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transX !== 0)) {
      editor.arrange(actions);
    }
  }
}

// 水平线对齐
function justify_midle_h() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_cneter_x(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transX !== 0)) {
      editor.arrange(actions);
    }
  }
}

// 靠右对齐
function flex_end() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_right(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transX !== 0)) {
      editor.arrange(actions);
    }
  }
}

// 靠顶部对齐
function flex_start_col() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_top(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transY !== 0)) {
      editor.arrange(actions);
    }
  }
}

// 中线对齐
function justify_midle_v() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_cneter_y(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transY !== 0)) {
      editor.arrange(actions);
    }
  }
}

// 靠底部对齐
function flex_end_col() {
  if (!model_enable.o) {
    return;
  }
  const actions: PositonAdjust[] = align_bottom(props.shapes);
  const page = props.context.selection.selectedPage;
  if (page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transY !== 0)) {
      editor.arrange(actions);
    }
  }
}

function space_around_h() {
  if (!model_enable.hv) {
    return;
  }
  const page = props.context.selection.selectedPage;
  const actions = distribute_horizontally(props.shapes);
  if (actions && page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transX !== 0)) {
      editor.arrange(actions);
    }
  }
}

function space_around_v() {
  if (!model_enable.hv) {
    return;
  }
  const page = props.context.selection.selectedPage;
  const actions = vertical_uniform_distribution(props.shapes);
  if (actions && page) {
    const editor = props.context.editor4Page(page);
    if (actions.find(i => i.transY !== 0)) {
      editor.arrange(actions);
    }
  }
}

function arrange_watcher(t: Number) {
  switch (t) {
    case Arrange.FLEX_START:
      flex_start();
      break;
    case Arrange.SPACE_AROUND_HOR:
      space_around_h();
      break;
    case Arrange.ITEMS_ALIGN:
      justify_midle_h();
      break;
    case Arrange.FLEX_END:
      flex_end();
      break;
    case Arrange.FLEX_START_COL:
      flex_start_col();
      break;
    case Arrange.SPACE_AROUND_VER:
      space_around_v();
      break;
    case Arrange.ITEMS_ALIGN_VER:
      justify_midle_v();
      break;
    case Arrange.FLEX_END_COL:
      flex_end_col();
      break;
    default:
      break;
  }
}

function _modify_model_disable() {
  reset_model();
  const selected = props.context.selection.selectedShapes;

  if (selected.length === 0) {
    return;
  }
  const first = selected[0];
  const first_p = first.parent;

  if (!first_p) {
    return;
  }

  if (selected.length === 1) {
    if (first_p.type !== ShapeType.Page) {
      model_enable.o = true;
    }
    if (is_container(first)) {
      model_enable.o = true;
      model_enable.hv = true;
    }
    if ((first as ArtboradView).autoLayout || (first_p as ArtboradView).autoLayout) {
      reset_model();
    }
    return;
  }
  const some = selected.some(s => (s as ArtboradView).autoLayout || (s.parent as ArtboradView).autoLayout);
  if (some) {
    return reset_model();
  }
  model_enable.o = true;

  if (selected.length > 2) {
    model_enable.hv = true;
  }
}

// const modify_model_disable = debounce(_modify_model_disable, 150, { leading: true });

function reset_model() {
  model_enable.hv = false;
  model_enable.o = false;
}

// function selection_watcher(t: number) {
//     if (t === Selection.CHANGE_SHAPE) {
//         modify_model_disable();
//     }
// }
const update = throttle(_modify_model_disable, 160, {leading: true});

// 这里在下代协作算法出来后可以优化
const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, update); // 监听选区变化

onMounted(() => {
  _modify_model_disable();
  props.context.arrange.watch(arrange_watcher);
  // props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
  stop
  stop2
  props.context.arrange.unwatch(arrange_watcher);
  // props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
  <div class="container">
    <Tooltip :content="`${t('home.align_left')} ${string_by_sys('Alt A')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_start">
        <svg-icon icon-class="flex-start"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.align_h_c')} ${string_by_sys('Alt H')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="justify_midle_h">
        <svg-icon icon-class="justify-midle-h"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.align_right')} ${string_by_sys('Alt D')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_end">
        <svg-icon icon-class="flex-end"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.align_top')} ${string_by_sys('Alt W')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_start_col">
        <svg-icon icon-class="flex-start-col"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.align_v_c')} ${string_by_sys('Alt V')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="justify_midle_v">
        <svg-icon icon-class="justify-midle-v"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.align_bottom')} ${string_by_sys('Alt S')}`" :offset="15">
      <div :class="model_enable.o ? 'item' : 'disable'" @click="flex_end_col">
        <svg-icon icon-class="flex-end-col"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.distribute_h')} ${string_by_sys('Shift Alt H')}`" :offset="15">
      <div :class="model_enable.hv ? 'item' : 'disable'" @click="space_around_h">
        <svg-icon icon-class="space-around-h"></svg-icon>
      </div>
    </Tooltip>
    <Tooltip :content="`${t('home.distribute_v')} ${string_by_sys('Shift Alt V')}`" :offset="15">
      <div :class="model_enable.hv ? 'item' : 'disable'" @click="space_around_v">
        <svg-icon icon-class="space-around-v"></svg-icon>
      </div>
    </Tooltip>
  </div>
</template>
<style scoped lang="scss">
.container {
  display: flex;
  justify-content: space-evenly;
  padding: 6px 8px 6px 8px;
  box-sizing: border-box;
  height: 40px;
  border-bottom: 1px solid #F0F0F0;
}

.item {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  border-radius: var(--default-radius);

  > svg {
    color: var(--theme-color);
    width: 28px;
    height: 28px;
  }
}

.item:hover {
  background-color: rgba(216, 216, 216, 0.4);
}

.disable {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.3;

  > svg {
    width: 28px;
    height: 28px;
  }
}
</style>