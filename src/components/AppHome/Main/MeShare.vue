
<template>
    <!-- 表格布局 -->
    <el-table :data=" Myfilelist " height="83vh" style="width: 100%" v-loading="isLoading" empty-text="没有内容" >
        <el-table-column prop="document.name" :label=" t('home.file_name') " />
        <el-table-column prop="document.updated_at" :label=" t('home.modification_time') " />
        <el-table-column prop="document.size" :label=" t('home.size') " />
        <el-table-column class="operation" :label=" t('home.operation') " type="index" width="180"
            style="text-align: center;">
            <template #default=" scope: any ">
                <el-icon :size=" 20 " v-if=" !Myfilelist[scope.$index].starfiled ">
                    <svg-icon class="svg star" style="width: 20px; height: 20px;" icon-class="star"
                        @click=" Starfile(scope.$index) ">{{ Myfilelist[scope.$index].starfiled }}</svg-icon>
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
import * as share_api from "@/apis/share"
import { Share } from '@element-plus/icons-vue'
import { onMounted, ref } from "vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isLoading = ref(false)
let Myfilelist = ref<any[]>([])

isLoading.value = true;

async function GetMyfilelist() {
    Myfilelist.value = (await share_api.getDoucmentListAPI()).data;


    for (let i = 0; i < Myfilelist.value.length; i++) {
        const updated = Myfilelist.value[i].document.updated_at.slice(0, 19)
        const size = Math.round(Myfilelist.value[i].document.size / 1024)
        Myfilelist.value[i].document.size = size + " KB"
        Myfilelist.value[i].document.updated_at = updated
        Myfilelist.value[i].starfiled = true


    }
    isLoading.value = false;

}

const Starfile = (index: number) => {
    Myfilelist.value[index].starfiled = Myfilelist.value[index].starfiled === true ? false : true
    console.log(Myfilelist.value[index].starfiled);


}

const Sharefile = (index: number) => {
    console.log(index)
}


onMounted(() => {
    GetMyfilelist()
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
