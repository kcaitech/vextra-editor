<template>
    <el-auto-resizer>
        <template #default="{ height, width }">
            <el-table-v2 v-if="height != 0" :columns="columns" :data=props.data :width="width" :height="height"
                :row-class="rowClass" :row-event-handlers="rowHandleClick" @scroll="rightmenu" :header-height="24"
                :row-height="40" :header-class="headerClass">
                <template v-if="loading" #overlay>
                    <div class="el-loading-mask" style="display: flex; align-items: center; justify-content: center">
                        <Loading :size="20" />
                    </div>
                </template>
                <template #empty>
                    <div v-if="props.addfile! > 2 && !loading && !noNetwork" class="datanull">
                        <p>{{ t('Createteam.projectfilenull') }}</p>
                        <button type="button" @click.stop="newProjectFill">{{ t('home.new_file') }}</button>
                    </div>
                    <div v-else-if="props.addproject! > 0 && !loading && !noNetwork" class="datanull">
                        <p>{{ props.nulldata ? t('search.search_results') : t('projectlist.datanull') }}</p>
                        <button type="button" @click.stop="onAddproject">{{ t('projectlist.addproject') }}</button>
                    </div>
                    <div v-else-if="!noNetwork && empty" class="flex items-center justify-center h-100%">
                        <el-empty :style="{ 'height': height - 50 + 'px' }" :description="t('home.table_empty_tips')" />
                    </div>
                    <div v-else-if="noNetwork" ref="net" class="flex items-center justify-center h-full">
                        <NetworkError @refreshDoc="refreshDoc"></NetworkError>
                    </div>
                </template>
            </el-table-v2>
        </template>
    </el-auto-resizer>
</template>
<script setup lang="tsx">
import { ref, watchEffect, Ref, inject, watch, computed } from 'vue'
import { Share, Delete, Remove } from '@element-plus/icons-vue'
import type { Column, RowClassNameGetter } from 'element-plus'
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'
import Loading from '../common/Loading.vue';
const props = defineProps<{
    data: any,
    iconlist: any,
    noNetwork: boolean,
    addfile?: number,
    address?: boolean,
    creator?: boolean,
    deleter?: boolean,
    projectshare?: boolean,
    addproject?: number,
    perm?: number,
    nulldata?: boolean
}>()
const { t } = useI18n()
const loading = ref(true)
const empty = ref(false)
const net = ref<HTMLDivElement>()
const user_id = localStorage.getItem('userId');



let timer: any
watch(() => props.data, () => {
    clearTimeout(timer)
    if (props.data[0]) {
        loading.value = false

    } else {
        empty.value = true
        loading.value = false
    }
});

const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
};

watch([() => props.noNetwork, net], (newV) => {
    if (newV) {
        loading.value = false
        if (net.value) {
            const el = net.value.parentElement!
            el.style.top = '50%'
        }
    }
})


const emits = defineEmits([
    'rightMeun',
    'updatestar',
    'share',
    'deletefile',
    'remove',
    'restore',
    'ndelete',
    'exit_share',
    'dbclickopen',
    'refreshDoc',
    'newProjectFill',
    'onAddproject',
    'cancelfixed',
    'skipproject',
    'onexitproject'

])

const selectedId = ref(-1)
const scrolltop = ref(0)

const refreshDoc = () => {
    emits('refreshDoc')
}
const newProjectFill = () => {
    emits('newProjectFill');
}

const onAddproject = () => {
    emits('onAddproject');
}

const rightmenu = (e: any,) => {
    const rightmenuElement = document.querySelector('.rightmenu') as HTMLElement;
    if (e.scrollTop >= scrolltop.value + 300 || scrolltop.value - e.scrollTop >= 300) {
        scrolltop.value = e.scrollTop;
        if (rightmenuElement.style.display === 'block') {
            rightmenuElement.style.display = 'none'
        }
    }
    x.value = e.scrollTop
}

const rowHandleClick = ({
    onclick: ({ rowData }: any) => {
        selectedId.value = -1
        if (rowData.project) {
            selectedId.value = rowData.project.id
        }
        if (rowData.document) {
            selectedId.value = rowData.document.id
        }
    },

    ondblclick: ({ rowData }: any) => {
        if (props.projectshare) {
            emits('dbclickopen', rowData)
        } else {
            emits('dbclickopen', rowData.document.id)
        }

    },

    oncontextmenu: ({ event, rowData, rowIndex }: any) => {
        if (props.projectshare) {
            selectedId.value = rowData.project.id
        } else {
            selectedId.value = rowData.document.id
        }
        emits('rightMeun', event, rowData, rowIndex)
    },
})

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
    if (rowData.project) {
        if (selectedId.value === rowData.project.id) {
            return 'selected'
        }
    }
    if (rowData.document)
        if (selectedId.value === rowData.document.id) {
            return 'selected'
        }
}

const x = ref(0)

const headerClass = computed(() => {
    return x.value > 0 ? 'test' : ''
})



