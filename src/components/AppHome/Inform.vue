<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import * as share_api from '@/apis/share';
import * as team_api from '@/apis/team';
import { useI18n } from 'vue-i18n';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'reviewed'): void
}>()
const props = defineProps<{
  applyList: any,
  teamApplyList: any
}>()
const activeName = ref('fill')
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
const permissionTeam = ref([`${t('share.readOnly')}`, `${t('share.editable')}`])
enum Audit {
  unPass,
  Pass
}
const hoveredFillIndex = ref(-1);
const tooltipTillVisible = ref(true);
const fillnum = computed(() => {
  return props.applyList.filter((item: any) => item.apply.status === 0).length > 0
})
const teamnum = computed(() => {
  return props.teamApplyList.filter((item: any) => item.request.status === 0).length > 0
})

const formatDate = computed(() => {
  return function (value: string): string {
    const lang = localStorage.getItem('locale') || 'zh'
    moment.locale(mapDateLang.get(lang) || 'zh-cn');
    return filterDate(value);
  }
})

const filterDate = (time: string) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${moment(date).format("MMM Do")} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const consent = (id: string, item: any) => {
  promissionApplyAudit(id, Audit.Pass)
  item.apply.status = 1
}
const refuse = (id: string, item: any) => {
  promissionApplyAudit(id, Audit.unPass)
  item.apply.status = 2
}
const promissionApplyAudit = async (id: string, type: Audit) => {
  try {
    await share_api.promissionApplyAuditAPI({ apply_id: id, approval_code: type })
  } catch (error) {
    ElMessage({
      message: `${t('apply.authorization_failure')}`
    })
  }
}
const close = () => {
  emit('close')
}

const consentTeam = (id: string, index: number, item: any) => {
  if(item.team) {
    postTeamAudit(id, Audit.Pass)
  }else {
    postTeamProjectAudit(id, Audit.Pass)
  }
  item.request.status = 1
}
const refuseTeam = (id: string, index: number, item: any) => {
  if(item.team) {
    postTeamAudit(id, Audit.unPass)
  }else {
    postTeamProjectAudit(id, Audit.unPass)
  }
  item.request.status = 2
}

const postTeamProjectAudit = async (id: string, type: Audit) => {
  try {
    await team_api.postTeamProjectAuditAPI({apply_id: id, approval_code: type});
  }catch(err) {
    console.log(err);
  }
}
const postTeamAudit = async (id: string, type: Audit) => {
  try {
    await team_api.postTeamAuditAPI({apply_id: id, approval_code: type});
  }catch(err) {
    console.log(err);
  }
}

