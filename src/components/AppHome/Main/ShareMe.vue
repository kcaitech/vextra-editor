<template>
    <!-- 表格布局 -->
    <el-table :data="documentsList" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document.updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " content="标星" v-if=" documentsList[scope.$index].starfiled ">
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
    documentsList.value = (await user_api.GetDocumentsList()).data;
    for (let i = 0; i < documentsList.value.length; i++) {
        const updated = documentsList.value[i].document.updated_at.slice(0, 19)
        const size = Math.round(documentsList.value[i].document.size / 1024)
        documentsList.value[i].document.size = size + " KB"
        documentsList.value[i].document.updated_at = updated
        documentsList.value[i].starfiled = true

    }
    isLoading.value = false;
}

const Starfile = (index: number) => {
    documentsList.value[index].starfiled = documentsList.value[index].starfiled === true ? false : true
    console.log(documentsList.value[index].starfiled);

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