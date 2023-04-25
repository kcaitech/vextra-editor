<script setup lang="ts">
import { ref, defineEmits, defineExpose } from 'vue'

const card = ref<HTMLDivElement>()
defineExpose({
    card
})
const emit = defineEmits<{
    (e: 'close'): void
}>()
const closeShare = (e: Event) => {
    emit('close');
}
</script>
<template>
    <el-card class="box-card" ref="card">
      <template #header>
        <div class="card-header">
          <span>文件分享</span>
          <el-button class="button" text>
            <div class="close" @click="closeShare"> X </div>
          </el-button>
        </div>
      </template>
      <div v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</div>
    </el-card>
  </template>
  
  <style scoped lang="scss">
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
        font-weight: var(--font-default-bold);
    }
    .close {
        font-size: 16px;
        color: black;
    }
    
  }
  ::v-deep .el-card__header {
        border-bottom: none;
        padding: 10px 20px;
    }
  
  .text {
    font-size: 14px;
  }
  
  .item {
    margin-bottom: 18px;
  }
  
  .box-card {
    width: 400px;
    position: absolute;
    top: 40px;
    right: 0;
  }
  </style>