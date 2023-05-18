<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import * as share_api from '@/apis/share'
const { t } = useI18n()

const docID = localStorage.getItem('docId')
const applyList: any = ref([])
const container = ref<HTMLDivElement>()
const posi = ref({
  top: 5,
  right: 10
})
enum Audit {
  Pass,
  unPass
}
const timestamp  = Date.now()
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`,`${t('share.editable')}`])
const getApplyList = async (time?: number) => {  
    const { data } = await share_api.getApplyListAPI({ doc_id: docID })
    applyList.value = data
}
const consent = (id: string, index: number) => {
  promissionApplyAudit(id, Audit.Pass)
  getApplyList()
}
const refuse = (id: string, index: number) => {
  promissionApplyAudit(id, Audit.unPass)
  getApplyList()
}
const promissionApplyAudit = async (id: string, type: number) => {
  await share_api.promissionApplyAuditAPI({apply_id: id, approval_code: type})
}
const close = (index: number) => {
  applyList.value.splice(index, 1)
}
let timer: any = null
// 
getApplyList(timestamp)
onMounted(() => {    
    timer = setInterval(() => {
        getApplyList()
    }, 10000)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<template>
  <div v-for="(item, index) in applyList" :key="index">

    <el-card class="box-card" ref="card" :style="{top:posi.top + (250 * index) + 'px', right: posi.right + 'px'}">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('apply.file_access_request') }}</span>
          <el-button class="button" text @click="close(index)">
            <div class="close"> X </div>
          </el-button>
        </div>
      </template>
      <div class="contain" ref="container">
         <!-- 文件名 -->
         <div class="unfounder">
          <span>{{ t('apply.applicant') }}:</span>
          <p class="name bold">{{ item.user.nickname }}</p>
        </div>
         <!-- 创建者 -->
         <div class="unfounder">
          <span>{{ t('apply.access_file') }}:</span>
          <p class="name bold">{{ item.document.name }}</p>
        </div>
         <!-- 文档权限 -->
         <div class="unfounder">
          <span>{{ t('apply.authority') }}:</span>
          <p class="name bold">{{permission[item.apply.perm_type]}}</p>
        </div>
        <div class="textarea" v-if="item.apply.applicant_notes.trim().length">
          <span class="remarks">{{ t('apply.remarks') }}:</span>
          <p class="text">{{item.apply.applicant_notes}}</p>
        </div>
        <!-- 链接按钮 -->
        <div class="button">
          <el-button color="#0d99ff" size="small" @click="consent(item.apply.id, index)">{{ t('apply.agree') }}</el-button>
          <el-button plain size="small" @click="refuse(item.apply.id, index)">{{ t('apply.refuse') }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
  
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

:deep(.el-card__header) {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}
:deep(.el-card__body) {
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
.remarks {
  margin-top: 10px;
}

.box-card {
  width: 300px;
  margin-bottom: 10px;
}
</style>