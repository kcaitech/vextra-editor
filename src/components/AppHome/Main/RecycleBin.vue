<template>
    <!-- 表格布局 -->
    <el-table :data="RecycleLists" height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document.updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 ">
                    <el-tooltip content="还原" show-after="1000">
                        <svg-icon class="svg restore" style="width: 20px; height: 20px;" icon-class="restore"
                            @click=" Restorefile(scope.$index) "></svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="彻底删除" show-after="1000">
                        <Delete @click=" Deletefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Share, Delete } from '@element-plus/icons-vue'
import { pushScopeId, reactive, ref, onMounted } from 'vue'
import * as share_api from "@/apis/share"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

let RecycleLists = ref<any[]>([]);
const isLoading = ref(false);
async function RecycleList() {
    // loading
    isLoading.value = true;
    RecycleLists.value = (await user_api.GetrecycleList()).data;
    for (let i = 0; i < RecycleLists.value.length; i++) {
        const updated = RecycleLists.value[i].document.updated_at.slice(0, 19)
        const size = Math.round(RecycleLists.value[i].document.size / 1024)
        RecycleLists.value[i].document.size = size + " KB"
        RecycleLists.value[i].document.updated_at = updated
        RecycleLists.value[i].starfiled = true

    }
    isLoading.value = false;
}

const Restorefile = (index: number) => {
    console.log(index)
}
const Deletefile = (index: number) => {
    console.log(index)
}

onMounted(() => {
    RecycleList();

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
