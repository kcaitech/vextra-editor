<template>
    <div>
        <div class="title" v-if="currentProject[0]">
            <div class="left">
                <div class="p">
                    <div class="title-p" v-if="!cusname">
                        <p @click="input_cusname(currentProject[0])"
                            :class="{ edit: currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 }">
                            {{ currentProject[0].project.name }}</p>
                        <Tooltip :content="'项目菜单'" :offset="5" :visible="showProjecrMenu ? false : visible">
                            <div class="setting hover" @mousedown.stop="(e) => projectMenu(currentProject[0], e)"
                                @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave">
                                <el-icon style="transform: rotate(90deg); margin-right: 5px;">
                                    <MoreFilled />
                                </el-icon>
                                <TeamProjectMenu v-if="showProjecrMenu" :items="menuItem" :data="currentProject[0]"
                                    @mousedown.stop :top="23" :left="0" @cancelFixed="cancelFixed" @close="closeMenu"
                                    @projectSetting="projectSetting" @reName="input_cusname"
                                    @showMembergDialog="showMembergDialog" @delProject="onDelProject"
                                    @exitProject="onExitProject">
                                </TeamProjectMenu>
                            </div>
                        </Tooltip>
                        <Tooltip :content="'回到上一级'" :offset="5">
                            <div style="padding-top: 3px;" class="back"
                                @click="back(currentProject[0].project, currentProject[0].is_in_team)">
                                <svg-icon icon-class="back"></svg-icon>
                            </div>
                        </Tooltip>
                    </div>
                    <input v-if="cusname" type="text" @input="updateInputNameWidth" v-model="projectName" ref="input"
                        :style="{ width: inputNameLength + 'px' }">
                </div>
                <div class="span">
                    <span v-if="!cusdesc" @click="input_cusdesc(currentProject[0])"
                        :class="{ edit: currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 }">{{
                            currentProject[0].project.description.trim().length === 0 ? '点击输入项目描述…' :
                            currentProject[0].project.description }}</span>
                    <input v-if="cusdesc" type="text" ref="input" @input="updateInputDescWidth" v-model="projectDesc"
                        :style="{ width: inputDescLength + 'px' }">
                </div>
            </div>
            <div class="right">
                <el-tooltip class="box-item" effect="dark" :content="currentProject[0].is_favor ? `取消固定` : `固定项目`"
                    placement="bottom" :show-after="500" :offset="10" :hide-after="0">
                    <div @click="cancelFixed">
                        <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                            <path
                                d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                :fill="currentProject[0].is_favor ? '#9775fa' : '#999'" p-id="15756"
                                data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                            </path>
                            <path
                                d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                class="">
                            </path>
                        </svg>
                    </div>
                </el-tooltip>
                <Tooltip :content="'邀请项目成员'" :offset="10">
                    <div class="setting" @click="projectSetting"><svg-icon icon-class="gear"></svg-icon></div>
                </Tooltip>
                <Tooltip :content="'成员权限'" :offset="10">
                    <div @click="showMembergDialog" v-if="currentProject[0].is_invited"><el-icon>
                            <User />
                        </el-icon></div>
                </Tooltip>
            </div>
        </div>
        <div class="team-header" v-if="currentProject[0]">
            <ul class="menu">
                <template v-for="(item, index) in items" :key="index">
                    <li class="item" :class="{ 'activate': itemid === index }" @click.stop="clickEvent(index)"
                        v-if="(index === 0) || (index === 1 && currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 3)">
                        {{ item }}
                    </li>
                </template>
            </ul>
        </div>
        <ProjectFillList v-if="itemid === 0 && currentProject[0]" :currentProject="currentProject[0]"></ProjectFillList>
        <ProjectRecycleBin v-if="itemid === 1 && currentProject[0]" :currentProject="currentProject[0]"></ProjectRecycleBin>
        <ProjectAccessSetting v-if="projectSettingDialog" title="邀请项目成员" :data="currentProject[0]" width="500px"
            @clodeDialog="projectSettingDialog = false" />
        <div :reflush="reflush !== 0 ? reflush : undefined">
            <ProjectMemberg v-if="projectMembergDialog" :projectMembergDialog="projectMembergDialog"
                :currentProject="currentProject[0]" @closeDialog="closeDialog" @exitProject="exitProject"></ProjectMemberg>
        </div>
        <ProjectDialog :projectVisible="delVisible" context="删除项目后，将删除项目及项目中所有文件、资料。" :title="'删除项目'" :confirm-btn="'仍然删除'"
            @clode-dialog="closeDelVisible" @confirm="DelProject"></ProjectDialog>
        <ProjectDialog :projectVisible="exitVisible" context="退出项目后，无法再访问项目中的文件，或使用项目中的资源。" :title="'退出项目'"
            :confirm-btn="'仍然退出'" @clode-dialog="closeExitVisible" @confirm="ExitProject"></ProjectDialog>
    </div>
