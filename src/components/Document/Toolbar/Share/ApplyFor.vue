<script setup lang="ts">
import { defineEmits, ref, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    index: number,
    name: string,
    file: string,
    authority: string,
    remarks: string
}>()
const emit = defineEmits<{
  (e: 'close', index: number): void
}>()
const card = ref<HTMLDivElement>()
const posi = ref({
  top: 5,
  right: 10
})

const closeShare = (index: number) => {
  emit('close', index)
}

</script>
<template>
  <el-card class="box-card" ref="card" :style="{top:posi.top + (250 * props.index) + 'px', right: posi.right + 'px'}">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <span>文件访问申请</span>
        <el-button class="button" text @click="closeShare(props.index)">
          <div class="close"> X </div>
        </el-button>
      </div>
    </template>
    <div class="contain">
       <!-- 文件名 -->
       <div class="unfounder">
        <span>申请人:</span>
        <p class="name bold">{{props.name}}</p>
      </div>
       <!-- 创建者 -->
       <div class="unfounder">
        <span>访问文件:</span>
        <p class="name bold">{{props.file}}</p>
      </div>
       <!-- 文档权限 -->
       <div class="unfounder">
        <span>权限:</span>
        <p class="name bold">{{props.authority}}</p>
      </div>
      <div class="textarea" v-if="props.remarks.trim().length">
        <span>备注:</span>
        <p class="text">{{props.remarks}}</p>
      </div>
      <!-- 链接按钮 -->
      <div class="button">
        <el-button size="small">同意</el-button>
        <el-button color="#0d99ff" size="small">拒绝</el-button>
      </div>
    </div>
  </el-card>
  
</template>
  
<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: var(--font-default-bold);
  }

  .close {
    font-size: 14px;
    color: black;
  }

}

::v-deep .el-card__header {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}
::v-deep .el-card__body {
  padding: var(--default-padding-half) var(--default-padding)
}

.contain {
  font-size: var(--font-default-fontsize);
  .button {
  display: flex;
  justify-content: center;
  margin: var(--default-margin);
}
}
.unfounder {
  display: flex;
  align-items: center;
  height: 30px;
  span {
    display: block;
    width: 60px;
  }
  >.name {
    margin-left: 10px;
  }
  >.bold {
    font-weight: bold;
  }
}
.textarea {
    display: flex;
    align-items: center;
    min-height: 30px;
    max-height: 70px;
    height: auto;
    span {
        display: block;
        width: 60px;
        margin-right: 10px;
    }
    >.text {
        flex: 1;
    }
}

.box-card {
  width: 300px;
  position: absolute;
  top: 5px;
  right: 10px;
}</style>