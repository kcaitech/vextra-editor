<script lang="ts" setup>
import { watch, ref, Ref, inject, computed, nextTick } from 'vue';
import { Folder } from '@element-plus/icons-vue';
import * as team_api from '@/request/team';
import { useI18n } from 'vue-i18n';

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

const emit = defineEmits<{
    (e: 'clodeDialog'): void;
    (e: 'confirm'): void;
    (e: 'moveFillSeccess'): void;
}>()

const { t } = useI18n()
const isshow = ref(false);
const active = ref('');

watch(() => props.projectVisible, (newvalue) => {
    isshow.value = newvalue
})

const handleClose = () => {
    emit('clodeDialog')
}

const { teamData, projectList } = inject('shareData') as {
    teamData: Ref<any[]>;
    projectList: Ref<any[]>;
    updateProject: () => void;
}
const activeNames = ref('2');
const pList = computed(() => {
    return projectList.value.filter(item => item.project.team_id === activeNames.value && item.self_perm_type >= 3);
})
const teamName = computed(() => {
    if (!props.projectItem || !teamData.value) return ''
    const team = teamData.value.filter(item => item.team.id === props.projectItem.project.team_id)[0]
    if (team) {
        return team.team.name
    } else {
        return ''
    }
})
const shareProject = computed(() => {
    return projectList.value.filter(item => !item.is_in_team);
})

const curProject = ref<any>({});
const targetProject = (project: any) => {
    active.value = project.project.id;
    curProject.value = project;
}
watch(activeNames, (v) => {
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
    if (!active.value && activeNames.value !== '2') return;
    let params
    emit('confirm');
    if (props.projectItem) {
        if (activeNames.value === '2') {
            params = {
                document_id: props.doc!.document.id,
                source_project_id: props.projectItem.project.id
            }
        } else {
            params = {
                document_id: props.doc!.document.id,
                source_project_id: props.projectItem.project.id,
                target_project_id: curProject.value.project.id
            }
            if (props.projectItem.project.id === curProject.value.project.id) return emit('moveFillSeccess');
        }
    } else {
        if (activeNames.value === '2') {
            return emit('moveFillSeccess');
        }
        params = {
            document_id: props.doc!.document.id,
            target_project_id: curProject.value.project.id
        }
    }
    moveProjectTarget(params);
    emit('moveFillSeccess');
}

const onactiveNames = (id: string) => {
    activeNames.value = id;
    if (id === '1') {
        nextTick(() => {
            active.value = shareProject.value[0].project.id;
        })
    } else if (id !== '2') {
        nextTick(() => {
            if (pList.value.length > 0) {
                active.value = pList.value[0].project.id;
            }
        })
    }
}
</script>

<template>
    <el-dialog v-model="isshow" width="550px" :title="title" align-center :close-on-click-modal="false"
        :before-close="handleClose">
        <div class="context">
            <div class="name">
                <span>{{ t('moveprojectfill.name') }}</span>
                <span style="font-weight: bold; margin-left: 5px;">{{ props.doc!.document.name }}</span>
            </div>
            <div class="name">
                <span>{{ t('moveprojectfill.location') }}</span>
                <span v-if="projectItem" style="font-weight: bold;margin-left: 5px;">{{ teamName + ' / ' +
                    projectItem.project.name }}</span>
                <span v-else style="font-weight: bold;margin-left: 5px;">{{ t('moveprojectfill.my_file') }}</span>
            </div>
            <div>
                {{ t('moveprojectfill.move_to') }}
            </div>
            <div class="conteiner">
                <div class="target_fill">
                    <el-scrollbar height="290px">
                        <div class="team-title" @click="onactiveNames('2')">
                            <div class="left" :class="{ 'is_active': activeNames === '2' }">
                                <el-icon style="margin-right: 10px;">
                                    <Folder />
                                </el-icon>
                                <div class="name">{{ t('moveprojectfill.my_file') }}</div>
                            </div>
                        </div>
                        <div class="team-title" @click="onactiveNames('1')" v-if="shareProject.length > 0">
                            <div class="left" :class="{ 'is_active': activeNames === '1' }">
                                <div class="receive">
                                    <svg-icon icon-class="receive-fill" />
                                </div>
                                <div class="name">{{ t('moveprojectfill.share_Project') }}</div>
                            </div>
                        </div>
                        <template v-for="(data) in teamData" :key="data.team.id">
                            <div class="team-title" @click="onactiveNames(data.team.id)" v-if="data.self_perm_type > 0">
                                <div class="left" :class="{ 'is_active': activeNames === data.team.id }">
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
                    </el-scrollbar>
                </div>
                <div class="target_project">
                    <el-scrollbar height="290px">
                        <div class="project" v-for="(item, i) in pList" :key="i" @click="targetProject(item)">
                            <div :class="{ 'is_active': item.project.id === active }">
                                <el-icon style="margin-right: 10px;">
                                    <Folder />
                                </el-icon>
                                <div class="name">{{ item.project.name }}</div>
                            </div>
                        </div>
                        <div class="project" v-if="activeNames === '2'">
                            <div :class="{ 'is_active': activeNames === '2' }">
                                <el-icon style="margin-right: 10px;">
                                    <Folder />
                                </el-icon>
                                <div>{{ t('moveprojectfill.private_file') }}</div>
                            </div>
                        </div>
                        <template v-for="(item, i) in shareProject" :key="i">
                            <div class="project" v-if="activeNames === '1'" @click="targetProject(item)">
                                <div :class="{ 'is_active': item.project.id === active }">
                                    <el-icon style="margin-right: 10px;">
                                        <Folder />
                                    </el-icon>
                                    <div class="name">{{ item.project.name }}</div>
                                </div>
                            </div>
                        </template>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button class="quit" :class="{ opacity: !active && activeNames !== '2' }" @click="quitProject"
                    style="background-color: #9775fa; color: #fff;">{{ confirmBtn
                    }}</el-button>
                <el-button class="quit" style="background-color: #fff; color: #000;" @click="handleClose">
                    {{ t('moveprojectfill.cancel') }}
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

:deep(.el-scrollbar) {
    margin-right: -10px;
}

h6 {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-right: 10px;
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
            box-sizing: border-box;
        }

        .target_project {
            width: 60%;
            ;
            padding: 5px 10px;
            box-sizing: border-box;
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

    .left {
        display: flex;
        align-items: center;
        width: 100%;
        padding-left: 8px;
        margin-right: 10px;
        border-radius: 4px;
        height: 100%;

        &:hover {
            background-color: #f3f0ff;

            .right {
                visibility: visible;
            }
        }

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
    padding-right: 10px;

    >div {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        height: 35px;
        border-radius: 4px;
        padding-left: 10px;
        margin-right: 10px;

        &:hover {
            background-color: #f3f0ff;
        }
    }

    .name {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
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

.opacity {
    opacity: .5;
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