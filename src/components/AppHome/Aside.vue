<script setup lang="ts">
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { Repository, CoopRepository, createDocument, DocEditor } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { Ref, inject, nextTick, onMounted, onUnmounted, ref, watch, computed, watchEffect } from 'vue';
import * as user_api from '@/request/users'
import * as team_api from '@/request/team'
import addTeam from '../TeamProject/addTeam.vue'
import addProject from '../TeamProject/addProject.vue';
import { ElMessage } from 'element-plus';
import TeamProjectMenu from '../TeamProject/TeamProjectMenu.vue';
import ProjectDialog from '../TeamProject/ProjectDialog.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import ProjectAccessSetting from '../TeamProject/ProjectFill/ProjectAccessSetting.vue';
import ProjectMemberg from '../TeamProject/ProjectFill/ProjectMemberg.vue';
import logo from '@/assets/h-logo-list.svg';
import min_logo from '@/assets/logo108x108.png';

const { t } = useI18n();
const route = useRoute();
const showoverlay = ref(false);
const teamcard = ref(false);
const projectcard = ref(false);
const teamid = ref('');
const x = ref('0');
const teamList = ref<any>([]);
const teamDataList = ref<any[]>([]);
const projectDataList = ref<any[]>([]);
const reflush = ref(0);
const projectShareList = ref<any[]>([]);
const activeShare = ref<number[]>([]);
const is_share = ref(false);
const showProjecrMenu = ref(false);
let menuItem: string[] = [];
const projectItem = ref<any>({});
const proname = ref('');
const projectMembergDialog = ref(false)
const projectSettingDialog = ref(false)
const showcontainer = ref(false)
const Input = ref<HTMLInputElement>();
const hover = ref('');
const isactive = ref('1')

const { updatestate, is_favor, projectList, is_team_upodate, teamData, activeNames, targetItem, favoriteList, updateActiveNames,
    updateShareData, upDateTeamData, state, saveProjectData, favoriteListsData, updateFavor, addTargetItem, setMenuVisi, menuState } = inject('shareData') as {
        updatestate: Ref<boolean>;
        is_favor: Ref<boolean>;
        is_team_upodate: Ref<boolean>;
        menuState: Ref<boolean>;
        updateShareData: (id: string, name: string, avatar: string, description: string, self_perm_type: number) => void;
        upDateTeamData: (data: any[]) => void;
        state: (b: boolean) => void;
        teamUpdate: (b: boolean) => void;
        updateFavor: (b: boolean) => void;
        saveProjectData: (data: any[]) => void;
        favoriteListsData: (data: any[]) => void;
        projectList: Ref<any[]>;
        favoriteList: Ref<any[]>;
        teamData: Ref<[{
            team: {
                id: string,
                name: string,
                avatar: string,
                description: string
            }
        }]>;
        activeNames: Ref<number[]>;
        updateActiveNames: {
            add: (n: number) => void;
            del: (n: number) => void;
        };
        targetItem: Ref<any[]>;
        addTargetItem: (data: any[]) => void;
        setMenuVisi: (b: boolean) => void;
    }


const showMembergDialog = () => {
    projectMembergDialog.value = true
    nextTick(() => {
        showcontainer.value = true
    })
}

const showSettingDialog = () => {
    projectSettingDialog.value = true
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

const exitProject = () => {
    projectMembergDialog.value = false;
}

function addChildToParent(parent: { children: any[]; }, child: any) {
    if (!parent.children) {
        parent.children = [];
    }
    parent.children.push(child);
}

function mergeArrays(parentArray: any[], childArray: any[]) {
    const mergedArray: any[] = [];
    parentArray.forEach(parentItem => {
        const parentClone = { ...parentItem };
        mergedArray.push(parentClone);
        const children = childArray.filter(childItem => childItem.project.team_id === parentItem.team.id);
        children.forEach(child => addChildToParent(parentClone, child));
    });
    return mergedArray;
}
// 使用合并函数将两个数组合并成一个数组

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}

