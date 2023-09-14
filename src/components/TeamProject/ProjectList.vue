<template>
    <div v-if="!noNetwork">
        <div v-if="teamprojectlist.length > 0 || SearchList.length > 0" class="container">
            <div class="hearder-container">
                <div class="title" v-for="(item, index) in titles" :key="index">{{ item }}</div>
            </div>
            <div class="main">
                <div class="project-item" :class="{ 'selected': selectid === item.project.id }"
                    v-for="(item, index) in searchvalue === '' ? teamprojectlist : SearchList" :key="item.project.id"
                    @click.stop="selectid = item.project.id" @dblclick.stop="skipProject(item.project.id)"
                    @contextmenu="rightmenu($event, item, index)" @mouseenter="showOther(item.project.id)"
                    @mouseleave="hiddOther">
                    <div class="project-name">{{ item.project.name }}</div>
                    <div class="project-description">{{ item.project.description }}</div>
                    <div class="project-creator">{{ item.creator.nickname }}</div>
                    <div class="other" v-if="selectid === item.project.id || showother && hoverId === item.project.id">
                        <div @click="cancelFixed(item.project.id, item.is_favor, index)">
                            <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                                <path
                                    d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                    :fill="item.is_favor ? '#9775fa' : '#999'" p-id="15756"
                                    data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                                </path>
                                <path
                                    d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                    fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                    class="">
                                </path>
                            </svg>
                        </div>
                        <div @click.stop="skipProject(item.project.id)"><svg-icon icon-class="drag"></svg-icon></div>
                        <div @click="onExitProject(item)"><svg-icon icon-class="pattern-ellipse"></svg-icon></div>
                    </div>
                    <div class="other" v-else-if="item.is_favor">
                        <div @click="cancelFixed(item.project.id, item.is_favor, index)">
                            <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                                <path
                                    d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                    :fill="item.is_favor ? '#9775fa' : '#999'" p-id="15756"
                                    data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                                </path>
                                <path
                                    d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                    fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                    class="">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <div class="other" v-else></div>
                </div>
            </div>
        </div>
        <div v-else class="datanull">
            <p>未加入任何项目</p>
            <button type="button" @click.stop="onAddproject" v-if="teamSelfPermType > 0">新建项目</button>
        </div>
    </div>
    <NetworkError v-else @refresh-doc="GetprojectLists"></NetworkError>
    <ProjectDialog :projectVisible="innerVisible" context="退出项目后，无法再访问项目中的文件，或使用项目中的资源。" :title="'退出项目'"
        :confirm-btn="'仍然退出'" @clode-dialog="handleClose" @confirm="quitProject"></ProjectDialog>
    <ProjectDialog :projectVisible="delVisible" context="删除项目后，将删除项目及项目中所有文件、资料。" :title="'删除项目'" :confirm-btn="'仍然删除'"
        @clode-dialog="closeDelVisible" @confirm="DelProject"></ProjectDialog>
    <listrightmenu :items="updateitems" :data="mydata" @showMembergDialog="showMembergDialog"
        @projectrename="setProjectInfo" @showSettingDialog="showSettingDialog"
        @cancelFixed="cancelFixed(mydata.project.id, mydata.is_favor, mydataindex)" @exitproject="rexitProject"
        @delproject="rdelProject" />
    <ProjectAccessSetting v-if="projectSettingDialog" title="邀请项目成员" :data="mydata" width="500px"
        @clodeDialog="projectSettingDialog = false" />
    <ProjectMemberg v-if="projectMembergDialog" :projectMembergDialog="projectMembergDialog" :currentProject="mydata"
        @closeDialog="closeDialog" @exitProject="exitProject" />
</template>
<script setup lang="ts">
import { Ref, computed, inject, watchEffect, onMounted, ref, watch, nextTick } from 'vue';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import * as team_api from '@/apis/team'
import ProjectDialog from './ProjectDialog.vue';
import listrightmenu from "@/components/AppHome/listrightmenu.vue"
import ProjectMemberg from '../TeamProject/ProjectFill/ProjectMemberg.vue'
import ProjectAccessSetting from '../TeamProject/ProjectFill/ProjectAccessSetting.vue'

