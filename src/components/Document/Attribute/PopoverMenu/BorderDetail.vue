<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, defineProps, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem } from '@/components/common/Select.vue';
import BorderPositonItem from './BorderPositionItem.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import BorderStyleSelected from './BorderStyleSelected.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue'
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { Border, BorderPosition, BorderStyle, MarkerType } from "@kcdesign//data/data/style";

const props = defineProps<{
    context: Context,
    shape: Shape,
    border: Border
}>();

const { t } = useI18n();
const editor = computed(() => {
    return props.context.editor4Shape(props.shape);
});
const popover = ref();
const borderStyle = ref<SelectItem>({
  value: 'dash',
  content: t('attr.dash')
});
const borderStyleOptionsSource = [
  {
    id: 1,
    data: {
      content: t('attr.solid'),
      value: 'solid'
    }
  }, {
    id: 2,
    data: {
      content: t('attr.dash'),
      value: 'dash',
    }
  },
];
const position = ref<SelectItem>({
  value: 0,
  content: t('attr.center')
});
const positonOptionsSource = [
  {
    id: 1,
    data: {
      content: t(`attr.${BorderPosition.Outer}`),
      value: BorderPosition.Outer
    }
  }, {
    id: 2,
    data: {
      content: t(`attr.${BorderPosition.Center}`),
      value: BorderPosition.Center,
    }
  }, {
    id: 3,
    data: {
      content: t(`attr.${BorderPosition.Inner}`),
      value: BorderPosition.Inner,
    }
  },
];
const borderFrontStyle = ref<SelectItem>({
  value: MarkerType.Line,
  content: MarkerType.Line
});
const borderFrontStyleOptionsSource = [
  {
    id: 0,
    data: {
      value: MarkerType.Line,
      content: MarkerType.Line
    }
  }, {
    id: 1,
    data: {
      value: MarkerType.OpenArrow,
      content: MarkerType.OpenArrow
    }
  }, {
    id: 2,
    data: {
      value: MarkerType.FilledArrow,
      content: MarkerType.FilledArrow
    }
  }, {
    id: 3,
    data: {
      value: MarkerType.OpenCircle,
      content: MarkerType.OpenCircle
    }
  }, {
    id: 4,
    data: {
      value: MarkerType.FilledCircle,
      content: MarkerType.FilledCircle
    }
  }, {
    id: 5,
    data: {
      value: MarkerType.OpenSquare,
      content: MarkerType.OpenSquare
    }
  }, {
    id: 6,
    data: {
      value: MarkerType.FilledSquare,
      content: MarkerType.FilledSquare
    }
  }, {
    id: 7,
    data: {
      value: MarkerType.FallT,
      content: MarkerType.FallT
    }
  }
]
const borderEndStyle = ref<SelectItem>({
  value: MarkerType.Line,
  content: `end-${MarkerType.Line}`
});
const borderEndStyleOptionsSource = [
  {
    id: 0,
    data: {
      value: MarkerType.Line,
      content: `end-${MarkerType.Line}`
    }
  }, {
    id: 1,
    data: {
      value: MarkerType.OpenArrow,
      content: `end-${MarkerType.OpenArrow}`
    }
  }, {
    id: 2,
    data: {
      value: MarkerType.FilledArrow,
      content: `end-${MarkerType.FilledArrow}`
    }
  }, {
    id: 3,
    data: {
      value: MarkerType.OpenCircle,
      content: `end-${MarkerType.OpenCircle}`
    }
  }, {
    id: 4,
    data: {
      value: MarkerType.FilledCircle,
      content: `end-${MarkerType.FilledCircle}`
    }
  }, {
    id: 5,
    data: {
      value: MarkerType.OpenSquare,
      content: `end-${MarkerType.OpenSquare}`
    }
  }, {
    id: 6,
    data: {
      value: MarkerType.FilledSquare,
      content: `end-${MarkerType.FilledSquare}`
    }
  }, {
    id: 7,
    data: {
      value: MarkerType.FallT,
      content:`end-${MarkerType.FallT}`
    }
  }
]
function showMenu() {
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
  const bs = new BorderStyle(0, 0);
  if (selected.value === 'dash') {
    bs.length = 10;
    bs.gap = 10;
  } else {
    bs.length = 0;
    bs.gap = 0;
  }
  const index = props.shape.getBorderIndex(props.border);
  editor.value.setBorderStyle(index, bs);
}
function positionSelect(selected: SelectItem) {
  position.value = selected;
  const index = props.shape.getBorderIndex(props.border);
  editor.value.setBorderPosition(index, selected.value as BorderPosition);
}
function setThickness(e: Event) {
  const thickness = Number((e.target as HTMLInputElement).value);
  const index = props.shape.getBorderIndex(props.border);
  editor.value.setBorderThickness(index, thickness);
}
function borderApexStyleSelect(selected: SelectItem) {
  const index = props.shape.getBorderIndex(props.border);
  if (selected.content.startsWith('end')) {
    borderEndStyle.value = selected;
    editor.value.setBorderApexStyle(index, selected.value as MarkerType, true);
  } else {
    borderFrontStyle.value = selected;
    editor.value.setBorderApexStyle(index, selected.value as MarkerType, false);
  }
}
watch(() => props.border, () => {
  initValue();  
}, { deep: true })
</script>

<template>
  <div class="border-detail-container">
    <Popover ref="popover" :width="240" :left="-470" :height="256" :title="t('attr.advanced_stroke')">
      <template #trigger>
        <svg-icon class="trigger" icon-class="gear" @click="showMenu"></svg-icon>
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
              @select="positionSelect"
              :source="positonOptionsSource"
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
          <div>
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
          <div>
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
    text-align: center;
    .trigger {
      width: 40%;
      height: 40%;
      transition: 0.5s;
      margin-top: 13px;
    }
    .trigger:hover {
      transform: rotate(90deg);
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
</style>