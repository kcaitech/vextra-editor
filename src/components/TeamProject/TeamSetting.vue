<template>
    <div class="set-container" style="height: calc(100vh - 208px);">
        <el-scrollbar height="100%">
            <div class="name-container">
                <div class="left">
                    <div class="title">{{ t('teamsetting.team_name') }}</div>
                    <div class="text">{{ teamName }}</div>
                </div>
                <div v-if="isDisabled" class="right">
                    <button type="button" @click.stop="midname">{{ t('teamsetting.edit_name')
                    }}</button>
                </div>
            </div>
            <div class="description-container">
                <div class="left">
                    <div class="title">{{ t('teamsetting.team_description') }}</div>
                    <div class="text">{{ teamDescription }}</div>
                </div>
                <div v-if="isDisabled" class="right">
                    <button type="button" @click.stop="middescription">{{
                        t('teamsetting.edit_description') }}</button>
                </div>

            </div>
            <div class="avatar-container">
                <div class="left">
                    <div class="title">{{ t('teamsetting.team_avatar') }}</div>
                    <div class="text">{{ t('teamsetting.avatar_restriction') }}</div>
                </div>
                <div v-if="isDisabled" class="right">
                    <label class="modify" for="image_uploads">{{
                        t('teamsetting.edit_avatar') }}</label>
                    <input type="file" id="image_uploads" name="image_uploads" accept=".jpg, .jpeg, .png"
                        style="display: none;" @change="midAvatarRequest($event)" />
                </div>
            </div>
            <div v-if="teamSelfPermType === 3" class="dissolve-container">
                <div class="left">
                    <div class="title">{{ t('teamsetting.disband_team') }}</div>
                    <div class="text">{{ t('teamsetting.disband_team_tips') }}</div>
                </div>
                <div class="right">
                    <button class="disband" type="button" @click.stop="dissolveteam">{{ t('teamsetting.disband_team')
                    }}</button>
                </div>
            </div>
            <div v-else class="leave-container">
                <div class="left">
                    <div class="title">{{ t('teamsetting.leave_team') }}</div>
                    <div class="text">{{ t('teamsetting.leave_team_tips') }}</div>
                </div>
                <div class="right">
                    <button class="disband" type="button" @click.stop="leaveteam">{{ t('teamsetting.leave_team') }}</button>
                </div>
            </div>
        </el-scrollbar>
    </div>
    <div v-if="showoverlay" class="overlay" @keyup.esc="showoverlay = false">
        <div class="card-container">
            <div class="heard">
                <div class="title" v-text="titlevalue"></div>
                <div class="close" @click.stop="showoverlay = false">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
            <div class="centent">
                <div class="textarea-container">
                    <textarea v-if="!(titlevalue === t('teamsetting.title_name1'))" class="text-textarea"
                        :placeholder="placeholdervalue" v-model="textareaValue" :maxlength="maxvalue"></textarea>
                    <input v-else class="text-input" type="text" v-model="textareaValue" :maxlength="maxvalue" required>
                </div>
            </div>
            <div class="addproject">
                <button class="bnt_cancel" type="submit" @click.stop.once="showoverlay = false">{{
                    t('teamsetting.cancel')
                }}</button>
                <button class="bnt_confirm" type="submit" @click.stop="confirm" :disabled="textareaValue === ''">
                    {{ t('teamsetting.confirm') }}
                </button>
            </div>
        </div>
    </div>
    <ProjectDialog :projectVisible="showDialog" :context="contenttext" :title="titlevalue"
        :confirm-btn="teamSelfPermType === 3 ? t('teamsetting.disband') : t('teamsetting.leave')"
        @clode-dialog="closeDisband" @confirm="confirmQuit"></ProjectDialog>