const getProjectFavoriteLists = async () => {
    try {
        const { data } = await team_api.getProjectFavoriteListsAPI()
        favoriteListsData(data);
        const project = favoriteProjectList(projectList.value, data)
        saveProjectData(project)
        projectDataList.value = data;
        projectShareList.value = data.filter((item: any) => !item.is_in_team);
        teamList.value = mergeArrays(teamDataList.value, data);
        reflush.value++
    } catch (error) {
        console.log(error);
    }
}

function Setindex(index: any, title: any) {
    sessionStorage.setItem('index', index);
    isactive.value = String(index)
    x.value = String(index);
}

const showteamcard = () => {
    showoverlay.value = true
    teamcard.value = true
}

const showprojectcard = (id: string) => {
    showoverlay.value = true
    projectcard.value = true
    teamid.value = id
}

const newProjectFile = (id: string) => {
    localStorage.setItem('project_id', id);
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo);
    const coopRepo = new CoopRepository(nd, repo)
    const editor = new DocEditor(nd, coopRepo);
    const page = editor.create(t('system.page1'));
    editor.insert(0, page);
    window.document.title = nd.name;
    (window as any).skrepo = coopRepo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document' });
}

const GetteamList = async () => {
    try {
        const { code, data, message } = await user_api.GetteamList()
        if (code === 0 && data) {
            upDateTeamData(data)
            teamDataList.value = teamData.value
            teamList.value = mergeArrays(data, projectDataList.value);
            reflush.value++
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {
        console.log(error);

    }
}

watch(updatestate, (newvalue) => {
    if (newvalue) {
        GetteamList()
        state(false)
    }
})

watch(() => favoriteList.value.length, (n, v) => {
    if (v > n) {
        teamList.value = mergeArrays(teamDataList.value, favoriteList.value);
        projectShareList.value = favoriteList.value.filter((item: any) => !item.is_in_team);
    }
})

watch(is_favor, () => {
    teamList.value = mergeArrays(teamDataList.value, favoriteList.value);
    projectShareList.value = favoriteList.value.filter((item: any) => !item.is_in_team);
})

const showShare = computed(() => {
    const len = projectList.value.filter(item => !item.is_in_team).length;
    return len > 0;
})

watch(is_team_upodate, () => {
    teamDataList.value = teamData.value
    teamList.value = mergeArrays(teamDataList.value, projectDataList.value);

})

const torouter = (id: string, index: number) => {
    router.push({ path: '/files/team/' + id });
    sessionStorage.setItem('index', '6');
    x.value = '6';
}

const skipProject = (item: any, e: MouseEvent) => {
    router.push({ path: '/files/project/' + item.project.id });
    sessionStorage.setItem('index', '7');
    x.value = '7';
}
const top = ref(0); const left = ref(0);
const menuData = ref<any>({})
type TeamProjectMenuEl = InstanceType<typeof TeamProjectMenu>;
const rightMenuEl = ref<TeamProjectMenuEl>();
const rightMenu = (item: any, e: MouseEvent) => {
    if (e.button === 2) {
        setMenuVisi(false);
        menuData.value = item;
        top.value = e.clientY;
        left.value = e.clientX;
        projectItem.value = item;
        menuItem = ['visit'];
        if (item.self_perm_type === 5) {
            menuItem.push('rename', 'del');
        }
        if (item.self_perm_type === 4) {
            menuItem.push('rename', 'exit');
        }
        menuItem.push('no_fixed');
        if ((!item.is_in_team || item.is_invited) && item.self_perm_type < 5) {
            menuItem.push('exit');
        }
        if (item.is_invited || item.self_perm_type === 5) {
            menuItem.push('perm');
        }
        const h = document.querySelector('body')?.clientHeight
        nextTick(() => {
            showProjecrMenu.value = true;
            nextTick(() => {
                if (rightMenuEl.value) {
                    const el = rightMenuEl.value.menu;
                    if (el && h) {
                        if (el.clientHeight + e.clientY > h) {
                            top.value = h - el.clientHeight;
                        }
                    }
                }
            })
            setMenuVisi(true);
        })
    } else {
        showProjecrMenu.value = false;
        setMenuVisi(false);
    }
}

watch(menuState, (v) => {
    if (!v) {
        showProjecrMenu.value = false;
    }
})

const closeMenu = () => {
    showProjecrMenu.value = false;
    setMenuVisi(false);
}
const delVisible = ref(false);
const project_item = ref<any>({})
const onDelProject = (data: any) => {
    delVisible.value = true;
    project_item.value = data;
}
const closeDelVisible = () => {
    delVisible.value = false;
}

const DelProject = () => {
    delVisible.value = false;
    const project = project_item.value;
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
const exitVisible = ref(false);
const closeExitVisible = () => {
    exitVisible.value = false;
}
const onExitProject = (data: any) => {
    exitVisible.value = true;
    project_item.value = data;
}
const ExitProject = () => {
    exitVisible.value = false;
    const project = project_item.value;
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
const exitProjectApi = async (id: string) => {
    try {
        await team_api.exitProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);
    }
}
const reName = ref('');
const inputCusname = (data: any) => {
    reName.value = data.project.id;
    proname.value = data.project.name;
    nextTick(() => {
        if (Input.value) {
            project_item.value = data;
            //@ts-ignore
            Input.value[0].focus()
            //@ts-ignore
            Input.value[0].select()
            document.addEventListener('keydown', enter);
        }
    })
}

function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        onblur();
    }
}
const onblur = () => {
    const project = project_item.value.project;
    if (proname.value.trim().length < 1 || proname.value.trim() === project.name) return reName.value = '';
    proname.value = proname.value.trim();
    const params = {
        project_id: project.id,
        name: proname.value
    }
    const index = projectList.value.findIndex(item => item.project.id === project.id);
    const favorite = favoriteList.value.findIndex((item) => item.project.id === project.id);
    projectList.value[index].project.name = proname.value;

    favoriteList.value[favorite].project.name = proname.value;
    project.name = proname.value;
    setProjectInfo(params)
    reName.value = '';
    document.removeEventListener('keydown', enter);
}
const setProjectInfo = async (params: any) => {
    try {
        await team_api.setProjectInfoAPI(params)
    } catch (err) {
        console.log(err);
    }
}

const skipProjecrShare = () => {
    router.push('/files/project_shared');
    sessionStorage.setItem('index', '9');
}

const isActive = (id: string, name: string, avatar: string, description: string, self_perm_type: number) => {
    if (route.params.id === id) {
        updateShareData(id, name, avatar, description != '' ? description : t('Createteam.description'), self_perm_type)
    }
    return route.params.id === id
}
const isProjectActive = (id: string) => {
    return route.params.id === id
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
        getProjectFavoriteLists();
    } catch (err) {
        console.log(err);
    }
}

