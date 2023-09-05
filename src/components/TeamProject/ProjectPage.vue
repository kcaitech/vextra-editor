<template>
    <div class="title" v-if="currentProject[0]">
        <div class="left">
            <div class="p">
                <p v-if="!cusname" @click="input_cusname">{{ currentProject[0].project.name }}</p>
                <input v-if="cusname" type="text" @input="updateInputNameWidth" v-model="projectName" ref="input"
                    :style="{ width: inputNameLength + 'px' }">
            </div>
            <div class="span">
                <span v-if="!cusdesc" @click="input_cusdesc">{{ currentProject[0].project.description }}</span>
                <input v-if="cusdesc" type="text" ref="input" @input="updateInputDescWidth" v-model="projectDesc"
                    :style="{ width: inputDescLength + 'px' }">
            </div>
        </div>
        <div class="right">
            <div @click="cancelFixed">
                <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="15755" width="24" height="24">
                    <path d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                        :fill="currentProject[0].is_favor ? '#9775fa' : '#999'" p-id="15756"
                        data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                    </path>
                    <path
                        d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                        fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG" class="">
                    </path>
                </svg>
            </div>
            <div class="setting" @click="projectSetting"><svg-icon icon-class="gear"></svg-icon></div>
            <div><el-icon>
                    <User />
                </el-icon></div>
        </div>
    </div>
    <div class="team-header">
        <ul class="menu">
            <li class="item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items" :key="index"
                @click.stop="clickEvent(index)">
                {{ item }}
            </li>
        </ul>
    </div>
    <ProjectFillList v-if="itemid === 0 && currentProject[0]" :currentProject="currentProject[0]"></ProjectFillList>
    <ProjectRecycleBin v-if="itemid === 1" :currentProject="currentProject[0]"></ProjectRecycleBin>
    <ProjectAccessSetting title="邀请项目成员" :dialog-visible="projectSettingDialog" @clodeDialog="projectSettingDialog = false">
        <div class="project_type">
            <p>项目类型</p>
            <el-select v-model="projectType" class="m-2" style="width: 230px;" size="large">
                <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.label" />
            </el-select>
        </div>
        <div class="project_type">
            <p>权限</p>
            <el-select v-model="projectPerm" class="m-2" style="width: 230px;" size="large">
                <el-option v-for="item in projectPerms" :key="item.value" :label="item.label" :value="item.label" />
            </el-select>
        </div>
        <div v-if="projectType === projectOptions[1].label">
            <div>点击链接或扫描二维码申请加入</div>
            <div class="share-switch">
                <span>邀请链接开关:</span>
                <el-switch class="switch" size="small" v-model="linkSwitch" @click="onLinkSwitch" />
            </div>
            <div class="link" v-if="linkSwitch">
                <el-input :value="sharelink" :readonly="true" />
                <div class="qrcode"><svg-icon icon-class="qrcode"></svg-icon></div>
            </div>
            <div class="checked" v-if="linkSwitch"><el-checkbox v-model="checked"
                    @click.stop="handleChecked"></el-checkbox><span>申请后需管理员审批确认</span>
            </div>
            <div class="button" :style="{ opacity: linkSwitch ? '1' : '.5' }" @click="copyLink"><button>复制链接</button></div>
        </div>
        <div v-else>
            <div class="button" @click="projectSettingDialog = false"><button>确定</button></div>
        </div>
    </ProjectAccessSetting>
</template>
<script setup lang="ts">
import { Ref, nextTick, inject, ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { router } from '@/router'
import * as user_api from '@/apis/users'
import ProjectFillList from './ProjectFill/ProjectFillList.vue';
import ProjectRecycleBin from './ProjectFill/ProjectRecycleBin.vue';
import { User } from '@element-plus/icons-vue';
import * as team_api from '@/apis/team';
import ProjectAccessSetting from './ProjectFill/ProjectAccessSetting.vue';
import { ElMessage } from 'element-plus';
const { t } = useI18n()
const itemid = ref(0)
const items = ['文件', '回收站',]
const route = useRoute();
const currentProject = ref<any[]>([]);
const cusname = ref<boolean>(false);
const cusdesc = ref<boolean>(false);
const input = ref<HTMLInputElement>();
const projectName = ref('');
const projectDesc = ref('');
const inputNameLength = ref(0)
const inputDescLength = ref(0)
const linkSwitch = ref(false);
const checked = ref(false);
const projectSettingDialog = ref(false);
const sharelink = ref(``);
const projectOptions = [
    {
        value: 0,
        label: '公开: 团队全部成员可访问',
    },
    {
        value: 1,
        label: '非公开: 仅通过链接申请访问',
    }
]
const projectType = ref(projectOptions[1].label);
const projectPerms = [
    {
        value: 1,
        label: '仅阅读',
    },
    {
        value: 2,
        label: '可评论',
    },
    {
        value: 3,
        label: '可编辑',
    }
]
const projectPerm = ref(projectPerms[0].label);
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
const { projectList, saveProjectData, is_favor, favoriteList, updateFavor, is_team_upodate, teamUpdate } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;
};

