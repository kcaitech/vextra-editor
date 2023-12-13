<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
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
  teamApplyList: any,
  y?: number
  x?: number
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
    return filterDate(value).replace(/\s*/g, '');
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
  if (item.team) {
    postTeamAudit(id, Audit.Pass)
  } else {
    postTeamProjectAudit(id, Audit.Pass)
  }
  item.request.status = 1
}
const refuseTeam = (id: string, index: number, item: any) => {
  if (item.team) {
    postTeamAudit(id, Audit.unPass)
  } else {
    postTeamProjectAudit(id, Audit.unPass)
  }
  item.request.status = 2
}

const postTeamProjectAudit = async (id: string, type: Audit) => {
  try {
    await team_api.postTeamProjectAuditAPI({ apply_id: id, approval_code: type });
  } catch (err) {
    console.log(err);
  }
}
const postTeamAudit = async (id: string, type: Audit) => {
  try {
    await team_api.postTeamAuditAPI({ apply_id: id, approval_code: type });
  } catch (err) {
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
const getName = (item: any) => {
  if (item.approver) {
    return item.approver.nickname;
  } else if (item.user) {
    return item.user.nickname;
  } else {
    return localStorage.getItem('nickname');
  }
}
</script>

<template>
  <el-card class="box-card" :style="{ top: y + 'px', left: x + 'px' }">
    <!-- 标题 -->
    <template #header>
      <div class="card-header">
        <span>{{ t('apply.notification_message') }}</span>
        <div class="close" @click.stop="close">
          <svg-icon icon-class="close"></svg-icon>
        </div>
      </div>
    </template>
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane name="fill">
        <template #label>
          <span class="custom-tabs-label">
            <div class="messagetips" v-if="fillnum"></div>
            <span :style="{
              fontWeight: activeName === 'fill' ? 600 : '',
              color: activeName === 'fill' ? 'rgba(0, 0, 0, 1)' : ''
            }">
              {{ t('apply.fill') }}
            </span>
          </span>
        </template>
        <div class="contain" v-if="activeName === 'fill'">
          <el-scrollbar height="400px" @scroll="scrollFill">
            <div class="inform-item" v-for="(item, i) in props.applyList" :key="i">
              <div class="avatar"><img :src="item.user.avatar" alt=""></div>
              <div class="item-container">
                <div class="item-title">
                  <span class="name">{{ item.user.nickname }}</span>
                  <span class="date">{{ formatDate(item.apply.created_at) }}</span>
                </div>
                <el-tooltip class="box-item" :enterable="false" effect="light" placement="bottom-end"
                  :visible="hoveredFillIndex === i && tooltipTillVisible">
                  <template #content>
                    <div class="custom-tooltip">
                      {{ t('apply.application_documents') }}"{{ item.document.name }}"，{{ t('apply.authority') }}：{{
                        permission[item.apply.perm_type] }}，【{{ t('apply.remarks') }}】：{{ item.apply.applicant_notes }}
                    </div>
                  </template>
                  <div class="item-text" @mouseenter.stop="showFillTooltip(i)" @mouseleave.stop="hideFillTooltip">
                    <span>{{ t('apply.application_documents') }}</span>"{{ item.document.name }}"
                    <div class="purview">{{ permission[item.apply.perm_type] }}</div>
                    <div class="notes">{{ t('apply.remarks') }}{{ item.apply.applicant_notes }}</div>
                  </div>
                </el-tooltip>
              </div>
              <div class="botton" v-if="item.apply.status === 0">
                <button class="bnt_confirm" type="button" @click.stop="consent(item.apply.id, item)">
                  {{ t('apply.agree') }}
                </button>
                <button class="bnt_cancel" type="button" @click.stop="refuse(item.apply.id, item)">
                  {{ t('apply.refuse') }}
                </button>
              </div>
              <div class="botton" v-else>
                <p class="agreed" v-if="item.apply.status === 1">{{ t('apply.have_agreed') }}</p>
                <p class="rejected" v-else-if="item.apply.status === 2">{{ t('apply.rejected') }}</p>
              </div>
            </div>
            <div class="text" v-if="props.applyList.length === 0"><span>{{ t('apply.no_message_received') }}</span></div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      <el-tab-pane name="team">
        <template #label>
          <span class="custom-tabs-label">
            <div class="messagetips" v-if="teamnum"></div>
            <span :style="{
              fontWeight: activeName === 'team' ? 600 : '',
              color: activeName === 'fill' ? 'rgba(0, 0, 0, 1)' : ''
            }">
              {{ t('apply.team') }}
            </span>
          </span>
        </template>
        <div class="contain" v-if="activeName === 'team'">
          <el-scrollbar height="400px" @scroll="scrollFill">
            <div class="inform-item" v-for="(item, i) in props.teamApplyList" :key="i">
              <div class="avatar"><img :src="item.approver ? item.approver.avatar : item.user.avatar" alt=""></div>
              <div class="item-container">
                <div class="item-title">
                  <span class="name">{{ getName(item) }}</span>
                  <span class="date">{{ formatDate(item.request.created_at) }}</span>
                </div>
                <el-tooltip class="box-item" :enterable="false" effect="light" placement="bottom-end"
                  :visible="hoveredFillIndex === i && tooltipTillVisible">
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
                  <div class="item-text" v-if="item.team && item.user" @mouseenter.stop="showFillTooltip(i)"
                    @mouseleave.stop="hideFillTooltip">
                    <span>{{ t('apply.apply_team') }}</span>{{ item.team.name }}
                    <br>
                    <span>{{ t('apply.authority') }}</span>{{ permissionTeam[item.request.perm_type] }}
                  </div>
                  <div class="item-text" v-else-if="item.project && item.user" @mouseenter.stop="showFillTooltip(i)"
                    @mouseleave.stop="hideFillTooltip">
                    <span>{{ t('apply.apply_project') }}</span>{{ item.project.name }}
                    <br>
                    <span>{{ t('apply.authority') }}</span>{{ permission[item.request.perm_type] }}
                  </div>
                  <div class="item-text" v-else-if="!item.user && item.request.status === 1">
                    {{ t('Createteam.welcome') }}{{ item.project ? t('Createteam.project') : t('Createteam.team') }}: {{
                      item.project ? item.project.name : item.team.name }}
                  </div>
                  <div class="item-text" v-else-if="!item.user && item.request.status === 2">
                    {{ t('Createteam.rejectprompt1') }}<span>您申请加入团队</span>"{{ item.project ? item.project.name :
                      item.team.name }}"
                    <br>
                    <span>{{ item.project ? t('Createteam.rejectprompt3') : t('Createteam.rejectprompt2') }}</span>
                  </div>
                </el-tooltip>
              </div>
              <div class="botton" v-if="item.request.status === 0 && item.user">
                <button class="bnt_confirm" type="button" @click.stop="consentTeam(item.request.id, i, item)">
                  {{ t('apply.agree') }}
                </button>
                <button class="bnt_cancel" type="button" @click.stop="refuseTeam(item.request.id, i, item)">
                  {{ t('apply.refuse') }}
                </button>
              </div>
              <div class="botton" v-else-if="!item.user"></div>
              <div class="botton" v-else>
                <p class="agreed" v-if="item.request.status === 1">{{ t('apply.have_agreed') }}</p>
                <p class="rejected" v-else-if="item.request.status === 2">{{ t('apply.rejected') }}</p>
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
  border: none;
  padding: 0 12px;
  margin: 0;
}

