<script setup lang="ts">
import { Action } from '@/context/tool';
import { prop } from 'vue-class-component';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
    lg: string,
    quick?: string,
    select?: any,
    d?: any,
    type: string,
    // state?: boolean
}>();
const emit = defineEmits<{
    (e: "selectRect", select: Action): void;
    (e: "selectEllipse", select: Action): void;
    (e: "selectPath", select: Action): void;
    (e: "selectArrow", select: Action): void;
}>();
const selectRect = (active: Action) => {
    emit('selectRect', active);
};
const selectEllipse = (e: MouseEvent) => {
    e.stopPropagation()
    emit('selectEllipse', props.select)
}
const selectPath = (e: MouseEvent) => {
    e.stopPropagation()
    emit('selectPath', props.select)
}
const selectArrow = (e: MouseEvent) => {
    e.stopPropagation()
    emit('selectArrow', props.select)
}
</script>
<template>
    <div class="container-change" @click="selectRect(props.select!)" v-if="props.type === 'rect'">
        <div style="display: flex; align-items: center;">
            <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden' }"></div>
            <div class="svg-container">
                <svg-icon :icon-class="select"></svg-icon>
            </div>
            <div class="select">{{ t(`shape.${props.lg}`) }}</div>
        </div>
        <span class="quick">{{ props.quick }}</span>
    </div>
    <div class="container-change" v-if="props.type === 'ellipse'" @mousedown="selectEllipse">
        <div style="display: flex; align-items: center;">
            <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden' }"></div>
            <div class="svg-container">
                <svg-icon :icon-class="select"></svg-icon>
            </div>
            <div class="select">{{ t(`bool.${props.lg}`) }}</div>
        </div>
        <span class="quick">{{ props.quick }}</span>
    </div>
    <div class="container-change" v-if="props.type === 'path'" @mousedown="selectPath">
        <div style="display: flex; align-items: center;">
            <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden' }"></div>
            <div class="svg-container">
                <svg-icon :icon-class="select"></svg-icon>
            </div>
            <div class="select">{{ t(`bool.${props.lg}`) }}</div>
        </div>
        <span class="quick">{{ props.quick }}</span>
    </div>
    <div class="container-change" v-if="props.type === 'arrow'" @mousedown="selectArrow">
        <div style="display: flex; align-items: center;">
            <div class="choose" :style="{ visibility: props.select === props.d ? 'visible' : 'hidden' }"></div>
            <div class="svg-container">
                <svg-icon :icon-class="select"></svg-icon>
            </div>
            <div class="select">{{ t(`bool.${props.lg}`) }}</div>
        </div>
        <span class="quick">{{ props.quick }}</span>
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
    height:  var(--default-input-height);
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      width: 50%;
      height: 50%;
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