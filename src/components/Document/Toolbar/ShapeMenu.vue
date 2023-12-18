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
            <div class="choose">
                <svg-icon icon-class="choose" :style="{ visibility: isActive ? 'visible' : 'hidden' }"></svg-icon>
            </div>
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
  height: 32px;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px 9px 8px;
  box-sizing: border-box;

    .choose {
        width: 12px;
        height: 12px;
        display: contents;

        svg {
            width: 12px;
            height: 12px;
        }
    }

  .svg-container {
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 8px;
    margin-right: 8px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
.quick {
  height: 14px;
  font-family: HarmonyOS Sans;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
}
//.container-change>div {
//  margin-left: var(--default-margin);
//}
</style>