const columns: Column<any>[] = [
    {
        key: 'name',
        title: `${t('home.file_name')}`,
        width: 400,
        minWidth: 100,
        dataKey: 'document',
        align: 'left',
        cellRenderer: ({ cellData: { name } }) => <span>{name}</span>
    },

    {
        key: 'time',
        title: `${props.iconlist.includes('restore') ? t('home.delete_file_time') : t('home.modification_time')}`,
        dataKey: 'document',
        width: 400,
        minWidth: 100,
        align: 'left',
        cellRenderer: ({ rowData: { document: { deleted_at, created_at }, document_access_record: { last_access_time, id } } }) => {
            let displayContent;
            if (props.iconlist.includes('restore')) {
                displayContent = <span>{deleted_at}</span>;
            } else {
                if (id === '0') {
                    let time = created_at.split('.')[0]
                    displayContent = <span>{time}</span>;
                } else {
                    displayContent = <span>{last_access_time}</span>;
                }
            }
            return (
                <>
                    {displayContent}
                </>
            );

        }

    },
    {
        key: 'size',
        dataKey: 'document',
        title: `${t('home.size')}`,
        width: 400,
        minWidth: 100,
        align: 'left',
        cellRenderer: ({ cellData: { size } }) => <span>{size}</span>,
    },
    {
        key: 'operations',
        title: `${t('home.operation')}`,
        dataKey: 'document',
        width: 400,
        minWidth: 100,
        class: 'other',
        align: 'left',
        cellRenderer: ({ rowData }) => (
            <>
                {props.iconlist.includes('star') && !rowData.document_favorites.is_favorite && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('updatestar', rowData)
                        }}>
                        <el-tooltip content={t('home.star')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg star" icon-class="star" >
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('star') && rowData.document_favorites.is_favorite && (
                    <el-icon style={"display: inline-block"}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('updatestar', rowData)
                        }}>
                        <el-tooltip content={t('home.de_star')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg star" icon-class="stared" >
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('share') && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('share', rowData)
                        }}>
                        <el-tooltip content={t('home.share')} show-after={1000} hide-after={0}>
                            <Share />
                        </el-tooltip>
                    </el-icon>
                )}

                {(props.iconlist.includes('delete_p') && props.perm! > 3 || props.perm! === 3 && rowData.document.user_id === user_id) && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('deletefile', rowData)
                        }}>
                        <el-tooltip content={t('home.delete')} show-after={1000} hide-after={0}>
                            <Delete />
                        </el-tooltip>
                    </el-icon>
                )}
                {(props.iconlist.includes('delete')) && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('deletefile', rowData)
                        }}>
                        <el-tooltip content={t('home.delete')} show-after={1000} hide-after={0}>
                            <Delete />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('remove') && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('remove', rowData)
                        }}>
                        <el-tooltip content={t('home.de_access_record')} show-after={1000} hide-after={0}>
                            <Remove />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('restore') && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('restore', rowData)
                        }}>
                        <el-tooltip content={t('home.restore')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg restore" icon-class="restore">
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('Delete') && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('ndelete', rowData)
                        }}>
                        <el-tooltip content={t('home.completely_delete')} show-after={1000} hide-after={0}>
                            <Delete />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('EXshare') && (
                    <el-icon
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {

                            emits('exit_share', rowData)
                        }}>
                        <el-tooltip content={t('home.exit_share')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg star" icon-class="exitshar" >
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}
            </>
        ),

    },
]

const getFillAddress = (id: string, project: any, team: any) => {
    const user_id = localStorage.getItem('userId');
    let address = '';
    if (project) {
        const p_Info = projectList.value.filter(item => item.project.id === project.id)[0];
        if (p_Info && p_Info.is_in_team) {
            address = team.name + ' / ' + project.name;
        } else if (p_Info) {
            address = `${t('Createteam.sharetip')} / '` + project.name;
        }
        return address;
    } else {
        if (user_id === id) {
            address = t('home.file_shared');
        } else {
            address = t('home.shared_file_received');
        }
        return address;
    }
}

