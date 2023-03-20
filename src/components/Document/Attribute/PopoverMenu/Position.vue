<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElSelect } from 'element-plus';
const { t } = useI18n();

const popover = ref();

function showMenu() {
  popover.value?.show()
}
</script>

<template>
  <div class="position-container">
    <Popover ref="popover" :left="-636" :title="t('attr.constraints')">
      <template #trigger>
        <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
      </template>
      <template #body>
        <div class="position">
          <div class="options">
            <div>
              <label>{{t('attr.horizontal')}}</label>
              <el-select></el-select>
            </div>
            <div>
              <label>{{t('attr.vertical')}}</label>
              <el-select></el-select>
            </div>
          </div>
          <div class="control"></div>
        </div>
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
  .position {
    display: flex;
    // .options {}
    // .control {}
  }
}
</style>