<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Ref, computed, inject, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import * as team_api from '@/request/team';

const props = defineProps<{
    showcontainer: boolean,
    title: string,
    width: string,
    data: any
}>();

const emit = defineEmits<{
    (e: 'closeDialog'): void;
}>()

const linkSwitch = ref(false)
const sharelink = ref(``)
const isshow = ref(false)
const checked = ref(false);
const currentProject = ref<any[]>([props.data]);
const { t } = useI18n()

const projectOptions = [
    {
        value: 0,
        label: t('Createteam.projectOptionsA'),
    },
    {
        value: 1,
        label: t('Createteam.projectOptionsB'),
    }
]
const projectType = ref(projectOptions[1].label);

const projectPerms = [
    {
        value: 1,
        label: t('Createteam.projectPermsA'),
    },
    {
        value: 2,
        label: t('Createteam.projectPermsB'),
    },
    {
        value: 3,
        label: t('Createteam.projectPermsC'),
    }
]
const projectPerm = ref(projectPerms[0].label);

const handleprem = (prem: number) => {
    switch (prem) {
        case 1:
            return projectPerm.value = projectPerms[0].label
        case 2:
            return projectPerm.value = projectPerms[1].label
        case 3:
            return projectPerm.value = projectPerms[2].label
        default:
            return
    }
}

const params = {
    project_id: '',
    public_switch: false,
    perm_type: 0,
    invited_switch: false,
    need_approval: false
}

enum permissions {
    noAuthority,
    readOnly,
    reviewable,
    editable
}

const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
}

const onLinkSwitch = () => {
    if (disabled.value) return
    const index = projectList.value.findIndex((item) => item.project.id === currentProject.value[0].project.id);
    params.invited_switch = linkSwitch.value;
    projectList.value[index].project.invited_switch = linkSwitch.value;
    setProjectInvitedInfo();
}

const copyLink = async () => {
    if (!linkSwitch.value) return;
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(sharelink.value).then(() => {
            ElMessage({
                message: `${t('share.copy_success')}`,
                type: 'success',
            })
        }, () => {
            ElMessage({
                message: `${t('share.copy_failure')}`,
                type: 'success',
            })
        })
    } else {
        const textArea = document.createElement('textarea')
        textArea.value = sharelink.value
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        ElMessage({
            message: `${t('share.copy_success')}`,
            type: 'success',
        })
        textArea.remove()
    }
}

const setProjectInvitedInfo = async () => {
    try {
        await team_api.setProjectInvitedInfoAPI(params);
    } catch (err) {
        console.log(err);
    }
}

watch(() => props.showcontainer, (newval) => {
    isshow.value = newval
})

watch(projectType, (v) => {
    const index = projectList.value.findIndex((item) => item.project.id === currentProject.value[0].project.id);
    if (v === projectOptions[0].label) {
        params.public_switch = true;
        projectList.value[index].project.public_switch = true;
        currentProject.value[0].project.public_switch = true;
    } else {
        params.public_switch = false;
        projectList.value[index].project.public_switch = false;
        currentProject.value[0].project.public_switch = false;
    }
    setProjectInvitedInfo();
})

watch(projectPerm, (v) => {
    const index = projectList.value.findIndex((item) => item.project.id === currentProject.value[0].project.id);
    if (v === projectPerms[0].label) {
        params.perm_type = permissions.readOnly;
        projectList.value[index].project.perm_type = permissions.readOnly;
    } else if (v === projectPerms[1].label) {
        params.perm_type = permissions.reviewable;
        projectList.value[index].project.perm_type = permissions.reviewable;
    } else {
        params.perm_type = permissions.editable;
        projectList.value[index].project.perm_type = permissions.editable;
    }
    setProjectInvitedInfo();
})

watch(checked, (val) => {
    if (disabled.value) return
    const index = projectList.value.findIndex((item) => item.project.id === currentProject.value[0].project.id);
    params.need_approval = val;
    projectList.value[index].project.need_approval = val;
    setProjectInvitedInfo();
})

