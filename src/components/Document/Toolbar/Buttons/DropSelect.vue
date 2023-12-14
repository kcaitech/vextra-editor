<script setup lang="ts">
import {} from 'vue';
import { useI18n } from 'vue-i18n'
import { BoolOp } from '@kcdesign/data';
import { Action } from "@/context/tool";
const { t } = useI18n()
const props = defineProps<{
    lg: string,
    quick?: string,
    select?: any,
    d?: any,
    type: string,
    bool?: BoolOp,
    state?: boolean
}>();
const emit = defineEmits<{
    (e: "selector", select: Action): void;
    (e: "selectBool", select: Action, bool: BoolOp): void;
}>();
const selector = (active: Action) => {
    emit('selector', active);
}
const handleBoolean = (e: MouseEvent) => {
  e.stopPropagation()
  emit('selectBool',props.select, props.bool!)
}

</script>
<template>
  <!-- cursor -->
  <div class="container-change" @click="selector(props.select!)" v-if="props.type === 'cursor'">
      <div style="display: flex; align-items: center;">
        <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden'  }"></div>
        <div class="svg-container">
          <svg-icon :icon-class="select"></svg-icon>
        </div>
        <div class="select">{{ t(`home.${props.lg}`) }}</div>
      </div>
      <span class="quick">{{ props.quick }}</span>
    </div>
    <!-- 布尔对象下拉菜单 -->
    <div class="container-change" v-if="props.type === 'bool'" @mousedown="handleBoolean">
      <div style="display: flex; align-items: center;">
        <div class="choose" :style="{ visibility: props.select === props.d && !state ? 'visible' : 'hidden'  }"></div>
        <div class="svg-container">
          <svg-icon :icon-class="select"></svg-icon>
        </div>
        <div class="select">{{ t(`bool.${props.lg}`) }}</div>
      </div>
    </div>
</template>
<style scoped lang="scss">
.container-change:hover {
  background-color: var(--active-color);
}
.choose {
  box-sizing: border-box;
  width: 12px;
  height: 8px;
  border-width: 0 0 2px 2px;
  border-style: solid;
  border-color: var(--theme-color-anti);
  transform: rotate(-45deg) translateY(-30%);
}
.select {
  font-size: var(--font-default-fontsize);
}
.container-change {
  display: flex;
  color: var(--theme-color-anti);
  width: 100%;
  height:  var(--default-input-height);
  align-items: center;
  justify-content: space-between;
  .svg-container {
    width: 32px;
      height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      width: 20px;
      height: 20px;
    }
  }
}
.quick {
  margin-right: var(--default-margin);
  font-size: 14px;
}
.container-change>div {
  margin-left: var(--default-margin);
}
</style>