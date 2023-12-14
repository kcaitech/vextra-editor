<script setup lang="ts">
import { Action } from '@/context/tool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
    isActive: boolean
    lg: string,
    quick: string,
    action: Action,
}>();
const emit = defineEmits<{
    (e: "select", select: Action): void;
}>();
const select = () => {
    emit('select', props.action);
};
function get_icon_class() {
    if (props.action ===Action.AddRect) return "pattern-rectangle";
    else if (props.action === Action.AddEllipse) return "pattern-oval";
    else if (props.action === Action.AddLine) return "pattern-line";
    else if (props.action === Action.AddArrow) return "pattern-arrow";
    return  "pattern-rectangle"
}
</script>
<template>
    <div class="container-change" @click="select">                                
        <div style="display: flex; align-items: center;">
            <div class="choose" :style="{ visibility: isActive ? 'visible' : 'hidden' }"></div>
            <div class="svg-container">
                <svg-icon :icon-class="get_icon_class()"></svg-icon>
            </div>
            <div class="select">{{ t(`shape.${props.lg}`) }}</div>
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