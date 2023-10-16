<script setup lang="ts">
import { Ref, inject, ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as team_api from '@/request/team'
import ProjectDialog from '../ProjectDialog.vue'
import listrightmenu from '@/components/AppHome/listrightmenu.vue'
import ProjectMemberg from '@/components/TeamProject/ProjectFill/ProjectMemberg.vue'
import ProjectAccessSetting from '@/components/TeamProject/ProjectFill/ProjectAccessSetting.vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n();
const tableData = computed(() => {
    return projectList.value.filter(item => !item.is_in_team);
});

const innerVisible = ref(false);
const delVisible = ref(false);
const items = ref(['rename', 'projectset', 'memberset', 'setfixed', 'cancelfixed', 'exitproject', 'deleteproject'])
const updateitems = ref(items.value)
const mydata = ref()
const mydataindex = ref()
const projectMembergDialog = ref(false)
const projectSettingDialog = ref(false)
const { projectList, is_favor, favoriteList, updateFavor } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
};
const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}
const cancelFixed = (project: any) => {
    project.is_favor = !project.is_favor;
    setProjectIsFavorite(project.project.id, project.is_favor);
    updateFavor(!is_favor.value);
}
const skipProject = (id: string) => {
    router.push({ path: '/apphome/project/' + id });
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
    innerVisible.value = true;
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
        router.push('/apphome/project_share');
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

const table = ref()

//右键菜单入口
const rightmenu = (row: any, _: any, e: MouseEvent) => {
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
    if ((e.target as HTMLElement).closest('.el-table__row')) {
        rightmenu.style.display = 'block'
        table.value.setCurrentRow(row)
    }
    updateitems.value = updateItemsBasedOnFavor(row, items.value);
    mydata.value = row
    mydataindex.value = index
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

</script>

<template>
    <el-table :data="tableData" ref="table" height="100%" style="width: 100%" :border="false"
        @row-dblclick="dblclickskipProject" @row-contextmenu="rightmenu" highlight-current-row>
        <el-table-column prop="project" :label="t('Createteam.project_name')">
            <template #default="scope">
                <span class="description">{{ scope.row.project.name }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="project" :label="t('Createteam.project_description')">
            <template #default="scope">
                <span class="description">{{ scope.row.project.description }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="creator" :label="t('Createteam.creator')">
            <template #default="scope">
                <span class="description"> {{ scope.row.creator.nickname }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="project" :label="t('home.operation')">
            <template #default="scope">
                <div class="other1" v-if="scope.row.is_favor">
                    <div @click="cancelFixed(scope.row)">
                        <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                            <path
                                d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                :fill="scope.row.is_favor ? '#9775fa' : '#999'" p-id="15756"
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
                <div class="other">
                    <div @click="cancelFixed(scope.row)">
                        <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                            <path
                                d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                :fill="scope.row.is_favor ? '#9775fa' : '#999'" p-id="15756"
                                data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                            </path>
                            <path
                                d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                class="">
                            </path>
                        </svg>
                    </div>
                    <div @click.stop="skipProject(scope.row.project.id)"><svg-icon icon-class="drag"></svg-icon></div>
                    <div @click="onExitProject(scope.row, scope.$index)"><svg-icon icon-class="pattern-ellipse"></svg-icon>
                    </div>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <ProjectDialog :projectVisible="innerVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')" @clode-dialog="handleClose"
        @confirm="quitProject"></ProjectDialog>
    <ProjectDialog :projectVisible="delVisible" :context="t('Createteam.projectdelcontext')"
        :title="t('Createteam.projectdeltitle')" :confirm-btn="t('Createteam.ok_delete')" @clode-dialog="closeDelVisible"
        @confirm="DelProject"></ProjectDialog>
    <listrightmenu :items="updateitems" :data="mydata" @showMembergDialog="showMembergDialog"
        @projectrename="setProjectInfo" @showSettingDialog="showSettingDialog" @cancelFixed="cancelFixed(mydata)"
        @exitproject="rexitProject" @delproject="rdelProject" />
    <ProjectAccessSetting v-if="projectSettingDialog" :title="t('Createteam.membertip')" :data="mydata" width="500px"
        @clodeDialog="projectSettingDialog = false" />
    <ProjectMemberg v-if="projectMembergDialog" :projectMembergDialog="projectMembergDialog" :currentProject="mydata"
        @closeDialog="closeDialog" @exitProject="exitProject" />
</template>

<style scoped lang="scss">
.other {
    display: none;

    svg {
        width: 16px;
        height: 16px;
        transition: 0.3s;

        &:hover {
            transform: scale(1.2);
        }
    }

    >div {
        margin-right: 10px;
    }
}

.other1 {
    display: flex;

    svg {
        width: 16px;
        height: 16px;
    }

    >div {
        margin-right: 10px;
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

    .other {
        display: flex;
    }

    .other1 {
        display: none;
    }
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    .other {
        display: flex;
    }

    .other1 {
        display: none;
    }
}

:deep(.el-table__row:hover) {
    .other {
        display: flex;
    }

    .other1 {
        display: none;
    }
}</style>