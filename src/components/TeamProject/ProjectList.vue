<template>
    <div class="tatle" style="height: calc(100vh - 186px);">
        <tablelist :data="searchvalue === '' ? teamprojectlist : SearchList" :iconlist="iconlists" :nulldata="nulldata"
            :projectshare="true" @onexitproject="onExitProject" @cancelfixed="cancelFixed" @on-addproject="onAddproject"
            @dbclickopen="dblclickskipProject" @skipproject="skipProject" @rightMeun="rightmenu" :noNetwork="noNetwork"
            :addproject="teamSelfPermType" />
    </div>
    <NetworkError @refresh-doc="GetprojectLists"></NetworkError>
    <ProjectDialog :projectVisible="innerVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')" @clode-dialog="handleClose"
        @confirm="quitProject"></ProjectDialog>
    <ProjectDialog :projectVisible="delVisible" :context="t('Createteam.projectdelcontext')"
        :title="t('Createteam.projectdeltitle')" :confirm-btn="t('Createteam.ok_delete')" @clode-dialog="closeDelVisible"
        @confirm="DelProject"></ProjectDialog>
    <listrightmenu v-show="rightmenushow" :items="updateitems" :data="mydata" @showMembergDialog="showMembergDialog"
        @projectrename="setProjectInfo" @showSettingDialog="showSettingDialog"
        @cancelFixed="cancelFixed(mydata, mydata.is_favor, mydataindex)" @exitproject="rexitProject"
        @delproject="rdelProject" />
    <ProjectAccessSetting v-if="projectSettingDialog" :showcontainer="showcontainer" :title="t('Createteam.membertip')"
        :data="mydata" width="500px" @clodeDialog="closeDialog" />
    <ProjectMemberg v-if="projectMembergDialog" :showcontainer="showcontainer" :projectMembergDialog="projectMembergDialog" :currentProject="mydata"
        @closeDialog="closeDialog" @exitProject="exitProject" />
</template>
<script setup lang="ts">
import { Ref, computed, inject, watchEffect, onMounted, ref, watch, nextTick } from 'vue';
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'
import { router } from '@/router'
import * as team_api from '@/request/team'
import ProjectDialog from './ProjectDialog.vue';
import listrightmenu from "@/components/AppHome/listrightmenu.vue"
import ProjectMemberg from '../TeamProject/ProjectFill/ProjectMemberg.vue'
import ProjectAccessSetting from '../TeamProject/ProjectFill/ProjectAccessSetting.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { debounce } from 'lodash';

interface Props {
    searchvalue?: string
}
const iconlists = ref(['fixed', 'entrance', 'project'])
const items = ref(['rename', 'projectset', 'memberset', 'setfixed', 'cancelfixed', 'exitproject', 'deleteproject'])
const updateitems = ref(items.value)
const mydata = ref()
const mydataindex = ref()
const showbutton = ref(false)
const noNetwork = ref(false)
const rightmenushow = ref(false)
const { t } = useI18n()
const selectid = ref(0)
const projectLists = ref<any[]>([])
const teamprojectlist = ref<any[]>([])
const innerVisible = ref(false);
const project_item = ref<any>({});
const projectMembergDialog = ref(false)
const projectSettingDialog = ref(false)
const nulldata = ref(false)
const showcontainer = ref(false)
const emits = defineEmits<{
    (e: 'addproject'): void
}>()

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const { teamID, updateprojectlist, updateprojectliststate, projectList, saveProjectData, is_favor, favoriteList, updateFavor, teamSelfPermType } = inject('shareData') as {
    updateprojectlist: Ref<boolean>;
    updateprojectliststate: (b: boolean) => void;
    teamID: Ref<string>;
    teamSelfPermType: Ref<number>;
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
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
    if (projectMembergDialog.value) {
        showcontainer.value = false
        projectMembergDialog.value = false;
    }
    if (projectSettingDialog.value) {
        showcontainer.value = false
        projectSettingDialog.value = false
    }
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
        if (data.self_perm_type != 5 && data.is_invited != true) {
            updateItems = filterItemsByIndexes(updateItems, [1, 3])
        }
    } else {
        updateItems = filterItemsByIndexes(updateItems, [4]);
        if (data.self_perm_type < 4) {
            updateItems = filterItemsByIndexes(updateItems, [0, 5])
        }
        if (data.self_perm_type === 5) {
            updateItems = filterItemsByIndexes(updateItems, [4])
        }
        if (data.self_perm_type != 5 && data.is_invited != true) {
            updateItems = filterItemsByIndexes(updateItems, [1, 3])
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

    if ((e.target as HTMLElement).closest('.el-table-v2__row')) {
        rightmenu.style.display = 'block'
    }
    updateitems.value = updateItemsBasedOnFavor(data, items.value);
    mydata.value = data
    mydataindex.value = index
    selectid.value = data.project.id
    rightmenushow.value = true;
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
    teamprojectlist.value = projectList.value.filter((item) => item.project.team_id === teamID.value)
})

