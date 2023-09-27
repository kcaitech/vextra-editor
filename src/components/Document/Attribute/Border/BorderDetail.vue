<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderPositonItem from './BorderPositionItem.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import { Context } from '@/context';
import { Border, BorderPosition, BorderStyle, Shape, ShapeType, TableShape } from "@kcdesign/data";
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
const show_position = ref<boolean>(true);
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
}
function borderStyleSelect(selected: SelectItem) {
  props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
  borderStyle.value = selected;
  if (len.value === 1) {
    const bs = selected.value === 'dash' ? new BorderStyle(10, 10) : new BorderStyle(0, 0);
    const shape = props.shapes[0] as TableShape;
    if (shape.type === ShapeType.Table) {
      const table = props.context.tableSelection;
      const e = props.context.editor4Table(shape);
      const is_edting = table.editingCell;
      if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
        let range
        if (is_edting) {
          range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
        } else {
          range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
        }
        e.setBorderStyle(props.index, bs, range)
      } else {
        editor.value.setBorderStyle(props.index, bs);
      }
    } else {
      editor.value.setBorderStyle(props.index, bs);
    }
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
    if (props.shapes[0].type === ShapeType.Table) return;
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
    const shape = props.shapes[0] as TableShape;
    if (shape.type === ShapeType.Table) {
      const table = props.context.tableSelection;
      const e = props.context.editor4Table(shape);
      const is_edting = table.editingCell;
      if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
        let range
        if (is_edting) {
          range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
        } else {
          range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
        }
        e.setBorderThickness(props.index, thickness, range)
      } else {
        editor.value.setBorderThickness(props.index, thickness);
      }
    } else {
      editor.value.setBorderThickness(props.index, thickness);
    }
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

const augment = (e: Event) => {
  if (borderThickness.value) {
    const thickness = Number(borderThickness.value.value) + 1
    if (len.value === 1) {
      const shape = props.shapes[0] as TableShape;
      if (shape.type === ShapeType.Table) {
        const table = props.context.tableSelection;
        const e = props.context.editor4Table(shape);
        const is_edting = table.editingCell;
        if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
          let range
          if (is_edting) {
            range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
          } else {
            range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
          }
          e.setBorderThickness(props.index, thickness, range)
        } else {
          editor.value.setBorderThickness(props.index, thickness);
        }
      } else {
        editor.value.setBorderThickness(props.index, thickness);
      }
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
    borderThickness.value.value = String(Number(borderThickness.value.value) + 1)
  }
}
const decrease = (e: Event) => {
  if (borderThickness.value) {
    if (Number(borderThickness.value.value) === 0) return
    const thickness = Number(borderThickness.value.value) - 1;
    if (len.value === 1) {
      const shape = props.shapes[0] as TableShape;
      if (shape.type === ShapeType.Table) {
        const table = props.context.tableSelection;
        const e = props.context.editor4Table(shape);
        const is_edting = table.editingCell;
        if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
          let range
          if (is_edting) {
            range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
          } else {
            range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
          }
          e.setBorderThickness(props.index, thickness, range)
        } else {
          editor.value.setBorderThickness(props.index, thickness);
        }
      } else {
        editor.value.setBorderThickness(props.index, thickness);
      }
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
    borderThickness.value.value = String(Number(borderThickness.value.value) - 1)
  }
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
          if (len.value === 1) {
            const shape = props.shapes[0] as TableShape;
            if (shape.type === ShapeType.Table) {
              const table = props.context.tableSelection;
              const e = props.context.editor4Table(shape);
              const is_edting = table.editingCell;
              if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                  range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
                } else {
                  range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
                }
                e.setBorderThickness(props.index, thickness, range)
              } else {
                editor.value.setBorderThickness(props.index, thickness);
              }
            } else {
              editor.value.setBorderThickness(props.index, thickness);
            }
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
          borderThickness.value.value = String(Number(borderThickness.value.value) + 1)
        }
      } else if (mx < 0) {
        if (borderThickness.value) {
          let thickness = Number(borderThickness.value.value) - 1
          if (thickness <= 0) {
            thickness = 0
            _curpt.x = e.screenX
          }
          if (len.value === 1) {
            const shape = props.shapes[0] as TableShape;
            if (shape.type === ShapeType.Table) {
              const table = props.context.tableSelection;
              const e = props.context.editor4Table(shape);
              const is_edting = table.editingCell;
              if (table.tableRowStart > -1 || table.tableColStart > -1 || is_edting) {
                let range
                if (is_edting) {
                  range = { rowStart: is_edting.index.row, rowEnd: is_edting.index.row, colStart: is_edting.index.col, colEnd: is_edting.index.col };
                } else {
                  range = { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd };
                }
                e.setBorderThickness(props.index, thickness, range)
              } else {
                editor.value.setBorderThickness(props.index, thickness);
              }
            } else {
              editor.value.setBorderThickness(props.index, thickness);
            }
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
  showStartStyle.value = false;
  showEndStyle.value = false;
  show_position.value = true;
  if (props.shapes.length === 1) {
    const shape = props.shapes[0];
    if (shape.type === ShapeType.Line) {
      show_position.value = false;
      if (props.index === 0) {
        showStartStyle.value = true;
        showEndStyle.value = true;
      }
    }
  } else if (props.shapes.length > 1) {
    const _idx = props.shapes.findIndex(i => i.type === ShapeType.Line);
    if (_idx > -1 && props.index === 0) {
      showStartStyle.value = true;
      showEndStyle.value = true;
    }
  }
}
function selection_wather(t?: any) {
  if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) layout();
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
  <div class="border-detail-container" @mousedown.stop>
    <Popover :context="props.context" class="popover" ref="popover" :width="240" height="auto" :left="445"
      :title="t('attr.advanced_stroke')">
      <template #trigger>
        <div class="trigger">
          <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
        </div>
      </template>
      <template #body>
        <div class="options-container">
          <!-- 边框位置 -->
          <div v-if="show_position" :style="{ opacity: shapes[0].type === ShapeType.Table ? '.5' : '1' }">
            <label>{{ t('attr.position') }}</label>
            <Select :selected="position" :item-view="BorderPositonItem" :item-height="30" :source="positonOptionsSource"
              @select="positionSelect" :type="shapes[0].type === ShapeType.Table ? 'table' : 'none'"></Select>
          </div>
          <!-- 边框厚度 -->
          <div>
            <label>{{ t('attr.thickness') }}</label>
            <div class="thickness-container">
              <svg-icon icon-class="thickness" @mousedown="onMouseDown"></svg-icon>
              <input ref="borderThickness" type="text" :value="border.thickness" @change="e => setThickness(e)"
                @focus="selectBorderThicknes">
              <div class="up_down">
                <svg-icon icon-class="down" style="transform: rotate(180deg);" @click="augment"></svg-icon>
                <svg-icon icon-class="down" @click="decrease"></svg-icon>
              </div>
            </div>
          </div>
          <!-- 边框样式 -->
          <div>
            <label>{{ t('attr.borderStyle') }}</label>
            <Select :selected="borderStyle" :item-view="BorderStyleItem" :value-view="BorderStyleSelected"
              :item-height="30" @select="borderStyleSelect" :source="borderStyleOptionsSource"></Select>
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
          padding: 0 14px;
          background-color: var(--input-background);
          width: calc(100% - 72px);
          height: var(--default-input-height);
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
            width: calc(100% - 37px);
            margin-left: var(--default-margin-half);
            background-color: transparent;
          }

          .up_down {
            width: 10px;
            height: 100%;

            >svg {
              width: 10px;
              height: 10px;
            }
          }
        }
      }
    }
  }
}
</style>