<template>
    <div class="card-container">
        <div class="heard">
            <div class="title">
                邀请同事加入团队
            </div>
            <div class="close" @click.stop="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="centent">
            <div class="permission-setting">
                <span>权限设置</span>
                <el-select class="select" v-model="teamInvitePermission" value-key="id" filterable
                    @change="setTeamInvitePermission(teamInvitePermission)" style="width: 120px;">
                    <el-option v-for="{ id, label } in options" :key="id" :value="id" :label="label" />
                </el-select>
            </div>
            <div class="permission-text">发送链接或二维码给同事申请加入</div>
            <div class="permission-text">
                <span> 邀请链接开关：</span>
                <el-switch v-model="teamInviteSwitch" class="ml-2" style="--el-switch-on-color: #9775fa" size="small"
                    @change="setTeamInviteSwitch(teamInviteSwitch)" />
            </div>
            <input class="switch" v-if="teamInviteSwitch" type="text" v-model="teaminviteinfo">
            <div class="permission-text" style="color: #666;">同事申请后，需管理员确认后才能加入</div>
        </div>
        <div class="invitemember">
            <button type="submit" :disabled="!teamInviteSwitch" @click.stop="copyText">复制链接</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'

interface teaminfotype {
    invited_perm_type: number,
    self_perm_type: number,
    invited_switch: boolean
}

const { t } = useI18n();
const emits = defineEmits(['close'])
const { teamID } = inject('shareData') as {
    teamID: Ref<string>;
}

const teamInvitePermission = ref<any>(1)
const options = [{ id: 1, label: '可编辑' }, { id: 0, label: '仅阅读' }]
const teamInviteSwitch = ref(false)
const teaminfo = ref<teaminfotype>()

const setTeamInvitePermission = async (value: number) => {
    try {
        const { code } = await user_api.Setteaminviteinfo({ team_id: teamID.value, invited_perm_type: value })
        if (code === 0) {
            ElMessage.success(value?.toString())
        } else {
            ElMessage.error('error')
        }
    } catch (error) {

    }
}

const setTeamInviteSwitch = async (value: boolean) => {
    try {
        const { code } = await user_api.Setteaminviteinfo({ team_id: teamID.value, invited_switch: value })
        if (code === 0) {
            ElMessage.success(value?.toString())
        } else {
            ElMessage.error('error')
        }
    } catch (error) {

    }
}

const Getteaminfo = async () => {
    try {
        const { code, data } = await user_api.Getteaminfo({ team_id: teamID.value })
        if (code === 0) {
            teaminfo.value = data
            if (teaminfo.value) {
                teamInvitePermission.value = teaminfo.value.invited_perm_type
                teamInviteSwitch.value = teaminfo.value.invited_switch
            }
        } else {
            ElMessage.error('获取失败')
        }
    } catch (error) {

    }
}

const teaminviteinfo = computed(() => {
    return `https://localhost:8080/zbb/#/join?key=${teamInvitePermission.value}&teamid=${teamID.value}`
})

async function copyText() {
    try {
        await navigator.clipboard.writeText(teaminviteinfo.value);
    } catch (error) {
        ElMessage.error("复制失败");
    }
}

const close = () => {
    emits('close')
}

onMounted(() => {
    Getteaminfo()
})

</script>
<style lang="scss" scoped>
.card-container {
    position: absolute;
    background-color: white;
    width: 480px;
    height: auto;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 16px 24px;
    z-index: 1000;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);

    .heard {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
            font-size: 24px;
            font-weight: 600;
            color: #3D3D3D
        }

        .close {
            width: 24px;
            height: 24px;
            padding: 4px;

            &:hover {
                background-color: #f3f0ff;
                border-radius: 3px;
                cursor: pointer;

                >svg {
                    fill: #9775fa;
                }
            }

            &:active>svg {
                transform: scale(0.9);
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .centent {
        margin-top: 12px;
        font-size: 14px;

        .permission-setting {
            margin-top: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            line-height: 24px;

            .select {
                margin-left: 8px;
            }
        }

        .permission-text,
        .switch {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            line-height: 24px;
        }

        .permission-text+.permission-text {
            margin-bottom: 6px;
        }

        .switch {
            outline-style: none;
            border: 1px solid #9775fa;
            height: 24px;
            width: 80%;
            border-radius: 2px;
            line-height: 24px;
        }
    }

    .invitemember {
        text-align: center;
        margin-top: 24px;

        button {
            cursor: pointer;
            color: white;
            font-size: 18px;
            letter-spacing: 2px;
            width: 120px;
            height: 48px;
            border: none;
            background-color: #9775fa;
            border-radius: 4px;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }

            &:active {
                background-color: #9775fa;
            }

            &:disabled {
                background-color: rgba(98, 67, 237, 0.3);
            }
        }
    }
}
</style>
