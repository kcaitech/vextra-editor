<script setup lang="ts">
import { Ref, inject, ref, nextTick, watchEffect, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as team_api from '@/request/team'
import ProjectDialog from '../ProjectDialog.vue'
import listrightmenu from '@/components/AppHome/listrightmenu.vue'
import ProjectMemberg from '@/components/TeamProject/ProjectFill/ProjectMemberg.vue'
import ProjectAccessSetting from '@/components/TeamProject/ProjectFill/ProjectAccessSetting.vue'
import { ElMessage } from 'element-plus'
import tablelist from '@/components/AppHome/tablelist.vue'
const { t } = useI18n();



const innerVisible = ref(false);
const delVisible = ref(false);
const items = ref(['rename', 'projectset', 'memberset', 'setfixed', 'cancelfixed', 'exitproject', 'deleteproject'])
const updateitems = ref(items.value)
const mydata = ref()
const mydataindex = ref()
const projectMembergDialog = ref(false)
const projectSettingDialog = ref(false)
const showcontainer = ref(false)
const { projectList, is_favor, favoriteList, updateFavor } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
};

const tableData = ref<any[]>(projectList.value.filter(item => !item.is_in_team))
onMounted(() => {
    tableData.value = projectList.value.filter(item => !item.is_in_team)
})
watchEffect(() => {

    tableData.value = projectList.value.filter(item => !item.is_in_team)
})

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}
const cancelFixed = (project: any, state: boolean) => {
    console.log(favoriteList);

    project.is_favor = !project.is_favor;
    const i = projectList.value.findIndex(item => item.project.id === project.project.id);
    if (!state) {
        favoriteList.value.push(projectList.value[i])
    } else {
        const index = favoriteList.value.findIndex(item => item.project.id === projectList.value[i].project.id)
        favoriteList.value.splice(index, 1)
    }
    setProjectIsFavorite(project.project.id, project.is_favor);
    updateFavor(!is_favor.value);
}
const skipProject = (id: string) => {
    router.push({ path: '/files/project/' + id });
}
const dblclickskipProject = (row: any) => {
    skipProject(row.project.id);
}

const handleClose = () => {
    innerVisible.value = false;
}
const closeDelVisible = () => {
    delVisible.value = false;
}

const project_item = ref<any>({});
const project_index = ref<number>(-1);

const onExitProject = (row: any, index: number,) => {
    project_item.value = row;
    project_index.value = index;
    if (row.self_perm_type === 5) {
        delVisible.value = true
    } else {
        innerVisible.value = true
    }
    document.addEventListener('keydown', escClose);
}

const rexitProject = (data: any) => {
    project_item.value = data;
    project_index.value = mydataindex.value;
    innerVisible.value = true;
    document.addEventListener('keydown', escClose);
}

const rdelProject = (data: any) => {
    project_item.value = data;
    project_index.value = mydataindex.value;
    delVisible.value = true
    document.addEventListener('keydown', escClose);
}

const escClose = () => {

    if (innerVisible.value) {
        innerVisible.value = false;
    }
    if (delVisible.value) {
        delVisible.value = false
    }
    document.removeEventListener('keydown', escClose);
}

const quitProject = () => {
    innerVisible.value = false;
    exitProject(project_item.value.project.id);
    tableData.value.splice(project_index.value, 1);
    const index = projectList.value.findIndex(item => item.project.id === project_item.value.project.id);
    const f_index = favoriteList.value.findIndex(item => item.project.id === project_item.value.project.id);
    favoriteList.value.splice(f_index, 1);
    projectList.value.splice(index, 1);
    if (tableData.value.length > 0) {
        router.push('/files/project_shared');
    } else {
        router.push({ name: "apphome" });
        sessionStorage.setItem('index', '1');
    }
}

const exitProject = async (id: string) => {
    try {
        await team_api.exitProjectAPI({ project_id: id })
    } catch (err) {
        console.log(err);
    }
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
            console.log(updateItems);
        }
        if (data.self_perm_type != 5 && data.is_invited != true) {
            updateItems = filterItemsByIndexes(updateItems, [1, 3])
            console.log(updateItems);

        }
    }
    return updateItems
}