const cancelFixed = (index: number, i: number, id: string) => {
    teamList.value[index].children.splice(i, 1);
    const p_index = projectList.value.findIndex(item => item.project.id === id);
    projectList.value[p_index].is_favor = false;
    setProjectIsFavorite(id, false);
}
const menucancelFixed = (data: any) => {
    const f_index = favoriteList.value.findIndex(item => item.project.id === data.project.id);
    favoriteList.value.splice(f_index, 1);
    const p_index = projectList.value.findIndex(item => item.project.id === data.project.id);
    projectList.value[p_index].is_favor = false;
    setProjectIsFavorite(data.project.id, false);
}

const shareFixed = (i: number, id: string) => {
    projectShareList.value.splice(i, 1);
    setProjectIsFavorite(id, false);
    const p_index = projectList.value.findIndex(item => item.project.id === id);
    projectList.value[p_index].is_favor = false;
    // updateFavor(!is_favor.value);
}

const showicon = (data: any) => {
    if (data.children) {
        return true
    }
    else if (targetItem.value.length > 0) {
        if (targetItem.value[0].project.team_id === data.team.id) {
            return true
        } else {
            return false
        }
    }
    else {
        return false
    }
}


const actionindex = ref()
watch(route, (v) => {
    if (x.value != '0') x.value = ''
    if (v.name === 'ProjectShare') {
        is_share.value = true;
        activeShare.value = [1]
    } else {
        is_share.value = false;
    }
    if (targetItem.value.length > 0) {
        if (v.params.id != targetItem.value[0].project.id) {
            const timer = setTimeout(() => {
                addTargetItem([])
                clearTimeout(timer)
            }, 300);
        }
    }
    if (actionindex.value != undefined) {
        updateActiveNames.del(actionindex.value)
        actionindex.value = undefined
    }
    if (route.name === "recently") {
        x.value = '1'
    }
    if (route.name === "starfile") {
        x.value = '2'
    }
    if (route.name === "meshare" || route.name === "recyclebin") {
        x.value = '3'
    }
    if (route.name === "shareme") {
        x.value = '4'
    }

}, { deep: true, immediate: true })


