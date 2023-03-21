<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem } from '@/components/common/Select.vue';
import BorderStyleItem from './BorderStyleItem.vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data/data/shape';
import { Border, BorderPosition } from "@kcdesign//data/data/style";

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
      content: t('attr.outer'),
      value: 2
    }
  }, {
    id: 2,
    data: {
      content: t('attr.center'),
      value: 0,
    }
  }, {
    id: 3,
    data: {
      content: t('attr.inner'),
      value: 1,
    }
  },
];
function showMenu() {
  popover.value.show();
  initValue();

}
function initValue() {
  const bp = ((p: BorderPosition) => {
    switch(p) {
      case BorderPosition.Center: return 0;
      case BorderPosition.Inner: return 1;
      case BorderPosition.Outer: return 2;
      default: return 0;
    }
  })(props.border.position);
  const positionSelected = positonOptionsSource.find(i => i.data.value === bp)?.data;
  positionSelected && (position.value = positionSelected);  
}
function borderStyleSelect(value: SelectItem) {
  borderStyle.value = value;
}
function positionSelect(selected: SelectItem) {
  position.value = selected;
  const p: BorderPosition = ((p: number) => {
    switch(p) {
      case 0: return BorderPosition.Center;
      case 1: return BorderPosition.Inner;
      case 2: return BorderPosition.Outer;
      default: return BorderPosition.Center;
    }
  })(selected.value as number);
  const index = props.shape.getBorderIndex(props.border);
  editor.value.setBorderPosition(index, p);
}
function setThickness(e: Event) {
  const thickness = Number((e.target as HTMLInputElement).value);
  const index = props.shape.getBorderIndex(props.border);
  editor.value.setBorderThickness(index, thickness)
}
</script>

<template>
  <div class="border-detail-container">
    <Popover ref="popover" :width="240" :left="-470" :height="160" :title="t('attr.advanced_stroke')">
      <template #trigger>
        <svg-icon class="trigger" icon-class="gear" @click="showMenu"></svg-icon>
      </template>
      <template #body>
        <div class="options-container">
          <div>
            <label>{{ t('attr.position') }}</label>
            <Select
              :selected="position"
              :item-view="BorderStyleItem"
              :item-height="32"
              @select="positionSelect"
              :source="positonOptionsSource"
            ></Select>
          </div>
          <div>
            <label>{{ t('attr.thickness') }}</label>
            <div class="thickness-container">
              <svg-icon icon-class="thickness"></svg-icon>
              <input type="text" :value="border.thickness" @change="e => setThickness(e)">
            </div>
          </div>
          <div>
            <label>{{ t('attr.borderStyle') }}</label>
            <Select
              :selected="borderStyle"
              :item-view="BorderStyleItem"
              :item-height="32"
              @select="borderStyleSelect"
              :source="borderStyleOptionsSource"
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
      padding: var(--default-padding-half);
      height: 120px;
      box-sizing: border-box;
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