//右键菜单入口
const rightmenu = (e: MouseEvent, row: any) => {
    const index = tableData.value.indexOf(row)
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
    updateitems.value = updateItemsBasedOnFavor(row, items.value);
    mydata.value = row
    mydataindex.value = index
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

const setProjectInfo = async (params: any) => {
    try {
        const { code, message } = await team_api.setProjectInfoAPI(params)
        if (code === 0) {
            const index = tableData.value.findIndex(item => item.project.id === params.project_id)
            tableData.value[index].project.name = params.name
        } else {
            ElMessage.error(message)
        }
    } catch (err) {
        console.log(err);
    }
}

const customRowClassName = () => {
    return {
        height: '50px',
        'border-radius': '6px'
    }
}

const noNetwork = ref(false)
const iconlists = ref(['fixed', 'entrance', 'project'])
</script>

<template>
    <div class="tatle" style="height: calc(100vh - 144px);">
        <tablelist :data="tableData" :iconlist="iconlists" :projectshare="true" @onexitproject="onExitProject"
            @cancelfixed="cancelFixed" @dbclickopen="dblclickskipProject" @skipproject="skipProject" @rightMeun="rightmenu"
            :noNetwork="noNetwork" />
    </div>
    <ProjectDialog :projectVisible="innerVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')" @clode-dialog="handleClose"
        @confirm="quitProject"></ProjectDialog>
    <ProjectDialog :projectVisible="delVisible" :context="t('Createteam.projectdelcontext')"
        :title="t('Createteam.projectdeltitle')" :confirm-btn="t('Createteam.ok_delete')" @clode-dialog="closeDelVisible"
        @confirm="DelProject"></ProjectDialog>
    <listrightmenu :items="updateitems" :data="mydata" @showMembergDialog="showMembergDialog"
        @projectrename="setProjectInfo" @showSettingDialog="showSettingDialog"
        @cancelFixed="cancelFixed(mydata, mydata.is_favor)" @exitproject="rexitProject" @delproject="rdelProject" />
    <ProjectAccessSetting v-if="projectSettingDialog" :showcontainer="showcontainer" :title="t('Createteam.membertip')"
        :data="mydata" width="500px" @closeDialog="closeDialog" />
    <ProjectMemberg v-if="projectMembergDialog" :showcontainer="showcontainer" :projectMembergDialog="projectMembergDialog"
        :currentProject="mydata" @closeDialog="closeDialog" @exitProject="exitProject" />
</template>

<style scoped lang="scss">
.other {
    display: none;

    .fixed,
    .fixed-cel,
    .entrance,
    .project {
        cursor: pointer;
        display: flex;
        align-items: center;
        margin-right: 10px;

        svg {
            color: #9775fa;
            margin: 2px 0;
            width: 20px;
            height: 20px;
            transition: 0.3s;

            &:hover {
                transform: scale(1.2);
            }
        }
    }
}

.other1 {
    display: flex;

    .fixed-cancel {
        display: flex;
        align-items: center;
        margin-right: 10px;

        svg {
            color: #9775fa;
            margin: 2px 0;
            width: 20px;
            height: 20px;
        }
    }



}

:deep(thead .cell) {
    font-size: 16px;
    color: #000;
}

:deep(.el-table__inner-wrapper::before) {
    display: none;
}

:deep(.el-table) {
    border-bottom: none;
    /* 去掉表头的底部边框 */
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}

.description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.el-table__body tr.current-row>td.el-table__cell) {
    background-color: #e5dbff;

    // .other {
    //     display: flex;
    // }

    // .other1 {
    //     display: none;
    // }
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    .other {
        display: flex;
    }

    .other1 {
        display: none;
    }
}

:deep(.el-table__row) {
    border: none;

    &:hover {
        .other {
            display: flex;
        }

        .other1 {
            display: none;
        }
    }

}
</style>