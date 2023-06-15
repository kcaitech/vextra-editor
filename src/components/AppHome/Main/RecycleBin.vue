<template>
    <!-- 表格布局 -->
    <el-table :data="GetrecycleList" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容"
        @row-contextmenu="rightmenu">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 ">
                    <el-tooltip :content=" t('home.restore') " :show-after=" 1000 " :hide-after=" 0 ">
                        <svg-icon class="svg restore" style="width: 20px; height: 20px;" icon-class="restore"
                            @click.stop.prevent=" Restorefile(scope.$index) "></svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip :content=" t('home.completely_delete') " :show-after=" 1000 " :hide-after=" 0 ">
                        <Delete @click.stop.prevent=" Deletefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click=" rRestorefile ">{{t('homerightmenu.restore')}}</li>
            <li @click=" rDeletefile ">{{t('homerightmenu.completely_delete')}}</li>
        </ul>
    </div>
    <!-- 确认删除弹框 -->
    <el-dialog v-model=" dialogVisible " :title=" t('home.completely_delete') " width="500" align-center  @keyup.enter="Qdeletefile(fileid)">
        <span>{{t('home.delete_tips')}}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click=" Qdeletefile(fileid) " style="background-color: none;">
                    {{ t('home.delete_ok') }}
                </el-button>
                <el-button @click=" dialogVisible = false ">{{t('home.cancel')}}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const GetrecycleList = ref<any[]>([])
const isLoading = ref(false)
const dialogVisible = ref(false)
const documentId = ref()
const menu = ref<HTMLElement>()
const fileid = ref('')

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
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        GetrecycleList.value = data
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
const Restorefile = async (index: number) => {
    const { document: { id } } = GetrecycleList.value[index]

    const { code } = await user_api.RecoverFile({ doc_id: id })
    if (code === 0) {
        ElMessage.success(t('home.restore_ok'))
        GetrecycleLists()
    } else {
        ElMessage.error(t('home.restore_no'))
    }
}

//删除对应文件
const Deletefile = (index: number) => {
    dialogVisible.value = true
    const { document: { id } } = GetrecycleList.value[index]
    fileid.value = id
}

const rightmenu = (row: any, column: any, event: any) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const rightmenu: any = document.querySelector('.rightmenu')
    const top = event.pageY
    const left = event.pageX
    if (event.target.tagName == 'DIV') {
        rightmenu.style.left = left + 200 > viewportWidth ? (viewportWidth - 200) + "px" : left + 'px'
        rightmenu.style.top = top + 291 > viewportHeight ? (viewportHeight - 291) + 'px' : top + 'px'
        rightmenu.style.display = 'block'
    }
    documentId.value = row
}

//还原对应文件
const rRestorefile = async () => {
    const { document: { id } } = documentId.value
    const { code } = await user_api.RecoverFile({ doc_id: id })
    if (code === 0) {
        ElMessage.success(t('home.restore_ok'))
        GetrecycleLists()
    } else {
        ElMessage.error(t('home.restore_no'))
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//删除对应文件
const rDeletefile = () => {
    dialogVisible.value = true
    const { document: { id } } = documentId.value
    fileid.value = id
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const Qdeletefile = async (id: string) => {
    try {
        const { code } = await user_api.DeleteFile({ doc_id: id })
        if (code === 0) {
            ElMessage.success(t('home.delete_file_ok'))
            dialogVisible.value = false
            GetrecycleLists()
        } else {
            dialogVisible.value = false
            ElMessage.error(t('home.delete_file_no'))
        }
    } catch (error) {
        dialogVisible.value = false
        ElMessage.error(t('other_tips'))
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

onMounted(() => {
    GetrecycleLists()
    document.addEventListener('mousedown', handleClickOutside)

})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.rightmenu {
    display: none;
    min-width: 200px;
    height: auto;
    z-index: 9999;
    position: absolute;
    background-color: white;
    padding: 10px 0;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;

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
                background-color: rgba(192, 192, 192, 0.3);
            }
        }

    }
}

:deep(.el-button) {
    background: none;

    &:hover {
        background-color: #e0e0e049;
        border-color: #dcdfe6;
    }

    &:active {
        background-color: white;
    }
}

:deep(.el-button--primary) {
    background-color: none;
    background: #145ff6;
    border: #145ff6;

    &:hover {
        background-color: #145ff6cd;
    }

    &:active {
        background-color: #145ff6;
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
