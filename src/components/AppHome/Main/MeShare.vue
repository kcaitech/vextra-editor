
<template>
    <!-- 表格布局 -->
    <el-table :data="getDoucmentList || []" height="83vh" style="width: 100%" v-loading="isLoading" v-infinite-scroll="load"
        empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180"
            style="text-align: center;">
            <template #default=" scope: any ">
                <el-icon :size=" 20 " v-if=" !getDoucmentList[scope.$index].document_favorites.is_favorite ">
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                        @click=" Starfile(scope.$index) ">{{ getDoucmentList[scope.$index].document_favorites.is_favorite
                        }}</svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " v-else>
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                        @click=" Starfile(scope.$index) "></svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <Share @click=" Sharefile(scope.$index) " />
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="删除" :show-after="1000">
                        <Delete @click=" Deletefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
        <append>aaaa</append>
    </el-table>
    <append>aaaa</append>
</template>

<script setup lang="ts">
import * as share_api from "@/apis/share"
import * as user_api from '@/apis/users'
import { Share, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from "vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isLoading = ref(false)
let getDoucmentList = ref<any[]>([])

isLoading.value = true;
function load() {

}

async function getDoucment() {
    // loading
    isLoading.value = true
    const { data } = await share_api.getDoucmentListAPI()
    if (data == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < data.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
    }
    getDoucmentList.value = data
    // unloading
    isLoading.value = false

}




function sizeTostr(size: any) {
    if ((size / 1024 / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024 / 1024).toFixed(2) + "GB"
    } else if ((size / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024).toFixed(2) + "MB"
    } else if ((size / 1024) > 1) {
        size = (size / 1024).toFixed(2) + "KB"
    } else {
        size = Math.round(size * 100) / 100 + "B"
    }
    return size
}


const Starfile = async (index: number) => {
    getDoucmentList.value[index].document_favorites.is_favorite = getDoucmentList.value[index].document_favorites.is_favorite === true ? false : true
    const doc_id = getDoucmentList.value[index].document.id
    if (getDoucmentList.value[index].document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: true })
        if (code === 0) {
            ElMessage.success("已取消星标文档")
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: false })
        if (code === 0) {
            ElMessage.success("已取消星标文档")
        }
    }

}

const Sharefile = (index: number) => {
    console.log(index)
}

const Deletefile = async (index: number) => {
    const { document: { id } } = getDoucmentList.value[index]
    const { code } = await user_api.MoveFile({ doc_id: id })
    if (code === 0) {
        ElMessage.success('文件已移至回收站')
        getDoucment()
    } else {
        ElMessage.error('移除失败')
    }
}


onMounted(() => {
    getDoucment()
})


</script>
<style lang="scss" scoped>
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

.el-table__row:hover .el-icon {
    display: inline-block;
}

:deep(.el-table_2_column_7) {
    text-align: center;
}

:deep(.el-table__row) {
    height: 50px;
    font-weight: 18px;
}
</style>
