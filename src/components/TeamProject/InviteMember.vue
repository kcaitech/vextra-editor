<template>
    <div class="card-container">
        <div class="heard">
            <div class="title">
                {{ t('inviteMember.title') }}
            </div>
            <div class="close" @click.stop="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="centent">
            <div class="permission-setting">
                <span>{{ t('inviteMember.permission_set') }}：</span>
                <input ref="inputselect" type="text" v-model="teamInvitePermission" @click.stop="openSelect"
                    placeholder="Select an option" :disabled="disabled" readonly />
                <div class="shrink" @click.stop="inputselect?.click()">
                    <svg-icon icon-class="down"
                        :style="{ transform: isSelectOpen ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666666' }"></svg-icon>
                </div>
                <transition name="el-zoom-in-top">
                    <ul v-show="isSelectOpen" class="options">
                        <li class="options_item" v-for="{ id, label } in options" :key="id"
                            @click.stop="selectOption(id, label)">
                            <span :style="{ fontWeight: label == teamInvitePermission ? 600 : 500 }">{{ label }}</span>
                            <div class="choose"
                                :style="{ visibility: label === teamInvitePermission ? 'visible' : 'hidden' }"></div>
                        </li>
                    </ul>
                </transition>
            </div>
            <div class="permission-tips">{{ t('inviteMember.permission_tips') }}</div>
            <div class="permission-text">
                <span> {{ t('inviteMember.permission_switch') }}</span>
                <el-switch v-model="teamInviteSwitch" class="ml-2" style="--el-switch-on-color: #1878F5" size="small"
                    @change="setTeamInviteSwitch(teamInviteSwitch)" :disabled="disabled" />
            </div>
            <input class="switch" v-if="teamInviteSwitch" type="text" v-model="teaminviteinfo" :disabled="disabled">
            <div class="permission-tips1">{{ t('inviteMember.permission_tipsA') }}</div>
        </div>
        <div class="invitemember">
            <button type="submit" :disabled="!teamInviteSwitch" @click.stop="copyText">{{ t('Createteam.copylink')
            }}</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'

interface teaminfotype {
    invited_perm_type: number,
    self_perm_type: number,
    invited_switch: boolean,
}

const { t } = useI18n();
// const emits = defineEmits(['close']);
const emits = defineEmits<{
    (e: 'close'): void
}>();
const { teamID } = inject('shareData') as {
    teamID: Ref<string>;
}

const isSelectOpen = ref<boolean>(false)
const inputselect = ref<HTMLInputElement>()

const teamInvitePermission = ref<any>()
const options = [{ id: 1, label: t('Createteam.projectPermsC') }, { id: 0, label: t('Createteam.projectPermsA') }]
const teamInviteSwitch = ref(false)
const teaminfo = ref<teaminfotype>()

const openSelect = () => {
    if (disabled.value) return
    isSelectOpen.value = !isSelectOpen.value;
}

const selectOption = (id: number, label: string) => {
    teamInvitePermission.value = label
    setTeamInvitePermission(id)
    isSelectOpen.value = false
}

const disabled = computed(() => {
    return (teaminfo.value?.self_perm_type === 0 || teaminfo.value?.self_perm_type === 1) ? true : false
})


const setTeamInvitePermission = async (value: number) => {
    try {
        const { code, message } = await user_api.Setteaminviteinfo({ team_id: teamID.value, invited_perm_type: value })
        if (code != 0) ElMessage.error(message)
    } catch (error) {

    }
}

const setTeamInviteSwitch = async (value: boolean) => {
    try {
        const { code, message } = await user_api.Setteaminviteinfo({ team_id: teamID.value, invited_switch: value })
        if (code != 0) ElMessage.error(message)
    } catch (error) {

    }
}

const Getteaminfo = async () => {
    try {
        const { code, data, message } = await user_api.Getteaminfo({ team_id: teamID.value })
        if (code === 0) {
            teaminfo.value = data
            if (teaminfo.value) {
                teamInvitePermission.value = options.find(item => item.id === teaminfo.value?.invited_perm_type)?.label
                teamInviteSwitch.value = teaminfo.value.invited_switch
            }
        } else {
            ElMessage.error(message)
        }
    } catch (error) {

    }
}