</template>
<script setup lang="ts">
import { Ref, computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/request/users'
import { router } from '@/router';
import { ElMessage } from 'element-plus';
import ProjectDialog from './ProjectDialog.vue';

const { t } = useI18n();
const titlevalue = ref('')
const placeholdervalue = ref('')
const formData = new FormData()
const showoverlay = ref(false)
const textareaValue = ref('')
const textareashow = ref(true)
const maxvalue = ref(0)
const contenttext = ref('')
const showDialog = ref(false)

const { teamID, teamName, teamDescription, teamSelfPermType, teamData, upDateTeamData, is_team_upodate, teamUpdate } = inject('shareData') as {
    teamID: Ref<string>;
    teamName: Ref<string>;
    teamDescription: Ref<string>;
    teamSelfPermType: Ref<number>;
    teamData: Ref<any[]>;
    upDateTeamData: (data: any[]) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;

}

interface TeamData {
    id: string,
    avatar: string,
    name: string,
    description: string
}

interface teamDataType {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const isDisabled: any = computed(() => {
    return (teamSelfPermType.value < 3 && teamSelfPermType.value !== 255) ? false : true
})


//获取元素，设置焦点并全选内容
const el = () => {
    const el = document.querySelector('.text-textarea') as HTMLTextAreaElement
    el.focus()
    el.select()
}

const el2 = () => {
    const el = document.querySelector('.text-input') as HTMLTextAreaElement
    el.focus()
    el.select()
}
//关闭弹窗
const closeDisband = () => {
    showDialog.value = false;
}
const confirmQuit = () => {
    if (titlevalue.value === '解散团队') {
        disband(teamID.value)
    } else {
        leave(teamID.value)
    }
}

//将修改的新值替换到teamData数组，返回修改后的新数组，重新渲染
const midDateTeamData = (teamData: Array<teamDataType>, id: string, updates: Partial<TeamData>) => {
    const newTeamData = teamData.map((item) => {
        if (item.team.id === id) {
            return { ...item, team: { ...item.team, ...updates } }
        }
        return item
    })
    return newTeamData
}

//修改团队名称
const midNameRequest = async () => {
    if (!textareaValue.value) return
    formData.append('name', textareaValue.value)
    try {
        const { code, message } = await user_api.Setteaminfo(formData)
        if (code === 0) {
            upDateTeamData(midDateTeamData(teamData.value, teamID.value, { name: textareaValue.value }))
            teamUpdate(!is_team_upodate.value)
            showoverlay.value = false
            formData.delete('name')
        } else {
            ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder') : message)
            formData.delete('name')
        }
    } catch (error) {

    }


}

//修改团队头像
const midAvatarRequest = async (e: any) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0]
        const fileName = file.name
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
        const maxSizeInBytes = 5 * 1024 * 1024; // 2MB
        if (file && file.size <= maxSizeInBytes && e.target.accept.includes(fileExtension)) {
            formData.append('avatar', file)
            try {
                const { code, message, data } = await user_api.Setteaminfo(formData)
                if (code === 0) {
                    upDateTeamData(midDateTeamData(teamData.value, teamID.value, { avatar: data.avatar }))
                    teamUpdate(!is_team_upodate.value)
                    formData.delete('avatar')
                } else {
                    ElMessage.error(message === '头像审核不通过' ? t('system.sensitive_reminder') : message)
                    formData.delete('avatar')
                }
            } catch (error) {
                ElMessage.error('修改失败')
            }
        } else {
            ElMessage.error(t('percenter.errortips'))
        }
    }
}

//修改团队描述
const midDescriptionRequest = async () => {
    if (!textareaValue.value) return
    formData.append('description', textareaValue.value)
    try {
        const { code, message } = await user_api.Setteaminfo(formData)
        if (code === 0) {
            upDateTeamData(midDateTeamData(teamData.value, teamID.value, { description: textareaValue.value }))
            teamUpdate(!is_team_upodate.value)
            formData.delete('description')
            showoverlay.value = false
        } else {
            ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder') : message)
            formData.delete('description')
        }
    } catch (error) {

    }
}