watchEffect(() => {
    if (props.address) {
        columns.splice(3, 0, {
            key: 'address',
            dataKey: 'document',
            title: t('home.filelocation'),
            width: 400,
            minWidth: 100,
            cellRenderer: ({ rowData: { document: { user_id }, project, team } }) => {
                const address = getFillAddress(user_id, project, team);
                return (
                    <span>{address}</span>
                );
            },
        },)
    }
    if (props.creator) {
        columns.splice(3, 0, {
            key: 'creator',
            dataKey: 'document',
            title: t('home.creator'),
            width: 400,
            minWidth: 100,
            align: 'left',
            cellRenderer: ({ rowData: { user: { nickname } } }) => {
                return (
                    <span>{nickname}</span>
                );
            },
        },)
    }
    if (props.deleter) {
        columns.splice(3, 0, {
            key: 'deleter',
            dataKey: 'document',
            title: t('home.deleter'),
            width: 400,
            minWidth: 100,
            cellRenderer: ({ rowData: { delete_user: { nickname } } }) => {
                return (
                    <span>{nickname}</span>
                );
            },
        },)
    }
    if (props.projectshare) {
        columns.splice(0, columns.length, {
            key: 'name',
            title: t('Createteam.project_name'),
            width: 400,
            minWidth: 100,
            dataKey: 'project',
            align: 'left',
            cellRenderer: ({ rowData: { project: { name } } }) => <span>{name}</span>
        },
            {
                key: 'description',
                title: t('Createteam.project_description'),
                width: 400,
                minWidth: 100,
                dataKey: 'project',
                align: 'left',
                cellRenderer: ({ rowData: { project: { description } } }) => <span>{description}</span>
            },
            {
                key: 'creator',
                title: t('Createteam.creator'),
                width: 400,
                minWidth: 100,
                dataKey: 'creator',
                align: 'left',
                cellRenderer: ({ rowData: { creator: { nickname } } }) => <span>{nickname}</span>
            },
            {
                key: 'name',
                title: t('home.operation'),
                width: 400,
                minWidth: 100,
                dataKey: 'project',
                class: 'other',
                align: 'left',
                cellRenderer: ({ rowData, rowIndex }) => (
                    <>
                        {!rowData.is_favor && (
                            <el-icon
                                onDblclick={(event: MouseEvent) => event.stopPropagation()}
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation()
                                    emits('cancelfixed', rowData, rowData.is_favor, rowIndex)
                                }}>
                                <el-tooltip content={t('Createteam.fixed')} show-after={1000} hide-after={0}>
                                    <svg-icon icon-class="fixed"></svg-icon>
                                </el-tooltip>
                            </el-icon>
                        )}

                        {rowData.is_favor && (
                            <el-icon style={"display: inline-block"}
                                onDblclick={(event: MouseEvent) => event.stopPropagation()}
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation()
                                    emits('cancelfixed', rowData, rowData.is_favor, rowIndex)
                                }}>
                                <el-tooltip content={t('Createteam.cancelFixed')} show-after={1000} hide-after={0}>
                                    <svg-icon icon-class="fixed-cancel"></svg-icon>
                                </el-tooltip>
                            </el-icon>
                        )}

                        {(
                            <el-icon
                                onDblclick={(event: MouseEvent) => event.stopPropagation()}
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation()
                                    emits('skipproject', rowData.project.id)
                                }}>
                                <el-tooltip content={t('projectlist.enterproject')} show-after={1000} hide-after={0}>
                                    <svg-icon icon-class="entrance"></svg-icon>
                                </el-tooltip>
                            </el-icon>
                        )}

                        {rowData.self_perm_type === 5 && (
                            <el-icon
                                onDblclick={(event: MouseEvent) => event.stopPropagation()}
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation()
                                    emits('onexitproject', rowData, rowIndex)
                                }}>
                                <el-tooltip content={t('teamprojectmenu.projectdeltitle')} show-after={1000} hide-after={0}>
                                    <svg-icon icon-class="delete-project"></svg-icon>
                                </el-tooltip>
                            </el-icon>
                        )}
                        {rowData.self_perm_type !== 5 && (
                            <el-icon
                                onDblclick={(event: MouseEvent) => event.stopPropagation()}
                                onClick={(event: MouseEvent) => {
                                    event.stopPropagation()
                                    emits('onexitproject', rowData, rowIndex)
                                }}>
                                <el-tooltip content={t('teamprojectmenu.projectexittitle')} show-after={1000} hide-after={0}>
                                    <svg-icon icon-class="exit-project"></svg-icon>
                                </el-tooltip>
                            </el-icon>
                        )}
                    </>
                ),
            },)
    }
})

</script>
<style lang="scss" scoped>
:deep(.other) {
    color: var(--active-color);

    .el-icon {
        font-size: 20px;
        margin-right: 6px;
        padding: 2px;
        display: none;

        svg {
            outline: none;
        }
    }
}

:deep(.el-table-v2__header-wrapper) {
    height: 26px !important;
}

:deep(.el-table-v2__header) {
    height: 26px !important;
}

:deep(.test) {
    box-shadow: 0 0 4px 0 rgb(0, 0, 0, 0.1) !important;
}

:deep(.el-table-v2__row) {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid white;
    border-top: 1px solid white;
    will-change: top;
}

:deep(.el-table-v2__header-row) {
    border: none;
    display: flex;
    justify-content: space-between;
    transition: all 0.2s ease-in-out;
}

:deep(.el-table-v2__row:hover) {
    border-radius: 4px;
    background-color: #f3f0ff;

    // border: none;

    .el-icon {
        display: block;

        &:hover {
            animation: el-icon 0.3s ease;
            transform: scale(1.2);
            cursor: pointer;
        }

        &:active {
            color: #7950f2;
        }
    }
}

:deep(.selected) {
    background-color: #e5dbff !important;
    border-radius: 4px !important;
}

:deep(span) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #606266;
}

@keyframes el-icon {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(1.2);
    }
}

.datanull {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 25%;

    button {
        cursor: pointer;
        border: none;
        width: 80px;
        height: 32px;
        border-radius: 4px;
        background-color: #9775fa;
        box-shadow: 1px 1px 3px #b1b1b1, -1px -1px 3px #b1b1b1;
        box-sizing: border-box;
        transition: all 0.5s ease-out;
        color: white;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }
    }
}
</style>
