<script lang="ts" setup>
import { Context } from '@/context';
import { ShapeType } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
  context: Context
  selected: ShapeType[]
}
interface Emits {
  (e: 'update-types', st: ShapeType, push: boolean): void;
}
export interface SelectedItem {
  selected: boolean
  shapetype: ShapeType
}
const emit = defineEmits<Emits>();
const { t } = useI18n();
const props = defineProps<Props>();
const all_types = ref<SelectedItem[]>([]);
const template: SelectedItem[] = [
  {
    selected: false,
    shapetype: ShapeType.Artboard
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
    shapetype: ShapeType.Text
  }
]
function check(index: number) {
  const is_ed = all_types.value[index].selected
  all_types.value[index].selected = !is_ed;
  emit('update-types', all_types.value[index].shapetype, !is_ed);
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
</script>
<template>
  <div class="types-wrap">
    <div v-for="(item, index) in all_types" :key="index" class="type-block" @click="() => check(index)">
      <div :class="item.selected ? 'check' : 'de-check'"> </div>
      <div class="content"> {{ t(`shape.${item.shapetype}`) }}</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.types-wrap {
  width: 100%;
  height: 100%;

  .type-block {
    width: 100%;
    height: 28px;
    color: var(--theme-color-anti);
    padding: 2px 13px;
    display: flex;
    box-sizing: border-box;
    align-items: center;

    >.check {
      box-sizing: border-box;
      width: 10px;
      height: 6px;
      border-width: 0 0 2px 2px;
      border-style: solid;
      border-color: var(--theme-color-anti);
      left: 6px;
      transform: rotate(-45deg) translateY(-20%);
    }

    >.de-check {
      box-sizing: border-box;
      width: 10px;
      height: 6px;
      border-width: 0 0 2px 2px;
      border-style: solid;
      border-color: transparent;
      left: 6px;
      transform: rotate(-45deg) translateY(-20%);
    }

    >.content {
      margin-left: 6px;
    }

  }

  .type-block:hover {
    background-color: var(--active-color);
  }
}
</style>