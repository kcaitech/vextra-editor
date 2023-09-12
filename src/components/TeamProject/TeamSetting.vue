<template>
    <div class="set-container">
        <div class="name-container">
            <div class="left">
                <div class="title">团队名称</div>
                <div class="text">{{ teamName }}</div>
            </div>
            <div class="right">
                <button type="button" :disabled="isDisabled.state" @click.stop="midname">修改名称</button>
            </div>
        </div>
        <div class="description-container">
            <div class="left">
                <div class="title">团队描述</div>
                <div class="text">{{ teamDescription }}</div>
            </div>
            <div class="right">
                <button type="button" :disabled="isDisabled.state" @click.stop="middescription">修改描述</button>
            </div>

        </div>
        <div class="avatar-container">
            <div class="left">
                <div class="title">团队头像</div>
                <div class="text">{{ t('Createteam.avatar_restriction') }}</div>
            </div>
            <div class="right">
                <label class="modify" :style="{ backgroundColor: isDisabled.color }" for="image_uploads">修改头像</label>
                <input type="file" id="image_uploads" name="image_uploads" accept=".jpg,.png" style="display: none;"
                    @change="midAvatarRequest($event)" :disabled="isDisabled.state" />
            </div>
        </div>
        <div v-if="teamSelfPermType === 3" class="dissolve-container">
            <div class="left">
                <div class="title">解散团队</div>
                <div class="text">解散团队，删除团队文件，不可恢复</div>
            </div>
            <div class="right">
                <button class="disband" type="button" @click.stop="dissolveteam">解散团队</button>
            </div>
        </div>
        <div v-else class="leave-container">
            <div class="left">
                <div class="title">离开团队</div>
                <div class="text">离开团队后，将无法再查看团队项目及资源</div>
            </div>
            <div class="right">
                <button class="disband" type="button" @click.stop="leaveteam">离开团队</button>
            </div>
        </div>
    </div>
    <div v-if="showoverlay" class="overlay">
        <div class="card-container">
            <div class="heard">
                <div class="title" v-text="titlevalue"></div>
                <div class="close" @click.stop="showoverlay = false">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
            <div class="centent">
                <div class="textarea-container">
                    <textarea v-if="textareashow" class="text-textarea" name="" id="" cols="30" rows="10"
                        :placeholder="placeholdervalue" v-model="textareaValue" :maxlength="maxvalue" />
                    <div v-else class="disbandtips">
                        <p v-if="teamSelfPermType === 3">解散团队后，将彻底删除团队中包含的全部项目资料，且不可恢复。</p>
                        <p v-else>离开团队后，将无法再查看团队项目及资源。</p>
                    </div>
                </div>
            </div>
            <div class="addproject">
                <button class="bnt_confirm" type="submit" @click.stop="confirm">
                    {{ teamSelfPermType === 3 ? '确定' : '离开' }}
                </button>
                <button class="bnt_cancel" type="submit" @click.stop.once="showoverlay = false">取消</button>
            </div>
        </div>
    </div>
    <ProjectDialog :projectVisible="showDialog" :context="contenttext" :title="titlevalue"
            :confirm-btn="teamSelfPermType === 3 ? '解散' : '离开'" @clode-dialog="closeDisband" @confirm="confirmQuit"></ProjectDialog>
</template>
<script setup lang="ts">
import { Ref, computed, inject, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/apis/users'
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
    return teamSelfPermType.value === 0 || teamSelfPermType.value === 1 ? { state: true, color: 'rgba(98, 67, 237, 0.3)' } : false
})

