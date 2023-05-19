
<template>
    <!-- 表格布局 -->
    <el-table :data="documentsList || []" height="83vh" style="width: 100%" v-if="viewmodel" v-loading="isLoading"
        empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document_access_record.last_access_time" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " content="标星" v-if=" !documentsList[scope.$index].document_favorites.is_favorite ">
                    <el-tooltip content="标星" :show-after="1000">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                            @click=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 " v-else>
                    <el-tooltip content="取消标星" :show-after="1000">
                        <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="stared"
                            @click=" Starfile(scope.$index) ">
                        </svg-icon>
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="分享" :show-after="1000">
                        <Share @click=" Sharefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
                <el-icon :size=" 20 ">
                    <el-tooltip content="移除记录" :show-after="1000">
                        <Remove @click=" Removefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <!-- 卡片布局 -->
    <el-row v-else>
        <el-col
            v-for="(                                           item                                           ) in                                            documentsList                                           "
            :key=" item.id " :span=" 3 " style="margin:0px 20px 20px 0px;">
            <el-card :body-style=" { padding: '0px' } " shadow="hover">
                <img src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                    class="image" />
                <div style="padding: 14px">
                    <span>{{ item.name }}</span>
                    <div class="bottom">
                        <time class="time">{{ item.updated_at }}</time>
                    </div>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import * as user_api from '@/apis/users'
import { Share, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const viewmodel = ref(true)
const isLoading = ref(false)
let documentsList = ref<any[]>([])

async function getUserdata() {
    // loading
    isLoading.value = true
    const { data } = await user_api.GetDocumentsList()
    if (data == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < data.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = data[i]
            data[i].document.size = sizeTostr(size)
            data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }
    }
    documentsList.value = data
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

    const { document: { id } } = documentsList.value[index]
    documentsList.value[index].document_favorites.is_favorite = !documentsList.value[index].document_favorites.is_favorite ? true : false
    if (documentsList.value[index].document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: true })
        if (code === 0) {
            ElMessage.success('已设为星标文档')
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: false })
        if (code === 0) {
            ElMessage.success('已取消星标文档')
        }
    }

}

const Sharefile = (index: number) => {
    console.log(index);

}

//移除对应文件的历史记录
const Removefile = async (index: number) => {

    const { document_access_record: { id } } = documentsList.value[index]
    const { code } = (await user_api.DeleteList({ access_record_id: id }))
    if (code === 0) {
        documentsList.value.splice(index, 1)
        ElMessage.success('移除成功')
    } else {
        ElMessage.error('移除失败')
    }

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
        background: rgba(185, 185, 185, 0.5);
        border-radius: 2px;
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
