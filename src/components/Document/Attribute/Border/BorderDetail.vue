<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderPositonItem from './BorderPositionItem.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue'
import { Context } from '@/context';
import { Border, BorderPosition, BorderStyle, MarkerType, Shape, ShapeType } from "@kcdesign/data";
import { genOptions } from '@/utils/common';
import { Selection } from '@/context/selection';
import { get_actions_border_thickness, get_actions_border_position, get_actions_border_style } from '@/utils/shape_style';
import { WorkSpace } from '@/context/workspace';
interface Props {
  context: Context
  shapes: Shape[]
  border: Border
  index: number
}
const props = defineProps<Props>();
const { t } = useI18n();
const editor = computed(() => {
  return props.context.editor4Shape(props.shapes[0]);
});
const len = computed(() => props.shapes.length);
const popover = ref();
const isDrag = ref(false)
const curpt: { x: number } = { x: 0 }
const _curpt: { x: number } = { x: 0 }
const scale = ref<{ axleX: number }>({
  axleX: 0
})
const showStartStyle = ref<boolean>(true)
const showEndStyle = ref<boolean>(true)
const borderThickness = ref<HTMLInputElement>();
const borderStyle = ref<SelectItem>({ value: 'dash', content: t('attr.dash') });
const borderStyleOptionsSource: SelectSource[] = genOptions([
  ['solid', t('attr.solid')],
  ['dash', t('attr.dash')]
]);
const position = ref<SelectItem>({ value: 0, content: t('attr.center') });
const positonOptionsSource: SelectSource[] = genOptions([
  [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
  [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
  [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);

const borderFrontStyle = ref<SelectItem>({ value: MarkerType.Line, content: MarkerType.Line });
const borderFrontStyleOptionsSource: SelectSource[] = genOptions([
  [MarkerType.Line, MarkerType.Line],
  [MarkerType.OpenArrow, MarkerType.OpenArrow],
  [MarkerType.FilledArrow, MarkerType.FilledArrow],
  [MarkerType.OpenCircle, MarkerType.OpenCircle],
  [MarkerType.FilledCircle, MarkerType.FilledCircle],
  [MarkerType.OpenSquare, MarkerType.OpenSquare],
  [MarkerType.FilledSquare, MarkerType.FilledSquare],
  [MarkerType.FallT, MarkerType.FallT],
]);

const borderEndStyle = ref<SelectItem>({ value: MarkerType.Line, content: `end-${MarkerType.Line}` });
const borderEndStyleOptionsSource: SelectSource[] = genOptions([
  [MarkerType.Line, `end-${MarkerType.Line}`],
  [MarkerType.OpenArrow, `end-${MarkerType.OpenArrow}`],
  [MarkerType.FilledArrow, `end-${MarkerType.FilledArrow}`],
  [MarkerType.OpenCircle, `end-${MarkerType.OpenCircle}`],
  [MarkerType.FilledCircle, `end-${MarkerType.FilledCircle}`],
  [MarkerType.OpenSquare, `end-${MarkerType.OpenSquare}`],
  [MarkerType.FilledSquare, `end-${MarkerType.FilledSquare}`],
  [MarkerType.FallT, `end-${MarkerType.FallT}`],
]);

function showMenu() {
  updater();
  popover.value.show();
}
function updater() {
  // border position init
  const positionSelected = positonOptionsSource.find(i => i.data.value === props.border.position)?.data;
  positionSelected && (position.value = positionSelected);

  // border style init
  const bs = ((s: BorderStyle) => s.length > 0 ? 'dash' : 'solid')(props.border.borderStyle);
  const borderStyleSelected = borderStyleOptionsSource.find(i => i.data.value === bs)?.data;
  borderStyleSelected && (borderStyle.value = borderStyleSelected);

  // border front apex init
  const borderFrontApex = borderFrontStyleOptionsSource.find(i => i.data.value === props.border.startMarkerType)?.data;
  borderFrontApex && (borderFrontStyle.value = borderFrontApex);

  // border end apex init
  const borderEndApex = borderEndStyleOptionsSource.find(i => i.data.value === props.border.endMarkerType)?.data;
  borderEndApex && (borderEndStyle.value = borderEndApex);
}
function borderStyleSelect(selected: SelectItem) {
  props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
  borderStyle.value = selected;
  if (len.value === 1) {
    const bs = selected.value === 'dash' ? new BorderStyle(10, 10) : new BorderStyle(0, 0);
    editor.value.setBorderStyle(props.index, bs);
  } else if (len.value > 1) {
    const actions = get_actions_border_style(props.shapes, props.index, (selected.value as 'dash' | 'solid'));
    if (actions && actions.length) {
      const page = props.context.selection.selectedPage;
      if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderStyle(actions);
      }
    }
  }
  popover.value.focus();
  props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function positionSelect(selected: SelectItem) {
  props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
  position.value = selected;
  if (len.value === 1) {
    editor.value.setBorderPosition(props.index, selected.value as BorderPosition);
  } else if (len.value > 1) {
    const actions = get_actions_border_position(props.shapes, props.index, selected.value as BorderPosition);
    if (actions && actions.length) {
      const page = props.context.selection.selectedPage;
      if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderPosition(actions);
      }
    }
  }
  popover.value.focus();
  props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function setThickness(e: Event) {
  props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
  const thickness = Number((e.target as HTMLInputElement).value);
  if (len.value === 1) {
    editor.value.setBorderThickness(props.index, thickness);
  } else if (len.value > 1) {
    const actions = get_actions_border_thickness(props.shapes, props.index, thickness);
    if (actions && actions.length) {
      const page = props.context.selection.selectedPage;
      if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderThickness(actions);
      }
    }
  }
  props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function borderApexStyleSelect(selected: SelectItem) {
  props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
  if (selected.content.startsWith('end')) {
    borderEndStyle.value = selected;
    editor.value.setBorderApexStyle(props.index, selected.value as MarkerType, true);
  } else {
    borderFrontStyle.value = selected;
    editor.value.setBorderApexStyle(props.index, selected.value as MarkerType, false);
  }
  popover.value.focus();
  props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
watch(() => props.border, () => {
  updater();
}, { deep: true })

const onMouseDown = (e: MouseEvent) => {
  e.stopPropagation()
  isDrag.value = true
  //鼠标按下时的位置
  curpt.x = e.screenX
  _curpt.x = e.screenX
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
const i = ref(0)
const onMouseMove = (e: MouseEvent) => {
  let mx = e.screenX - curpt.x
  scale.value.axleX = e.screenX - _curpt.x
  if (scale.value.axleX > 0 || Number(borderThickness.value!.value) !== 0) {
    curpt.x = e.screenX
    i.value = i.value + 1
    if (i.value >= 3 && isDrag.value) {
      i.value = 0
      if (mx > 0) {
        if (borderThickness.value) {
          const thickness = Number(borderThickness.value.value) + 1
          editor.value.setBorderThickness(props.index, thickness);
          borderThickness.value.value = String(Number(borderThickness.value.value) + 1)
        }
      } else if (mx < 0) {
        if (borderThickness.value) {
          let thickness = Number(borderThickness.value.value) - 1
          if (thickness <= 0) {
            thickness = 0
            _curpt.x = e.screenX
          }
          editor.value.setBorderThickness(props.index, thickness);
          if (Number(borderThickness.value.value) > 0) {
            borderThickness.value.value = String(Number(borderThickness.value.value) - 1)
          }
        }
      }
    }
  }
}
const onMouseUp = (e: MouseEvent) => {
  e.stopPropagation()
  isDrag.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
function layout() {
  if (len.value === 1) {
    const shape = props.shapes[0];
    if (shape.type === ShapeType.Line) {
      showStartStyle.value = true;
      showEndStyle.value = true;
    } else {
      showStartStyle.value = false;
      showEndStyle.value = false;
    }
  } else if (len.value > 1) {
    const _idx = props.shapes.findIndex(i => i.type === ShapeType.Line);
    if (_idx > -1) {
      showStartStyle.value = true;
      showEndStyle.value = true;
    } else {
      showStartStyle.value = false;
      showEndStyle.value = false;
    }
  }
}
function selection_wather(t?: any) {
  if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
    layout();
  }
}
const selectBorderThicknes = () => {
  borderThickness.value?.select()
}
onMounted(() => {
  props.context.selection.watch(selection_wather);
  layout();
})
onUnmounted(() => {
  props.context.selection.unwatch(selection_wather);
})
</script>

<template>
  <div class="border-detail-container">
    <Popover :context="props.context" class="popover" ref="popover" :width="240" height="auto" :left="-455"
      :title="t('attr.advanced_stroke')">
      <template #trigger>
        <div class="trigger">
          <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
        </div>
      </template>
      <template #body>
        <div class="options-container">
          <!-- 边框位置 -->
          <div>
            <label>{{ t('attr.position') }}</label>
            <Select :selected="position" :item-view="BorderPositonItem" :item-height="32" :source="positonOptionsSource"
              @select="positionSelect"></Select>
          </div>
          <!-- 边框厚度 -->
          <div>
            <label>{{ t('attr.thickness') }}</label>
            <div class="thickness-container">
              <svg-icon icon-class="thickness" @mousedown="onMouseDown"></svg-icon>
              <input ref="borderThickness" type="text" :value="border.thickness" @change="e => setThickness(e)" @focus="selectBorderThicknes">
            </div>
          </div>
          <!-- 边框样式 -->
          <div>
            <label>{{ t('attr.borderStyle') }}</label>
            <Select :selected="borderStyle" :item-view="BorderStyleItem" :value-view="BorderStyleSelected"
              :item-height="32" @select="borderStyleSelect" :source="borderStyleOptionsSource"></Select>
          </div>
          <!-- 起点样式 -->
          <div v-if="showStartStyle">
            <label>{{ t('attr.startMarkerType') }}</label>
            <Select :selected="borderFrontStyle" :item-view="BorderApexStyleItem"
              :value-view="BorderApexStyleSelectedItem" :item-height="32" :source="borderFrontStyleOptionsSource"
              @select="borderApexStyleSelect"></Select>
          </div>
          <!-- 终点样式 -->
          <div v-if="showEndStyle">
            <label>{{ t('attr.endMarkerType') }}</label>
            <Select :selected="borderEndStyle" :item-view="BorderApexStyleItem" :value-view="BorderApexStyleSelectedItem"
              :item-height="32" :source="borderEndStyleOptionsSource" @select="borderApexStyleSelect"></Select>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.border-detail-container {
  >.popover {
    width: 18px;
    height: 22px;

    .trigger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      >svg {
        width: 11px;
        height: 11px;
        transition: 0.5s;
      }

      >svg:hover {
        transform: rotate(90deg);
      }
    }

    .options-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--default-padding);
      box-sizing: border-box;
      height: 100%;

      >div {
        display: flex;
        align-items: center;
        margin: 4px 0;

        >label {
          flex: 0 0 72px;
          text-align: left;
          box-sizing: border-box;
          font-weight: var(--font-default-bold);
        }

        >.thickness-container {
          box-sizing: border-box;
          padding: 0 var(--default-padding);
          background-color: var(--input-background);
          width: calc(100% - 72px);
          height: 32px;
          border-radius: var(--default-radius);
          display: flex;
          align-items: center;

          >svg {
            cursor: ew-resize;
            flex: 0 0 24px;
            height: 24px;
          }

          >input {
            outline: none;
            border: none;
            width: calc(100% - 24px);
            margin-left: var(--default-margin-half);
            background-color: transparent;
          }
        }
      }
    }
  }
}
</style>