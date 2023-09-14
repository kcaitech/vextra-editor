<template>
    <div class="table">
        <el-auto-resizer>
            <template #default="{ height, width }">
                <el-table-v2 :columns="columns" :data=props.data :width="width" :height="height" :row-class="rowClass"
                    :row-event-handlers="rowHandleClick" @scroll="rightmenu">
                    <template #overlay v-if="loading">
                        <div class="el-loading-mask" style="display: flex; align-items: center; justify-content: center">
                            <Loading :size="20"/>
                        </div>
                    </template>
                    <template #empty>
                        <div v-if="props.type === 'project'" class="datanull">
                            <p>项目没有任何文件</p>
                            <button type="button" @click="newProjectFill">新建文件</button>
                        </div>
                        <div v-else-if="empty" class="flex items-center justify-center h-100%">
                            <el-empty :style="{ 'height': height - 50 + 'px' }" :description="t('home.table_empty_tips')" />
                        </div>
                        <div v-else-if="noNetwork" ref="net" class="flex items-center justify-center h-100%">
                            <NetworkError @refreshDoc="refreshDoc"></NetworkError>
                        </div>
                    </template>
                </el-table-v2>
            </template>
        </el-auto-resizer>
    </div>
</template>
<script setup lang="tsx">
import { ref, watchEffect, Ref, inject } from 'vue'
import { Share, Delete, Remove } from '@element-plus/icons-vue'
import type { Column, RowClassNameGetter } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { watch, nextTick } from 'vue';
import NetworkError from '@/components/NetworkError.vue'
import Loading from '../common/Loading.vue';

const { t } = useI18n()


const loading = ref(true)
const empty = ref(false)
const net = ref<HTMLDivElement>()
const props = defineProps<{
    data: any
    iconlist: any
    noNetwork: boolean
    type?: string
    address?: boolean
    creator?: boolean
}>()

watch(() => props.data, () => {
    loading.value = false
    empty.value = true
});

const { projectList, saveProjectData, is_favor, favoriteList, updateFavor, is_team_upodate, teamData } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    is_team_upodate: Ref<boolean>;
    teamData: Ref<[{
        team: {
            id: string,
            name: string,
            avatar: string,
            description: string
        }
    }]>;
};

watch(() => props.noNetwork, (newV) => {
    if (newV) {
        nextTick(() => {
            if (net.value) {
                loading.value = false
                const el = net.value.parentElement
                nextTick(() => {
                    if (el) {
                        el.style.top = '50%'
                    }
                })
            }
        })
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
    'newProjectFill'
])

const selectedId = ref(-1)
const scrolltop = ref(0)

const refreshDoc = () => {
    emits('refreshDoc')
}
const newProjectFill = () => {
    emits('newProjectFill');
}

const rightmenu = (e: any) => {
    const rightmenuElement = document.querySelector('.rightmenu') as HTMLElement;
    if (e.scrollTop >= scrolltop.value + 300 || scrolltop.value - e.scrollTop >= 300) {
        scrolltop.value = e.scrollTop;
        if (rightmenuElement.style.display === 'block') {
            rightmenuElement.style.display = 'none'
        }
    }
}

const rowHandleClick = ({
    onclick: ({ rowData }: any) => {
        selectedId.value = rowData.document.id
    },
    ondblclick: ({ rowData }: any) => {
        emits('dbclickopen', rowData.document.id)
    },
    oncontextmenu: ({ event, rowData }: any) => {
        selectedId.value = rowData.document.id
        emits('rightMeun', event, rowData)
    },
})

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
    if (selectedId.value === rowData.document.id) {
        return 'selected'
    }
    return ''
}

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
        align: 'left',
        cellRenderer: ({ rowData }) => (
            <>
                {props.iconlist.includes('star') && !rowData.document_favorites.is_favorite && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('updatestar', rowData)
                        }}>
                        <el-tooltip content={t('home.star')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg star" icon-class="star" >
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('star') && rowData.document_favorites.is_favorite && (
                    <el-icon size={20} style={"display: inline-block"}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('updatestar', rowData)
                        }}>
                        <el-tooltip content={t('home.de_star')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg star" icon-class="stared" >
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('share') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('share', rowData)
                            console.log(rowData);
                        }}>
                        <el-tooltip content={t('home.share')} show-after={1000} hide-after={0}>
                            <Share />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('delete') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('deletefile', rowData)
                        }}>
                        <el-tooltip content={t('home.delete')} show-after={1000} hide-after={0}>
                            <Delete />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('remove') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('remove', rowData)
                        }}>
                        <el-tooltip content={t('home.de_access_record')} show-after={1000} hide-after={0}>
                            <Remove />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('restore') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('restore', rowData)
                        }}>
                        <el-tooltip content={t('home.restore')} show-after={1000} hide-after={0}>
                            <svg-icon class="svg restore" icon-class="restore">
                            </svg-icon>
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('Delete') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            emits('ndelete', rowData)
                        }}>
                        <el-tooltip content={t('home.completely_delete')} show-after={1000} hide-after={0}>
                            <Delete />
                        </el-tooltip>
                    </el-icon>
                )}

                {props.iconlist.includes('EXshare') && (
                    <el-icon size={20}
                        onDblclick={(event: MouseEvent) => event.stopPropagation()}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
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
    if(project) {
        const p_Info = projectList.value.filter(item => item.project.id === project.id)[0];
        if(p_Info && p_Info.is_in_team) {
            address = team.name + ' / ' + project.name;
        }else if(p_Info) {
            address = '收到的分享项目 / ' + project.name;
        }
        return address;
    }else {
        if(user_id === id) {
            address = '我的文件';
        }else {
            address = '收到的共享文件';
        }
        return address;
    }
}

watchEffect(() => {
    if (props.address) {
        columns.splice(3, 0, {
            key: 'address',
            dataKey: 'document',
            title: `文件位置`,
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
            title: `创建者`,
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
})

</script>
<style lang="scss" scoped>
.table {
    height: calc(100vh - 140px)
}

@media screen and (max-width: 1000px) {
    .table {
        height: calc(100vh - 125px);
    }
}
:deep(.el-table-v2__row) {
    display: flex;
    justify-content: space-between;
}
:deep(.el-table-v2__header-row) {
    display: flex;
    justify-content: space-between;
}

:deep(.el-table-v2__row:hover) {
    border-radius: 6px;
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

:deep(.el-icon) {
    box-sizing: content-box;
    margin-right: 6px;
    padding: 2px;
    display: none;
    color: #9775fa;

    &>:focus {
        outline: none;
    }
}


:deep(.el-table-v2__row.selected) {
    background-color: #e5dbff;
    border-radius: 6px;
}

:deep(span) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #606266;
}

:deep(.action) {
    background-color: red;
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