watch(() => currentProject.value, () => {
    if (currentProject.value) {
        projectType.value = currentProject.value[0].project.public_switch ? projectOptions[0].label : projectOptions[1].label;
        handleprem(currentProject.value[0].project.perm_type);
        linkSwitch.value = currentProject.value[0].project.invited_switch;
        checked.value = currentProject.value[0].project.need_approval;
    }
}, { deep: true });
const is_qrcode = ref(false);
const qrCodeLink = ref('')
const produceQrcode = () => {
    qrCodeLink.value = sharelink.value;
    is_qrcode.value = true;
}


watchEffect(() => {
    currentProject.value = projectList.value.filter((item) => item.project.id === currentProject.value[0].project.id);
    if (currentProject.value.length) {
        projectType.value = currentProject.value[0].project.public_switch ? projectOptions[0].label : projectOptions[1].label;
        handleprem(currentProject.value[0].project.perm_type);
        linkSwitch.value = currentProject.value[0].project.invited_switch;
        checked.value = currentProject.value[0].project.need_approval;
    }
})

onMounted(() => {
    const project = currentProject.value[0].project;
    params.project_id = project.id;
    params.public_switch = project.public_switch;
    params.invited_switch = project.invited_switch;
    params.need_approval = project.need_approval;
    params.perm_type = project.perm_type;
    sharelink.value = `https://localhost:8080/zbb/#/apphome/project/${project.id}`

})

const inputTypeSelect = ref<HTMLInputElement>()
const inputPermSelect = ref<HTMLInputElement>()
const showTypeSelect = ref<boolean>(false)
const showPermSelect = ref<boolean>(false)

const openTypeSelect = () => {
    if (disabled.value) return
    showTypeSelect.value = !showTypeSelect.value;
    showPermSelect.value=false
}

const openPermSelect = () => {
    if (disabled.value) return
    showPermSelect.value = !showPermSelect.value
    showTypeSelect.value=false
}

const selectTypeOption = (data: any) => {
    projectType.value = data.label
    showTypeSelect.value = false
}

const selectPermOption = (data: any) => {
    projectPerm.value = data.label
    showPermSelect.value = false
}

