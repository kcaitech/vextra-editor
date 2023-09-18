<script setup lang="ts" >
import {
    Clock,
    Star,
    Delete,
    BottomLeft,
    Plus,
    Folder,
    FolderOpened,
    Operation
} from '@element-plus/icons-vue'
import { router } from '@/router'
import { useRoute } from 'vue-router'
import { FilePicker } from '../common/filepicker';
import { Repository, CoopRepository, Document } from '@kcdesign/data';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data';
import { Zip } from "@pal/zip";
import { createDocument } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { DocEditor } from '@kcdesign/data';
import { Ref, inject, nextTick, onMounted, onUnmounted, ref, watch, computed, watchEffect } from 'vue';
import * as user_api from '@/apis/users'
import * as team_api from '@/apis/team'
import addTeam from '../TeamProject/addTeam.vue'
import addProject from '../TeamProject/addProject.vue';
import { ElMessage } from 'element-plus';
import TeamProjectMenu from '../TeamProject/TeamProjectMenu.vue';
import ProjectDialog from '../TeamProject/ProjectDialog.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import ProjectAccessSetting from '../TeamProject/ProjectFill/ProjectAccessSetting.vue';
import ProjectMemberg from '../TeamProject/ProjectFill/ProjectMemberg.vue';

interface Emits {
    (e: 'settitle', title: string, recycle: boolean): void;
}

const emits = defineEmits<Emits>();
const { t } = useI18n();
const route = useRoute();
const showoverlay = ref(false);
const teamcard = ref(false);
const projectcard = ref(false);
const teamid = ref('');
// const activeNames = ref([-1]);
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
const Input = ref<HTMLInputElement>();
const hover = ref('');

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
        updateActiveNames: (n: number) => void;
        targetItem: Ref<any[]>;
        addTargetItem: (data: any[]) => void;
        setMenuVisi: (b: boolean) => void;
    }


const showMembergDialog = () => {
    projectMembergDialog.value = true
}

const showSettingDialog = () => {
    projectSettingDialog.value = true
}

