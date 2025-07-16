/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import SvgIcon from '@/components/common/SvgIcon.vue';
import { Context } from '@/context';
import { ShapeType } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Props = {
  context: Context
  selected: ShapeType[]
}
interface Emits {
  (e: 'update-types', st: ShapeType, push: boolean, multi: boolean): void;
}

export type SelectedItem = {
  selected: boolean
    type: ShapeType
}
const emit = defineEmits<Emits>();
const { t } = useI18n();
const props = defineProps<Props>();
const all_types = ref<SelectedItem[]>([]);
const hoverIndex = ref(-1);
const template: SelectedItem[] = Array.from(Object.values(ShapeType)).filter(i => ![
    ShapeType.Triangle, ShapeType.TableCell, ShapeType.Table, ShapeType.SymbolUnion,
].includes(i)).map(type => {
    if (type === ShapeType.SymbolRef) {
        type = 'instance' as ShapeType;
    }
    if (type === ShapeType.BoolShape) {
        type = 'bool' as ShapeType;
    }
    return {
        selected: false,
        type: type as ShapeType,
    }
});

function check(index: number, e: MouseEvent) {
  const is_ed = all_types.value[index].selected
  all_types.value[index].selected = !is_ed;
    emit('update-types', all_types.value[index].type, !is_ed, e.shiftKey);
}
function init() {
  for (let i = 0; i < template.length; i++) {
    const t = template[i];
      if (props.selected.includes(t.type)) {
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
        <div class="content"> {{ t(`shape.${item.type}`) }}</div>
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