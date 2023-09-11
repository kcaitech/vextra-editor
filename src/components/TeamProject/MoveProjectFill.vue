<script lang="ts" setup>
import { watch, ref, Ref, inject, watchEffect, computed } from 'vue';
import { Folder } from '@element-plus/icons-vue';
import * as team_api from '@/apis/team';
interface data {
    document: {
        id: string
        name: string
        doc_type: number
        user_id: string
    }
    document_favorites: {
        is_favorite: boolean
    }
}

const props = defineProps<{
    projectVisible: boolean
    title: string
    confirmBtn: string
    projectItem: any
    doc: data | undefined
}>();
const isshow = ref(false);
const active = ref('');

watch(() => props.projectVisible, (newvalue) => {
    isshow.value = newvalue
})

const emit = defineEmits<{
    (e: 'clodeDialog'): void;
    (e: 'confirm'): void;
    (e: 'moveFillSeccess'): void;
}>()
const handleClose = () => {
    emit('clodeDialog')
}

const { teamData, projectList } = inject('shareData') as {
    teamData: Ref<any[]>;
    projectList: Ref<any[]>;
    updateProject: () => void;
}
const activeNames = ref();
const pList = computed(() => {
    return projectList.value.filter(item => item.project.team_id === activeNames.value && item.self_perm_type >= 3);
})
const teamName = computed(() => {
    return teamData.value.filter(item => item.team.id === props.projectItem.project.team_id)[0].team.name
})
const shareProject = computed(() => {
    return projectList.value.filter(item => !item.is_in_team);
})

const curProject = ref<any>({});
const targetProject = (project: any) => {
    active.value = project.project.id;
    curProject.value = project;
}
watch(activeNames, () => {
    active.value = '';
})
const moveProjectTarget = async (params: any) => {
    try {
        await team_api.moveDocumentAPI(params)
    } catch (err) {
        console.log(err);

    }
}
const quitProject = () => {
    emit('confirm');
    const params = {
        document_id: props.doc!.document.id,
        source_project_id: props.projectItem.project.id,
        target_project_id: curProject.value.project.id
    }
    moveProjectTarget(params);
    emit('moveFillSeccess')
}

const onactiveNames = (id: string) => {
    activeNames.value = id;
}
</script>

<template>
    <el-dialog v-model="isshow" width="550px" :title="title" align-center :close-on-click-modal="false"
        :before-close="handleClose">
        <div class="context">
            <div class="name">
                <span>文件名称:</span>
                <span style="font-weight: bold; margin-left: 5px;">{{ props.doc!.document.name }}</span>
            </div>
            <div class="name">
                <span>当前位置:</span>
                <span style="font-weight: bold;margin-left: 5px;">{{ teamName + ' / ' + projectItem.project.name }}</span>
            </div>
            <div>
                移动文件至:
            </div>
            <div class="conteiner">
                <div class="target_fill">
                    <template v-for="(data) in teamData" :key="data.team.id">
                        <div class="team-title" :class="{ 'is_active': activeNames === data.team.id }"
                            @click="onactiveNames(data.team.id)">
                            <div class="left">
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
                        </div>
                    </template>
                    <template>
                        <div class="team-title" :class="{ 'is_active': activeNames === '1' }"
                            @click="onactiveNames('1')">
                            <div class="left">
                                <div class="team-avatar">
                                    <div class="img">
                                        <img src="" alt="team avatar">
                                    </div>
                                </div>
                                <div class="name">收到的共享项目</div>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="target_project">
                    <div class="project" :class="{ 'is_active': item.project.id === active }" v-for="(item, i) in pList || shareProject"
                        :key="i" @click="targetProject(item)">
                        <div>
                            <el-icon style="margin-right: 10px;">
                                <Folder />
                            </el-icon>
                            <div>{{ item.project.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button class="quit" @click="quitProject" style="background-color: #9775fa; color: #fff;">{{ confirmBtn
                }}</el-button>
                <el-button class="quit" style="background-color: #9775fa; color: #fff;" @click="handleClose">
                    取消
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
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

.context {
    font-size: 14px;
    color: #000;
    padding-right: 10px;

    >.name {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .conteiner {
        display: flex;
        margin-top: 10px;
        width: 100%;
        height: 300px;
        border: 1px solid rgba(0, 0, 0, .5);
        border-radius: 4px;

        .target_fill {
            padding: 5px 10px;
            width: 40%;
            border-right: 1px solid rgba(0, 0, 0, .5);
        }

        .target_project {
            flex: 1;
            padding: 5px 10px;
        }
    }
}

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
        width: 100%;
        margin-left: 8px;
        height: 100%;

        .down {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 16px;
            width: 16px;
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
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 100%;
        }
    }
}

.project {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    margin-bottom: 5px;

    &:hover {
        background-color: #f3f0ff;
    }

    >div {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        height: 35px;
        border-radius: 4px;
        padding-left: 10px;
    }
}


.dialog-footer {
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}

:deep(.el-collapse-item__content) {
    padding: 0;
}

:deep(.el-input__wrapper) {
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

.is_active {
    font-weight: 600;
    color: #9775fa;
    background-color: #e5dbff !important;
}
</style>