interface Props {
    searchvalue?: string
}

const items = ref(['rename', 'projectset', 'memberset', 'setfixed', 'cancelfixed', 'exitproject', 'deleteproject'])
const updateitems = ref(items.value)
const mydata = ref()
const mydataindex = ref()
const route = useRoute()
const showbutton = ref(false)
const noNetwork = ref(false)
const { t } = useI18n()
const titles = ['项目名称', '项目描述', '创建者', '操作',]
const selectid = ref(0)
const projectLists = ref<any[]>([])
const teamprojectlist = ref<any[]>([])
const innerVisible = ref(false);
const project_item = ref<any>({});
const projectMembergDialog = ref(false)
const projectSettingDialog = ref(false)
const showother = ref(false)
const hoverId = ref('')
const emits = defineEmits<{
    (e: 'addproject'): void
}>()

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const { teamID, teamData, updateprojectlist, updateprojectliststate, projectList, saveProjectData, is_favor, favoriteList, updateFavor, updateActiveNames, addTargetItem, teamSelfPermType } = inject('shareData') as {
    updateprojectlist: Ref<boolean>;
    updateprojectliststate: (b: boolean) => void;
    teamID: Ref<string>;
    teamSelfPermType: Ref<number>;
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    updateActiveNames: (n: number) => void;
    teamData: Ref<[{
        team: {
            id: string,
            name: string,
            avatar: string,
            description: string
        }
    }]>;
    addTargetItem: (data: any[]) => void;
};

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}
const onAddproject = () => {
    emits('addproject');
}
const showOther = (id: string) => {
    showother.value = true;
    hoverId.value = id;
}
const hiddOther = () => {
    showother.value = false;
    hoverId.value = '';
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

const GetprojectLists = async () => {
    try {
        const { code, data, message } = await user_api.GetprojectLists()
        if (code === 0) {
            const project = favoriteProjectList(data, favoriteList.value)
            saveProjectData(project)
            projectLists.value = project
            teamprojectlist.value = project.filter((item) => item.project.team_id === teamID.value)
            if (noNetwork.value) noNetwork.value = false
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {
        noNetwork.value = true
    }
}

function filterItemsByIndexes(sourceArray: any, indexesToDelete: any) {
    return sourceArray.filter((_: any, index: number) => !indexesToDelete.includes(index));
}

function updateItemsBasedOnFavor(data: any, sourceItems: any) {
    let updateItems = [...sourceItems]
    if (data.is_favor) {
        updateItems = filterItemsByIndexes(updateItems, [3]);
        if (data.self_perm_type < 4) {
            updateItems = filterItemsByIndexes(updateItems, [0, 5])

        }
        if (data.self_perm_type === 5) {
            updateItems = filterItemsByIndexes(updateItems, [4])
        }
    } else {
        updateItems = filterItemsByIndexes(updateItems, [4]);
        if (data.self_perm_type < 4) {
            updateItems = filterItemsByIndexes(updateItems, [0, 5])
        }
        if (data.self_perm_type === 5) {
            updateItems = filterItemsByIndexes(updateItems, [4])
        }
    }
    return updateItems
}

const delVisible = ref(false);

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
    delProject(project.project.id);
}

const delProject = async (id: string) => {
    try {
        await team_api.delProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);

    }
}

const quitProject = () => {
    innerVisible.value = false;
    exitProjectAPI(project_item.value.project.id);
    const index = projectList.value.findIndex(item => item.project.id === project_item.value.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project_item.value.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
}

const exitProjectAPI = async (id: string) => {
    try {
        await team_api.exitProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);
    }
}
const handleClose = () => {
    innerVisible.value = false;
}

const onExitProject = (row: any) => {
    project_item.value = row;
    if (row.self_perm_type === 5) {
        delVisible.value = true;
    } else {
        innerVisible.value = true;
    }
}

const rexitProject = (data: any) => {
    project_item.value = data;
    innerVisible.value = true;

}

const rdelProject = (data: any) => {
    project_item.value = data;
    delVisible.value = true
}

const setProjectInfo = async (params: any) => {
    try {
        const { code, message } = await team_api.setProjectInfoAPI(params)
        if (code === 0) {
            const index = teamprojectlist.value.findIndex(item => item.project.id === params.project_id)
            teamprojectlist.value[index].project.name = params.name
        } else {
            ElMessage.error(message)
        }
    } catch (err) {
        console.log(err);
    }
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: any, index?: number) => {
    console.log(data);

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const rightmenu: any = document.querySelector('.rightmenu')
    const top = e.pageY
    const left = e.pageX
    nextTick(() => {
        const width = rightmenu.clientWidth
        const height = rightmenu.clientHeight
        rightmenu.style.left = left + width > viewportWidth ? (viewportWidth - width) + "px" : left + 'px'
        rightmenu.style.top = top + height > viewportHeight ? (viewportHeight - height) + 'px' : top + 'px'
    })

    if ((e.target as HTMLElement).closest('.project-item')) {
        rightmenu.style.display = 'block'
    }
    updateitems.value = updateItemsBasedOnFavor(data, items.value);
    mydata.value = data
    mydataindex.value = index
    selectid.value = data.project.id
}

//监听updateprojectlist的值，为true的时候，重新获取列表，然后调用updateprojectliststate重新设为false
watch(updateprojectlist, () => {
    if (updateprojectlist.value) {
        GetprojectLists()
        updateprojectliststate(false)
    }
})

//获取当前用户所有项目列表,然后用计算属性筛选出当前团队的项目
watchEffect(() => {
    teamprojectlist.value = projectList.value.filter((item) => item.project.team_id === teamID.value)
    if (teamprojectlist.value.length === 0) {
        showbutton.value = true
    } else {
        showbutton.value = false
    }
})

watch(is_favor, () => {
    const timer = setTimeout(() => {
        teamprojectlist.value = projectList.value.filter((item) => item.project.team_id === teamID.value)
        clearTimeout(timer)
    }, 300)
})

//通过计算属性，筛选出与搜索匹配的项目
const SearchList = computed(() => {
    return teamprojectlist.value.filter((el: any) => {
        return el.project.name.toLowerCase().includes(props.searchvalue.toLowerCase())
            ||
            el.creator.nickname.toLowerCase().includes(props.searchvalue.toLowerCase())
    })
})

const skipProject = (id: string) => {
    teamData.value.find((item, index) => {
        if (item.team.id === route.params.id) {
            updateActiveNames(index)
            addTargetItem(teamprojectlist.value.filter((item) => item.project.id === id))
            return
        }
    })
    router.push({ path: '/apphome/project/' + id });
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}

const cancelFixed = (id: string, state: boolean, index: number) => {
    if (props.searchvalue === '') {
        teamprojectlist.value[index].is_favor = !state;
    } else {
        SearchList.value[index].is_favor = !state;
    }
    const i = projectList.value.findIndex(item => item.project.id === id);
    projectList.value[i].is_favor = !state;
    setProjectIsFavorite(id, !state);
    updateFavor(!is_favor.value);
}

onMounted(() => {
    if (!teamprojectlist.value) {
        GetprojectLists();
    }
})

</script>
<style lang="scss" scoped>
.selected {
    background-color: #e5dbff !important;
}

.container {

    .hearder-container {
        display: flex;

        .title {
            flex: 1;
            font-weight: 600;
        }
    }

    .project-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 40px;
        border-radius: 4px;
        margin: 6px 0;
        padding: 0 6px;

        &:hover {
            background-color: #f3f0ff;
        }

        .project-name,
        .project-description,
        .project-creator,
        .other {
            width: 25%;
            display: flex;

            svg {
                width: 16px;
                height: 16px;
            }

            >div {
                margin-right: 10px;
            }
        }

        .project-name {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 20px;
            box-sizing: border-box;
            margin-left: 5px;
        }

        .project-description {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 20px;
        }

        .project-creator {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 20px;
        }
    }
}

.datanull {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 240px;

    button {
        cursor: pointer;
        border: none;
        width: 120px;
        height: 40px;
        border-radius: 4px;
        background-color: #9775fa;
        box-sizing: border-box;
        transition: all 0.5s ease-out;
        color: white;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }
    }
}
</style>