//解散团队
const disband = async (id: string) => {
    try {
        const { code, message } = await user_api.Disbandteam({ team_id: id })
        if (code === 0) {
            upDateTeamData(teamData.value.filter(item => item.team.id != id))
            teamUpdate(!is_team_upodate.value)
            router.push({ name: 'recently' })
            sessionStorage.setItem('index', '1')
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {

    }
}

//离开团队
const leave = async (id: string) => {
    try {
        const { code, message } = await user_api.Leaveteam({ team_id: id })
        if (code === 0) {
            router.push({ name: 'recently' })
            sessionStorage.setItem('index', '1')
            upDateTeamData(teamData.value.filter(item => item.team.id != id))
            teamUpdate(!is_team_upodate.value)
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {

    }
}


const midname = () => {
    showoverlay.value = true
    textareashow.value = true
    titlevalue.value = t('teamsetting.title_name1')
    textareaValue.value = teamName.value
    maxvalue.value = 20
    nextTick(() => el2())
}

const middescription = () => {
    showoverlay.value = true
    textareashow.value = true
    titlevalue.value = t('teamsetting.title_name2')
    textareaValue.value = teamDescription.value
    maxvalue.value = 120
    nextTick(() => el())
}

const dissolveteam = () => {
    showDialog.value = true
    textareashow.value = false
    titlevalue.value = t('teamsetting.title_name3')
    contenttext.value = t('teamsetting.disband_team_tipsB')
}

const leaveteam = () => {
    showDialog.value = true
    textareashow.value = false
    titlevalue.value = t('teamsetting.title_name4')
    contenttext.value = t('teamsetting.leave_team_tips')
}

const confirm = () => {
    switch (titlevalue.value) {
        case '修改团队名称':
            return midNameRequest()
        case '修改团队描述':
            return midDescriptionRequest()
        case '解散团队':
            return disband(teamID.value)
        case '离开团队':
            return leave(teamID.value)
        default:
            return
    }
}

watch(teamID, () => {
    formData.delete('team_id')
    formData.append('team_id', teamID.value)
})

onMounted(() => {
    formData.append('team_id', teamID.value)
})

</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

@media (max-height: 220px) {
    .card-container {
        height: 100%;
        overflow: auto !important;
        animation: none !important;
    }
}

@media (max-width: 420px) {
    .card-container {
        width: 100% !important;
        overflow: auto !important;
    }
}

@keyframes move {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translate(0);
        opacity: 1;
    }
}

.card-container {
    position: absolute;
    width: 420px;
    padding: 0 24px;
    transform: translateY(0);
    background-color: white;
    border-radius: 14px;
    border: 1px solid #F0F0F0;
    box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    animation: move 0.25s ease-in-out;
    z-index: 1000;

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
            display: flex;
            width: 28px;
            height: 28px;
            padding: 6px;
            border-radius: 6px;
            box-sizing: border-box;

            &:hover {
                background-color: rgba(245, 245, 245, 1);
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .centent {
        .textarea-container {

            .text-input,
            .text-textarea {
                width: 100%;
                padding: 7px 12px;
                font-size: 13px;
                background-color: rgba(245, 245, 245, 1);
                outline-style: none;
                resize: none;
                border-radius: 6px;
                border: 1px solid rgba(245, 245, 245, 1);
                font-family: none;
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(235, 235, 235, 1);
                }

                &:focus {
                    border: 1px solid #1878F5;
                    background-color: rgba(245, 245, 245, 1);
                }
            }

            .text-input {
                height: 36px;
            }

            .text-textarea {
                height: 80px;
            }
        }
    }

    .addproject {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 11px;
        height: 64px;

        button {
            cursor: pointer;
            font-size: 13px;
            width: 70px;
            height: 36px;
            border: none;
            border-radius: 6px;
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

            &:disabled {
                background-color: #BDE2FF !important;
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

.set-container {
    margin: 0 8px;

    .name-container,
    .description-container,
    .avatar-container,
    .dissolve-container,
    .leave-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 89px;
        gap: 20px;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;

        .left {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .title {
                font-size: 14px;
                font-weight: 600;
                color: #000000;
            }

            .text {
                line-height: 20px;
                font-size: 13px;
                font-weight: 400;
                color: #808080;
            }
        }

        .right button,
        .modify {
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(51, 51, 51, 1);
            font-size: 14px;
            font-weight: 500;
            width: 92px;
            height: 36px;
            border: 1px solid #F0F0F0;
            outline: none;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 6px;

            &:hover {
                background-color: rgba(247, 247, 249, 1);
            }

            &:active {
                background-color: rgba(243, 243, 245, 1);
            }

            &:disabled {
                box-shadow: none;
            }
        }
    }

    .dissolve-container,
    .leave-container {
        .right {
            button {
                color: #E22424;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #E22424;

                &:hover {
                    background-color: rgba(199, 8, 8, 0.08);
                }

                &:active {
                    background-color: rgba(248, 225, 225, 1);
                    border: 1px solid #C70808;
                }
            }
        }
    }

}
</style>