//获取元素，设置焦点并全选内容
const el = () => {
    const el = document.querySelector('.text-textarea') as HTMLTextAreaElement
    el.focus()
    el.select()
}
//关闭弹窗
const closeDisband = () => {
    showDialog.value = false;
}
const confirmQuit = () => {
    if(titlevalue.value === '解散团队') {
        disband(teamID.value)
    }else {
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
    formData.delete('team_id')
    formData.delete('name')
    formData.append('team_id', teamID.value)
    formData.append('name', textareaValue.value)
    try {
        const { code, message } = await user_api.Setteaminfo(formData)
        if (code === 0) {
            upDateTeamData(midDateTeamData(teamData.value, teamID.value, { name: textareaValue.value }))
            teamUpdate(!is_team_upodate.value)
            showoverlay.value = false
            ElMessage.success('已修改团队描述')
        } else {
            ElMessage.success(message)
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
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file && file.size <= maxSizeInBytes && e.target.accept.includes(fileExtension)) {
            formData.delete('team_id')
            formData.delete('avatar')
            formData.append('team_id', teamID.value)
            formData.append('avatar', file)
            try {
                const { code, message, data } = await user_api.Setteaminfo(formData)
                if (code === 0) {
                    upDateTeamData(midDateTeamData(teamData.value, teamID.value, { avatar: data.avatar }))
                    teamUpdate(!is_team_upodate.value)
                    ElMessage.success('已修改头像')
                } else {
                    ElMessage.error(message)
                }
            } catch (error) {

            }

        } else {
            ElMessage.error(t('percenter.errortips'))
        }
    }
}

//修改团队描述
const midDescriptionRequest = async () => {
    formData.delete('team_id')
    formData.delete('description')
    formData.append('team_id', teamID.value)
    formData.append('description', textareaValue.value)
    try {
        const { code, message } = await user_api.Setteaminfo(formData)
        if (code === 0) {
            upDateTeamData(midDateTeamData(teamData.value, teamID.value, { description: textareaValue.value }))
            teamUpdate(!is_team_upodate.value)
            showoverlay.value = false
            ElMessage.success('已修改团队描述')
        } else {
            ElMessage.success(message)
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
    titlevalue.value = '修改团队名称'
    textareaValue.value = teamName.value
    maxvalue.value = 20
    nextTick(() => el())
}

const middescription = () => {
    showoverlay.value = true
    textareashow.value = true
    titlevalue.value = '修改团队描述'
    textareaValue.value = teamDescription.value
    maxvalue.value = 120
    nextTick(() => el())
}

const dissolveteam = () => {
    showDialog.value = true
    textareashow.value = false
    titlevalue.value = '解散团队'
    contenttext.value = '解散团队后，将彻底删除团队中包含的全部项目资料，且不可恢复。'
}

const leaveteam = () => {
    showDialog.value = true
    textareashow.value = false
    titlevalue.value = '离开团队'
    contenttext.value = '离开团队后，将无法再查看团队项目及资源。'
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



</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.card-container {
    position: absolute;
    background-color: white;
    width: 480px;
    height: 240px;
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

        .textarea-container {
            margin-top: 16px;
            color: #3D3D3D;

            .text-textarea {
                padding: 6px 12px;
                width: calc(100% - 24px);
                height: 120px;
                border: none;
                outline-style: none;
                box-shadow: inset 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
                border-radius: 3px;
                resize: none;
                font-size: 14px;
                font-family: none;
            }

            .disbandtips {
                line-height: 120px;
            }
        }
    }

    .addproject {
        display: flex;
        justify-content: space-evenly;
        text-align: center;
        margin-top: 12px;

        button {
            cursor: pointer;
            font-size: 18px;
            letter-spacing: 2px;
            width: 96px;
            height: 40px;
            border: none;
            border-radius: 4px;
            transition: all 0.2s ease-in-out;

            &:active {
                .bnt_confirm {
                    background-color: #9775fa;
                }
            }

            &:disabled {
                background-color: rgba(98, 67, 237, 0.3);
            }
        }

        .bnt_confirm {
            color: white;
            background-color: #9775fa;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }
        }

        .bnt_cancel {
            color: black;
            background-color: white;
            border: 1px solid #9775fa;

            &:hover {
                color: #9775fa;
            }
        }
    }
}

.set-container {

    .name-container,
    .description-container,
    .avatar-container,
    .dissolve-container,
    .leave-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 40px 0;

        .left {

            .title {
                font-weight: 600;
                margin-bottom: 12px;
            }

            .text {
                color: #666;
            }
        }

        .right button,
        .modify {
            display: block;
            cursor: pointer;
            color: white;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            width: 80px;
            height: 32px;
            border: none;
            background-color: #9775fa;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease-in-out;

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
