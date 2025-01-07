<script lang="ts" setup>
import { Context } from '@/context';
import BorderCustomInput from './BorderCustomInput.vue';
import {
  AsyncBorderThickness,
  Border,
  BorderSideSetting,
  LinearApi,
  ShapeType,
  ShapeView,
  SideType,
  TableView
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border, get_borders_side } from '@/utils/shape_style';
import { Selection } from '@/context/selection';
import { hidden_selection } from '@/utils/content';
import { useI18n } from 'vue-i18n';
import { can_custom, getSideInfo, get_actions_border_side_info, get_borders_side_thickness } from "./index"
import { Menu } from '@/context/menu';
import { format_value } from "@/utils/common";
import { sortValue } from '../BaseAttr/oval';
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n();

interface Props {
  context: Context
  border: Border
  index: number
  reflush_side: number
}

const props = defineProps<Props>();
const select_side = ref<SideType>();
const shapes = ref<ShapeView[]>();
const thickness_top = ref<number | string>(0);
const thickness_right = ref<number | string>(0);
const thickness_bottom = ref<number | string>(0);
const thickness_left = ref<number | string>(0);
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)

const update_side = () => {
  const selected = props.context.selection.selectedShapes;
  const s = flattenShapes(selected).filter(s => s.type !== ShapeType.Group && can_custom.includes(s.type) && !s.data.haveEdit);
  if (!s.length) return;
  shapes.value = s;
  const action = get_borders_side(s, props.index);
  if (action) {
    select_side.value = action;
  } else {
    select_side.value = undefined;
  }
}


const setSideType = (type: SideType) => {
  if (select_side.value === type || !shapes.value) return;
  select_side.value = type;
  const page = props.context.selection.selectedPage;
  if (!page) return;
  const border = shapes.value[0].style.borders[props.index];
  const data = getSideInfo(border, type)
  if (!data) return;
  const actions = get_actions_border_side_info(shapes.value, props.index, data);
  if (actions && actions.length) {
    const editor = props.context.editor4Page(page);
    editor.setShapesBorderSide(actions);
  }
  hidden_selection(props.context);
  getSideThickness();
}

watch(() => select_side.value, (v, o) => {
  if (v === SideType.Custom || o === SideType.Custom) {
    nextTick(() => {
      props.context.menu.notify(Menu.UPDATE_LOCATE);
    })
  }
})

const setSideThickness = (thickness: number, type: SideType) => {
  if (!shapes.value) return;
  const page = props.context.selection.selectedPage;
  if (!page) return;
  const actions = get_actions_border(shapes.value, props.index, thickness);
  if (actions && actions.length) {
    const editor = props.context.editor4Page(page);
    switch (type) {
      case SideType.Top:
        editor.setShapeBorderThicknessTop(actions);
        break;
      case SideType.Left:
        editor.setShapeBorderThicknessLeft(actions);
        break;
      case SideType.Right:
        editor.setShapeBorderThicknessRight(actions);
        break;
      case SideType.Bottom:
        editor.setShapeBorderThicknessBottom(actions);
        break;
    }
  }
  hidden_selection(props.context);
  getSideThickness();
}

function keydownThickness(e: KeyboardEvent, val: string | number, type: SideType) {
  if (!shapes.value) return;
  if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
    let value: any = sortValue(val.toString());
    value = value + (e.code === 'ArrowUp' ? 1 : -1)
    if (isNaN(value)) return;
    value = value <= 0 ? 0 : value <= 300 ? value : 300
    const actions = get_actions_border(shapes.value, props.index, value);
    if (actions && actions.length) {
      switch (type) {
        case SideType.Top:
          linearApi.modifyBorderThicknessTop(actions)
          break;
        case SideType.Left:
          linearApi.modifyBorderThicknessLeft(actions)
          break;
        case SideType.Right:
          linearApi.modifyBorderThicknessRight(actions)
          break;
        case SideType.Bottom:
          linearApi.modifyBorderThicknessBottom(actions)
          break;
      }
    }
    hidden_selection(props.context);
    getSideThickness();
    e.preventDefault();
  }
}

function selection_wather(t?: any) {

  
  if (t === Selection.CHANGE_SHAPE) {
    update_side();
  }
}

watch(() => props.reflush_side, () => {
  getSideThickness();
})

const getSideThickness = () => {
  if (!shapes.value) return;
  const side = get_borders_side_thickness(shapes.value, props.index)
  thickness_top.value = typeof side[0] === 'number' ? format_value(side[0]) : t('attr.more_value');
  thickness_right.value = typeof side[1] === 'number' ? format_value(side[1]) : t('attr.more_value');
  thickness_bottom.value = typeof side[2] === 'number' ? format_value(side[2]) : t('attr.more_value');
  thickness_left.value = typeof side[3] === 'number' ? format_value(side[3]) : t('attr.more_value');
}
const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let borderthickness_editor: AsyncBorderThickness | undefined = undefined;

