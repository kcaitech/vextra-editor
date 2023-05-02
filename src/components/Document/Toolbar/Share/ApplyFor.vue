<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import * as share_api from '@/apis/share'
const { t } = useI18n()

const docID = '7974d5b3-273f-4364-82e3-2aba93d6ac92'
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
const permission = ref(['无权限', '只读', '可评论','可编辑'])
const getApplyList = async () => {
    const { data } = await share_api.getApplyListAPI({ doc_id: docID })
    applyList.value = data
    console.log( applyList.value,'apply');
}
const consent = (id: number, index: number) => {
  promissionApplyAudit(id, Audit.Pass)
  applyList.value.splice(index, 1)
}
const refuse = (id: number, index: number) => {
  promissionApplyAudit(id, Audit.unPass)
  applyList.value.splice(index, 1)
}
const promissionApplyAudit = async (id: number, type: number) => {
  await share_api.promissionApplyAuditAPI({apply_id: id, approval_code: type})
}
let timer: any = null
getApplyList()
onMounted(() => {    
    timer = setInterval(() => {
        getApplyList()
    }, 60000)
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
          <span>文件访问申请</span>
          <el-button class="button" text>
            <div class="close"> X </div>
          </el-button>
        </div>
      </template>
      <div class="contain" ref="container">
         <!-- 文件名 -->
         <div class="unfounder">
          <span>申请人:</span>
          <p class="name bold">{{ item.user.nickname }}</p>
        </div>
         <!-- 创建者 -->
         <div class="unfounder">
          <span>访问文件:</span>
          <p class="name bold">{{ item.document.name }}</p>
        </div>
         <!-- 文档权限 -->
         <div class="unfounder">
          <span>权限:</span>
          <p class="name bold">{{permission[item.perm_type]}}</p>
        </div>
        <!-- <div class="textarea" v-if="props.remarks.trim().length">
          <span>备注:</span>
          <p class="text">{{props.remarks}}</p>
        </div> -->
        <!-- 链接按钮 -->
        <div class="button">
          <el-button color="#0d99ff" size="small" @click="consent(item.id, index)">同意</el-button>
          <el-button plain size="small" @click="refuse(item.id, index)">拒绝</el-button>
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
  margin-bottom: 10px;
}
</style>