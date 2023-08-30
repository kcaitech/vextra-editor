<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import * as share_api from '@/apis/share';
import * as team_api from '@/apis/team';
import { useRoute } from 'vue-router';
const { t } = useI18n();
const route = useRoute();
const applyList: any = ref([]);
const teamApplyList: any = ref([{
            "user": {
                "id": "1672502400000",
                "nickname": "1",
                "avatar": "https://storage.protodesign.cn/af78d7g98d.png"
            },
            "team": {
                "id": "1672502400000",
                "name": "团队A",
                "invited_perm_type": 0,
                "created_at": "2023-04-25 11:39:21.678000",
                "avatar": "https://storage.protodesign.cn/files/teams/ab4c48c0-7472-46e1-9ddb-ff44ed4960ae/avatar/9e75b522-277b-4dcf-a209-4d43d4f27d24.png",
                "description": "团队A介绍"
            },
            "request": {
                "created_at": "2023-04-25 11:39:21.678000",
                "id": "1672502400000",
                "first_displayed_at": "2023-04-25 11:39:21.678000",
                "status": 0,
                "applicant_notes": "我是xxx，需要看一下这份文档，请通过",
                "processor_notes": "予以通过",
                "processed_at": "2023-04-25 11:39:21.678000",
                "perm_type": 1,
                "user_id": "1672502400000",
                "team_id": "1672502400000"
            }
        },
        {
            "user": {
                "id": "1672502400000",
                "nickname": "1",
                "avatar": "https://storage.protodesign.cn/af78d7g98d.png"
            },
            "team": {
                "id": "1672502400000",
                "name": "团队A",
                "invited_perm_type": 0,
                "created_at": "2023-04-25 11:39:21.678000",
                "description": "团队A介绍",
                "avatar": "https://storage.protodesign.cn/files/teams/ab4c48c0-7472-46e1-9ddb-ff44ed4960ae/avatar/9e75b522-277b-4dcf-a209-4d43d4f27d24.png"
            },
            "request": {
                "created_at": "2023-04-25 11:39:21.678000",
                "id": "1672502400000",
                "first_displayed_at": "2023-04-25 11:39:21.678000",
                "status": 0,
                "applicant_notes": "我是xxx，需要看一下这份文档，请通过",
                "processor_notes": "予以通过",
                "processed_at": "2023-04-25 11:39:21.678000",
                "perm_type": 1,
                "user_id": "1672502400000",
                "team_id": "1672502400000"
            }
        }]);
const projectApplyList: any = ref([ {
            "user": {
                "id": "1672502400000",
                "nickname": "1",
                "avatar": "https://storage.protodesign.cn/af78d7g98d.png"
            },
            "project": {
                "id": "1672502400000",
                "name": "项目1",
                "public_switch": false,
                "public_perm_type": 1,
                "team_id": "1672502400000",
                "description": "项目1介绍"
            },
            "request": {
                "created_at": "2023-04-25 11:39:21.678000",
                "id": "1672502400000",
                "first_displayed_at": "2023-04-25 11:39:21.678000",
                "status": 0,
                "applicant_notes": "我是xxx，需要看一下这份文档，请通过",
                "processor_notes": "予以通过",
                "processed_at": "2023-04-25 11:39:21.678000",
                "perm_type": 1,
                "user_id": "1672502400000",
                "team_id": "1672502400000"
            }
        },
        {
            "user": {
                "id": "1672502400000",
                "nickname": "1",
                "avatar": "https://storage.protodesign.cn/af78d7g98d.png"
            },
            "project": {
                "id": "1672502400000",
                "name": "项目1",
                "public_switch": false,
                "public_perm_type": 1,
                "team_id": "1672502400000",
                "description": "项目1介绍"
            },
            "request": {
                "created_at": "2023-04-25 11:39:21.678000",
                "id": "1672502400000",
                "first_displayed_at": "2023-04-25 11:39:21.678000",
                "status": 0,
                "applicant_notes": "我是xxx，需要看一下这份文档，请通过",
                "processor_notes": "予以通过",
                "processed_at": "2023-04-25 11:39:21.678000",
                "perm_type": 1,
                "user_id": "1672502400000",
                "team_id": "1672502400000"
            }
        }]);
const container = ref<HTMLDivElement>();

enum Audit {
  unPass,
  Pass
}
const timestamp = Date.now()
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`]);
const teamPermission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.editable')}`]);
const getApplyList = async (time?: number) => {
  const { data } = await share_api.getApplyListAPI({ doc_id: route.query.id, start_time: time })
  applyList.value = [...applyList.value, ...data]
}

const getProjectApplyList = async (time?: number) => {
  const { data } = await team_api.getTeamProjectApplyAPI({ start_time: time })
  projectApplyList.value = [...projectApplyList.value, ...data]
}

const getTeamApply = async (time?: number) => {
  const { data } = await team_api.getTeamApplyAPI({ start_time: time })
  teamApplyList.value = [...teamApplyList.value, ...data]
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
          <el-button class="button" text @click="close(index, 'fill')">
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
          <p class="name bold">{{ permission[item.apply.perm_type] }}</p>
        </div>
        <div class="textarea" v-if="item.apply.applicant_notes.trim().length">
          <span class="remarks">{{ t('apply.remarks') }}:</span>
          <p class="text">{{ item.apply.applicant_notes }}</p>
        </div>
        <!-- 链接按钮 -->
        <div class="button">
          <el-button color="#0d99ff" size="small" @click="consent(item.apply.id, index, 'fill')">{{ t('apply.agree')
          }}</el-button>
          <el-button plain size="small" @click="refuse(item.apply.id, index, 'fill')">{{ t('apply.refuse') }}</el-button>
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
          <span>{{ t('apply.team_apply') }}</span>
          <el-button class="button" text @click="close(index, 'project')">
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
          <el-button color="#0d99ff" size="small" @click="consent(item.request.id, index, 'project')">{{ t('apply.agree')
          }}</el-button>
          <el-button plain size="small" @click="refuse(item.request.id, index, 'project')">{{ t('apply.refuse')
          }}</el-button>
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
          <span>{{ t('apply.project_apply') }}</span>
          <el-button class="button" text @click="close(index, 'team')">
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
          <el-button color="#0d99ff" size="small" @click="consent(item.request.id, index, 'team')">{{ t('apply.agree')
          }}</el-button>
          <el-button plain size="small" @click="refuse(item.request.id, index, 'team')">{{ t('apply.refuse')
          }}</el-button>
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