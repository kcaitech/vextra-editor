<template>
    <div class="title" v-if="currentProject[0]">
        <div class="left">
            <div class="p">
                <div class="title-p" v-if="!cusname">
                    <Tooltip :content="t('projectpage.back')" :offset="5">
                        <div class="back" @click="back(currentProject[0].project, currentProject[0].is_in_team)">
                            <svg-icon icon-class="back-icon"></svg-icon>
                        </div>
                    </Tooltip>
                    <p @click="input_cusname(currentProject[0])"
                        :class="{ edit: currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 }">
                        {{ currentProject[0].project.name }}</p>
                    <Tooltip :content="t('projectpage.menu')" :offset="5" :visible="showProjecrMenu ? false : visible">
                        <div class="setting hover" @mousedown.stop="(e) => projectMenu(currentProject[0], e)"
                            @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave">
                            <el-icon style="transform: rotate(90deg); margin-right: 5px;">
                                <MoreFilled />
                            </el-icon>
                            <TeamProjectMenu v-if="showProjecrMenu" :items="menuItem" :data="currentProject[0]"
                                @mousedown.stop :top="28" :left="0" @cancelFixed="cancelFixed" @close="closeMenu"
                                @projectSetting="projectSetting" @reName="input_cusname"
                                @showMembergDialog="showMembergDialog" @delProject="onDelProject"
                                @exitProject="onExitProject">
                            </TeamProjectMenu>
                        </div>
                    </Tooltip>
                </div>
                <div style="height: 38px;" v-if="cusname">
                    <input type="text" @input="updateInputNameWidth" v-model="projectName" ref="input"
                        :style="{ width: inputNameLength + 'px' }">
                </div>
            </div>
            <div class="span">
                <span v-if="!cusdesc" @click="input_cusdesc(currentProject[0])"
                    :class="{ edit: currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 }">{{
                        currentProject[0].project.description.trim().length === 0 ? t('projectpage.input_tips') :
                        currentProject[0].project.description }}</span>
                <input v-if="cusdesc" type="text" ref="input" @input="updateInputDescWidth" v-model="projectDesc"
                    :style="{ width: inputDescLength + 'px' }">
            </div>
        </div>
        <div class="right">
            <Tooltip :content="currentProject[0].is_favor ? t('projectpage.unpin') : t('projectpage.fixed_items')"
                :offset="10">
                <div class="fixedbnt" @click="cancelFixed">
                    <svg-icon v-if="currentProject[0].is_favor" style="color: rgba(24, 120, 245, 1)"
                        icon-class="fixed-icon"></svg-icon>
                    <svg-icon v-else icon-class="fixed-normal"></svg-icon>
                </div>
            </Tooltip>
            <Tooltip :content="t('projectpage.member')" :offset="10">
                <div class="setting" @click="projectSetting">
                    <svg-icon icon-class="addmember-normal"></svg-icon>
                </div>
            </Tooltip>
            <Tooltip :content="t('projectpage.permission')" :offset="10">
                <div class="members" @click="showMembergDialog" v-if="currentProject[0].is_invited">
                    <svg-icon icon-class="memberlist-normal"></svg-icon>
                </div>
            </Tooltip>
            <button type="button" v-if="currentProject[0].self_perm_type > 2" @click="newFile">
                <svg-icon icon-class="addfile-icon"></svg-icon>
                {{ t('home.new_file') }}
            </button>
        </div>
    </div>
    <div class="team-header" v-if="currentProject[0]">
        <ul class="menu">
            <li class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px', height: 2 + 'px' }"></li>
            <template v-for="(item, index) in items" :key="index">
                <li class="item" :class="{ 'activate': itemid === index }" @click.stop="clickEvent(index, $event)"
                    v-if="(index === 0) || (index === 1 && currentProject[0].self_perm_type === 5 || currentProject[0].self_perm_type === 4 || currentProject[0].self_perm_type === 3)">
                    {{ item }}
                </li>
            </template>
        </ul>
    </div>
    <ProjectFillList ref="childComponentRef" v-if="itemid === 0 && currentProject[0]" :currentProject="currentProject[0]">
    </ProjectFillList>
    <ProjectRecycleBin v-if="itemid === 1 && currentProject[0]" :currentProject="currentProject[0]"></ProjectRecycleBin>
    <ProjectAccessSetting v-if="projectSettingDialog" :showcontainer="showcontainer" :title="t('Createteam.membertip')"
        :data="currentProject[0]" width="500px" @closeDialog="closeDialog" />
    <div :reflush="reflush !== 0 ? reflush : undefined">
        <ProjectMemberg v-if="projectMembergDialog" :projectMembergDialog="projectMembergDialog"
            :showcontainer="showcontainer" :currentProject="currentProject[0]" @closeDialog="closeDialog"
            @exitProject="exitProject"></ProjectMemberg>
    </div>
    <ProjectDialog :projectVisible="delVisible" :context="t('Createteam.projectdelcontext')"
        :title="t('Createteam.projectdeltitle')" :confirm-btn="t('Createteam.ok_delete')" @clode-dialog="closeDelVisible"
        @confirm="DelProject"></ProjectDialog>
    <ProjectDialog :projectVisible="exitVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')" @clode-dialog="closeExitVisible"
        @confirm="ExitProject"></ProjectDialog>
