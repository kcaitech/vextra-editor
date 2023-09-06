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

interface Emits {
    (e: 'settitle', title: string): void;
}

const emits = defineEmits<Emits>();
const { t } = useI18n();
const route = useRoute();
const showoverlay = ref(false);
const teamcard = ref(false);
const projectcard = ref(false);
const teamid = ref('');
// const activeNames = ref([-1]);
const teamList = ref<any>([]);
const teamDataList = ref<any[]>([]);
const projectDataList = ref<any[]>([]);
const reflush = ref(0);
const projectShareList = ref<any[]>([]);
const activeShare = ref([0]);
const is_share = ref(false);

const { updatestate, updateShareData, upDateTeamData, state, saveProjectData, favoriteListsData, updateFavor, is_favor,
    projectList, is_team_upodate, teamData, activeNames, targetItem, favoriteList } = inject('shareData') as {
        updatestate: Ref<boolean>;
        is_favor: Ref<boolean>;
        is_team_upodate: Ref<boolean>;
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

const picker = new FilePicker((file) => {
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

function Setindex(a: any, b: any) {
    sessionStorage.setItem('index', a)
}

const x = sessionStorage.getItem('index')

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
    console.log(id, 'id');
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

const torouter = (id: string) => {
    router.push({ path: '/apphome/teams/' + id });
}

const skipProject = (id: string) => {
    router.push({ path: '/apphome/project/' + id });
}

const skipProjecrShare = () => {
    router.push({ path: 'project_share' });
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

const shareFixed = (i: number, id: string) => {
    projectShareList.value.splice(i, 1);
    setProjectIsFavorite(id, false);
    updateFavor(!is_favor.value);
}

const showicon = (data: any) => {
    if (data.children) {
        return true
    } else if (targetItem.value.length > 0) {
        if (targetItem.value[0].project.team_id === data.team.id) {
            return true
        }else{
            return false
        }
    } else {
        return false
    }
}

watch(route, (v) => {
    if (v.name === 'ProjectShare') {
        is_share.value = true;
    } else {
        is_share.value = false;
    }
})

const listss = ref<any[]>([])

watchEffect(() => {
    listss.value = []
    for (let i = 0; i < favoriteList.value.length; i++) {
        listss.value.push(favoriteList.value[i].project.id)
    }
})

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
            <div class="new">
                <button class="newfile" @click="newFile"> <el-icon>
                        <Plus />
                    </el-icon><span>{{ t('home.New_file') }}</span></button>
                <button class="openfile" @click="picker.invoke()"><el-icon>
                        <FolderOpened />
                    </el-icon><span>{{ t('home.open_local_file') }}</span></button>
            </div>
            <el-menu :default-active="x ? x : '1'" active-text-color="#ffd04b" class="el-menu-vertical-demo"
                text-color="#000000">
                <router-link to="/apphome/recently"><el-menu-item index="1" @click="Setindex(1, t('home.recently_opened'))">
                        <el-icon>
                            <Clock />
                        </el-icon>
                        <span>{{ t('home.recently_opened') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/starfile"><el-menu-item index="2" @click="Setindex(2, t('home.star_file'))">
                        <el-icon>
                            <Star />
                        </el-icon>
                        <span>{{ t('home.star_file') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/meshare"><el-menu-item index="3" @click="Setindex(3, t('home.file_shared'))">
                        <el-icon>
                            <Folder />
                        </el-icon>
                        <span>{{ t('home.file_shared') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/shareme"><el-menu-item index="4"
                        @click="Setindex(4, t('home.shared_file_received'))">
                        <el-icon>
                            <BottomLeft />
                        </el-icon>
                        <span>{{ t('home.shared_file_received') }}</span>
                    </el-menu-item></router-link>
                <router-link to="/apphome/recyclebin"><el-menu-item index="5"
                        @click="Setindex(5, t('home.recycling_station'))">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <span>{{ t('home.recycling_station') }}</span>
                    </el-menu-item></router-link>
            </el-menu>
            <div class="teamlists" :reflush="reflush !== 0 ? reflush : undefined">
                <div class="demo-collapse">
                    <el-collapse v-model="activeShare" v-if="showShare">
                        <el-collapse-item @click.stop="skipProjecrShare">
                            <template #title>
                                <div class="team-title" :class="{ 'is_active': is_share }">
                                    <div class="left">
                                        <div class="down"
                                            :style="{ transform: activeShare.includes(1) ? 'rotate(0deg)' : 'rotate(-90deg)', visibility: projectShareList.length > 0 ? 'visible' : 'hidden' }">
                                            <svg-icon icon-class="down" />
                                        </div>
                                        <div class="team-avatar">
                                            <div class="img">
                                                <img src="" alt="team avatar">
                                            </div>
                                        </div>
                                        <div class="name">收到的分享项目</div>
                                    </div>
                                    <div class="right">
                                    </div>
                                </div>
                            </template>
                            <template v-for="(item, i) in projectShareList" :key="i">
                                <div class="project" @click.stop="skipProject(item.project.id)"
                                    :class="{ 'is_active': isProjectActive(item.project.id) }">
                                    <div>
                                        <div>{{ item.project.name }}</div>
                                        <div class="right" @click.stop="newProjectFile(item.project.id)">
                                            <div @click="shareFixed(i, item.project.id)">
                                                <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                                    xmlns="http://www.w3.org/2000/svg" p-id="15755" width="20" height="20">
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
                                            <svg-icon icon-class="close"
                                                style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-collapse-item>
                    </el-collapse>
                    <el-collapse v-model="activeNames">
                        <el-collapse-item v-for="(data, index) in teamList" :key="data.team.id" :name="index"
                            @click.stop="torouter(data.team.id)">
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
                                        <svg-icon icon-class="close" />
                                    </div>
                                </div>
                            </template>
                            <template v-for="(item, i) in data.children" :key="i">
                                <div class="project" @click.stop="skipProject(item.project.id)"
                                    :class="{ 'is_active': isProjectActive(item.project.id) }">
                                    <div>
                                        <div>{{ item.project.name }}</div>
                                        <div class="right" @click.stop="newProjectFile(item.project.id)">
                                            <div @click="cancelFixed(index, i, item.project.id)">
                                                <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                                    xmlns="http://www.w3.org/2000/svg" p-id="15755" width="20" height="20">
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
                                            <svg-icon icon-class="close"
                                                style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-for="(target, n) in targetItem" :key="n">
                                <div v-if="(target.project.team_id === data.team.id) && !listss.includes(target.project.id) && isProjectActive(target.project.id)"
                                    class="project" @click.stop="skipProject(target.project.id)"
                                    :class="{ 'is_active': isProjectActive(target.project.id) }">
                                    <div>
                                        <div>{{ target.project.name }}</div>
                                        <div class="right" @click.stop="newProjectFile(target.project.id)">
                                            <svg-icon icon-class="close"
                                                style="transform: rotate(45deg); margin-left: 5px; width: 16px; height: 16px;" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
            <div class=" team-container">
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
    bottom: 8px;
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
        box-shadow: 1px 1px 3px rgb(0, 0, 0);
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
    overflow-y: auto;
    background-color: white;

    .el-col {
        width: 100%;
        max-width: 100%;
        flex: 1;

        .new {
            display: block;
            text-align: center;
            margin: 20px 10px auto;

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

                &.is-active {
                    font-weight: 600;
                    color: #9775fa;
                    background-color: #e5dbff;
                }
            }
        }

        .teamlists {
            width: 100%;
            position: absolute;
            bottom: 60px;
            top: 400px;
            overflow-y: auto;

            &::-webkit-scrollbar {
                height: 0;
                width: 0;
            }

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

                    &:hover {
                        background-color: #f3f0ff;

                        .right {
                            visibility: visible;
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

                            display: flex;
                            align-items: center;
                            visibility: hidden;
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



:deep(.el-collapse-item__content) {
    padding: 0;
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

}
</style>