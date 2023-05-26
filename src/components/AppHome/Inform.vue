<script setup lang="ts">
import { ref, computed, defineEmits, defineProps, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as share_api from '@/apis/share'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'reviewed'): void
}>()
const props = defineProps<{
  applyList: any
}>()
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
enum Audit {
  unPass,
  Pass
}

const formatDate = computed(() => {
  return function (value: string): string {
    const date = new Date(value)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours}:${minutes}`
  }
})
const consent = (id: string, index: number) => {
  promissionApplyAudit(id, Audit.Pass)
}
const refuse = (id: string, index: number) => {
  promissionApplyAudit(id, Audit.unPass)
}
const promissionApplyAudit = async (id: string, type: number) => {
  try {
    await share_api.promissionApplyAuditAPI({ apply_id: id, approval_code: type })
    emit('reviewed')

  } catch (error) {
    ElMessage({
      message: `${t('apply.authorization_failure')}`
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
        <span>{{ t('apply.notification_message') }}</span>
        <el-button class="button" text @click="close">
          <div class="close"> X </div>
        </el-button>
      </div>
    </template>
    <div class="contain">
      <el-scrollbar height="400px" style="padding-right: 10px;">
        <div class="inform-item" v-for="(item, i) in props.applyList" :key="i">
          <div class="avatar"><img :src="item.user.avatar" alt=""></div>
          <div class="item-container">
            <div class="item-title">
              <span>{{ item.user.nickname }}</span>
              <span>{{ formatDate(item.apply.created_at) }}</span>
            </div>
            <el-tooltip class="box-item" effect="light" placement="bottom-end">
              <template #content>
                <div class="custom-tooltip">
                  {{ t('apply.application_documents') }}"{{ item.document.name }}"，{{ t('apply.authority') }}：{{ permission[item.apply.perm_type] }}，【{{ t('apply.remarks') }}】：{{ item.apply.applicant_notes }}</div>
              </template>
              <div class="item-text">
                {{ t('apply.application_documents') }}"{{ item.document.name }}"，{{ t('apply.authority') }}：{{ permission[item.apply.perm_type] }}，【{{ t('apply.remarks') }}】：{{ item.apply.applicant_notes }}</div>
            </el-tooltip>
          </div>
          <div class="botton" v-if="item.apply.status === 0">
            <el-button color="#0d99ff" size="small" @click="consent(item.apply.id, i)">{{ t('apply.agree') }}</el-button>
            <el-button plain size="small" style="margin-top: 5px;" @click="refuse(item.apply.id, i)">{{ t('apply.refuse') }}</el-button>
          </div>
          <div class="botton" v-else>
            <p v-if="item.apply.status === 1">{{ t('apply.have_agreed') }}</p>
            <p v-else-if="item.apply.status === 2">{{ t('apply.rejected') }}</p>
          </div>
        </div>
        <div class="text" v-if="props.applyList.length === 0"><span>{{ t('apply.no_message_received') }}</span></div>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__header) {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}

:deep(.el-card__body) {
  padding: var(--default-padding-half) var(--default-padding-quarter) var(--default-padding-half) var(--default-padding);
}

:deep(.el-button+.el-button) {
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
  max-width: 200px;
  /* 设置最大宽度 */
  word-wrap: break-word;
  /* 设置自动换行 */
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
    line-clamp: 2;
    text-overflow: ellipsis;
  }
}

.box-card {
  width: 300px;
  z-index: 9;
  position: absolute;
  top: 50px;
  right: 130px;
}</style>