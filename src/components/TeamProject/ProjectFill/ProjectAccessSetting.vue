<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Ref, inject, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/components/common/CloseIcon.vue';
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
    sharelink.value = `https://protodesign.cn/zbb/#/apphome/project/${project.id}`

})

const changemargin = () => {
    nextTick(() => {
        let el = document.querySelectorAll('.el-dialog__header')
        for (let i = 0; i<el.length;i++) {
            (el[i] as HTMLElement).style.marginRight='0px'
        }
    })

}

</script>

<template>
    <el-dialog v-model="isshow" :width="width" align-center :append-to-body="true" :close-on-click-modal="false"
        :show-close="false" @open="changemargin" :destroy-on-close="true" @close="emit('closeDialog')">
        <template #header>
            <div class="my-header">
                <div class="title">{{ title }}</div>
                <CloseIcon :size="20" @close="emit('closeDialog')" />
            </div>
        </template>
        <div class="body">
            <div class="project_type">
                <p class="text">{{ t('Createteam.projecttype') }}</p>
                <el-select v-model="projectType" class="m-2" style="width: 230px;" size="large"
                    :disabled="!(currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5)">
                    <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.label" />
                </el-select>
            </div>
            <div class="project_type" v-if="currentProject[0]">
                <p class="text">{{ t('Createteam.jurisdiction') }}</p>
                <el-select v-model="projectPerm" class="m-2" style="width: 230px;" size="large"
                    :disabled="!(currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5)">
                    <el-option v-for="item in projectPerms" :key="item.value" :label="item.label" :value="item.label" />
                </el-select>
            </div>
            <div v-if="currentProject[0] && projectType === projectOptions[1].label">
                <div>{{ t('Createteam.jointips') }}</div>
                <div class="share-switch"
                    :style="{ opacity: currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5 ? '1' : '.5' }">
                    <span style="font-weight: 600;">{{ t('Createteam.invitation_switch') }}:</span>
                    <el-switch class="switch" size="small" v-model="linkSwitch" @click="onLinkSwitch"
                        :disabled="!(currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5)" />
                </div>
                <div class="link" v-if="linkSwitch">
                    <el-input :value="sharelink" :readonly="true" />
                    <!-- <div class="qrcode" @click="produceQrcode"><svg-icon icon-class="qrcode"></svg-icon></div> -->
                </div>
                <div class="qrcode-box" v-if="!is_qrcode">
                </div>
                <div class="checked" v-if="linkSwitch"
                    :style="{ opacity: currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5 ? '1' : '.5' }">
                    <el-checkbox v-model="checked"
                        :disabled="!(currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 5)"></el-checkbox><span>申请后需管理员审批确认</span>
                </div>
                <div class="button" :style="{ opacity: linkSwitch ? '1' : '.5' }" @click="copyLink">
                    <button>{{ t('Createteam.copylink') }}</button>
                </div>
            </div>
            <div v-else>
                <div class="button" @click.stop="emit('closeDialog')"><button>{{ t('Createteam.confirm') }}</button></div>
            </div>
        </div>
    </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: #9775fa;
    background-color: #9775fa;
}

:deep(.el-dialog__body) {
    padding: 16px !important;
}

:deep(.el-input__inner) {
    font-size: var(--font-default-fontsize);
}

:deep(.el-dialog__title) {
    font-weight: bold;
}

.body {
    font-size: var(--font-default-fontsize);
}

.my-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        color: #3D3D3D;
        font-weight: 600;
    }
}

.button {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    button {
        width: 80px;
        height: 30px;
        font-size: 10px;
        border: none;
        background-color: var(--active-color-beta);
        color: #fff;
        border: 1px solid var(--active-color-beta);
        border-radius: 4px;
        outline: none;
    }
}

.project_type {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .text {
        width: 60px;
        font-weight: 600;
    }
}

.share-switch {
    margin-top: 10px;
}

.switch {
    --el-switch-on-color: var(--active-color);
    margin-left: 10px;

}

:deep(.el-input__inner) {
    height: 30px;
    font-size: 10px;
}

.link {
    display: flex;
    align-items: center;
    margin-top: 10px;

    .qrcode {
        width: 25px;
        height: 25px;
        margin-left: 10px;

        svg {
            width: 100%;
            height: 100%;
            color: #9775fa;
        }
    }

    :deep(.el-input__inner) {
        height: 30px;
        font-size: 14px;
    }
}

.qrcode-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;

    div {
        width: 150px;
        height: 150px;
        background-color: aquamarine;
    }
}

.checked {
    display: flex;
    align-items: center;
    margin-top: 10px;

    span {
        margin-left: 10px;
    }
}
</style>