:deep(.el-card__body) {
  padding: 0;
  margin: 0;
}

:deep(.el-tabs__header) {
  padding: 0;
  margin: 0 0 12px 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 12px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 0.1em;
}

:deep(.el-tabs__nav) {
  display: flex;
  gap: 32px;
}

:deep(.el-tabs__item) {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

:deep(.el-tabs__content) {
  padding: 0 12px;
  margin: 0;
}

.custom-tabs-label {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0px;
    left: -16px;
    right: -16px;
    bottom: 0px;
  }

  .messagetips {
    position: absolute;
    top: 6px;
    right: -2px;
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 50%;
  }

  span {
    font-size: 12px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 54px;

  span {
    font-size: 13px;
    font-weight: 600;
  }

  .close {
    width: 16px;
    height: 16px;
    padding: 4px;
    border-radius: 6px;

    &:hover {
      background-color: rgb(243, 243, 245);
      cursor: pointer;
    }

    svg {
      color: #262626;
      width: 100%;
      height: 100%;
    }
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

  // .scrollbar-demo-item {
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   height: 50px;
  //   margin: 10px;
  //   text-align: center;
  //   border-radius: 4px;
  //   background: var(--el-color-primary-light-9);
  //   color: var(--el-color-primary);

  // }
}

.inform-item {
  width: 100%;
  height: auto;
  display: flex;
  border-bottom: 1px solid var(--theme-color-line);
  margin-bottom: 16px;
  gap: 6px;

  .botton {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;

    .agreed {
      color: rgba(191, 191, 191, 1);
    }

    .rejected {
      color: rgba(255, 199, 199, 1);
    }

    button {
      cursor: pointer;
      font-size: 11px;
      width: 40px;
      height: 22px;
      border: none;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .bnt_confirm {
      color: white;
      background-color: rgba(24, 120, 245, 1);

      &:hover {
        background-color: rgba(66, 154, 255, 1);
      }

      &:active {
        background-color: rgba(10, 89, 207, 1);
      }
    }

    .bnt_cancel {
      color: rgba(51, 51, 51, 1);
      background-color: #FFFFFF;
      border: 1px solid #F0F0F0;

      &:hover {
        background-color: rgba(247, 247, 249, 1);
      }

      &:active {
        background-color: rgba(243, 243, 245, 1);
      }
    }
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
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #efefef;

  >img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.item-container {
  width: 205px;
  margin-bottom: 16px;

  .item-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 24px;
    gap: 4px;

    .date {
      color: rgba(191, 191, 191, 1);
      font-size: 12px;
      white-space: nowrap;
    }

    .name {
      color: rgba(140, 140, 140, 1);
      width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .item-text {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    // -webkit-line-clamp: 2;
    // line-clamp: 2;
    text-overflow: ellipsis;
    line-height: 24px;
    word-break: break-all;


    span {
      color: rgba(140, 140, 140, 1);
    }


    .purview {
      color: rgba(0, 0, 0, 1);
    }

    .notes {
      color: rgba(140, 140, 140, 1)
    }
  }
}

.box-card {
  width: 320px;
  z-index: 9;
  position: absolute;
  border-radius: 8px;
  box-sizing: border-box;
  overflow: visible;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);

  &::before {
    content: "";
    position: absolute;
    clear: both;
    top: -6px;
    right: 60px;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 10px solid #fff;
    filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.12));
  }

}
</style>