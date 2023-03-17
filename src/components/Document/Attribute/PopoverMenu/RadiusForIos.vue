<script setup lang="ts">
import { ref } from 'vue';
import Popover from '@/components/common/Popover.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const popover = ref();

function showMenu() {
  popover.value?.show();
}


</script>

<template>
  <div class="radius-for-ios-container">
    <Popover
      :left="-332"
      :width="240"
      :height="100"
      ref="popover"
      :title="t('attr.corner_smoothing')"
    >
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
      </template>
      <template #body>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.radius-for-ios-container {
  text-align: center;
  svg {
    width: 40%;
    height: 40%;
    transition: 0.5s;
    margin-top: 13px;
  }
  svg:hover {
    transform: rotate(90deg);
  }
}
</style>