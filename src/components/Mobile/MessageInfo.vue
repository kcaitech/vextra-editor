<template>
    <div class="info">
        <div class="card-header">
            <span>{{ t('apply.notification_message') }}</span>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="back-icon"></svg-icon>
            </div>
        </div>
        <div class="botton">
            <div class="ms-botton-item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items"
                :key="index" @click.stop="clickEvent(index, $event)">
                {{ item }}
            </div>
            <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px' }"></div>
        </div>
        <div class="message-list">
            <!-- 文件消息列表 -->
            <div class="contain" v-if="itemid === 0">
                <div class="inform-item" v-for="(item, i) in props.applyList" :key="i">
                    <div class="item-title">
                        <div class="item-title-left">
                            <div class="avatar"><img :src="item.user.avatar" alt=""></div>
                            <span class="name">{{ item.user.nickname }}</span>
                            <span class="date">{{ formatDate(item.apply.created_at) }}</span>
                        </div>
                        <div class="item-title-right">
                            <div class="botton">
                                <span class="agreed" v-if="item.apply.status === 1">{{ t('apply.have_agreed') }}</span>
                                <span class="rejected" v-if="item.apply.status === 2">{{ t('apply.rejected') }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="item-text">
                        <div class="purview"><span>申请</span><span>「</span>{{ permission[item.apply.perm_type]
                            }}<span>」</span><span>「</span>{{
                item.document.name }}<span>」</span></div>
                        <div class="notes" v-if="item.apply.applicant_notes !== ''">
                            {{ t('apply.remarks') }}：{{ item.apply.applicant_notes }}
                        </div>
                    </div>
                    <div v-if="item.apply.status === 0" class="botton">
                        <button class="bnt_confirm" type="button" @click.stop="consent(item.apply.id, item)">
                            {{ t('apply.agree') }}
                        </button>
                        <button class="bnt_cancel" type="button" @click.stop="refuse(item.apply.id, item)">
                            {{ t('apply.refuse') }}
                        </button>
                    </div>
                </div>
                <div class="text" v-if="props.applyList.length === 0"><span>{{ t('apply.no_message_received')
                        }}</span>
                </div>
            </div>


            <!-- 团队消息列表 -->
            <div class="contain" v-if="itemid === 1">
                <div class="inform-item" v-for="(item, i) in props.teamApplyList" :key="i">

                    <div class="item-title">
                        <div class="item-title-left">
                            <div class="avatar"><img :src="item.approver ? item.approver.avatar : item.user.avatar"
                                    alt=""></div>
                            <span class="name">{{ getName(item) }}</span>
                            <span class="date">{{ formatDate(item.request.created_at) }}</span>
                        </div>
                        <div class="item-title-right">
                            <div class="botton">
                                <div class="agreed" v-if="item.request.status === 1">{{ t('apply.have_agreed') }}</div>
                                <div class="rejected" v-if="item.request.status === 2">{{ t('apply.rejected') }}</div>
                            </div>
                        </div>

                    </div>
                    <div v-if="item.team && item.user" class="item-text">
                        <div class="context">
                            <span>{{ t('apply.apply_team') }}</span>{{ item.team.name }}
                        <br>
                            <span>{{ t('apply.authority') }}</span>「{{ permissionTeam[item.request.perm_type] }}」
                        </div>

                    </div>
                    <div v-else-if="item.project && item.user" class="item-text">
                        <div class="context">
                            <span>{{ t('apply.apply_project') }}</span>{{ item.project.name }}
                            <br>
                            <span>{{ t('apply.authority') }}</span>「{{ permission[item.request.perm_type] }}」
                        </div>
                    </div>
                    <div v-else-if="!item.user && item.request.status === 1" class="item-text">
                        <div class="context">
                            <span>{{ t('Createteam.welcome') }}{{ item.project ? t('Createteam.project') :
                t('Createteam.team')
                                }}：</span> {{
                item.project ? item.project.name : item.team.name }}
                        </div>

                    </div>
                    <div v-else-if="!item.user && item.request.status === 2" class="item-text">
                        <div class="context">
                            {{ t('Createteam.rejectprompt1') }}
                            <span>您申请加入团队</span>
                            "{{ item.project ? item.project.name : item.team.name }}"
                            <br>
                            <span>{{ item.project ? t('Createteam.rejectprompt3') : t('Createteam.rejectprompt2')}}</span>
                        </div>
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
                </div>
                <div class="text" v-if="props.teamApplyList.length === 0"><span>{{ t('apply.no_message_received')
                        }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import moment = require('moment');
import 'moment/locale/zh-cn';
import { mapDateLang } from '@/utils/date_lang'
import { ElMessage } from 'element-plus';
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';

const { t } = useI18n()
const elwidth = ref()
const elleft = ref()
const items = [t('apply.fill'), t('apply.team')]
const itemid = ref<number>(Number(sessionStorage.getItem('message-tab')) || 0)
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`])
const permissionTeam = ref([`${t('share.readOnly')}`, `${t('share.editable')}`])
enum Audit {
    unPass,
    Pass
}


const emits = defineEmits<{
    (e: 'close'): void,
    (e: 'reviewed'): void
}>()

const props = defineProps<{
    applyList: any,
    teamApplyList: any,
    done?: boolean,
}>()

//同意文件申请
const consent = (id: string, item: any) => {
    promissionApplyAudit(id, Audit.Pass)
    item.apply.status = 1
}

//拒绝文件申请
const refuse = (id: string, item: any) => {
    promissionApplyAudit(id, Audit.unPass)
    item.apply.status = 2
}

//文件申请请求
const promissionApplyAudit = async (id: string, type: Audit) => {
    try {
        await share_api.promissionApplyAuditAPI({ apply_id: id, approval_code: type })
    } catch (error) {
        ElMessage({
            message: `${t('apply.authorization_failure')}`
        })
    }
}

//同意加入团队
const consentTeam = (id: string, index: number, item: any) => {
    if (item.team) {
        postTeamAudit(id, Audit.Pass)
    } else {
        postTeamProjectAudit(id, Audit.Pass)
    }
    item.request.status = 1
}

//拒绝加入团队
const refuseTeam = (id: string, index: number, item: any) => {
    if (item.team) {
        postTeamAudit(id, Audit.unPass)
    } else {
        postTeamProjectAudit(id, Audit.unPass)
    }
    item.request.status = 2
}

//项目申请请求
const postTeamProjectAudit = async (id: string, type: Audit) => {
    try {
        await team_api.postTeamProjectAuditAPI({ apply_id: id, approval_code: type });
    } catch (err) {
        console.log(err);
    }
}

//团队申请请求
const postTeamAudit = async (id: string, type: Audit) => {
    try {
        await team_api.postTeamAuditAPI({ apply_id: id, approval_code: type });
    } catch (err) {
        console.log(err);
    }
}

const clickEvent = (index: number, e: MouseEvent) => {
    itemid.value = index
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
    sessionStorage.setItem('message-tab', index.toString())
}

//获取item位置及宽度
function resizechange() {
    const items = document.querySelectorAll('.ms-botton-item')
    const rect = items[itemid.value].getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
}

const filterDate = (time: string) => {
    const date = new Date(time.replace(/-/g, '/').slice(0, 18));
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${moment(date).format("MMM Do")} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const formatDate = computed(() => {
    return function (value: string): string {
        const lang = localStorage.getItem('locale') || 'zh'
        moment.locale(mapDateLang.get(lang) || 'zh-cn');
        return filterDate(value).replace(/\s*/g, '');
    }
})

const getName = (item: any) => {
    if (item.approver) {
        return item.approver.nickname;
    } else if (item.user) {
        return item.user.nickname;
    } else {
        return localStorage.getItem('nickname');
    }
}

watch(() => props.done, (b) => {
    if (b) resizechange()
})

onMounted(() => {
    resizechange()
})

</script>

<style lang="scss" scoped>
.message-list {
    width: 100%;
    height: calc(100% - 76px);


    .contain {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        padding: 0 14px;
        box-sizing: border-box;
        font-size: 15px;
        font-weight: 500;

        .inform-item {
            width: 100%;
            height: auto;
            padding: 14px 0;
            display: flex;
            flex-direction: column;
            border-bottom: 1px solid var(--theme-color-line);
            gap: 4px;
            box-sizing: border-box;

            .item-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;

                .item-title-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    .avatar {
                        width: 32px;
                        min-width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;


                        >img {
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }

                    .date {
                        color: rgba(191, 191, 191, 1);
                        white-space: nowrap;
                    }

                    .name {
                        color: rgba(140, 140, 140, 1);
                        max-width: 120px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .item-title-right {
                    .botton {
                        white-space: nowrap;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-size: 13px;
                        gap: 8px;

                        .agreed {
                            color: rgba(191, 191, 191, 1);
                        }

                        .rejected {
                            color: rgba(255, 199, 199, 1);
                        }
                    }
                }


            }

            .item-text {
                overflow: hidden;
                display: flex;
                flex-direction: column;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
                word-break: break-all;

                .context{
                    color: #000000;
                    span{
                        color: #BFBFBF;
                    }
                }

                .purview {
                    color: rgba(0, 0, 0, 1);
                    line-height: 26px;

                    span {
                        color: #BFBFBF;
                    }
                }

                .notes {
                    line-height: 26px;
                    color: #8C8C8C;
                }
            }

            .botton {
                white-space: nowrap;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 8px;

                button {
                    cursor: pointer;
                    font-size: 13px;
                    width: 54px;
                    height: 32px;
                    border: none;
                    border-radius: 5px;
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



            .item-container {
                width: 205px;
                margin-bottom: 16px;




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
    }
}

.botton {
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .file,
    .team {
        width: 32px;
        text-align: center;
    }
}

.indicator {
    position: absolute;
    height: 2px;
    background-color: rgba(12, 111, 240, 1);
    bottom: -4px;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
}

.info {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 999;

    .card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;

        .close {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
