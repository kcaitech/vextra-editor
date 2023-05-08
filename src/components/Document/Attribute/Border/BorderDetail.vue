<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, defineProps, computed, watch, onUpdated, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderPositonItem from './BorderPositionItem.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue'
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { ShapeType } from "@kcdesign/data/data/classes"
import { Border, BorderPosition, BorderStyle, MarkerType } from "@kcdesign//data/data/style";
import { genOptions } from '@/utils/common';

const props = defineProps<{
    context: Context,
    shape: Shape,
    border: Border,
    index: number
}>();

const { t } = useI18n();
const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
});
const popover = ref();
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

const showStartStyle = ref<boolean>(false)
const showEndStyle = ref<boolean>(false)

function showMenu() {
  const workspace = props.context.workspace
  workspace.popoverVisible(false);
  popover.value.show();
  initValue();
}
function initValue() {  
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
  borderStyle.value = selected;
  const bs = selected.value === 'dash' ? new BorderStyle(10, 10) : new BorderStyle(0, 0);
  editor.value.setBorderStyle(props.index, bs);
  popover.value.focus();
}
function positionSelect(selected: SelectItem) {
  position.value = selected;
  editor.value.setBorderPosition(props.index, selected.value as BorderPosition);
  popover.value.focus();
}
function setThickness(e: Event) {
  const thickness = Number((e.target as HTMLInputElement).value);
  editor.value.setBorderThickness(props.index, thickness);
}
function borderApexStyleSelect(selected: SelectItem) {
  if (selected.content.startsWith('end')) {
    borderEndStyle.value = selected;
    editor.value.setBorderApexStyle(props.index, selected.value as MarkerType, true);
  } else {
    borderFrontStyle.value = selected;
    editor.value.setBorderApexStyle(props.index, selected.value as MarkerType, false);
  }
  popover.value.focus();
}
watch(() => props.border, () => {
  initValue();  
}, { deep: true })

const startArr = ['line-shape']
onMounted(() => {
  if(startArr.includes(props.shape.typeId)) {
    showStartStyle.value = true
    showEndStyle.value = true
  }else {
    showStartStyle.value = false
    showEndStyle.value = false
  }
})
onUpdated(() => {
  if(startArr.includes(props.shape.typeId)) {
    showStartStyle.value = true
    showEndStyle.value = true
  }else {
    showStartStyle.value = false
    showEndStyle.value = false
  }
})
</script>

<template>
  <div class="border-detail-container">
    <Popover :context="props.context" class="popover" ref="popover" :width="240" height="auto" :left="-490" :title="t('attr.advanced_stroke')">
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
            <Select
              :selected="position"
              :item-view="BorderPositonItem"
              :item-height="32"
              :source="positonOptionsSource"
              @select="positionSelect"
            ></Select>
          </div>
          <!-- 边框厚度 -->
          <div>
            <label>{{ t('attr.thickness') }}</label>
            <div class="thickness-container">
              <svg-icon icon-class="thickness"></svg-icon>
              <input type="text" :value="border.thickness" @change="e => setThickness(e)">
            </div>
          </div>
          <!-- 边框样式 -->
          <div>
            <label>{{ t('attr.borderStyle') }}</label>
            <Select
              :selected="borderStyle"
              :item-view="BorderStyleItem"
              :value-view="BorderStyleSelected"
              :item-height="32"
              @select="borderStyleSelect"
              :source="borderStyleOptionsSource"
            ></Select>
          </div>
          <!-- 起点样式 -->
          <div v-if="showStartStyle">
            <label>{{ t('attr.startMarkerType') }}</label>
            <Select
              :selected="borderFrontStyle"
              :item-view="BorderApexStyleItem"
              :value-view="BorderApexStyleSelectedItem"
              :item-height="32"
              :source="borderFrontStyleOptionsSource"
              @select="borderApexStyleSelect"
            ></Select>
          </div>
          <!-- 终点样式 -->
          <div v-if="showEndStyle">
            <label>{{ t('attr.endMarkerType') }}</label>
            <Select
              :selected="borderEndStyle"
              :item-view="BorderApexStyleItem"
              :value-view="BorderApexStyleSelectedItem"
              :item-height="32"
              :source="borderEndStyleOptionsSource"
              @select="borderApexStyleSelect"
            ></Select>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
  .border-detail-container {
    > .popover {
      width: 32px;
      height: 32px;
      .trigger {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
          width: 40%;
          height: 40%;
          transition: 0.5s;
        }
        > svg:hover {
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
        > div {
          display: flex;
          align-items: center;
          margin: 4px 0;
          > label {
            flex: 0 0 72px;
            text-align: left;
            box-sizing: border-box;
            font-weight: var(--font-default-bold);
          }
          > .thickness-container {
            box-sizing: border-box;
            padding: 0 var(--default-padding);
            background-color: var(--input-background);
            width: calc(100% - 72px);
            height: 32px;
            border-radius: var(--default-radius);
            display: flex;
            align-items: center;
            cursor: ew-resize;
            > svg {
              flex: 0 0 24px;
              height: 24px;
            }
            > input {
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