const disabled = computed(() => {
    return !(currentProject.value[0].self_perm_type === 4 || currentProject.value[0].self_perm_type === 5)
})
const handleClickOutside = (e: MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.typeoptions') == null) {
        console.log('执行1');
        showTypeSelect.value = false
    }
    if (e.target instanceof Element && e.target.closest('.permoptions') == null) {
        console.log('执行2');
        showPermSelect.value = false
    }
}
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
    <div class="overlay"></div>
    <div class="card-container">
        <div class="heard">
            <div class="title">
                {{ title }}
            </div>
            <div class="close" @click.stop="emit('closeDialog')">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>

        <div class="type-setting">
            <span>{{ t('Createteam.projecttype') }}：</span>
            <input ref="inputTypeSelect" class="typeinput" :style="{ opacity: disabled ? 0.6 : 1 }" type="text"
                v-model="projectType" @click.stop="openTypeSelect" placeholder="Select an option" :disabled="disabled"
                readonly />
            <div class="shrink1" @click.stop="inputTypeSelect?.click()">
                <svg-icon icon-class="down"
                    :style="{ transform: showTypeSelect ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666666' }"></svg-icon>
            </div>
            <transition name="el-zoom-in-top">
                <ul v-show="showTypeSelect" class="typeoptions">
                    <li class="options_item" v-for="item in projectOptions" :key="item.value"
                        @click.stop="selectTypeOption(item)">
                        <span :style="{ fontWeight: item.label == projectType ? 600 : 500 }">{{ item.label }}</span>
                        <div class="choose" :style="{ visibility: item.label === projectType ? 'visible' : 'hidden' }">
                        </div>
                    </li>
                </ul>
            </transition>
        </div>
        <div class="perm-setting" v-if="currentProject[0]">
            <span>{{ t('Createteam.jurisdiction') }}：</span>
            <input ref="inputPermSelect" class="perminput" :style="{ opacity: disabled ? 0.6 : 1 }" type="text"
                v-model="projectPerm" @click.stop="openPermSelect" placeholder="Select an option" :disabled="disabled"
                readonly />
            <div class="shrink2" @click.stop="inputPermSelect?.click()">
                <svg-icon icon-class="down"
                    :style="{ transform: showPermSelect ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#666666' }"></svg-icon>
            </div>
            <transition name="el-zoom-in-top">
                <ul v-show="showPermSelect" class="permoptions">
                    <li class="options_item" v-for="item in projectPerms" :key="item.value"
                        @click.stop="selectPermOption(item)">
                        <span :style="{ fontWeight: item.label == projectPerm ? 600 : 500 }">{{ item.label }}</span>
                        <div class="choose" :style="{ visibility: item.label === projectPerm ? 'visible' : 'hidden' }">
                        </div>
                    </li>
                </ul>
            </transition>
        </div>
        <div class="centent" v-if="currentProject[0] && projectType === projectOptions[1].label">
            <div class="permission-tips">{{ t('Createteam.jointips') }}</div>
            <div class="permission-switch">
                <span> {{ t('Createteam.invitation_switch') }}</span>
                <el-switch v-model="linkSwitch" class="ml-2" style="--el-switch-on-color: #1878F5" size="small"
                    @click="onLinkSwitch" :disabled="disabled" />
            </div>
            <input v-if="linkSwitch" class="switch" :style="{ opacity: disabled ? 0.6 : 1 }" type="text" v-model="sharelink"
                :disabled="disabled" readonly>
            <div v-if="linkSwitch" class="permission-tips1" :style="{ opacity: disabled ? 0.6 : 1 }">
                <input type="checkbox" id="filetips" v-model="checked" :disabled="disabled">
                <label for="filetips">申请后需管理员审批确认</label>
            </div>
            <div class="invitemember">
                <button type="button" :disabled="!linkSwitch" @click.stop="copyLink">{{ t('Createteam.copylink')
                }}</button>
            </div>
        </div>
        <div class="cancel" v-else>
            <button type="button" @click.stop="emit('closeDialog')">{{ t('Createteam.confirm') }}</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

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
    z-index: 9999;
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

    .type-setting,
    .perm-setting {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        height: 40px;

        span {
            width: 65px;
            font-size: 13px;
            color: rgba(38, 38, 38, 1);
        }

        .typeinput {
            width: 190px;
        }

        .perminput {
            width: 70px;
        }

        input {
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

        .shrink1 {
            right: 115px;
        }

        .shrink2 {
            right: 235px;
        }

        .shrink1,
        .shrink2 {
            position: absolute;
            display: flex;
            align-items: center;
            width: 12px;
            height: 12px;
            color: rgba(102, 102, 102, 1);

            svg {
                transition: 0.5s;
                width: 100%;
                height: 100%;
            }
        }

        .typeoptions {
            width: 190px;
        }

        .permoptions {
            width: 70px;
        }

        .typeoptions,
        .permoptions {
            position: absolute;
            top: 40px;
            left: 71px;
            padding: 0;
            margin: 0;
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
                    flex: 1;
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

    .centent {
        display: flex;
        flex-direction: column;

        .permission-tips {
            display: flex;
            align-items: center;
            height: 38px;
            font-size: 12px;
            color: rgba(140, 140, 140, 1);
        }

        .permission-switch {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 35px;

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
            gap: 6px;

            input[type=checkbox] {
                margin: 0;
                padding: 0;
                width: 14px;
                height: 14px;
                border-radius: 4px;
            }

            input[type=checkbox]:checked::after {
                position: absolute;
                width: 14px;
                height: 14px;
                margin: -1px 0 0 -1px;
                content: "";
                color: #FFFFFF;
                border-radius: 4px;
                border: 1px solid rgba(24, 120, 245, 1);
                background-image: url('@/assets/select-icon.svg');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 60% 40%;
                background-color: rgba(24, 120, 245, 1);
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

    .cancel {
        display: flex;
        align-items: center;
        height: 64px;

        button {
            width: 214px;
            height: 40px;
            border-radius: 6px;
            border: none;
            outline: none;
            margin: auto;
            color: rgba(255, 255, 255, 1);
            background: #1878F5;

            &:hover {
                background-color: rgba(66, 154, 255, 1);
            }

            &:active {
                background-color: rgba(10, 89, 207, 1);
            }

        }
    }

}
</style>