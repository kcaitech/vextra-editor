<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
import { useRoute } from 'vue-router';
const { t } = useI18n();
const route = useRoute();
const applyList: any = ref([]);
const projectApplyList = ref<any[]>([]);
const teamApplyList = ref<any[]>([]);
const container = ref<HTMLDivElement>();

enum Audit {
  unPass,
  Pass
}
const timestamp = Date.now()
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`]);
const teamPermission = ref([`${t('share.readOnly')}`, `${t('share.editable')}`]);
const getApplyList = async (time?: number) => {
  try {
    const { data } = await share_api.getApplyListAPI({ start_time: time })
    if (data) applyList.value = [...applyList.value, ...data]
  } catch (e) {
    console.log(e)
  }
}

const getProjectApplyList = async (time?: number) => {
    try {
        const { data } = await team_api.getTeamProjectApplyAPI({ start_time: time })
        if (data) projectApplyList.value = [...projectApplyList.value, ...data]
    } catch (e) {
        console.log(e)
    }
}

const getTeamApply = async (time?: number) => {
    try {
        const { data } = await team_api.getTeamApplyAPI({ start_time: time })
        if (data) teamApplyList.value = [...teamApplyList.value, ...data]
    } catch (e) {
        console.log(e)
    }
}

const consent = (id: string, index: number, action: string) => {
  if (action === 'fill') {
    promissionApplyAudit(id, Audit.Pass);
    applyList.value.splice(index, 1);
  } else if (action === 'project') {
    postTeamProjectAudit(id, Audit.Pass)
    projectApplyList.value.splice(index, 1);
  } else if (action === 'team') {
    postTeamAudit(id, Audit.Pass);
    teamApplyList.value.splice(index, 1);
  }
}
const refuse = (id: string, index: number, action: string) => {
  if (action === 'fill') {
    promissionApplyAudit(id, Audit.unPass);
    applyList.value.splice(index, 1);
  } else if (action === 'project') {
    postTeamProjectAudit(id, Audit.unPass);
    projectApplyList.value.splice(index, 1);
  } else if (action === 'team') {
    postTeamAudit(id, Audit.unPass);
    teamApplyList.value.splice(index, 1);
  }
}

// 申请审核
const promissionApplyAudit = async (id: string, type: number) => {
  await share_api.promissionApplyAuditAPI({ apply_id: id, approval_code: type })
}
const postTeamProjectAudit = async (id: string, type: number) => {
  await team_api.postTeamProjectAuditAPI({ apply_id: id, approval_code: type })
}
const postTeamAudit = async (id: string, type: number) => {
  await team_api.postTeamAuditAPI({ apply_id: id, approval_code: type })
}

const close = (index: number, action: string) => {
  if (action === 'fill') {
    applyList.value.splice(index, 1);
  } else if (action === 'project') {
    projectApplyList.value.splice(index, 1);
  } else if (action === 'team') {
    teamApplyList.value.splice(index, 1);
  }
}
let timer: any = null
// 
getApplyList(timestamp);
getProjectApplyList(timestamp);
getTeamApply(timestamp);
onMounted(() => {
  timer = setInterval(() => {
    getApplyList(timestamp);
    getProjectApplyList(timestamp);
    getTeamApply(timestamp);
  }, 10000)
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<template>
  <!-- 文件访问申请 -->
  <div v-for="(item, index) in applyList" :key="index">
    <el-card class="box-card" ref="card">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('apply.file_access_request') }}</span>
          <!--          <el-button class="button" text @click="close(index, 'fill')">-->
          <!--            <div class="close"> X </div>-->
          <!--          </el-button>-->
          <div class="close" @click="close(index, 'fill')">
            <svg-icon icon-class="close"></svg-icon>
          </div>
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
          <p class="name bold">{{ permission[item.apply.perm_type] }}</p>
        </div>
        <div class="textarea" v-if="item.apply.applicant_notes.trim().length">
          <span class="remarks">{{ t('apply.remarks') }}:</span>
          <div class="text"><span>{{ item.apply.applicant_notes }}</span></div>
        </div>
        <!-- 链接按钮 -->
        <div class="button">
          <!--          <el-button color="#0d99ff" size="small" @click="consent(item.apply.id, index, 'fill')">{{ t('apply.agree')-->
          <!--          }}</el-button>-->
          <!--          <el-button plain size="small" @click="refuse(item.apply.id, index, 'fill')">{{ t('apply.refuse') }}</el-button>-->
          <button class="refuse" @click="refuse(applyList[0].apply.id, index, 'fill')">
            <span style="font-size: 14px;font-weight: 500;color: #262626">{{ t('apply.refuse') }}</span>
          </button>
          <button class="agree" @click="consent(applyList[0].apply.id, index, 'fill')">
            <span style="font-size: 14px;font-weight: 500;color: #FFFFFF">{{ t('apply.agree') }}</span>
          </button>
        </div>
      </div>
    </el-card>
  </div>
  <!-- 团队项目申请 -->
  <div v-for="(item, index) in projectApplyList" :key="index">
    <el-card class="box-card" ref="card">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('apply.project_apply') }}</span>
          <!--          <el-button class="button" text @click="close(index, 'project')">-->
          <!--            <div class="close"> X </div>-->
          <!--          </el-button>-->
          <div class="close" @click="close(index, 'project')">
            <svg-icon icon-class="close"></svg-icon>
          </div>
        </div>
      </template>
      <div class="contain" ref="container">
        <!-- 文件名 -->
        <div class="unfounder">
          <span>{{ t('apply.applicant') }}:</span>
          <p class="name bold">{{ item.user.nickname }}</p>
        </div>
        <!-- 项目名 -->
        <div class="unfounder">
          <span>{{ t('apply.project') }}:</span>
          <p class="name bold">{{ item.project.name }}</p>
        </div>
        <!-- 文档权限 -->
        <div class="unfounder">
          <span>{{ t('apply.authority') }}:</span>
          <p class="name bold">{{ permission[item.request.perm_type] }}</p>
        </div>
        <!-- 链接按钮 -->
        <div class="button">
          <!--          <el-button color="#0d99ff" size="small" @click="consent(item.request.id, index, 'project')">{{ t('apply.agree')-->
          <!--          }}</el-button>-->
          <!--          <el-button plain size="small" @click="refuse(item.request.id, index, 'project')">{{ t('apply.refuse')-->
          <!--          }}</el-button>-->
          <button class="refuse" @click="consent(item.request.id, index, 'project')">
            <span style="font-size: 14px;font-weight: 500;color: #262626">{{ t('apply.refuse') }}</span>
          </button>
          <button class="agree" @click="refuse(item.request.id, index, 'project')">
            <span style="font-size: 14px;font-weight: 500;color: #FFFFFF">{{ t('apply.agree') }}</span>
          </button>
        </div>
      </div>
    </el-card>
  </div>
  <!-- 团队申请 -->
  <div v-for="(item, index) in teamApplyList" :key="index">
    <el-card class="box-card" ref="card">
      <!-- 标题 -->
      <template #header>
        <div class="card-header">
          <span>{{ t('apply.team_apply') }}</span>
          <!--          <el-button class="button" text @click="close(index, 'team')">-->
          <!--            <div class="close"> X </div>-->
          <!--          </el-button>-->
          <div class="close" @click="close(index, 'team')">
            <svg-icon icon-class="close"></svg-icon>
          </div>
        </div>
      </template>
      <div class="contain" ref="container">
        <!-- 文件名 -->
        <div class="unfounder">
          <span>{{ t('apply.applicant') }}:</span>
          <p class="name bold">{{ item.user.nickname }}</p>
        </div>
        <!-- 项目名 -->
        <div class="unfounder">
          <span>{{ t('apply.team') }}:</span>
          <p class="name bold">{{ item.team.name }}</p>
        </div>
        <!-- 文档权限 -->
        <div class="unfounder">
          <span>{{ t('apply.authority') }}:</span>
          <p class="name bold">{{ teamPermission[item.request.perm_type] }}</p>
        </div>
        <!-- 链接按钮 -->
        <div class="button">
          <!--          <el-button color="#0d99ff" size="small" @click="consent(item.request.id, index, 'team')">{{ t('apply.agree')-->
          <!--          }}</el-button>-->
          <!--          <el-button plain size="small" @click="refuse(item.request.id, index, 'team')">{{ t('apply.refuse')-->
          <!--          }}</el-button>-->
          <button class="refuse" @click="consent(item.request.id, index, 'team')">
            <span style="font-size: 14px;font-weight: 500;color: #262626">{{ t('apply.refuse') }}</span>
          </button>
          <button class="agree" @click="refuse(item.request.id, index, 'team')">
            <span style="font-size: 14px;font-weight: 500;color: #FFFFFF">{{ t('apply.agree') }}</span>
          </button>
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
  height: 16px;

  span {
    font-size: 16px;
    font-weight: var(--font-default-bold);
    line-height: 16px;
    color: #3D3D3D;
    font-family: HarmonyOS Sans;
  }

  .close {
    width: 16px;
    height: 16px;

    >svg {
      width: 16px;
      height: 16px;
    }
  }

}

:deep(.el-card__header) {
  border-bottom: none;
  padding: 24px;
  box-sizing: border-box;
  height: 64px;
}

:deep(.el-card__body) {
  padding: 0 24px 8px 24px;
}

.contain {

  .button {
    display: flex;
    justify-content: center;
    height: 60px;
    padding: 12px 0;
    box-sizing: border-box;

    .refuse {
      width: 100px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 8px 14px;
      gap: 4px;
      background: #FFFFFF;
      box-sizing: border-box;
      border: 1px solid #F0F0F0;
      margin-right: 16px
    }

    .agree {
      width: 100px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 8px 14px;
      gap: 4px;
      background: #1878F5;
      border: none;
    }
  }
}

.unfounder {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 6px 0;
  box-sizing: border-box;

  span {
    display: block;
    width: 65px;
    font-size: 13px;
    line-height: 24px;
    color: #8C8C8C;
  }

  >.name {
    height: 24px;
    font-family: HarmonyOS Sans;
    font-size: 13px;
    line-height: 24px;
    color: #000000;
    margin: 0;
  }

  >.bold {
    font-weight: 500;
  }
}

.textarea {
  display: flex;
  min-height: 36px;
  max-height: 72px;
  height: auto;
  margin: 6px 0;
  box-sizing: border-box;

  >span {
    display: block;
    width: 65px;
    font-family: HarmonyOS Sans;
    font-size: 13px;
    line-height: 24px;
    color: #8C8C8C;
  }

  >.text {
    width: calc(100% - 65px);
    font-family: HarmonyOS Sans;
    font-size: 13px;
    font-weight: 500;
    line-height: 24px;
    color: #8C8C8C;

    span {
      max-height: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
  }
}

.box-card {
  width: 380px;
  margin-right: 5px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.08);
}
</style>