watchEffect(() => {
    const teamid = ref()
    if (route.name === 'ProjectPage') {
        const [teamids] = projectList.value.filter(item => item.project.id === route.params.id).map(obj => obj.project.team_id)
        teamid.value = teamids
        const index = teamData.value.findIndex(item => item.team.id === teamid.value);

        if (index !== -1 && !activeNames.value.includes(index)) {
            actionindex.value = teamData.value.findIndex(item => item.team.id === teamid.value)
            updateActiveNames.add(teamData.value.findIndex(item => item.team.id === teamid.value))
        }

        teamList.value.filter((item: any) => {
            if (item.team.id === teamid.value) {
                if (item.children) {
                    const foundObject = item.children.find((item: any) => item.project.id === route.params.id)
                    if (foundObject) {
                        addTargetItem([])
                    } else {
                        addTargetItem(projectList.value.filter(item => item.project.id === route.params.id));
                    }
                } else {
                    addTargetItem(projectList.value.filter(item => item.project.id === route.params.id));
                }
            }
        }
        )
    }
    nextTick(() => {
        const index = projectShareList.value.findIndex(item => item.project.id === route.params.id);
        if (index !== -1) {
            activeShare.value = [1]
        }
    })
})


let timer: any
onMounted(() => {
    GetteamList();
    getProjectFavoriteLists();
    if (timer) {
        clearInterval(timer)
    }
    timer = setInterval(() => {
        GetteamList();
        getProjectFavoriteLists();
    }, 60000);
})

onUnmounted(() => {
    if (timer) {
        clearInterval(timer)
    }
})

const product_name = t('product.name');

</script>

