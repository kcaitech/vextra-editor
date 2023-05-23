<template>
    <!-- 表格布局 -->
    <el-table :data="Getfavorites || []" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容" @row-click="toDocument">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " v-if=" Getfavorites[scope.$index].document_favorites.is_favorite == false ">
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                        @click.stop=" Starfile(scope.$index) "></svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " v-else>
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                        @click.stop=" Starfile(scope.$index) "></svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <Share @click.stop=" Sharefile(scope) " />
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <FileShare v-if="showFileShare" @close="closeShare" :docId="docId" :selectValue="selectValue" @select-type="onSelectType" @switch-state="onSwitch" :shareSwitch="shareSwitch" :pageHeight="pageHeight"></FileShare>
    <div v-if="showFileShare" class="overlay"></div>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Share, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pushScopeId, reactive, ref, onMounted, onUnmounted } from 'vue'
import * as share_api from "@/apis/share"
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
const { t } = useI18n()

let Getfavorites = ref<any[]>([]);
const isLoading = ref(false);
const docId = ref('')
const showFileShare = ref<boolean>(false);
const shareSwitch = ref(true)
const pageHeight = ref(0)
const selectValue = ref(1)

async function getUserdata() {
    // loading
    isLoading.value = true
    const { data } = await user_api.GetfavoritesList()
    if (data == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < data.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
    }
    Getfavorites.value = data
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
    Getfavorites.value[index].document_favorites.is_favorite = Getfavorites.value[index].document_favorites.is_favorite === true ? false : true
    const doc_id = Getfavorites.value[index].document.id
    if (Getfavorites.value[index].document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: true })
        if (code === 0) {
            ElMessage.success("已取消星标文档")
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: doc_id, status: false })
        if (code === 0) {
            ElMessage.success("已取消星标文档")
            getUserdata()
        }
    }

}

const toDocument = (row: any) => {
    const docId = row.document.id
    router.push({
        name: 'document',
        query: {
            id: docId
        }
    })
}
const Sharefile = (scope: any) => {
    if(showFileShare.value) {
    showFileShare.value = false
    return
  }
    docId.value = scope.row.document.id
    selectValue.value = scope.row.document.doc_type !== 0 ? scope.row.document.doc_type : scope.row.document.doc_type  
  showFileShare.value = true
}
const closeShare = () => {
  showFileShare.value = false
}
const getPageHeight = () => {
  pageHeight.value = window.innerHeight
}
const onSwitch = (state: boolean) => {
    shareSwitch.value = state
}
const onSelectType = (type: number) => {
  selectValue.value = type
}

onMounted(() => {
    getUserdata()
    getPageHeight()
    window.addEventListener('resize', getPageHeight);
})
onUnmounted(() => {
  window.removeEventListener('resize', getPageHeight);
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
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
