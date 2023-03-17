<script setup lang="ts">
import { ref } from 'vue';
import Popover from '@/components/common/Popover.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const popover = ref();
const isHorizontalFix = ref<boolean>(false);
const isVertical = ref<boolean>(false);

function showMenu() {
  popover.value.show();
}

</script>

<template>
  <div class="scale-container">
    <Popover
      ref="popover"
      :width="180"
      :height="72"
      :left="-332"
      :title="t('attr.follow_container_scaling')"
    >
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
      </template>
      <template #body>
        <div class="checbox-container">
          <div>
            <input type="checkbox" id="horizontal" name="horizontal">
            <label for="horizontal">{{ t('attr.horizontal') }}</label>
          </div>
          <div>
            <input type="checkbox" id="vertical" name="vertical">
            <label for="vertical">{{ t('attr.vertical') }}</label>
          </div>
        </div>
        
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.scale-container {
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
  .space {
    width: 32px;
    height: 12px;
    background-color: aqua;
  }
  .checbox-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
    }
  }
}
</style>