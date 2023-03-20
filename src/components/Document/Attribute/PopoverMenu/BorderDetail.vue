<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from '@/components/common/Select.vue';

const { t } = useI18n();
const popover = ref();

function showMenu() {
  popover.value.show();
}
</script>

<template>
  <div class="border-detail-container">
    <Popover ref="popover" :left="-592" :title="t('attr.advanced_stroke')">
      <template #trigger>
        <svg-icon class="trigger" icon-class="gear" @click="showMenu"></svg-icon>
      </template>
      <template #body>
        <div class="options-container">
          <Select width="200px"></Select>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
  .border-detail-container {
    text-align: center;
    .trigger {
      width: 40%;
      height: 40%;
      transition: 0.5s;
      margin-top: 13px;
    }
    .trigger:hover {
      transform: rotate(90deg);
    }

  }
</style>