<script setup lang='ts'>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {

}
</script>
<template>
  <div class="items-wrap">
    <div class="item">
      <span>{{ t('system.paste') }}</span>
      <span></span>
    </div>
    <div class="item">{{ t('system.copy') }}</div>
    <div class="line"></div>
    <div class="item">{{ t('system.select_layer') }}</div>
  </div>
</template>
<style lang='scss' scoped>
.items-wrap {
  width: 100%;
  font-size: var(--font-default-fontsize);

  .item {
    width: 100%;
    height: 28px;
    padding: 0 var(--default-padding);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    background-color: var(--theme-color);
  }

  .line {
    width: 100%;
    height: 17px;
    // padding: var(--default-padding-half) 0;
    border-width: 8px 0 8px 0;
    border-style: solid;
    border-color: var(--theme-color);
    box-sizing: border-box;
    background-color: grey;
  }

  .item:hover {
    background-color: var(--active-color);
  }
}
</style>