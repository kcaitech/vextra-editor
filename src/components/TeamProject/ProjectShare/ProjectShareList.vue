<script setup lang="ts">
import { Ref, nextTick, inject, ref, onMounted, watch, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n();
import { useRoute } from 'vue-router'
import { router } from '@/router'
import * as team_api from '@/apis/team';
import ProjectDialog from '../ProjectDialog.vue';
const tableData = computed(() => {
    return projectList.value.filter(item => !item.is_in_team);
});
const route = useRoute();
const innerVisible = ref(false);
const { projectList, saveProjectData, is_favor, favoriteList, updateFavor, is_team_upodate, teamUpdate } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;
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

const project_item = ref<any>({});
const project_index = ref<number>(-1);
const onExitProject = (row: any, index: number) => {
    project_item.value = row;
    project_index.value = index;
    innerVisible.value = true;
    document.addEventListener('keydown', escClose);
}
const escClose = () => {
    innerVisible.value = false;
}
watch(innerVisible, (v) => {
    if (!v) {
        document.removeEventListener('keydown', escClose);
    }
})
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

</script>

<template>
    <el-table :data="tableData" height="100%" style="width: 100%" :border="false" @row-dblclick="dblclickskipProject" highlight-current-row>
        <el-table-column prop="project" label="项目名称">
            <template #default="scope">
                <span class="description">{{ scope.row.project.name }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="project" label="项目描述">
            <template #default="scope">
                <span class="description">{{ scope.row.project.description }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建者">
            <template #default="scope">
                <span class="description"> {{ scope.row.creator.nickname }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="project" label="操作">
            <template #default="scope">
                <div class="other1" v-if="scope.row.is_favor">
                    <div @click="cancelFixed(scope.row)" >
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
                    <div @click="cancelFixed(scope.row)" >
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
    <ProjectDialog :projectVisible="innerVisible" context="退出项目后，无法再访问项目中的文件，或使用项目中的资源。" :title="'退出项目'"
        :confirm-btn="'仍然退出'" @clode-dialog="handleClose" @confirm="quitProject"></ProjectDialog>
</template>

<style scoped lang="scss">
.other {
    display: none;
    svg {
        width: 16px;
        height: 16px;
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
}
</style>