</template>
<script setup lang="ts">
import { Ref, nextTick, inject, ref, onMounted, watch, onUnmounted, DefineComponent, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as user_api from '@/request/users'
import ProjectFillList from './ProjectFill/ProjectFillList.vue';
import ProjectRecycleBin from './ProjectFill/ProjectRecycleBin.vue';
import { User, MoreFilled } from '@element-plus/icons-vue';
import * as team_api from '@/request/team';
import ProjectAccessSetting from './ProjectFill/ProjectAccessSetting.vue';
import ProjectMemberg from './ProjectFill/ProjectMemberg.vue';
import TeamProjectMenu from './TeamProjectMenu.vue';
import { ElMessage } from 'element-plus';
import ProjectDialog from './ProjectDialog.vue';
import Tooltip from '../common/Tooltip.vue'
import { ceil, debounce } from 'lodash'

const { t } = useI18n()
const itemid = ref(0)
const items = [t('projectpage.file'), t('projectpage.recycle_bin'),]
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
const showProjecrMenu = ref(false);
const delVisible = ref(false);
const exitVisible = ref(false);
const visible = ref(false);
const showcontainer = ref(false)
const elwidth = ref()
const elleft = ref()
let menuItem: string[] = ['visit'];
const childComponentRef = ref()

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

const newFile = () => {
    childComponentRef.value.newProjectFill()
}

const clickEvent = (index: number, e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
    itemid.value = index
    sessionStorage.setItem('activateitem', index.toString())
}
const closeMenu = () => {
    showProjecrMenu.value = false;
    setMenuVisi(false);
}

const back = (project: any, isTeam: boolean) => {
    if (isTeam) {
        router.push({ path: '/files/team/' + project.team_id });
    } else {
        router.push('/files/project_shared');
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
        router.push('/files/project_shared');
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
        router.push({ path: '/files/team/' + project.project.team_id });
    } else {
        const inshare = projectList.value.filter(item => !item.is_in_team).length;
        if (inshare > 0) {
            router.push('/files/project_shared');
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
    if (!v) {
        showProjecrMenu.value = false;
    }
})

const projectMenu = (project: any, e: MouseEvent) => {
    menuItem = ['visit'];
    setMenuVisi(false);
    if (project.self_perm_type === 5) {
        menuItem.push('rename', 'del');
    }
    if (project.self_perm_type === 4) {
        menuItem.push('rename', 'exit');
    }
    if (project.is_invited || project.self_perm_type === 5) {
        menuItem.push('perm');
    }
    if (project.is_favor) {
        menuItem.push('no_fixed');
    } else {
        menuItem.push('fixed');
    }
    if ((!project.is_in_team || project.is_invited) && project.self_perm_type < 5) {
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
    nextTick(() => {
        showcontainer.value = true
    })
}

const showMembergDialog = () => {
    projectMembergDialog.value = true;
    visible.value = false;
    nextTick(() => {
        showcontainer.value = true
    })
}

const closeDialog = () => {
    showcontainer.value = false
    if (projectMembergDialog.value) {
        projectMembergDialog.value = false;
    }
    if (projectSettingDialog.value) {
        projectSettingDialog.value = false
    }
}

const exitProject = (id: string, isTeam: boolean) => {
    projectMembergDialog.value = false;
    const project = currentProject.value[0];
    const index = projectList.value.findIndex(item => item.project.id === project.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
    if (isTeam) {
        router.push({ path: '/files/team/' + id });
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

watch(is_favor, (v) => {
    currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
})

const _cancelFixed = () => {
    const project = currentProject.value[0];
    project.is_favor = !project.is_favor;
    if (project.is_favor) {
        favoriteList.value.push(project)
    } else {
        const index = favoriteList.value.findIndex(item => item.project.id === project.project.id)
        favoriteList.value.splice(index, 1)
    }
    setProjectIsFavorite(project.project.id, project.is_favor);
    updateFavor(!is_favor.value);
}
const cancelFixed = debounce(_cancelFixed, 200);
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
    visible.value = false;
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
        nextTick(() => {
            itemid.value = 0
            const items = document.querySelectorAll('.item')
            const rect = items[itemid.value].getBoundingClientRect()
            elwidth.value = rect.width
            elleft.value = rect.x
        })
    }
}, { deep: true });


watch(() => route.params.id, () => {
    if (route.name === "ProjectPage") {
        currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
    }
})

watch(currentProject, () => {
    if (currentProject.value.length !== 0) {
        window.document.title = currentProject.value[0].project.name + ' - ' + t('product.name')
    } else {
        return
    }
})

let timer1: any
let unwatch: any
onMounted(() => {
    const x = sessionStorage.getItem('activateitem')
    if (x) itemid.value = parseInt(x)
    if (!currentProject.value.length) GetprojectLists()
    timer1 = setTimeout(() => {
        unwatch = watch(projectList, () => {
            currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
            if (currentProject.value.length === 0) {
                if (route.name === "ProjectPage") {
                    router.push({ path: '/files/recently' })
                    ElMessage.closeAll()
                    ElMessage.error({ duration: 3000, message: '项目不存在或被移出项目' })
                }
            }
        })
    }, 10000);
})

onUnmounted(() => {
    sessionStorage.setItem('activateitem', '0')
    clearTimeout(timer1)
    if (unwatch) unwatch()
})

</script>
<style lang="scss" scoped>
.activate {
    color: rgba(0, 0, 0, 1) !important;
    // border-bottom: 2px solid #9775fa;
}

.team-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 8px 16px 8px;
    box-shadow: inset 0px -1px 0px 0px #F0F0F0;
    box-sizing: border-box;

    .menu {
        display: flex;
        gap: 24px;
        align-items: flex-end;
        list-style: none;
        line-height: 40px;
        padding: 0;
        margin: 0;


        .indicator {
            position: absolute;
            height: 2px;
            background-color: rgb(12, 111, 240);
            border-radius: 2px;
            transition: all 0.2s ease-in-out;
        }

        .item {
            white-space: nowrap;
            font-size: 13px;
            font-weight: 500;
            color: rgba(119, 119, 119, 1);
        }
    }
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 108px;
    margin: 0 8px;
    box-sizing: border-box;

    .left {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .p {
            box-sizing: border-box;

            .title-p {
                width: fit-content;
                display: flex;
                align-items: center;
                text-overflow: ellipsis;
                white-space: nowrap;

                svg {
                    width: 14px;
                    height: 14px;
                }

                .back {
                    svg {
                        width: 16px !important;
                        height: 16px !important;
                    }
                }

                .setting {
                    margin-top: 2px;
                    position: relative;
                }

            }

            input {
                font-size: 20px;
                font-weight: bold;
                outline: none;
                border: none;
                width: auto;
                max-width: 100%;
                height: 38px;
                border: 2px solid rgb(12, 111, 240);
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                box-sizing: border-box;
            }
        }

        .edit {
            height: 100%;
            box-sizing: border-box;

            &:hover {
                border: 2px solid rgb(12, 111, 240);
            }
        }

        p {
            display: list-item;
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            padding: 5px 0px;
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
            height: 32px;
            padding-right: 10px;

            input {
                font-size: 12px;
                outline: none;
                border: none;
                width: auto;
                max-width: 100%;
                height: 100%;
                border: 2px solid rgb(12, 111, 240);
                border-radius: 0%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                letter-spacing: 1px;
                box-sizing: border-box;

            }
        }

        span {
            display: list-item;
            width: auto;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.7);
            padding: 5px 0px;
            box-sizing: border-box;
            border: 2px solid transparent;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .right {
        display: flex;
        gap: 8px;
        align-items: center;
        box-sizing: border-box;

        .fixedbnt,
        .setting,
        .members {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            box-sizing: border-box;

            svg {
                width: 18px;
                height: 18px;
            }

            &:hover {
                background-color: rgba(235, 235, 237, 1);
            }
        }

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 108px;
            height: 36px;
            margin-left: 10px;
            border: 1px solid rgba(24, 120, 245, 1);
            border-radius: 6px;
            background-color: rgba(24, 120, 245, 1);
            box-sizing: border-box;
            transition: all 0.5s ease-out;
            color: white;

            &:hover {
                background-color: rgba(51, 140, 255, 1);
            }

            &:active {
                background-color: rgba(12, 111, 240, 1);
            }

            svg {
                padding: 2px;
                width: 16px;
                height: 16px;
                box-sizing: border-box;
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
    font-size: 12px;
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
        font-size: 12px;
        border: none;
        background-color: var(--active-color);
        color: #fff;
        border: 1px solid var(--active-color);
        border-radius: 6px;
    }
}

.hover {
    display: flex;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    padding: 3px 0;
    padding-left: 5px;

    &:hover {
        background-color: rgba(235, 235, 237, 1);
    }
}

.back {
    display: flex;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    padding: 3px;
    margin-top: 2px;

    &:hover {
        background-color: rgba(235, 235, 237, 1);
    }
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: rgba(235, 235, 237, 1);
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
    background-color: rgba(235, 235, 237, 1)
}

:deep(.el-select .el-input.is-disabled .el-select__caret) {
    cursor: pointer;
}

:deep(.el-switch.is-disabled .el-switch__core, .el-switch.is-disabled .el-switch__label) {
    cursor: pointer;
}
</style>