const clickEvent = (index: number) => {
    itemid.value = index
}

const projectSetting = () => {
    const project = currentProject.value[0].project;
    params.project_id = project.id;
    params.public_switch = project.public_switch;
    params.invited_switch = project.invited_switch;
    params.need_approval = project.need_approval;
    params.perm_type = project.perm_type;
    sharelink.value = `https://protodesign.cn/#/apphome/project/${project.id}`
    projectSettingDialog.value = true;
}

watch(projectType, (v) => {
    const index = projectList.value.findIndex((item) => item.project.id === route.params.id);
    if (v === projectOptions[0].label) {
        params.public_switch = true;
        projectList.value[index].project.public_switch = true;
    } else {
        params.public_switch = false;
        projectList.value[index].project.public_switch = false;
    }
    setProjectInvitedInfo();
})
watch(projectPerm, (v) => {
    const index = projectList.value.findIndex((item) => item.project.id === route.params.id);
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
const handleChecked = () => {
    const index = projectList.value.findIndex((item) => item.project.id === route.params.id);
    params.need_approval = !checked.value;
    projectList.value[index].project.need_approval = !checked.value;
    setProjectInvitedInfo();
}
const onLinkSwitch = () => {
    const index = projectList.value.findIndex((item) => item.project.id === route.params.id);
    params.invited_switch = linkSwitch.value;
    projectList.value[index].project.invited_switch = linkSwitch.value;
    setProjectInvitedInfo();
}

const setProjectInvitedInfo = async () => {
    try {
        await team_api.setProjectInvitedInfoAPI(params);
    } catch (err) {
        console.log(err);
    }
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}
watch(is_favor, () => {
    const timer = setTimeout(() => {
        currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
        clearTimeout(timer)
    }, 300)
})

const cancelFixed = () => {
    const project = currentProject.value[0];
    project.is_favor = !project.is_favor;
    setProjectIsFavorite(project.project.id, project.is_favor);
    updateFavor(!is_favor.value);
}

const GetprojectLists = async () => {
    try {
        const { data } = await user_api.GetprojectLists()
        const pros = data.filter((item: any) => item.project.id === route.params.id);
        console.log(pros, 'pros');

        if (!pros.length) {
            router.push({
                name: 'projectApply',
                query: {
                    id: route.params.id
                }
            })
        }
        if (pros[0].perm_type === 0) {
            router.push({
                name: 'projectApply',
                query: {
                    id: route.params.id
                }
            })
        }
        const project = favoriteProjectList(data, favoriteList.value)
        saveProjectData(project)
        currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
        projectType.value = currentProject.value[0].project.public_switch ? projectOptions[0].label : projectOptions[1].label;
        handleprem(currentProject.value[0].project.perm_type);
        linkSwitch.value = currentProject.value[0].project.invited_switch;
        checked.value = currentProject.value[0].project.need_approval;
    } catch (error) {
        console.log(error);
    }
}

const copyLink = async () => {
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

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}

function input_cusname() {
    projectName.value = currentProject.value[0].project.name;
    cusname.value = !cusname.value;
    nextTick(() => {
        if (input.value) {
            input.value.select();
            updateInputNameWidth();
            input.value.addEventListener('blur', blur);
            document.addEventListener('keydown', enter)
        }
    })
}
function input_cusdesc() {
    projectDesc.value = currentProject.value[0].project.description;
    cusdesc.value = !cusdesc.value;
    nextTick(() => {
        if (input.value) {
            input.value.select();
            updateInputDescWidth();
            input.value.addEventListener('blur', blur_desc);
            document.addEventListener('keydown', enter_desc)
        }
    })
}
function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        blur();
    }
}
function enter_desc(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        blur_desc();
    }
}
function blur() {
    const project = currentProject.value[0].project
    const params = {
        project_id: project.id,
        name: projectName.value
    }
    const favorite = favoriteList.value.findIndex((item) => item.project.id === route.params.id);
    if (favorite !== -1) {
        favoriteList.value[favorite].project.name = projectName.value;
        teamUpdate(!is_team_upodate.value);
    }
    project.name = projectName.value;
    setProjectInfo(params)
    cusname.value = false;
    document.removeEventListener('keydown', enter);
}
function blur_desc() {
    const project = currentProject.value[0].project
    const params = {
        project_id: project.id,
        description: projectDesc.value
    }
    const favorite = favoriteList.value.findIndex((item) => item.project.id === route.params.id);
    if (favorite !== -1) {
        favoriteList.value[favorite].project.description = projectDesc.value;
        teamUpdate(!is_team_upodate.value);
    }
    project.description = projectDesc.value;
    setProjectInfo(params)
    cusdesc.value = false;
    document.removeEventListener('keydown', enter);
}
function updateInputNameWidth() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
        if (!input.value) return;
        context.font = window.getComputedStyle(input.value).font;
        const metrics = context.measureText(projectName.value);
        inputNameLength.value = metrics.width + 10; // 添加一些额外宽度作为缓冲
    }
}
function updateInputDescWidth() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
        if (!input.value) return;
        context.font = window.getComputedStyle(input.value).font;
        const metrics = context.measureText(projectDesc.value);
        inputDescLength.value = metrics.width + 10; // 添加一些额外宽度作为缓冲
    }
}

