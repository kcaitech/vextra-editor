<template>
    <!-- 表格布局 -->
    <el-table :data="documentsList" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document.updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " v-if=" !documentsList[scope.$index].starfiled ">
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                        @click=" Starfile(scope.$index) "></svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " v-else>
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                        @click=" Starfile(scope.$index) "></svg-icon>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <Share @click=" Sharefile(scope.$index) " />
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Share, Remove } from '@element-plus/icons-vue'
import { pushScopeId, reactive, ref, onMounted } from 'vue'
import * as share_api from "@/apis/share"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

let documentsList = ref<any[]>([]);
const isLoading = ref(false);
async function getUserdata() {
    // loading
    isLoading.value = true;
    documentsList.value = (await user_api.GetfavoritesList()).data;
    for (let i = 0; i < documentsList.value.length; i++) {
        const updated = documentsList.value[i].document.updated_at.slice(0, 19)
        const size = sizeTostr(documentsList.value[i].document.size)
        documentsList.value[i].document.size = size
        documentsList.value[i].document.updated_at = updated
    }
    isLoading.value = false;
}

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

const Starfile = (index: number) => {
    documentsList.value[index].starfiled = documentsList.value[index].starfiled === true ? false : true
    const favorite_id: string = documentsList.value[index].document.id
    if (documentsList.value[index].starfiled ==true) {
        const status = 1
        user_api.DeleteList({ favorite_id, status })
    } else {
        const status = 0
        user_api.DeleteList({ favorite_id, status })
    }

}

const Sharefile = (index: number) => {
    console.log(index)
}

onMounted(() => {
    getUserdata()

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