const teaminviteinfo = computed(() => {
    return `https://protodesign.cn/#/join?key=${teamInvitePermission.value}&teamid=${teamID.value}`
})

async function copyText() {
    try {
        await navigator.clipboard.writeText(teaminviteinfo.value);
        ElMessage.closeAll();
        ElMessage.success(t('inviteMember.copy_success'));
    } catch (error) {
        ElMessage.closeAll();
        ElMessage.error(t('inviteMember.copy_failure'));
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
@keyframes move {
    from {
        transform: translate(-50%, -20%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

.card-container {
    position: absolute;
    background-color: white;
    width: 420px;
    border-radius: 16px;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0%);
    padding: 0 24px;
    z-index: 1000;
    border: 1px solid #F0F0F0;
    box-sizing: border-box;
    animation: move 0.25s ease-in-out;

    .heard {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;

        .title {
            font-size: 16px;
            font-weight: 600;
            color: rgba(61, 61, 61, 1);
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

    .centent {
        display: flex;
        flex-direction: column;

        .permission-setting {
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            height: 40px;

            span {
                font-size: 13px;
                color: rgba(38, 38, 38, 1);
            }

            input {
                width: 122px;
                height: 32px;
                font-size: 12px;
                font-weight: 400;
                outline: none;
                border: none;
                border-radius: 6px;
                padding: 3px 3px 3px 12px;
                background: #F5F5F5;
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(235, 235, 235, 1);
                }

                &:focus {
                    background-color: rgba(235, 235, 235, 1);
                }

                &:disabled {
                    background-color: rgba(240, 240, 240, 1) !important;
                }
            }

            .shrink {
                position: absolute;
                display: flex;
                align-items: center;
                left: 175px;
                width: 12px;
                height: 12px;
                color: rgba(102, 102, 102, 1);

                svg {
                    transition: 0.5s;
                    width: 100%;
                    height: 100%;
                }
            }

            .options {
                position: absolute;
                top: 40px;
                left: 71px;
                padding: 0;
                margin: 0;
                width: 122px;
                background-color: white;
                border-radius: 8px;
                border: 1px solid #EBEBEB;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                z-index: 1;
                box-sizing: border-box;

                .options_item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 40px;
                    padding: 0 0 0 12px;

                    &:hover {
                        background-color: rgba(245, 245, 245, 1);
                    }

                    span {
                        font-size: 12px;
                        font-weight: 400;
                    }

                    .choose {
                        box-sizing: border-box;
                        width: 10px;
                        height: 6px;
                        margin-right: 4px;
                        margin-left: 2px;
                        border-width: 0 0 0.2em 0.2em;
                        border-style: solid;
                        border-color: rgb(0, 0, 0, .75);
                        transform: rotate(-45deg) translateY(-30%);
                    }
                }
            }
        }

        .permission-tips {
            display: flex;
            align-items: center;
            height: 38px;
            font-size: 12px;
            color: rgba(140, 140, 140, 1);
        }

        .permission-text {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 40px;

            span {
                font-size: 13px;
                color: rgba(38, 38, 38, 1);
            }

        }

        .switch {
            display: flex;
            align-items: center;
            height: 36px;
            width: 100%;
            padding: 7px 12px;
            outline-style: none;
            border: none;
            background-color: rgba(245, 245, 245, 1);
            border-radius: 6px;
            box-sizing: border-box;
        }

        .permission-tips1 {
            display: flex;
            align-items: center;
            height: 38px;
            font-size: 12px;
            color: rgba(38, 38, 38, 1);
        }
    }

    .invitemember {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;

        button {
            margin: auto;
            width: 214px;
            height: 40px;
            font-size: 14px;
            outline: none;
            border: none;
            border-radius: 6px;
            color: #FFFFFF;
            background: #1878F5;

            &:hover {
                background-color: rgba(66, 154, 255, 1);
            }

            &:active {
                background-color: rgba(10, 89, 207, 1);
            }

            &:disabled {
                background-color: rgba(189, 226, 255, 1);
            }
        }
    }
}
</style>
