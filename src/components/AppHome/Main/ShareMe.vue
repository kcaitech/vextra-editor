<template>
    <!-- 表格布局 -->
    <el-table :data="ShareList||[]" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document.updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " content="标星" v-if=" !ShareList[scope.$index].document_favorites.is_favorite ">
                    <el-tooltip content="标星" show-after="1000">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                            @click=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " v-else>
                    <el-tooltip content="取消标星" show-after="1000">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                            @click=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="分享" show-after="1000">
                        <Share @click=" Sharefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="退出共享" show-after="1000">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="exitshar"
                            @click=" Exitshar(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Share, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pushScopeId, reactive, ref, onMounted } from 'vue'
import * as share_api from "@/apis/share"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

let ShareList = ref<any[]>([]);
const isLoading = ref(false);


async function ShareLists() {
    // loading
    isLoading.value = true
    const { data } = await user_api.ShareLists()
    if (data == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < data.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
    }
    ShareList.value = data
    // unloading  
    isLoading.value = false;
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
    ShareList.value[index].document_favorites.is_favorite = ShareList.value[index].document_favorites.is_favorite === true ? false : true
    const doc_id = ShareList.value[index].document.id
    if (ShareList.value[index].document_favorites.is_favorite == true) {
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

const Exitshar = async (index: number) => {
    const {document:{id}} = ShareList.value[index]
    const { code } = await user_api.ExitSharing({ share_id:id})
    if(!code){
        ElMessage.success('退出成功')
    }else{
        ElMessage.error('退出失败')
    }
    
    
}

onMounted(() => {
    ShareLists()

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
    height: 56px;
    font-weight: 18px;
}
</style>