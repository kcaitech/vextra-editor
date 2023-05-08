<script setup lang="ts">
import { ref, computed, defineEmits, defineProps,watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as share_api from '@/apis/share'

const emit = defineEmits<{
  (e: 'close'): void
}>()
const props = defineProps<{
  applyList: any
}>()
const applyList: any = ref(props.applyList)
const permission = ref(['无权限', '只读', '可评论','可编辑'])
enum Audit {
  Pass,
  unPass
}
watch(props.applyList, () => {
  applyList.value = props.applyList
},{deep: true})

const formatDate = computed(() => {
  return function (value: string): string {
    const date = new Date(value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours}:${minutes}`
  }
})
const consent = (id: number, index: number) => {
  promissionApplyAudit(id, Audit.Pass)
  applyList.value[index].approval_result = 1;
}
const refuse = (id: number, index: number) => {
  promissionApplyAudit(id, Audit.unPass)
  applyList.value[index].approval_result = 2;
}
const promissionApplyAudit = async (id: number, type: number) => {
  try {
    await share_api.promissionApplyAuditAPI({ apply_id: id, approval_code: type })
  }catch(error) {
    ElMessage({
        message: '授权失败'
      })
  }
}
const close = () => {
  emit('close')
}
</script>

<template>
  <el-card class="box-card">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <span>通知消息</span>
        <el-button class="button" text @click="close">
          <div class="close"> X </div>
        </el-button>
      </div>
    </template>
    <div class="contain">
      <el-scrollbar height="400px" style="padding-right: 10px;">
        <div class="inform-item" v-for="(item, i) in applyList" :key="i">
          <div class="avatar"><img :src="item.user.avatar" alt=""></div>
          <div class="item-container">
            <div class="item-title">
              <span>{{ item.user.nickname }}</span>
              <span>{{ formatDate(item.created_at) }}</span>
            </div>
            <el-tooltip
              class="box-item"
              effect="light"
              placement="bottom-end"
            >
            <template #content><div class="custom-tooltip">申请文档："{{item.document.name}}"权限：{{permission[item.perm_type]}}，【备注】{{item.remarks}}</div></template>
            <div class="item-text">
              {{ '申请文档：' + '"' + item.document.name +'"权限：'+permission[item.perm_type] + '， 【备注】' + item.remarks }}
            </div>
            </el-tooltip>
          </div>
          <div class="botton" v-if="item.approval_result === 0">
            <el-button color="#0d99ff" size="small" @click="consent(item.id, i)">同意</el-button>
            <el-button plain size="small" style="margin-top: 5px;" @click="refuse(item.id, i)">拒绝</el-button>
          </div>
          <div class="botton" v-else>
            <p v-if="item.approval_result === 1">已同意</p>
            <p v-else-if="item.approval_result === 2">已拒绝</p>
          </div>
        </div>
        <div class="text" v-if="applyList.length === 0"><span>未收到任何消息</span></div>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
::v-deep .el-card__header {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}

::v-deep .el-card__body {
  padding: var(--default-padding-half) var(--default-padding-quarter) var(--default-padding-half) var(--default-padding);
}

::v-deep .el-button+.el-button {
  margin-left: 0;
}

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
.tooltip-base-box .box-item {
  margin-top: 10px;
  width: 180px;
  background-color: #fff;
}
.custom-tooltip {
  max-width: 200px; /* 设置最大宽度 */
  word-wrap: break-word; /* 设置自动换行 */
}

.contain {
  font-size: var(--font-default-fontsize);

  .scrollbar-demo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 10px;
    text-align: center;
    border-radius: 4px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

  }
}

.inform-item {
  width: 100%;
  height: 80px;
  display: flex;
  border-bottom: 1px solid var(--theme-color-line);

  .botton {
    width: 45px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.text {
  width: 100%;
  height: 300px;
  display: flex;
  color: #999;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #efefef;
  margin-top: 5px;

  >img {
    width: 80%;
    height: 80%;
  }
}

.item-container {
  width: 180px;
  padding: var(--default-padding-half);

  .item-title {
    display: flex;
    justify-content: space-between;
  }

  .item-text {
    margin-top: 5px;
    width: 180px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
  }
}

.box-card {
  width: 300px;
  z-index: 9;
  position: absolute;
  top: 50px;
  right: 90px;
}</style>