</template>
<script setup lang="ts">
import { Ref, nextTick, inject, ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as user_api from '@/apis/users'
import ProjectFillList from './ProjectFill/ProjectFillList.vue';
import ProjectRecycleBin from './ProjectFill/ProjectRecycleBin.vue';
import { User, MoreFilled } from '@element-plus/icons-vue';
import * as team_api from '@/apis/team';
import ProjectAccessSetting from './ProjectFill/ProjectAccessSetting.vue';
import ProjectMemberg from './ProjectFill/ProjectMemberg.vue';
import TeamProjectMenu from './TeamProjectMenu.vue';
import { ElMessage } from 'element-plus';
import ProjectDialog from './ProjectDialog.vue';
import Tooltip from '../common/Tooltip.vue'

const { t } = useI18n()
const itemid = ref(0)
const items = ['文件', '回收站',]
const route = useRoute();
const reflush = ref(0);
const currentProject = ref<any[]>([]);
const cusname = ref<boolean>(false);
const cusdesc = ref<boolean>(false);
const input = ref<HTMLInputElement>();
const projectName = ref('');
const projectDesc = ref('');
const inputNameLength = ref(0)
const inputDescLength = ref(0)
const projectSettingDialog = ref(false);
const projectMembergDialog = ref(false);
const sharelink = ref(``);
const showProjecrMenu = ref(false);
const delVisible = ref(false);
const memberLen = ref(0);
const exitVisible = ref(false);
const moveVisible = ref(false);
let menuItem: string[] = ['visit'];
const visible = ref(false);
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


const { projectList, saveProjectData, is_favor, favoriteList, updateFavor, is_team_upodate, teamUpdate, setMenuVisi, menuState } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    menuState: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;
    setMenuVisi: (b: boolean) => void;

};

const clickEvent = (index: number) => {
    itemid.value = index
}
const closeMenu = () => {
    showProjecrMenu.value = false;
    setMenuVisi(false);
}

const back = (project: any, isTeam: boolean) => {
    if (isTeam) {
        router.push({ path: '/apphome/teams/' + project.team_id });
    } else {
        router.push('/apphome/project_share');
    }
}
const closeDelVisible = () => {
    delVisible.value = false;
}
const closeExitVisible = () => {
    exitVisible.value = false;
}
const onExitProject = () => {
    exitVisible.value = true;
}

const onDelProject = () => {
    delVisible.value = true;
    visible.value = false;
}

const ExitProject = () => {
    exitVisible.value = false;
    const project = currentProject.value[0];
    exitProjectApi(project.project.id);
    const index = projectList.value.findIndex(item => item.project.id === project.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
    const inshare = projectList.value.filter(item => !item.is_in_team).length;
    if (inshare > 0) {
        router.push('/apphome/project_share');
    } else {
        router.push({ name: "apphome" });
        sessionStorage.setItem('index', '1');
    }
}

var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer)
    visible.value = false
}

const exitProjectApi = async (id: string) => {
    try {
        await team_api.exitProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);
    }
}

const DelProject = () => {
    delVisible.value = false;
    const project = currentProject.value[0];
    const index = projectList.value.findIndex(item => item.project.id === project.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
    if (project.is_in_team) {
        router.push({ path: '/apphome/teams/' + project.project.team_id });
    } else {
        const inshare = projectList.value.filter(item => !item.is_in_team).length;
        if (inshare > 0) {
            router.push('/apphome/project_share');
        } else {
            router.push({ name: "apphome" });
            sessionStorage.setItem('index', '1');
        }
    }
    delProject(project.project.id);
}

const delProject = async (id: string) => {
    try {
        await team_api.delProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);

    }
}