function updatePosition(movementX: number, movementY: number) {
  const clientHeight = document.documentElement.clientHeight;
  const clientWidth = document.documentElement.clientWidth;
  telX.value += movementX;
  telY.value += movementY;
  telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
  telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

async function dragStart(e: MouseEvent, type: SideType) {
  tel.value = true;
  telX.value = e.clientX;
  telY.value = e.clientY;
  const el = e.target as HTMLElement;
  if (!document.pointerLockElement) {
    await el.requestPointerLock({
      unadjustedMovement: true
    })
  }
  const selected = props.context.selection.selectedShapes;
  const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
  const page = props.context.selection.selectedPage;
  borderthickness_editor = props.context.editor.controller().asyncBorderSideThickness(shapes, page!, type);
  document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
  if (!document.pointerLockElement) {
    dragEnd();
  }
}

const dragging = (e: MouseEvent, thickness: number | string) => {
  if (typeof thickness === 'string') return;
  updatePosition(e.movementX, e.movementY);
  let val = thickness + e.movementX;
  if (val < 0) {
    val = 0;
  } else if (val > 300) {
    val = 300;
  }
  if (borderthickness_editor) {
    borderthickness_editor.execute(val, props.index);
  }
  getSideThickness();
}

const dragEnd = () => {
  tel.value = false;
  document.exitPointerLock();
  if (borderthickness_editor) {
    borderthickness_editor.close();
    borderthickness_editor = undefined;
  }
  document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

onMounted(() => {
  update_side();
  getSideThickness();
  props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
  props.context.selection.unwatch(selection_wather);
})

import border_all_icon from '@/assets/icons/svg/border-all.svg';
import border_top_icon from '@/assets/icons/svg/border-top.svg';
import border_bottom_icon from '@/assets/icons/svg/border-bottom.svg';
import border_left_icon from '@/assets/icons/svg/border-left.svg';
import border_right_icon from '@/assets/icons/svg/border-right.svg';
import border_custom_icon from '@/assets/icons/svg/border-custom.svg';

</script>

<template>
  <div class="container">
    <div class="border-style">
      <div class="border">{{ t('attr.unilateral') }}</div>
      <div class="border-select">
        <div class="all" :class="{ selected: select_side === SideType.Normal }" @click="setSideType(SideType.Normal)">
          <SvgIcon :icon="border_all_icon"/>
        </div>
        <div class="top" :class="{ selected: select_side === SideType.Top }" @click="setSideType(SideType.Top)">
          <SvgIcon :icon="border_top_icon"/>
        </div>
        <div class="bottom" :class="{ selected: select_side === SideType.Bottom }"
          @click="setSideType(SideType.Bottom)">
          <SvgIcon :icon="border_bottom_icon"/>
        </div>
        <div class="left" :class="{ selected: select_side === SideType.Left }" @click="setSideType(SideType.Left)">
          <SvgIcon :icon="border_left_icon"/>
        </div>
        <div class="right" :class="{ selected: select_side === SideType.Right }" @click="setSideType(SideType.Right)">
          <SvgIcon :icon="border_right_icon"/>
        </div>
        <div class="custom" :class="{ selected: select_side === SideType.Custom }"
          @click="setSideType(SideType.Custom)">
          <SvgIcon :icon="border_custom_icon"/>
        </div>
      </div>
    </div>
    <div class="border-style" style="margin-top: 6px;" v-if="select_side === SideType.Custom">
      <div class="border"></div>
      <div class="border-custom">
        <BorderCustomInput ticon="top" :shadowV="thickness_top" @onChange="(v) => setSideThickness(v, SideType.Top)"
          @dragstart="(e) => dragStart(e, SideType.Top)" @dragging="(e) => dragging(e, thickness_top)"
          @dragend="dragEnd" @keydown="(e, val) => keydownThickness(e, val, SideType.Top)"></BorderCustomInput>
        <BorderCustomInput ticon="bottom" :shadowV="thickness_bottom"
          @onChange="(v) => setSideThickness(v, SideType.Bottom)" @dragstart="(e) => dragStart(e, SideType.Bottom)"
          @dragging="(e) => dragging(e, thickness_bottom)" @dragend="dragEnd"
          @keydown="(e, val) => keydownThickness(e, val, SideType.Bottom)">
        </BorderCustomInput>
      </div>
    </div>
    <div class="border-style" style="margin-top: 6px;" v-if="select_side === SideType.Custom">
      <div class="border"></div>
      <div class="border-custom">
        <BorderCustomInput ticon="left" :shadowV="thickness_left" @onChange="(v) => setSideThickness(v, SideType.Left)"
          @dragstart="(e) => dragStart(e, SideType.Left)" @dragging="(e) => dragging(e, thickness_left)"
          @dragend="dragEnd" @keydown="(e, val) => keydownThickness(e, val, SideType.Left)">
        </BorderCustomInput>
        <BorderCustomInput ticon="right" :shadowV="thickness_right"
          @onChange="(v) => setSideThickness(v, SideType.Right)" @dragstart="(e) => dragStart(e, SideType.Right)"
          @dragging="(e) => dragging(e, thickness_right)" @dragend="dragEnd"
          @keydown="(e, val) => keydownThickness(e, val, SideType.Right)">
        </BorderCustomInput>
      </div>
    </div>
    <teleport to="body">
      <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
      </div>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.border-style {
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .border {
    flex: 0 0 24px;
    box-sizing: border-box;
    width: 24px;
    font-family: HarmonyOS Sans;
    font-size: 12px;
    color: #737373;
    margin-right: 24px;
  }

  .border-select {
    flex: 1;
    height: 32px;
    border-radius: var(--default-radius);
    background-color: #F5F5F5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    box-sizing: border-box;

    >div {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      height: 28px;

      >svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  .border-custom {
    flex: 1;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.selected {
  background-color: #FFFFFF;
}

.point {
  position: absolute;
  width: 24px;
  height: 24px;
  background-image: url("@/assets/cursor/scale.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 32px;
  z-index: 10000;
}
</style>