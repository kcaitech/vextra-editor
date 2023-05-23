<template>
    <!-- 表格布局 -->
    <el-table :data="GetrecycleList || []" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容"
        @row-click="toDocument">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 ">
                    <el-tooltip content="还原" show-after="1000">
                        <svg-icon class="svg restore" style="width: 20px; height: 20px;" icon-class="restore"
                            @click.stop.prevent=" Restorefile(scope.$index) "></svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="彻底删除" show-after="1000">
                        <Delete @click.stop.prevent=" Deletefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <!-- 确认删除弹框 -->
    <el-dialog v-model=" dialogVisible " title="彻底删除" width="30%" align-center>
        <span>删除执行后，文件将无法恢复找回，确认要删除吗？</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click=" Qdeletefile " style="background-color: none;">
                    确定删除
                </el-button>
                <el-button @click=" dialogVisible = false ">取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
const { t } = useI18n()

let GetrecycleList = ref<any[]>([])
const isLoading = ref(false)
const dialogVisible = ref(false)
let fileid = 0

//获取回收站文件列表
async function GetrecycleLists() {
    // loading
    isLoading.value = true
    const { data } = await user_api.GetrecycleList()
    if (data == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < data.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
    }
    GetrecycleList.value = data
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
        ElMessage.success('还原成功')
        GetrecycleLists()
    } else {
        ElMessage.error('还原失败')
    }
}

//删除对应文件
const Deletefile = (index: number) => {
    dialogVisible.value = true
    fileid = index
}

const Qdeletefile = async () => {
    try {
        const { document: { id } } = GetrecycleList.value[fileid]
    const { code } = await user_api.DeleteFile({ doc_id: id })
    if (code === 0) {
        ElMessage.success('删除成功')
        dialogVisible.value = false
        GetrecycleLists()
    } else {
        dialogVisible.value = false
        ElMessage.error('删除失败')
    }
    } catch (error) {
        dialogVisible.value = false
        ElMessage.error('请确保网络联系正常')
    }
    
}




//回收站列表屏蔽点击打开的动作
const toDocument = (row: any) => {
    const docId = row.document.id
    router.push({
        name: 'document',
        query: {
            id: docId
        }
    })
}

onMounted(() => {
    GetrecycleLists()

})
</script>

<style lang="scss" scoped>
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
</style>
