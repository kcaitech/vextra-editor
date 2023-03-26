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
      :left="-516"
      :width="240"
      :height="100"
      ref="popover"
      :title="t('attr.corner_smoothing')"
      class="popover"
    >
      <template #trigger>
        <div class="trigger">
          <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
        </div>
      </template>
      <template #body>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.radius-for-ios-container {
  .popover {
    width: 32px;
    height: 32px;
    .trigger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      svg {
        width: 40%;
        height: 40%;
        transition: 0.5s;
      }
      svg:hover {
        transform: rotate(90deg);
      }
    }
  }
  
}
</style>