watch(menuState, (v) => {
<<<<<<< HEAD
    if(!v) {
=======
    if (!v) {
>>>>>>> 75f3bdbb750e344019d8ccbd81484602da2b919f
        showProjecrMenu.value = false;
    }
})

const projectMenu = (project: any, e: MouseEvent) => {
    menuItem = ['visit'];
    setMenuVisi(false);
    if (project.self_perm_type === 5 || project.self_perm_type === 4) {
        menuItem.push('rename', 'del');
    }
    if (project.is_invited || project.self_perm_type === 5) {
        menuItem.push('perm');
    }
    if (project.is_favor) {
        menuItem.push('no_fixed');
    } else {
        menuItem.push('fixed');
    }
    if (!project.is_in_team) {
        menuItem.push('exit');
    }
    nextTick(() => {
        showProjecrMenu.value = true;
        setMenuVisi(true);
    })
}


const projectSetting = () => {
    projectSettingDialog.value = true;
    visible.value = false;
}

const showMembergDialog = () => {
    projectMembergDialog.value = true;
    visible.value = false;
}

const closeDialog = () => {
    projectMembergDialog.value = false;
}

const exitProject = (id: string, isTeam: boolean) => {
    projectMembergDialog.value = false;
    const project = currentProject.value[0];
    const index = projectList.value.findIndex(item => item.project.id === project.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
    if (isTeam) {
        router.push({ path: '/apphome/teams/' + id });
    } else {
        router.push({ name: "apphome" })
        sessionStorage.setItem('index', '1');
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
        reflush.value++
    } catch (error) {
        console.log(error);
    }
}

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}

function input_cusname(project: any) {
    if (project.self_perm_type < 4) return;
    projectName.value = project.project.name;
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

function input_cusdesc(project: any) {
    if (project.self_perm_type < 4) return ElMessage.error('无权限设置项目描述');
    projectDesc.value = project.project.description;
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
    if (!currentProject.value[0]) return cusname.value = false;
    const project = currentProject.value[0].project
    projectName.value = projectName.value.trim();
    document.removeEventListener('keydown', enter);
    if (projectName.value.trim().length < 1) {
        cusname.value = false
        return
    }
    if (projectName.value === project.name.trim()) {
        cusname.value = false
        return
    }
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
}

function blur_desc() {
    if (!currentProject.value[0]) return cusdesc.value = false;
    const project = currentProject.value[0].project
    projectDesc.value = projectDesc.value.trim();
    document.removeEventListener('keydown', enter_desc);
    if (projectDesc.value.trim().length < 1) {
        cusdesc.value = false;
        return
    }
    if (projectDesc.value === project.description.trim()) {
        cusdesc.value = false;
        return
    }
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
        reflush.value++;
    }
}, { deep: true });


watchEffect(() => {
    route.params.id;
    currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
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
        width: calc(100% - 140px);

        .p {
            box-sizing: border-box;

            .title-p {
                width: fit-content;
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
                padding-right: 10px;

                svg {
                    width: 16px;
                    height: 16px;
                }

                .setting {
                    position: relative;
                }

                >div {
                    margin-top: 5px;
                }
            }

            input {
                font-size: 18px;
                font-weight: bold;
                outline: none;
                border: none;
                width: auto;
                max-width: 100%;
                height: 38px;
                border: 2px solid #9775fa;
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 10px;
                padding-left: 5px;
                padding-top: 3px;
                padding-bottom: 3px;
                box-sizing: border-box;
            }
        }

        .edit {
            &:hover {
                border: 2px solid #9775fa;
            }
        }

        p {
            display: list-item;
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            padding: 5px;
            border: 2px solid transparent;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
            max-width: 100%;
            padding-right: 10px;

            input {
                font-size: 10px;
                outline: none;
                border: none;
                width: auto;
                max-width: 100%;
                height: 24px;
                border: 2px solid #9775fa;
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        span {
            display: list-item;
            width: auto;
            font-size: 10px;
            color: rgba(0, 0, 0, 0.7);
            padding: 5px;
            box-sizing: border-box;
            border: 2px solid transparent;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .right {
        display: flex;
        width: 90px;
        height: 30px;
        margin-left: 50px;

        svg {
            width: 16px;
            height: 16px;
        }


        >div {
            margin-right: 5px;
            padding: 0 4px;
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

.hover {
    display: flex;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    padding: 2px 0;
    padding-left: 5px;

    &:hover {
        background-color: #e5dbff;
    }
}

.back {
    display: flex;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    padding: 0 3px 2px 3px;

    &:hover {
        background-color: #e5dbff;
    }
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #9775fa;
}

:deep(.el-checkbox) {
    height: 16px;
}

:deep(.el-checkbox.is-disabled) {
    cursor: pointer;
}

:deep(.el-checkbox__input.is-disabled .el-checkbox__inner::after) {
    cursor: pointer;
}

:deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
    cursor: pointer;
}

:deep(.el-checkbox__original) {
    cursor: pointer;
}

:deep(.el-input.is-disabled) {
    cursor: pointer;
}

:deep(.el-select .el-input.is-disabled .el-input__wrapper) {
    cursor: pointer;
}

:deep(.el-select .el-input.is-disabled .el-input__inner) {
    cursor: pointer;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: #fff
}

:deep(.el-select .el-input.is-disabled .el-select__caret) {
    cursor: pointer;
}

:deep(.el-switch.is-disabled .el-switch__core, .el-switch.is-disabled .el-switch__label) {
    cursor: pointer;
}
</style>
