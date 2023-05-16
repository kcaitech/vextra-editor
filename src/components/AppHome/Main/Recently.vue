
<template>
    <!-- 表格布局 -->
    <el-table :data="documentsList" height="83vh" style="width: 100%" v-if="viewmodel" v-loading="isLoading"
        empty-text="没有内容">
        <el-table-column prop="document.name" :label="t('home.file_name')" />
        <el-table-column prop="document.updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="document.size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <template #default="scope: any">
                <el-icon :size=" 20 " content="标星" v-if=" !documentsList[scope.$index].starfiled ">
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
                    <el-tooltip content="移除记录" show-after="1000">
                        <Remove @click=" Removefile(scope.$index) " />
                    </el-tooltip>
                </el-icon>&nbsp;
            </template>
        </el-table-column>
    </el-table>
    <!-- 卡片布局 -->
    <el-row v-else>
        <el-col
            v-for="(                         item                         ) in                          documentsList                         "
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()



const viewmodel = ref(true)
const isLoading = ref(false)
let documentsList = ref<any[]>([])

async function getUserdata() {
    // loading
    isLoading.value = true
    documentsList.value = (await user_api.GetDocumentsList()).data;
    for (let i = 0; i < documentsList.value.length; i++) {
        const updated = documentsList.value[i].document.updated_at.slice(0, 19)
        const size = sizeTostr(documentsList.value[i].document.size)
        documentsList.value[i].document.size = size
        documentsList.value[i].document.updated_at = updated
    }
    // unloading  
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
    console.log(documentsList.value[index].starfiled);

}

const Sharefile = (index: number) => {
    console.log(index)
}

const Removefile = async (index: number) => {

    const docid: string = documentsList.value[index].id
    const state: any = (await user_api.DeleteList({ docid }))
    if (state.code === 0) {
        documentsList.value = documentsList.value.slice(index, 1)
        console.log(index,docid)
    }



}


onMounted(() => {
    getUserdata();

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
