<template>
    <tablelist :data="lists" :iconlist="iconlists" @restore="Restorefile" @ndelete="Deletefile" @rightMeun="rightmenu" />
    
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click="rRestorefile">{{ t('homerightmenu.restore') }}</li>
            <li @click="rDeletefile">{{ t('homerightmenu.completely_delete') }}</li>
        </ul>
    </div>

    <!-- 确认删除弹框 -->
    <el-dialog v-model="dialogVisible" :title="t('home.completely_delete')" width="500" align-center
        @keyup.enter="Qdeletefile(docId)">
        <span>{{ t('home.delete_tips') }}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :disabled="false" @click=" Qdeletefile(docId)" style="background-color: none;">
                    {{ t('home.delete_ok') }}
                </el-button>
                <el-button @click=" dialogVisible = false">{{ t('home.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import tablelist from '@/components/AppHome/tablelist.vue'
const { t } = useI18n()

const isLoading = ref(false)
const dialogVisible = ref(false)
const menu = ref<HTMLElement>()
const docId = ref('')
const mydata = ref()
let lists = ref<any[]>([])
const iconlists = ref(['restore', 'Delete'])

const emits = defineEmits(['data-update'])

interface data {
    document: {
        id: string
        name: string
        doc_type: number
    }
    document_favorites: {
        is_favorite: boolean
    }
}

//获取回收站文件列表
async function GetrecycleLists() {
    // loading
    isLoading.value = true
    try {
        const { data } = await user_api.GetrecycleList()
        if (data == null) {
            ElMessage.error(t('home.failed_list_tips'))
        } else {
            for (let i = 0; i < data.length; i++) {
                let { document: { size, deleted_at } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document.deleted_at = deleted_at.slice(0, 19).split('T')[0] + ' ' + deleted_at.slice(0, 19).split('T')[1]
            }
        }
        lists.value = Object.values(data)
    } catch (error) {
        ElMessage.error(t('home.failed_list_tips'))
    }

    // unloading  
    isLoading.value = false;
}

//转换文件大小
function sizeTostr(size: any) {
    if ((size / 1024 / 1024 / 1024) > 1) {
        size = Math.round((size / 1024 / 1024 / 1024) * 100) / 100 + "GB"
    } else if ((size / 1024 / 1024) > 1) {
        size = Math.round((size / 1024 / 1024) * 100) / 100 + "MB"
    } else if ((size / 1024) > 1) {
        size = Math.round((size / 1024) * 100) / 100 + "KB"
    } else {
        size = Math.round(size * 100) / 100 + "B"
    }
    return size
}

//还原对应文件
const Restorefile = async (data: data) => {
    const { document: { id } } = data
    const { code } = await user_api.RecoverFile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.restore_ok') })
        lists.value = lists.value.filter(item => item.document.id != id)
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.restore_no') })
    }
}

//删除对应文件
const Deletefile = (data: data) => {
    const { document: { id } } = data
    docId.value = id
    dialogVisible.value = true
}

//删除文件
const Qdeletefile = async (id: string) => {
    try {
        const { code } = await user_api.DeleteFile({ doc_id: id })
        if (code === 0) {
            lists.value = lists.value.filter(item => item.document.id != id)
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.delete_file_ok') })
            dialogVisible.value = false
        } else {
            dialogVisible.value = false
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.delete_file_no') })
        }
    } catch (error) {
        dialogVisible.value = false
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('other_tips') })
    }
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const { document: { id } } = data
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
    docId.value = id
    mydata.value = data
}

//右键还原对应文件
const rRestorefile = async () => {
    Restorefile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键删除对应文件
const rDeletefile = () => {
    dialogVisible.value = true
    const { document: { id } } = mydata.value
    docId.value = id
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

watch(lists, (Nlist) => {
    emits('data-update', Nlist, t('home.delete_file_time'))
}, { deep: true })

onMounted(() => {
    GetrecycleLists()
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style lang="scss" scoped>
main {
    height: auto;
}

.item {
    height: calc(100vh - 194px);
}

@media screen and (max-width: 1000px) {
    .item {
        height: calc(100vh - 154px);
    }
}

.title {
    display: flex;
    justify-content: space-between;
    padding: 0 10px 6px 10px;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;

    span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 10px;
    }

    span:nth-child(1) {
        flex: 2;
    }

    span:not(:nth-child(1)) {
        flex: 1;

    }

    div {
        flex: 1;
        padding: 0 10px 6px 0;
        display: flex;

    }
}

.rightmenu {
    display: none;
    min-width: 200px;
    z-index: 999;
    position: absolute;
    background-color: white;
    padding: 10px 0;
    border-radius: 5px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

    ul {
        margin: 0;
        padding: 0 10px;

        li {
            display: block;
            padding: 10px 10px;
            font-size: 14px;
            text-decoration: none;
            color: rgba(13, 13, 13, 0.9);
            border-radius: 2px;
            cursor: pointer;

            &:hover {
                background-color: #f3f0ff;
            }
        }
    }
}

.dialog-footer>.el-button {
    &:hover {
        background-color: rgba(208, 208, 208, 0.167);
    }

    &:active {
        background-color: white;
    }
}

.dialog-footer>.el-button--primary {
    background-color: #9775fa;
    color: white;
    border-color: #9775fa;

    &:hover {
        background: #9675fa91;
        border-color: #9675fa91;
    }

    &:active {
        background-color: #9775fa;
    }

    &[disabled] {
        background: #e5dbff;
        border: 1px #e5dbff solid;
    }
}


.el-icon {
    display: none;
    position: relative;
    top: 5px;

    &:hover {
        color: #6395f9;
    }

    &:active {
        color: #145ff6;

    }

    &:focus-visible {
        outline: none;
    }
}

:deep(.el-icon) {
    &>:focus {
        outline: none;
    }

    &>:focus-visible {
        outline: none;
    }
}

:deep(.el-table__row:hover .el-icon) {
    display: inline-block;
}

:deep(.el-table__row) {
    height: 56px;
    font-weight: 18px;
}

:deep(.el-table__cell) {
    padding: 0;
}

:deep(.el-table__cell .cell) {
    line-height: 56px;
}
</style>
