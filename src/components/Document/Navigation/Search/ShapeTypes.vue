<script lang="ts" setup>
import SvgIcon from '@/components/common/SvgIcon.vue';
import { Context } from '@/context';
import { ShapeType } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
  context: Context
  selected: ShapeType[]
}
interface Emits {
  (e: 'update-types', st: ShapeType, push: boolean, multi: boolean): void;
}
export interface SelectedItem {
  selected: boolean
  shapetype: ShapeType
}
const emit = defineEmits<Emits>();
const { t } = useI18n();
const props = defineProps<Props>();
const all_types = ref<SelectedItem[]>([]);
const hoverIndex = ref(-1);
const template: SelectedItem[] = [
  {
    selected: false,
    shapetype: ShapeType.Artboard
  },
  {
    selected: false,
    shapetype: ShapeType.Group
  },
  {
    selected: false,
    shapetype: ShapeType.Rectangle
  },
  {
    selected: false,
    shapetype: ShapeType.Oval
  },
  {
    selected: false,
    shapetype: ShapeType.Line
  },
  {
    selected: false,
    shapetype: ShapeType.Text
  },
  {
    selected: false,
    shapetype: ShapeType.Image
  }
]
function check(index: number, e: MouseEvent) {
  const is_ed = all_types.value[index].selected
  all_types.value[index].selected = !is_ed;
  emit('update-types', all_types.value[index].shapetype, !is_ed, e.shiftKey);
}
function init() {
  for (let i = 0; i < template.length; i++) {
    const t = template[i];
    if (props.selected.includes(t.shapetype)) {
      t.selected = true;
      all_types.value.push(t);
    } else {
      all_types.value.push(t);
    }
  }
}
onMounted(() => {
  init();
})

import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
</script>
<template>
  <div class="types-wrap">
    <div v-for="(item, index) in all_types" :key="index" class="type-block" @click="(e) => check(index, e)" @mouseover="hoverIndex = index" @mouseleave="hoverIndex = -1">
      <div class="content"> {{ t(`shape.${item.shapetype}`) }}</div>
      <div class="de-check">
        <SvgIcon v-if="item.selected" :icon="hoverIndex === index ? white_select_icon: page_select_icon"/>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.types-wrap {
  width: 100%;
  height: 100%;

  .type-block {
    width: 100%;
    height: 34px;
    color: #262626;
    padding: 2px 5px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    align-items: center;

    >.de-check {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      >svg {
        width: 12px;
        height: 12px;
      }
    }
    .content {
      flex: 1;
      text-align: center;
    }

  }

  .type-block:hover {
    background-color: #1878F5;
    color: #fff;
  }
}
</style>