//通过计算属性，筛选出与搜索匹配的项目
const SearchList = computed(() => {
    return teamprojectlist.value.filter((el: any) => {
        return el.project.name.toLowerCase().includes(props.searchvalue.trim().toLowerCase())
            ||
            el.creator.nickname.toLowerCase().includes(props.searchvalue.trim().toLowerCase())
    })
})

watch(() => props.searchvalue, () => {
    if (props.searchvalue.trim() !== '') {
        SearchList.value.length === 0 ? nulldata.value = true : ''
    } else {
        nulldata.value = false
    }
})

const skipProject = (id: string) => {
    router.push({ path: '/apphome/project/' + id });
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}

const _cancelFixed = (row: any, state: boolean, index: number) => {
    if (props.searchvalue === '') {
        teamprojectlist.value[index].is_favor = !state;
    } else {
        SearchList.value[index].is_favor = !state;
    }
    const i = projectList.value.findIndex(item => item.project.id === row.project.id);
    projectList.value[i].is_favor = !state;
    if (!state) {
        favoriteList.value.push(projectList.value[i])
    } else {
        const index = favoriteList.value.findIndex(item => item.project.id === projectList.value[i].project.id)
        favoriteList.value.splice(index, 1)
    }
    setProjectIsFavorite(row.project.id, !state);
    updateFavor(!is_favor.value);
}
const cancelFixed = debounce(_cancelFixed, 200);

onMounted(() => {
    GetprojectLists();
})

const dblclickskipProject = (row: any) => {
    skipProject(row.project.id);
}

</script>
<style lang="scss" scoped>
.selected {
    background-color: #e5dbff !important;
}

.main {
    height: calc(100vh - 96px - 56px - 56px - 20px);
}

.container {

    .hearder-container {
        display: flex;

        .title {
            flex: 1;
            font-size: 14px;
            font-weight: 600;
        }
    }

    .project-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 50px;
        border-radius: 4px;
        margin: 6px 0;

        &:hover {
            background-color: #f3f0ff;
        }

        .project-name,
        .project-description,
        .project-creator,
        .other {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            flex: 1;
        }

        .other {
            display: flex;
            align-items: center;

            svg {
                display: flex;
                width: 20px;
                height: 20px;
                color: #9775fa;
                margin-right: 6px;
                padding: 2px;
                transition: .3s;

                &:hover {
                    cursor: pointer;
                    transform: scale(1.2);
                }
            }

        }
    }
}

.datanull {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 240px;
    font-size: 14px;

    button {
        cursor: pointer;
        border: none;
        width: 80px;
        height: 32px;
        border-radius: 4px;
        background-color: #9775fa;
        box-sizing: border-box;
        transition: all 0.5s ease-out;
        color: white;
        margin-bottom: 10px;
        box-shadow: 1px 1px 3px #b1b1b1, -1px -1px 3px #b1b1b1;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }
    }
}
</style>