const closeDialog = () => {
    projectMembergDialog.value = false;
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

const picker = new FilePicker('.sketch', (file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo).then((document: Document) => {
        window.document.title = document.name;
        const coopRepo = new CoopRepository(document, repo);
        (window as any).skrepo = coopRepo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});

function newFile() {
    if (route.name === 'ProjectPage') {
        const perm = projectList.value.filter(item => item.project.id === route.params.id)[0].self_perm_type;
        if (perm > 2) {
            localStorage.setItem('project_id', route.params.id as string);
        }
    }
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

function Setindex(index: any, title: any) {
    sessionStorage.setItem('index', index);
    x.value = String(index);
    if (index == 3) {
        emits('settitle', title, true);
    } else {
        emits('settitle', title, false);
    }
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
        if (code === 0) {
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
    const timer = setTimeout(() => {
        getProjectFavoriteLists();
        clearTimeout(timer)
    }, 200)
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
    router.push({ path: '/apphome/teams/' + id });
    sessionStorage.setItem('index', '6');
    x.value = '6';
}

const skipProject = (item: any, e: MouseEvent) => {
    router.push({ path: '/apphome/project/' + item.project.id });
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
        if (item.self_perm_type === 5 || item.self_perm_type === 4) {
            menuItem.push('rename', 'del');
        }
        menuItem.push('no_fixed');
        if (!item.is_in_team) {
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
        router.push('/apphome/project_share');
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
    proname.value = data.project.name;
    reName.value = data.project.id;
    nextTick(() => {
        if (Input.value) {
            project_item.value = data;
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
    router.push('/apphome/project_share');
    sessionStorage.setItem('index', '9');
}

const isActive = (id: string, name: string, avatar: string, description: string, self_perm_type: number) => {
    if (route.params.id === id) {
        updateShareData(id, name, avatar, description != '' ? description : '你还没有填写团队描述，快去填写吧。', self_perm_type)
    }
    return route.params.id === id
}
const isProjectActive = (id: string) => {
    return route.params.id === id
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
        getProjectFavoriteLists()
    } catch (err) {
        console.log(err);
    }
}

const cancelFixed = (index: number, i: number, id: string) => {
    teamList.value[index].children.splice(i, 1);
    setProjectIsFavorite(id, false);
    updateFavor(!is_favor.value);
}
const menucancelFixed = (data: any) => {
    const f_index = favoriteList.value.findIndex(item => item.project.id === data.project.id);
    favoriteList.value.splice(f_index, 1);
    setProjectIsFavorite(data.project.id, false);
    updateFavor(!is_favor.value);
}

const shareFixed = (i: number, id: string) => {
    projectShareList.value.splice(i, 1);
    setProjectIsFavorite(id, false);
    updateFavor(!is_favor.value);
}

// const test1 = ref(true)

// watch(targetItem, () => {
//     if (targetItem.value.length < 1) {
//         test1.value = false
//     } else {
//         test1.value = true
//     }
// })

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
            addTargetItem([])
        }
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

watch(() => teamList.value, (newvalue) => {
    const teamid = ref()

    if (route.name === 'ProjectPage') {
        const [teamids] = projectList.value.filter(item => item.project.id === route.params.id).map(obj => obj.project.team_id)
        teamid.value = teamids
        if (activeNames.value.includes(teamData.value.findIndex(item => item.team.id === teamid.value))) return
        updateActiveNames(teamData.value.findIndex(item => item.team.id === teamid.value))
    }
    if (newvalue) {
        newvalue.filter((item: any) => {
            if (item.team.id === teamid.value) {
                if (item.children) {
                    const foundObject = item.children.find((item: any) => item.project.id === route.params.id)
                    if (foundObject) {
                        console.log('11111');
                        addTargetItem([])
                    } else {
                        console.log('22222');
                        addTargetItem(projectList.value.filter(item => item.project.id === route.params.id));
                    }
                } else {
                    console.log('33333');
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
}, { deep: true })

onMounted(() => {
    GetteamList();
    getProjectFavoriteLists();

})

onUnmounted(() => {
    picker.unmount();
})

</script>
<template>
    <el-row class="tac">
        <el-col>
            <el-scrollbar height="100%">
                <div style="height: 360px;">
                    <div class="new">
                        <button class="newfile" @click="newFile"> <el-icon>
                                <Plus />
                            </el-icon><span>{{ t('home.New_file') }}</span></button>
                        <button class="openfile" @click="picker.invoke()"><el-icon>
                                <FolderOpened />
                            </el-icon><span>{{ t('home.open_local_file') }}</span></button>
                    </div>
                    <el-menu :default-active="x" active-text-color="#ffd04b" class="el-menu-vertical-demo"
                        text-color="#000000">
                        <router-link to="/apphome/recently"><el-menu-item index="1"
                                :style="{ backgroundColor: x === '1' ? '#e5dbff' : hover === '1' ? '#f3f0ff' : '#fff', color: x === '1' ? '#9775fa' : '#000', fontWeight: x === '1' ? '600' : '400' }"
                                @click="Setindex(1, t('home.recently_opened'))" @mouseenter="hover = '1'"
                                @mouseleave="hover = ''">
                                <el-icon>
                                    <Clock />
                                </el-icon>
                                <span>{{ t('home.recently_opened') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/apphome/starfile"><el-menu-item index="2"
                                :style="{ backgroundColor: x === '2' ? '#e5dbff' : hover === '2' ? '#f3f0ff' : '#fff', color: x === '2' ? '#9775fa' : '#000', fontWeight: x === '2' ? '600' : '400' }"
                                @click="Setindex(2, t('home.star_file'))" @mouseenter="hover = '2'"
                                @mouseleave="hover = ''">
                                <el-icon>
                                    <Star />
                                </el-icon>
                                <span>{{ t('home.star_file') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/apphome/meshare"><el-menu-item index="3"
                                :style="{ backgroundColor: x === '3' ? '#e5dbff' : hover === '3' ? '#f3f0ff' : '#fff', color: x === '3' ? '#9775fa' : '#000', fontWeight: x === '3' ? '600' : '400' }"
                                @click="Setindex(3, t('home.file_shared'))" @mouseenter="hover = '3'"
                                @mouseleave="hover = ''">
                                <el-icon>
                                    <Folder />
                                </el-icon>
                                <span>{{ t('home.file_shared') }}</span>
                            </el-menu-item></router-link>
                        <router-link to="/apphome/shareme"><el-menu-item index="4"
                                :style="{ backgroundColor: x === '4' ? '#e5dbff' : hover === '4' ? '#f3f0ff' : '#fff', color: x === '4' ? '#9775fa' : '#000', fontWeight: x === '4' ? '600' : '400' }"
                                @click="Setindex(4, t('home.shared_file_received'))" @mouseenter="hover = '4'"
                                @mouseleave="hover = ''">
                                <el-icon>
                                    <BottomLeft />
                                </el-icon>
                                <span>{{ t('home.shared_file_received') }}</span>
                            </el-menu-item></router-link>
                        <div class="line"></div>
                        <!-- <router-link to="/apphome/recyclebin"><el-menu-item index="5"
                        @click="Setindex(5, t('home.recycling_station'))">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>{{ t('home.recycling_station') }}</span>
                    </el-menu-item></router-link> -->
                    </el-menu>
                </div>
            </el-scrollbar>
            <div class="teamlists" :reflush="reflush !== 0 ? reflush : undefined">
                <el-scrollbar height="100%">
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
                                                <svg-icon icon-class="receive-fill" />
                                            </div>
                                            <div class="name">收到的分享项目</div>
                                        </div>
                                        <div class="right">
                                        </div>
                                    </div>
                                </template>
                                <template v-for="(item, i) in projectShareList" :key="i">
                                    <div class="project" @click.stop="(e) => skipProject(item, e)"
                                        @mousedown.stop="(e) => rightMenu(item, e)"
                                        :class="{ 'is_active': isProjectActive(item.project.id) }">
                                        <div style="box-sizing: border-box;">
                                            <div class="project_name">{{ item.project.name }}</div>
                                            <div class="right">
                                                <Tooltip :content="'取消固定'" :offset="10">
                                                    <div @click="shareFixed(i, item.project.id)">
                                                        <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024"
                                                            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15755"
                                                            width="20" height="20">
                                                            <path
                                                                d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                                                fill="#9775fa" p-id="15756"
                                                                data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG"
                                                                class=""></path>
                                                            <path
                                                                d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                                                fill="#FFFFFF" p-id="15757"
                                                                data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                                                class=""></path>
                                                        </svg>
                                                    </div>
                                                </Tooltip>
                                                <svg-icon icon-class="close" @click.stop="newProjectFile(item.project.id)"
                                                    v-if="item.self_perm_type > 2"
                                                    style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
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
                                        <div class="right" @click.stop="showprojectcard(data.team.id)">
                                            <svg-icon icon-class="close" v-if="data.self_perm_type > 0" />
                                        </div>
                                    </div>
                                </template>
                                <template v-for="(item, i) in data.children" :key="i">
                                    <div class="project" @click.stop="(e) => skipProject(item, e)"
                                        @mousedown.stop="(e) => rightMenu(item, e)"
                                        :class="{ 'is_active': isProjectActive(item.project.id) }">
                                        <el-input v-if="reName === item.project.id" v-model="proname" ref="Input" autofocus
                                            @blur="onblur" />
                                        <div v-else style="box-sizing: border-box;">
                                            <div class="project_name">{{ item.project.name }}</div>
                                            <div class="right">
                                                <Tooltip :content="'取消固定'" :offset="10">
                                                    <div @click="cancelFixed(index, i, item.project.id)">
                                                        <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024"
                                                            version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15755"
                                                            width="20" height="20">
                                                            <path
                                                                d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                                                fill="#9775fa" p-id="15756"
                                                                data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG"
                                                                class=""></path>
                                                            <path
                                                                d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                                                fill="#FFFFFF" p-id="15757"
                                                                data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                                                class=""></path>
                                                        </svg>
                                                    </div>
                                                </Tooltip>
                                                <svg-icon icon-class="close" @click.stop="newProjectFile(item.project.id)"
                                                    v-if="item.self_perm_type > 2"
                                                    style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template v-for="(target, n) in targetItem" :key="n">
                                    <transition name="el-zoom-in-top">
                                        <div v-if="target.project.team_id === data.team.id" class="project"
                                            @click.stop="(e) => skipProject(target, e)"
                                            @mousedown.stop="(e) => rightMenu(target, e)"
                                            :class="{ 'is_active': isProjectActive(target.project.id) }">
                                            <div style="box-sizing: border-box;">
                                                <div class="project_name">{{ target.project.name }}</div>
                                                <div class="right" @click.stop="newProjectFile(target.project.id)"
                                                    v-if="target.self_perm_type > 2">
                                                    <svg-icon icon-class="close"
                                                        style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
                                                </div>
                                            </div>
                                        </div>
                                    </transition>
                                </template>

                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </el-scrollbar>
            </div>
            <div class="team-container">
                <button class="newteam" @click.stop="showteamcard">
                    <svg-icon icon-class="close" />
                    <span>{{ t('Createteam.add_team') }}</span>
                </button>
            </div>
        </el-col>
    </el-row>
    <transition name="nested" :duration="550">
        <div v-if="showoverlay" class="overlay">
            <addTeam v-if="teamcard" class="inner" @close="showoverlay = false; teamcard = false" />
            <addProject v-if="projectcard" class="inner" :teamid="teamid"
                @close="showoverlay = false; projectcard = false" />
        </div>
    </transition>
    <TeamProjectMenu v-if="showProjecrMenu" :items="menuItem" :data="projectItem" :top="top" :left="left" @close="closeMenu"
        ref="rightMenuEl" @delProject="onDelProject" @exitProject="onExitProject" @cancelFixed="menucancelFixed"
        @reName="inputCusname" @showMembergDialog="showMembergDialog" @projectSetting="showSettingDialog">
    </TeamProjectMenu>
    <ProjectDialog :projectVisible="delVisible" context="删除项目后，将删除项目及项目中所有文件、资料。" :title="'删除项目'" :confirm-btn="'仍然删除'"
        @clode-dialog="closeDelVisible" @confirm="DelProject"></ProjectDialog>
    <ProjectDialog :projectVisible="exitVisible" context="退出项目后，无法再访问项目中的文件，或使用项目中的资源。" :title="'退出项目'"
        :confirm-btn="'仍然退出'" @clode-dialog="closeExitVisible" @confirm="ExitProject"></ProjectDialog>
    <ProjectAccessSetting v-if="projectSettingDialog" title="邀请项目成员" :data="menuData" width="500px"
        @clodeDialog="projectSettingDialog = false" />
    <ProjectMemberg v-if="projectMembergDialog" :projectMembergDialog="projectMembergDialog" :currentProject="menuData"
        @closeDialog="closeDialog" @exitProject="exitProject" />
</template>

<style lang="scss" scoped>
a {
    text-decoration: none;
}

:deep(.el-collapse) {
    border: none;
    margin: 0 10px;
}

:deep(.el-collapse-item__header) {
    border: none;
    height: 40px;
    border-radius: 4px;
    margin-top: 5px;
}

:deep(.el-collapse .el-collapse-item__arrow) {
    display: none;
}

:deep(.el-collapse-item__header:hover) {
    background-color: transparent;
    cursor: pointer;

    .right {
        visibility: visible;
    }
}

:deep(.el-collapse-item__wrap) {
    border: none;
}

.nested-enter-active,
.nested-leave-active {
    transition: all 0.3s ease-in-out;
}

.nested-leave-active {
    transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
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

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.team-container {
    position: absolute;
    bottom: 0px;
    width: 100%;
    text-align: center;

    .newteam {
        cursor: pointer;
        border: none;
        width: calc(100% - 16px);
        height: 32px;
        margin: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        background-color: #9775fa;
        box-shadow: 1px 1px 2px rgba(0, 0, 0, .5);
        box-sizing: border-box;
        transition: all 0.5s ease-out;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }

        &:active {
            background-color: #9775fa;
        }

        span {
            color: #ffffff;
            letter-spacing: 2px;
            font-size: 14px;
            font-weight: 600;
        }

        svg {
            margin-right: 4px;
            margin-top: 2px;
            width: 16px;
            height: 16px;
            fill: white;
            transform: rotate(45deg);
        }
    }
}

.el-row {
    width: 100%;
    height: calc(100vh - 56px);
    overflow: hidden;
    // overflow-y: auto;
    background-color: white;

    .el-col {
        width: 100%;
        max-width: 100%;
        height: 100%;
        flex: 1;

        .new {
            display: block;
            text-align: center;
            margin: 10px 10px auto;

            button {
                width: 100%;
                height: 40px;
                margin: 0px 0 20px 0;
                border: none;
                font-size: 14px;
                letter-spacing: 1px;
                font-weight: 500;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;

                span {
                    overflow: hidden;
                    white-space: nowrap;
                }

                .el-icon {
                    font-size: 20px;
                    margin-right: 6px;
                }
            }


            .newfile {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #9775fa;
                color: #ffffff;

                &:hover {
                    background-color: #9675fadc;
                }

                &:active {
                    background-color: #9775fa;
                }
            }

            .openfile {
                background-color: #f3f0ff;
                color: #9775fa;

                &:hover {
                    border: 1px #9775fa solid;
                }
            }


        }

        .el-menu {
            border: none;
            background: none;


            .el-menu-item {
                border-radius: 4px;
                margin: 10px;
                height: 40px;

                &:hover {
                    background-color: #f3f0ff;
                    color: #9775fa;
                }

            }
        }

        .teamlists {
            width: 100%;
            position: absolute;
            bottom: 60px;
            top: 350px;

            .demo-collapse {
                .team-title {
                    width: 100%;
                    height: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 4px;
                    margin-bottom: 5px;

                    &:hover {
                        background-color: #f3f0ff;

                        .right {
                            visibility: visible;
                        }
                    }

                    .left {
                        display: flex;
                        align-items: center;
                        width: 200px;
                        margin-left: 8px;

                        .down {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            margin-right: 4px;
                            margin-left: 2px;
                            transition: .3s;

                            svg {
                                width: 10px;
                                height: 10px;
                            }
                        }

                        .team-avatar {
                            width: 24px;
                            height: 24px;
                            min-width: 24px;
                            background-color: #9775fa;
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

                                span {
                                    font-size: 12px;
                                    font-weight: 600;
                                    color: white;
                                }
                            }
                        }

                        .name {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .right {
                        visibility: hidden;
                        margin-right: 8px;
                        height: 100%;

                        svg {
                            width: 16px;
                            min-width: 16px;
                            height: 16px;
                            fill: #9775fa;
                            transform: rotate(45deg);
                        }
                    }
                }

                .project {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 4px;
                    cursor: pointer;

                    .el-input {
                        height: 35px;
                        border: none;
                        outline: none;
                    }

                    &:hover {
                        background-color: #f3f0ff;

                        .right {
                            display: flex;
                        }
                    }

                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        height: 35px;
                        border-radius: 4px;
                        padding-left: 50px;


                        .right {
                            >div {
                                display: flex;
                                align-items: center;
                            }

                            display: none;

                            align-items: center;
                            height: 100%;
                            padding-right: 10px;

                            svg {
                                width: 18px;
                                min-width: 16px;
                                height: 18px;
                                fill: #9775fa;
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

            .teamitem {
                border-radius: 4px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow-x: hidden;
                line-height: 40px;
                margin: 0 10px 6px 10px;
                padding: 0 6px;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;

            }


        }
    }
}

.line {
    width: 100%;
    height: 0.1px;
    border: 1px solid transparent;
    background-color: rgba($color: #ccc, $alpha: 0.3);
    box-sizing: border-box;
}

.project_name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 10px;
}

.receive {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 5px;
    width: 20px;
    height: 100%;

    >svg {
        width: 16px;
        height: 16px;
    }
}

:deep(.el-collapse-item__content) {
    padding: 0;
}

:deep(.el-collapse-item__content .el-input__wrapper) {
    height: 80%;
    outline: none;
    border: none;
    box-shadow: none;
    padding: 1px 5px;
    border-radius: 0;
    margin-right: 10px;
    border-bottom: 1px solid #9775fa;
    background-color: transparent;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: none;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #9775fa;
}

.hover {
    background-color: #f3f0ff;
}

.is_active {
    font-weight: 600;
    color: #9775fa;
    background-color: #e5dbff !important;
}




@media screen and (max-width:1000px) {

    span,
    h3 {
        display: none;
    }

    .el-row .el-col .new button .el-icon {
        padding: 0;
        margin: 0;
        font-size: 24px;
    }

    .el-menu-item {
        justify-content: center;
    }

    .el-icon {
        margin: 0;
        padding: 0;
        font-size: 32px;
    }

    .project_name {
        display: none;
    }

    .team-title {
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
        }

        .name {
            display: none;
        }

        .right {
            display: none;
        }
    }

    .project {
        display: none !important;
    }
}
</style>