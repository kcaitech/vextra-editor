
<template>
    <!-- 表格布局 -->
    <el-table :data="documentsList" height="83vh" style="width: 100%" v-if="viewmodel" v-loading="isLoading">
        <el-table-column prop="name" :label="t('home.file_name')" />
        <el-table-column prop="updated_at" :label="t('home.modification_time')" />
        <el-table-column prop="size" :label="t('home.size')" />
        <el-table-column class="operation" :label="t('home.operation')" type="index" width="180">
            <a href="#">{{ t('home.star_marking') }}</a>&nbsp;
            <a href="#">{{ t('home.share') }}</a>&nbsp;
            <a href="#">{{ t('home.delete') }}</a>
        </el-table-column>
    </el-table>
    <!-- 卡片布局 -->
    <el-row v-else>
        <el-col v-for="(     item     ) in      documentsList     " :key=" item.id " :span=" 3 "
            style="margin:0px 20px 20px 0px;">
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
import { ElMessageBox, ElMessage } from 'element-plus'
import { pushScopeId, reactive, ref, onMounted } from 'vue'
import * as share_api from "@/apis/share"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()


const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
})

const dialogVisible = ref(false)
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const viewmodel = ref(true);
const isLoading = ref(false);

// function datefile(index: number) {
//     const x = tableData.value
//     stardata = tableData.value.splice(index, 1)
//     if (x.length != stardata.length && x.length != 0) {
//         ElMessage({
//             message: '文件已成功移至回收站！',
//             type: 'success',
//         })
//     }

//     //需要判断文件是否已经从数据中移除

// }

function starclick() {
    //需要判断文件是否已经存在与标星数据中
    ElMessage({
        message: `${t('home.file_star_marking')}`,
        type: 'success',
    })
}

let documentsList = ref<any[]>([]);

async function getUserdata() {
    // loading
    isLoading.value = true;
    documentsList.value = (await user_api.GetDocumentsList()).data;
    for (let i = 0; i < documentsList.value.length; i++) {
        const updated = documentsList.value[i].updated_at.slice(0, 19)
        const size = Math.round(documentsList.value[i].size / 1024)
        documentsList.value[i].size = size + " KB"
        documentsList.value[i].updated_at = updated
        documentsList.value[i].starfiled = true

    }
    documentsList.value[1].starfiled = false
    // process();  
    // unloading  
    isLoading.value = false;
}

const Starfile = (index: number) => {
    documentsList.value[index].starfiled = documentsList.value[index].starfiled === true ? false : true
}

const Sharefile = (index: number) => {
    console.log(index)
}

const Removefile = (index: number) => {
    console.log(index)
}


onMounted(() => {
    reactive(getUserdata());

})
</script>
<style lang="scss">
.el-table tr {
    height: 60px;
    font-weight: 18px;
}
</style>

<style lang="scss" scoped>
.dialog-footer button:first-child {
    margin-right: 10px;
}

.test {
    >svg {
        width: 100%;
        height: 100%;
    }
}

.el-icon {
    display: none;
}

.el-icon:active {
    background-color: #999;
    border-radius: 1px;
    color: #6290ee;

}

.el-table__row:hover .el-icon {
    display: inline-block;
    color: #3172f4;
}

:deep(.el-table_1_column_4 .cell) {
    text-align: center;
}

:deep(.el-card .el-col .el-row) {
    width: 250px;
    height: auto;
}

.time {
    font-size: 12px;
    color: #999;
}

.bottom {
    margin-top: 13px;
    line-height: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.button {
    padding: 0;
    min-height: auto;
}

.image {
    width: 100%;
    display: block;
}
</style>
