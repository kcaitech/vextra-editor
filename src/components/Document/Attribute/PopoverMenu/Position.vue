<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const popover = ref();

function showMenu() {
  popover.value?.show()
}
</script>

<template>
  <div class="position-container">
    <Popover ref="popover" :left="-332" :title="t('attr.constraints')">
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.position-container {
  text-align: center;
  svg {
    width: 40%;
    height: 40%;
    transition: 0.5s;
    margin-top: 10px;
  }
  svg:hover {
    transform: rotate(90deg);
  }
}
</style>