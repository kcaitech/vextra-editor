<script lang="ts" setup>
import { watch, ref, Ref, inject, computed, nextTick } from 'vue';
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
                target_project_id: active.value
            }
            if (props.projectItem.project.id === active.value) return emit('moveFillSeccess');
        }
    } else {
        if (activeNames.value === '2') {
            return emit('moveFillSeccess');
        }
        params = {
            document_id: props.doc!.document.id,
            target_project_id: active.value
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

const disabled = computed(() => {
    return activeNames.value !== '2' && activeNames.value !== '1' && pList.value.length === 0 ||
        activeNames.value === '1' && shareProject.value.length === 0
})

</script>

<template>
    <el-dialog class="movefile" v-model="isshow" width="550px" align-center :close-on-click-modal="false"
        :before-close="handleClose" :show-close="false">
        <template #header>
            <div class="my-header">
                <div class="title">{{ title }}</div>
                <div class="close" @click.stop="handleClose">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
        </template>
        <div class="context">
            <div class="filename">
                <span>{{ t('moveprojectfill.name') }}</span>
                <span>{{ props.doc!.document.name }}</span>
            </div>
            <div class="filelocation">
                <span>{{ t('moveprojectfill.location') }}</span>
                <span v-if="projectItem">{{ teamName + ' / ' + projectItem.project.name }}</span>
                <span v-else>{{ t('moveprojectfill.my_file') }}</span>
            </div>
            <div class="tips">
                {{ t('moveprojectfill.move_to') }}
            </div>
            <div class="conteiner">
                <div class="target_fill">
                    <el-scrollbar>
                        <div class="team-title" :class="{ 'is_active': activeNames === '2' }"
                            @click.stop="onactiveNames('2')">
                            <div class="left">
                                <svg-icon icon-class="file-normal"></svg-icon>
                                <div class="name">{{ t('moveprojectfill.my_file') }}</div>
                            </div>
                        </div>
                        <div class="team-title" :class="{ 'is_active': activeNames === '1' }"
                            @click.stop="onactiveNames('1')" v-if="shareProject.length > 0">
                            <div class="left">
                                <svg-icon icon-class="receive-fill" />
                                <div class="name">{{ t('moveprojectfill.share_Project') }}</div>
                            </div>
                        </div>
                        <template v-for="(data) in teamData" :key="data.team.id">
                            <div class="team-title" :class="{ 'is_active': activeNames === data.team.id }"
                                @click.stop="onactiveNames(data.team.id)">
                                <!-- v-if="data.self_perm_type > 0" 移除此判断，团队只读，但项目可以是可编辑-->
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
                    </el-scrollbar>
                </div>
                <div class="target_project">
                    <el-scrollbar>
                        <div class="project" :class="{ 'is_active': item.project.id === active }" v-for="(item, i) in pList"
                            :key="i" @click.stop="targetProject(item)">
                            <div class="left">
                                <div class="name">{{ item.project.name }}</div>
                            </div>
                        </div>
                        <div class="teamlocationtips"
                            v-if="activeNames !== '2' && activeNames !== '1' && pList.length === 0">没有可移动的位置</div>
                        <div class="project" :class="{ 'is_active': activeNames === '2' }" v-if="activeNames === '2'">
                            <div class="left">
                                <div>{{ t('moveprojectfill.private_file') }}</div>
                            </div>
                        </div>
                        <template v-for="(item, index) in shareProject" :key="index">
                            <div class="project" :class="{ 'is_active': item.project.id === active }"
                                v-if="activeNames === '1'" @click.stop="targetProject(item)">
                                <div class="left">
                                    <div class="name">{{ item.project.name }}</div>
                                </div>
                            </div>
                            <div class="projectlocationtips" v-if="activeNames === '1' && shareProject.length === 0">
                                没有可移动的位置</div>
                        </template>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="movefooter">
                <button class="bnt_confirm" :class="{ opacity: !active && activeNames !== '2' }" type="button"
                    @click.stop="quitProject" :disabled="disabled">
                    {{ confirmBtn }}
                </button>
                <button class="bnt_cancel" type="button" @click.stop="handleClose">
                    {{ t('moveprojectfill.cancel') }}
                </button>

            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss">
.opacity {
    opacity: 0.6;
}

.movefile {
    padding: 0 24px;
    margin: 0;
    border-radius: 16px;
    box-sizing: border-box;

    .el-dialog__header {
        padding: 0;
        margin: 0;

        .my-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 64px;

            .title {
                font-size: 16px;
                font-weight: 600;
            }

            .close {
                width: 16px;
                height: 16px;
                padding: 4px;
                border-radius: 6px;

                &:hover {
                    background-color: rgb(243, 243, 245);
                    cursor: pointer;
                }

                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .el-dialog__body {
        padding: 0;
        margin: 0;

        .context {


            .filename,
            .filelocation {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                height: 38px;

                span:first-child {
                    min-width: 65px;
                    color: #8C8C8C;
                }

                span:nth-child(2) {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: #000000;
                    font-weight: 600;
                }
            }

            .tips {
                display: flex;
                align-items: center;
                height: 34px;
                font-size: 13px;
                color: #262626;
                font-weight: 600;
            }

            .conteiner {
                display: flex;
                height: 348px;
                border-radius: 6px;
                border: 1px solid #EBEBEB;
                box-sizing: border-box;

                .target_fill {
                    flex: 1;
                    height: 348px;
                    padding: 8px;
                    border-right: 1px solid #EBEBEB;
                    overflow: hidden;
                    box-sizing: border-box;

                    .team-title {
                        display: flex;
                        align-items: center;
                        height: 40px;
                        border-radius: 6px;
                        padding: 0 0 0 8px;
                        box-sizing: border-box;

                        .left {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            overflow: hidden;

                            svg {
                                width: 24px;
                                height: 24px;
                                box-sizing: border-box;
                            }

                            .team-avatar {
                                width: 24px;
                                height: 24px;
                                min-width: 24px;
                                background-color: #3f00fc;
                                text-align: center;
                                border-radius: 50%;
                                overflow: hidden;
                                display: flex;
                                align-items: center;
                                justify-content: center;

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

                                font-size: 13px;
                                font-weight: 600;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }
                }

                .target_project {
                    flex: 1;
                    height: 348px;
                    padding: 8px;
                    overflow: hidden;
                    box-sizing: border-box;

                    .project {
                        display: flex;
                        align-items: center;
                        height: 40px;
                        border-radius: 6px;
                        padding: 0 0 0 8px;
                        box-sizing: border-box;

                        .left {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            overflow: hidden;
                        }

                        .name {
                            display: inline-block;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        &:hover {
                            background-color: rgba(245, 245, 245, 1);
                        }
                    }

                    .teamlocationtips,
                    .projectlocationtips {
                        font-size: 13px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 332px;
                        opacity: 0.6;
                    }
                }
            }
        }
    }

    .el-dialog__footer {
        padding: 0;
        margin: 0;

        .movefooter {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 64px;
            gap: 16px;

            button {
                cursor: pointer;
                font-size: 13px;
                width: 100px;
                height: 40px;
                border: none;
                border-radius: 6px;
                box-sizing: border-box;
            }

            .bnt_confirm {
                color: white;
                background-color: rgba(24, 120, 245, 1);

                &:hover {
                    background-color: rgba(66, 154, 255, 1);
                }

                &:active {
                    background-color: rgba(10, 89, 207, 1);
                }

                &:disabled {
                    background-color: rgba(189, 226, 255, 1);
                }
            }

            .bnt_cancel {
                color: rgba(51, 51, 51, 1);
                background-color: #FFFFFF;
                border: 1px solid #F0F0F0;

                &:hover {
                    background-color: rgba(247, 247, 249, 1);
                }

                &:active {
                    background-color: rgba(243, 243, 245, 1);
                }
            }
        }
    }
}

.is_active {
    color: rgba(24, 120, 245, 1);
    background-color: rgba(24, 120, 245, 0.1) !important;
}</style>