const setProjectInfo = async (params: any) => {
    try {
        await team_api.setProjectInfoAPI(params)
    } catch (err) {
        console.log(err);
    }
}

watch(() => currentProject.value, (n) => {
    currentProject.value = n;
    if (currentProject.value[0]) {
        projectType.value = currentProject.value[0].project.public_switch ? projectOptions[0].label : projectOptions[1].label;
        handleprem(currentProject.value[0].project.perm_type);
        linkSwitch.value = currentProject.value[0].project.invited_switch;
        checked.value = currentProject.value[0].project.need_approval;
    }
}, { deep: true });
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
watchEffect(() => {
    currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
    if (currentProject.value.length) {
        projectType.value = currentProject.value[0].project.public_switch ? projectOptions[0].label : projectOptions[1].label;
        handleprem(currentProject.value[0].project.perm_type);
        linkSwitch.value = currentProject.value[0].project.invited_switch;
        checked.value = currentProject.value[0].project.need_approval;
    }
})


onMounted(() => {
    if (!currentProject.value.length) {
        GetprojectLists()
    }
})
</script>
<style lang="scss" scoped>
.nested-enter-active,
.nested-leave-active {
    transition: all 0.3s ease-in-out;
}

.nested-leave-active {
    transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
    transform: translateY(400px);
    opacity: 0;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
    transition: all 0.3s ease-in-out;
}

.nested-enter-active .inner {
    transition-delay: 0.25s;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.001;
}

.activate {
    color: black;
    border-bottom: 2px solid #9775fa;
}

.team-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0 8px 0;
    padding: 12px;
    border-bottom: 1px solid #c4c4c4cf;

    .menu {
        cursor: pointer;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;

        color: #666;

        .item {
            margin-right: 32px;
            font-size: 18px;
            font-weight: 600;
            padding-bottom: 6px;
        }
    }

    .addandsearch {
        display: flex;

        button {
            cursor: pointer;
            border: none;
            width: 120px;
            height: 40px;
            border-radius: 4px;
            background-color: #9775fa;
            box-sizing: border-box;
            margin-right: 12px;
            transition: all 0.5s ease-out;
            color: white;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }
        }

        .el-input {
            width: 280px;
            height: 40px;
            font-size: 12px;
            --el-input-border-color: #f3f0ff;
            --el-input-hover-border-color: #e5dbff;
            --el-input-focus-border-color: #9775fa;

            .close:hover {
                border-radius: 2px;
                cursor: pointer;
                background-color: #f3f0ff;
            }

            .el-icon {
                padding: 2px;
                color: #9775fa;
            }
        }
    }
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    margin-top: 30px;
    padding: 12px;
    margin: 32px 0 8px 0;
    box-sizing: border-box;

    .left {
        flex: 1;

        .p {
            input {
                font-size: 18px;
                font-weight: bold;
                outline: none;
                border: none;
                width: auto;
                height: 32px;
                border: 2px solid #9775fa;
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 10px;
            }
        }

        p {
            width: fit-content;
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            margin-bottom: 10px;
            padding: 5px;
            border: 2px solid transparent;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
                border: 2px solid #9775fa;
            }
        }

        .span {
            input {
                font-size: 10px;
                outline: none;
                border: none;
                width: auto;
                height: 24px;
                border: 2px solid #9775fa;
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        span {
            display: flex;
            width: fit-content;
            font-size: 10px;
            color: rgba(0, 0, 0, 0.7);
            padding: 5px;
            box-sizing: border-box;
            border: 2px solid transparent;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
                border: 2px solid #9775fa;
            }
        }
    }

    .right {
        display: flex;
        width: auto;
        height: 30px;
        margin-left: 50px;

        svg {
            width: 16px;
            height: 16px;
        }


        >div {
            margin-right: 10px;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;

            >svg {
                width: 20px;
                height: 20px;
            }

            &:hover {
                background-color: #e5dbff;
            }
        }

        .setting {
            >svg {
                width: 16px;
                height: 16px;
            }
        }
    }
}

.project_type {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    p {
        width: 50px;
        margin-right: 10px;
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

.checked {
    display: flex;
    align-items: center;
    margin-top: 10px;

    span {
        margin-left: 10px;
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
    }
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #9775fa;
}

:deep(.el-checkbox) {
    height: 16px;
}
</style>