<template>
    <div class="logo">
        <img class="logo-image" :src="logo" :alt="product_name" />
        <img class="mini_logo-image" :src="min_logo" :alt="product_name" style="display: none;" />
    </div>
    <el-row class="tac">
        <el-col>
            <el-scrollbar height="100%">
                <div>
                    <el-menu :default-active="x" active-text-color="#ffd04b" class="el-menu-vertical-demo"
                        text-color="#000000">
                        <router-link to="/files/recently"><el-menu-item index="1" :class="{ 'is_active': x == '1' }"
                                @click="Setindex(1, t('home.recently_opened'))" @mouseenter="hover = '1'"
                                @mouseleave="hover = ''">
                                <el-icon size="20">
                                    <svg-icon v-if="x == '1'" icon-class="recently-select"></svg-icon>
                                    <svg-icon v-else icon-class="recently-normal"></svg-icon>
                                </el-icon>
                                <span>{{ t('home.recently_opened') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/files/star"><el-menu-item index="2" :class="{ 'is_active': x == '2' }"
                                @click="Setindex(2, t('home.star_file'))" @mouseenter="hover = '2'"
                                @mouseleave="hover = ''">
                                <el-icon size="20">
                                    <svg-icon v-if="x == '2'" icon-class="star-select"></svg-icon>
                                    <svg-icon v-else icon-class="star-normal"></svg-icon>
                                </el-icon>
                                <span>{{ t('home.star_file') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/files/myfile"><el-menu-item index="3" :class="{ 'is_active': x == '3' }"
                                @click="Setindex(3, t('home.file_shared'))" @mouseenter="hover = '3'"
                                @mouseleave="hover = ''">
                                <el-icon size="20">
                                    <svg-icon v-if="x == '3'" icon-class="file-select"></svg-icon>
                                    <svg-icon v-else icon-class="file-normal"></svg-icon>
                                </el-icon>
                                <span>{{ t('home.file_shared') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/files/shared"><el-menu-item index="4" :class="{ 'is_active': x == '4' }"
                                @click="Setindex(4, t('home.shared_file_received'))" @mouseenter="hover = '4'"
                                @mouseleave="hover = ''">
                                <el-icon size="20">
                                    <svg-icon v-if="x == '4'" icon-class="share-select"></svg-icon>
                                    <svg-icon v-else icon-class="share-normal"></svg-icon>
                                </el-icon>
                                <span>{{ t('home.shared_file_received') }}</span>
                            </el-menu-item></router-link>
                    </el-menu>
                </div>
                <div class="newteam-container">
                    <div class="left">
                        <span>{{ t('Createteam.team') }}</span>
                    </div>
                    <div class="right" @click.stop="showteamcard">
                        <Tooltip :content="t('Createteam.add_team')" :offset="10">
                            <svg-icon icon-class="add"></svg-icon>
                        </Tooltip>
                    </div>
                </div>
                <div class="teamlists" :reflush="reflush !== 0 ? reflush : undefined">
                    <div class="demo-collapse">
                        <el-collapse v-model="activeShare" v-if="showShare">
                            <el-collapse-item @click.stop="skipProjecrShare" :name="1">
                                <template #title>
                                    <div class="team-title" :class="{ 'is_active': is_share }">
                                        <div class="left">
                                            <div class="down"
                                                :style="{ transform: activeShare[0] === 1 ? 'rotate(0deg)' : 'rotate(-90deg)', visibility: projectShareList.length > 0 ? 'visible' : 'hidden' }">
                                                <svg-icon icon-class="down" />
                                            </div>
                                            <div class="receive">
                                                <svg t="1702388143460" class="icon" viewBox="0 0 1024 1024"
                                                    version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20737"
                                                    width="200" height="200">
                                                    <path
                                                        d="M896 896l-45.44-45.12A63.808 63.808 0 0 1 896 832a64 64 0 0 0 64-64V128a64 64 0 0 0-64-64H256a64 64 0 0 0-64 64v5.44c0 17.6-7.04 33.536-18.56 45.12L128 133.44V128A128 128 0 0 1 256 0h640a128 128 0 0 1 128 128v640a128 128 0 0 1-128 128zM64 256v640a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H128a64 64 0 0 0-64 64z m704-128a128 128 0 0 1 128 128v640a128 128 0 0 1-128 128H128A128 128 0 0 1 0 896V256a128 128 0 0 1 128-128h640z"
                                                        fill="#5A5A5A" p-id="20738"></path>
                                                    <path
                                                        d="M160 256h384a32 32 0 0 1 0 64H160a32 32 0 0 1 0-64z m576 64a32 32 0 1 1 0-64 32 32 0 0 1 0 64zM64 384h768v64H64v-64z"
                                                        fill="#5A5A5A" p-id="20739"></path>
                                                </svg>
                                            </div>
                                            <div class="name">{{ t('Createteam.sharetip') }}</div>
                                        </div>
                                    </div>
                                </template>

                                <template v-for="(item, i) in projectShareList" :key="i">
                                    <div class="project" @click.stop="(e) => skipProject(item, e)"
                                        @mousedown.stop="(e) => rightMenu(item, e)"
                                        :class="{ 'is_active': isProjectActive(item.project.id) }">
                                        <el-input v-if="reName === item.project.id" v-model="proname" ref="Input"
                                            :autofocus="true" @blur="onblur" />
                                        <div v-else style="box-sizing: border-box;">
                                            <div class="project_name">{{ item.project.name }}</div>
                                            <div class="right">

                                                <div class="fixed" @click.stop="shareFixed(i, item.project.id)">
                                                    <Tooltip :content="t('Createteam.cancelFixed')" :offset="10">
                                                        <svg-icon icon-class="fixed-icon"
                                                            style="color: rgba(24, 120, 245, 1);"></svg-icon>
                                                    </Tooltip>
                                                </div>


                                                <div v-if="item.self_perm_type > 2" class="newfile"
                                                    @click.stop="newProjectFile(item.project.id)">
                                                    <Tooltip :content="'新建文件'" :offset="10">
                                                        <svg-icon icon-class="add"></svg-icon>
                                                    </Tooltip>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-collapse-item>
                        </el-collapse>
                        <el-collapse v-model="activeNames">
                            <el-collapse-item v-for="(data, index) in teamList" :key="data.team.id" :name="index"
                                @click.stop="torouter(data.team.id, index)">

                                <template #title>
                                    <div class="team-title"
                                        :class="{ 'is_active': isActive(data.team.id, data.team.name, data.team.avatar, data.team.description, data.self_perm_type) }">
                                        <div class="left">
                                            <div class="down"
                                                :style="{ transform: activeNames.includes(index) ? 'rotate(0deg)' : 'rotate(-90deg)', visibility: showicon(data) ? 'visible' : 'hidden' }">
                                                <svg-icon icon-class="down" />
                                            </div>
                                            <div class="team-avatar">
                                                <div v-if="data.team.avatar.includes('http')" class="img">
                                                    <img :src="data.team.avatar" alt="team avatar">
                                                </div>
                                                <div v-else class="text">
                                                    <span>{{ data.team.name.slice(0, 1) }}</span>
                                                </div>
                                            </div>
                                            <div class="name">{{ data.team.name }}</div>
                                        </div>
                                        <div class="right" v-if="data.self_perm_type > 0">
                                            <div class="newproject" @click.stop="showprojectcard(data.team.id)">
                                                <svg-icon icon-class="add" />
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <template v-for="(item, i) in data.children" :key="i">
                                    <div class="project" @click.stop="(e) => skipProject(item, e)"
                                        @mousedown.stop="(e) => rightMenu(item, e)"
                                        :class="{ 'is_active': isProjectActive(item.project.id) }">
                                        <el-input v-if="reName === item.project.id" v-model="proname" ref="Input"
                                            :autofocus="true" @blur="onblur" />
                                        <div v-else>
                                            <div class="project_name">{{ item.project.name }}</div>
                                            <div class="right">

                                                <div class="fixed" @click.stop="cancelFixed(index, i, item.project.id)">
                                                    <Tooltip :content="t('Createteam.cancelFixed')" :offset="10">
                                                        <svg-icon icon-class="fixed-icon"
                                                            style="color: rgba(24, 120, 245, 1);"></svg-icon>
                                                    </Tooltip>
                                                </div>


                                                <div v-if="item.self_perm_type > 2" class="newfile"
                                                    @click.stop="newProjectFile(item.project.id)">
                                                    <Tooltip :content="'新建文件'" :offset="10">
                                                        <svg-icon icon-class="add"></svg-icon>
                                                    </Tooltip>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <template v-for="(target, n) in targetItem" :key="n">
                                    <div v-if="target.project.team_id === data.team.id" class="project"
                                        @click.stop="(e) => skipProject(target, e)"
                                        @mousedown.stop="(e) => rightMenu(target, e)"
                                        :class="{ 'is_active': isProjectActive(target.project.id) }">
                                        <div style="box-sizing: border-box;">
                                            <div class="project_name">{{ target.project.name }}</div>
                                            <div class="right">

                                                <div v-if="target.self_perm_type > 2" class="newfile"
                                                    @click.stop="newProjectFile(target.project.id)">
                                                    <Tooltip :content="'新建文件'" :offset="10">
                                                        <svg-icon icon-class="add"></svg-icon>
                                                    </Tooltip>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </div>

            </el-scrollbar>
        </el-col>
    </el-row>
    <div v-if="showoverlay" class="overlay">
        <addTeam v-if="teamcard" class="inner" @close="showoverlay = false; teamcard = false" />
        <addProject v-if="projectcard" class="inner" :teamid="teamid"
            @close="showoverlay = false; projectcard = false" />
    </div>
    <TeamProjectMenu v-if="showProjecrMenu" :items="menuItem" :data="projectItem" :top="top" :left="left"
        @close="closeMenu" ref="rightMenuEl" @delProject="onDelProject" @exitProject="onExitProject"
        @cancelFixed="menucancelFixed" @reName="inputCusname" @showMembergDialog="showMembergDialog"
        @projectSetting="showSettingDialog">
    </TeamProjectMenu>
    <ProjectDialog :projectVisible="delVisible" :context="t('Createteam.projectdelcontext')"
        :title="t('Createteam.projectdeltitle')" :confirm-btn="t('Createteam.ok_delete')"
        @clode-dialog="closeDelVisible" @confirm="DelProject"></ProjectDialog>
    <ProjectDialog :projectVisible="exitVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')"
        @clode-dialog="closeExitVisible" @confirm="ExitProject"></ProjectDialog>
    <ProjectAccessSetting v-if="projectSettingDialog" :showcontainer="showcontainer" :title="t('Createteam.membertip')"
        :data="menuData" width="500px" @closeDialog="closeDialog" />
    <ProjectMemberg v-if="projectMembergDialog" :showcontainer="showcontainer"
        :projectMembergDialog="projectMembergDialog" :currentProject="menuData" @closeDialog="closeDialog"
        @exitProject="exitProject" />
</template>

<style lang="scss" scoped>
.logo {
    display: flex;
    justify-content: center;

    .logo-image {
        margin: 0 0 16px 0;
    }

    .mini_logo-image {
        margin: 16px 0;
        height: 28px;
    }
}

a {
    text-decoration: none;
}

:deep(.el-collapse) {
    border: none;
}

:deep(.el-collapse-item__header) {
    cursor: default !important;
    border: none;
    height: 36px;
    margin-bottom: 6px;
    background-color: rgba(250, 250, 250, 1);
}

:deep(.el-collapse .el-collapse-item__arrow) {
    display: none;
}

:deep(.el-collapse-item__wrap) {
    background-color: rgba(250, 250, 250, 1);
    border: none;
}

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

.newteam-container {
    height: 40px;
    display: flex;
    align-items: center;
    margin: 20px 6px 6px 6px;
    padding: 0 0 0 16px;
    justify-content: space-between;
    font-size: 13px;
    color: rgb(128, 128, 128);

    .left {
        display: flex;
        align-items: center;

        span {
            padding: 0 2px;
            white-space: nowrap;
        }
    }

    .right {
        height: 28px;
        width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 6px;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: rgba(243, 243, 245, 1);
        }

        svg {
            outline: none;
            color: rgba(51, 51, 51, 1);
            width: 16px;
            height: 16px;
        }
    }
}

.el-row {
    width: 100%;
    height: calc(100vh - 60px);
    overflow: hidden;
    background-color: none;

    .el-col {
        width: 100%;
        max-width: 100%;
        height: 100%;
        flex: 1;

        .el-menu {
            border: none;
            background: none;

            .el-menu-item {
                cursor: default !important;
                border-radius: 4px;
                height: 36px;
                line-height: 36px;
                margin: 6px;
                font-size: 14px !important;
                padding: 0 16px !important;

                &:hover {
                    background-color: rgba(243, 243, 245, 1);

                    .right {
                        visibility: visible;
                    }
                }

                .el-icon {
                    fill: none !important;
                }

            }
        }

        .teamlists {
            width: 100%;
            position: relative;

            .demo-collapse {
                .team-title {
                    width: 100%;
                    height: 36px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 6px;
                    margin: 6px;

                    &:hover {
                        background-color: rgba(243, 243, 245, 1);

                        .right .newproject {
                            visibility: visible;
                        }
                    }

                    .left {
                        display: flex;
                        align-items: center;

                        .down {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            margin-right: 4px;
                            margin-left: 4px;
                            transition: .3s;

                            svg {
                                width: 10px;
                                height: 10px;
                            }
                        }

                        .team-avatar {
                            width: 20px;
                            height: 20px;
                            background-color: rgba(24, 120, 245, 1);
                            text-align: center;
                            border-radius: 50%;
                            overflow: hidden;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 6px;

                            .img {
                                width: 100%;
                                height: 100%;
                                line-height: 0;

                                img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }
                            }

                            .text {
                                display: flex;
                                justify-content: center;
                                width: 20px;
                                height: 20px;

                                span {
                                    color: white;
                                    font-size: 12px;
                                    font-weight: 600;
                                    line-height: 20px;
                                }
                            }
                        }

                        .name {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            line-height: 36px;
                            font-size: 14px;
                            width: 150px;
                        }
                    }

                    .right {
                        display: flex;

                        .newproject {
                            visibility: hidden;
                            margin-right: 6px;
                            width: 26px;
                            height: 26px;
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            svg {
                                width: 16px;
                                min-width: 16px;
                                height: 16px;
                                color: rgba(51, 51, 51, 1);
                            }

                            &:hover {
                                background-color: rgba(235, 235, 237, 1);
                            }

                        }
                    }
                }

                .project {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 6px 6px;
                    border-radius: 6px;

                    .el-input {
                        height: 36px;
                        border: none;
                        outline: none;
                    }

                    &:hover {
                        background-color: rgba(243, 243, 245, 1);

                        .right .newfile {
                            visibility: visible;
                        }
                    }

                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        height: 36px;
                        border-radius: 6px;
                        padding-left: 44px;
                        box-sizing: border-box;

                        .right {
                            display: flex;

                            .fixed,
                            .newfile {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 28px;
                                height: 28px;
                                margin-right: 6px;
                                border-radius: 6px;

                                svg {
                                    width: 16px;
                                    min-width: 16px;
                                    height: 16px;
                                    color: rgba(51, 51, 51, 1);
                                }

                                &:hover {
                                    background-color: rgba(235, 235, 237, 1);
                                }
                            }

                            .newfile {
                                visibility: hidden;
                            }
                        }
                    }

                    input {
                        border: none;
                        outline: none;
                        background-color: transparent;
                        color: #000;
                        font-size: var(--font-default-fontsize);
                    }
                }
            }




        }
    }
}

.project_name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 10px;
    line-height: 36px;
    font-size: 14px;
}

.receive {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;

    >svg {
        padding: 2px;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
    }
}

:deep(.el-collapse-item__content) {
    padding: 0;
}

:deep(.el-collapse-item__content .el-input__wrapper) {
    outline: none;
    border: none;
    box-shadow: none;
    padding: 1px 5px;
    border-radius: 0;
    margin-right: 10px;
    border-bottom: 1px solid rgba(24, 120, 245, 1);
    background-color: transparent;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: none;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #9775fa;
}


.is_active {
    font-weight: 600;
    color: rgba(24, 120, 245, 1);
    background-color: rgba(24, 120, 245, 0.1) !important;

    .right .newproject,
    .fixed,
    .newfile {
        &:hover {
            background-color: rgba(24, 120, 245, 0.1) !important;
        }
    }

}



@media screen and (max-width:1000px) {
    .logo {
        .logo-image {
            display: none;
        }

        .mini_logo-image {
            display: flex !important;
        }
    }

    .newteam-container {
        padding: 0 !important;
        justify-content: center !important;

        .left {
            display: none !important;
        }
    }

    span,
    h3 {
        display: none;
    }

    .el-menu-item {
        justify-content: center;
    }

    .el-icon {
        margin: 0;
        padding: 0;
        font-size: 32px !important;
    }

    .project_name {
        display: none;
    }

    .team-title {
        justify-content: center !important;

        .left {
            display: flex;
            justify-content: center;
            margin-left: 0 !important;

            .down {
                display: none !important;
            }

            .team-avatar {
                margin-right: 0 !important;

                .text {
                    display: flex;

                    span {
                        display: inline;
                        font-size: 12px;
                        font-weight: 600;
                        color: white;
                    }
                }
            }

            .receive {
                margin: 0 !important;
            }
        }

        .name {
            display: none;
        }

        .right {
            display: none !important;
        }
    }

    .project {
        display: none !important;
    }
}
</style>