const showFillTooltip = (i: number) => {
  hoveredFillIndex.value = i;
  tooltipTillVisible.value = true;
}
const hideFillTooltip = () => {
  hoveredFillIndex.value = -1;
  tooltipTillVisible.value = false;
}
const scrollFill = () => {
  tooltipTillVisible.value = false;
}
const getAvatar = () => {
  return localStorage.getItem('avatar');
}
const getName = (user: any) => {
  if(user) {
    return user.nickname;
  }else {
    return localStorage.getItem('nickname');
  }
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
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane name="fill">
        <template #label>
          <span class="custom-tabs-label">
            <div v-if="fillnum"></div>
            <span>{{ t('apply.fill') }}</span>
          </span>
        </template>
        <div class="contain" v-if="activeName === 'fill'">
          <el-scrollbar height="400px" style="padding-right: 10px;" @scroll="scrollFill">
            <div class="inform-item" v-for="(item, i) in props.applyList" :key="i">
              <div class="avatar"><img :src="item.user.avatar" alt=""></div>
              <div class="item-container">
                <div class="item-title">
                  <span class="name">{{ item.user.nickname }}</span>
                  <span class="date">{{ formatDate(item.apply.created_at) }}</span>
                </div>
                <el-tooltip class="box-item" :enterable="false" effect="light" placement="bottom-end" :visible="hoveredFillIndex === i && tooltipTillVisible">
                  <template #content>
                    <div class="custom-tooltip">
                      {{ t('apply.application_documents') }}"{{ item.document.name }}"，{{ t('apply.authority') }}：{{
                        permission[item.apply.perm_type] }}，【{{ t('apply.remarks') }}】：{{ item.apply.applicant_notes }}
                    </div>
                  </template>
                  <div class="item-text" @mouseenter.stop="showFillTooltip(i)" @mouseleave.stop="hideFillTooltip">
                    {{ t('apply.application_documents') }}"{{ item.document.name }}"，{{ t('apply.authority') }}：{{
                      permission[item.apply.perm_type] }}，【{{ t('apply.remarks') }}】：{{ item.apply.applicant_notes }}</div>
                </el-tooltip>
              </div>
              <div class="botton" v-if="item.apply.status === 0">
                <el-button color="#0d99ff" size="small" @click="consent(item.apply.id, item)">{{ t('apply.agree')
                }}</el-button>
                <el-button plain size="small" style="margin-top: 5px;" @click="refuse(item.apply.id, item)">{{
                  t('apply.refuse') }}</el-button>
              </div>
              <div class="botton" v-else>
                <p v-if="item.apply.status === 1">{{ t('apply.have_agreed') }}</p>
                <p v-else-if="item.apply.status === 2">{{ t('apply.rejected') }}</p>
              </div>
            </div>
            <div class="text" v-if="props.applyList.length === 0"><span>{{ t('apply.no_message_received') }}</span></div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane name="team">
        <template #label>
          <span class="custom-tabs-label">
            <div v-if="teamnum"></div>
            <span>{{ t('apply.team') }}</span>
          </span>
        </template>
        <div class="contain" v-if="activeName === 'team'">
          <el-scrollbar height="400px" style="padding-right: 10px;" @scroll="scrollFill">
            <div class="inform-item" v-for="(item, i) in props.teamApplyList" :key="i">
              <div class="avatar"><img :src="item.user ? item.user.avatar : getAvatar()" alt=""></div>
              <div class="item-container">
                <div class="item-title">
                  <span class="name">{{ getName(item.user) }}</span>
                  <span class="date">{{ formatDate(item.request.created_at) }}</span>
                </div>
                <el-tooltip class="box-item" :enterable="false" effect="light" placement="bottom-end" :visible="hoveredFillIndex === i && tooltipTillVisible">
                  <template #content>
                    <div class="custom-tooltip" v-if="item.team && item.user">
                      {{ t('apply.apply_team') }}"{{ item.team.name }}"，{{ t('apply.authority') }}：{{
                        permissionTeam[item.request.perm_type] }}
                    </div>
                    <div class="custom-tooltip" v-else-if="item.project && item.user">
                      {{ t('apply.apply_project') }}"{{ item.project.name }}"，{{ t('apply.authority') }}：{{
                        permission[item.request.perm_type] }}
                    </div>
                  </template>
                  <div class="item-text" v-if="item.team && item.user" @mouseenter.stop="showFillTooltip(i)" @mouseleave.stop="hideFillTooltip">
                    {{ t('apply.apply_team') }}"{{ item.team.name }}"，{{ t('apply.authority') }}：{{
                      permissionTeam[item.request.perm_type] }}</div>
                  <div class="item-text"  v-else-if="item.project && item.user" @mouseenter.stop="showFillTooltip(i)" @mouseleave.stop="hideFillTooltip">
                    {{ t('apply.apply_project') }}"{{ item.project.name }}"，{{ t('apply.authority') }}：{{
                      permission[item.request.perm_type] }}</div>
                      <div class="item-text"  v-else-if="!item.user && item.request.status === 1">
                    欢迎加入{{ item.project ? '项目组' : '团队' }}: {{ item.project ? item.project.name : item.team.name }}</div>
                    <div class="item-text"  v-else-if="!item.user && item.request.status === 2">
                    申请加入{{ item.project ? '项目组' : '团队' }}"{{ item.project ? item.project.name : item.team.name }}"被拒绝，如有疑问，请联系项目组管理员</div>
                </el-tooltip>
              </div>
              <div class="botton" v-if="item.request.status === 0 && item.user">
                <el-button color="#0d99ff" size="small" @click="consentTeam(item.request.id, i, item)">{{ t('apply.agree')
                }}</el-button>
                <el-button plain size="small" style="margin-top: 5px;" @click="refuseTeam(item.request.id, i, item)">{{
                  t('apply.refuse') }}</el-button>
              </div>
              <div class="botton" v-else-if="!item.user"></div>
              <div class="botton" v-else>
                <p v-if="item.request.status === 1">{{ t('apply.have_agreed') }}</p>
                <p v-else-if="item.request.status === 2">{{ t('apply.rejected') }}</p>
              </div>
            </div>
            <div class="text" v-if="props.teamApplyList.length === 0"><span>{{ t('apply.no_message_received') }}</span>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__header) {
  border-bottom: none;
  padding: var(--default-padding-half) var(--default-padding);
  padding-bottom: 0;
}

:deep(.el-card__body) {
  padding: 0 var(--default-padding-quarter) var(--default-padding-half) var(--default-padding);
}

:deep(.el-button+.el-button) {
  margin-left: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  width: auto;
  right: 12px;
}

:deep(.el-tabs__item.is-active) {
  color: #000;
  font-weight: bold;
}

:deep(.el-tabs__item) {
  padding: 0 11px;
}

:deep(.el-tabs__item.is-top:last-child) {
  padding-right: 8px;
}

.el-button.is-text:not(.is-disabled):hover {
  background-color: #f3f0ff;
}

.custom-tabs-label {
  div {
    position: absolute;
    top: 10px;
    right: 5px;
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 50%;
  }
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
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.item-container {
  width: 180px;
  padding: var(--default-padding-half);

  .item-title {
    display: flex;
    justify-content: space-between;

    .date {
      width: auto;
    }

    .name {
      width: calc(100% - 90px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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
  top: 56px;
  right: 130px;
}
</style>