
<template>
    <el-table :data="tableData" height="83vh" style="width: 100%" v-if="viewmodel">
        <el-table-column prop="filename" label="文件名称" />
        <el-table-column prop="modtime" label="修改时间" />
        <el-table-column prop="size" label="大小" />
        <el-table-column class="operation" label="操作" type="index" width="180" #default="scope">
            <a href="#" @click.prevent="starclick">标星</a>&nbsp;
            <a href="#" @click.prevent="dialogFormVisible = true">分享</a>&nbsp;
            <a href="#" @click.prevent="datefile(scope.$index)" :plain="true">删除</a>
        </el-table-column>

        
</el-table>
<template v-else>
    <el-row >
    <el-col
      v-for="(o, index) in 2"
      :key="o"
      :span="8"
      :offset="index > 0 ? 2 : 0"
    >
      <el-card :body-style="{ padding: '0px'}" shadow="hover" >
        <img
          src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
          class="image"
        />
        <div style="padding: 14px">
          <span>Yummy hamburger</span>
          <div class="bottom">
            <time class="time">{{  }}</time>
            <el-button text class="button">Operating</el-button>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
        </template>
    <button @click="viewmodel =! viewmodel">测试</button>

    <el-dialog v-model="dialogFormVisible" header="Shipping address" width="20%" :align-center="true">
        <el-form :model="form">
            <el-form-item label="Promotion name" :label-:width=formLabelWidth>
                <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Zones" :label-:width=formLabelWidth>
                <el-select v-model="form.region" placeholder="Please select a zone">
                    <el-option label="Zone No.1" value="shanghai" />
                    <el-option label="Zone No.2" value="beijing" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { pushScopeId, reactive, ref, onMounted } from 'vue'
import * as share_api from "@/apis/share"


var stardata = [{}]

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
const viewmodel = ref(true)

function datefile(index: number) {
    const x = tableData.value
    stardata = tableData.value.splice(index, 1)
    if (x.length != stardata.length && x.length != 0) {
        ElMessage({
            message: '文件已成功移至回收站！',
            type: 'success',
        })
    }

    //需要判断文件是否已经从数据中移除

}

function starclick() {
    //需要判断文件是否已经存在与标星数据中
    ElMessage({
        message: '文件已被标星，可在标星列表中查看！',
        type: 'success',
    })
}




const handleClose = (done: () => void) => {
    ElMessageBox.confirm('Are you sure to close this dialog?')
        .then(() => {
            done()
        })
        .catch(() => {
            // catch error
        })
}


const tableData = ref([
    {
        filename: '第一个文档',
        modtime: '2023-01-23',
        size: '1MB',

    },
    {
        filename: '第二个文档',
        modtime: '2023-01-23',
        size: '1MB',

    },
    {
        filename: '第三个文档',
        modtime: '2023-01-23',
        size: '1MB',
    },
    {
        filename: '第四个文档',
        modtime: '2023-01-23',
        size: '1MB',
    },

])
const getDoucmentList = async() => {
  const result = await share_api.getDoucmentListAPI()
    console.log(result,'result');
}

onMounted(() => {
// getDoucmentList()

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


a {
    display: none;
}

.el-table__row:hover a {
    display: inline-block;
}

:deep(.el-table_1_column_4 .cell) {
    text-align: center;
}
:deep(.el-card .el-col .el-row
){
    width: 250px;
    height: auto;
}
</style>
