<template>
    <div class="tatle" style="height: calc(100vh - 56px - 96px - 56px);">
        <tablelist :data="lists" :iconlist="iconlists" @restore="Restorefile" @ndelete="Deletefile" @rightMeun="rightmenu"
            :noNetwork="noNetwork" @refreshDoc="refreshDoc" :deleter="true" />
    </div>
    <!-- 右键菜单 -->
    <listrightmenu :items="items" :data="mydata" @getrecycle-lists="GetrecycleLists" @r-deletefile="Deletefile"
        @r-restorefile="Restorefile" />
    <!-- 确认删除弹框 -->
    <el-dialog v-model="dialogVisible" :title="t('home.completely_delete')" width="500" align-center
        @keyup.enter="Qdeletefile(docId)">
        <span>{{ t('home.delete_tips') }}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :disabled="false" @click=" Qdeletefile(docId)" style="background-color: none;">
                    {{ t('home.delete_ok') }}
                </el-button>
                <el-button @click=" dialogVisible = false">{{ t('home.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import * as user_api from '@/request/users'
import * as team_api from '@/request/team'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import tablelist from '@/components/AppHome/tablelist.vue'
import listrightmenu from "@/components/AppHome/listrightmenu.vue"
import { useRoute } from 'vue-router'
const items = ['restore', 'completely_delete']
const { t } = useI18n()
const dialogVisible = ref(false)
const docId = ref('')
const mydata = ref<data>()
const noNetwork = ref(false)
let lists = ref<any[]>([])
const iconlists = ref(['restore', 'Delete'])
const route = useRoute();
const props = defineProps<{
    currentProject: any
}>();

interface data {
    document: {
        id: string
        name: string
        doc_type: number
    }
    document_favorites: {
        is_favorite: boolean
    }
}

//获取回收站文件列表
async function GetrecycleLists(id: string) {
    let projectId = id
    if (!id || id === '0') {
        projectId = route.params.id as string
    }

    try {
        const { data } = await team_api.GetrecycleList({ project_id: projectId })
        if (data) {
            for (let i = 0; i < data.length; i++) {
                let { document: { size, deleted_at } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document.deleted_at = deleted_at.split('.')[0]
            }
        }
        noNetwork.value = false
        lists.value = Object.values(data)
        const user_id = localStorage.getItem('userId');
        if (props.currentProject.self_perm_type < 4) {
            lists.value = lists.value.filter(item => item.document.user_id === user_id);
        }
    } catch (error) {
        noNetwork.value = true
    }

}

const refreshDoc = () => {
    GetrecycleLists(props.currentProject.project.id)
}

//转换文件大小
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

//还原对应文件
const Restorefile = async (data: data) => {
    const { document: { id } } = data
    const { code } = await user_api.RecoverFile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.restore_ok') })
        lists.value = lists.value.filter(item => item.document.id != id)
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.restore_no') })
    }
}

//删除对应文件
const Deletefile = (data: data) => {
    const { document: { id } } = data
    docId.value = id
    dialogVisible.value = true
}

//删除文件
const Qdeletefile = async (id: string) => {
    try {
        const { code } = await user_api.DeleteFile({ doc_id: id })
        if (code === 0) {
            lists.value = lists.value.filter(item => item.document.id != id)
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.delete_file_ok') })
            dialogVisible.value = false
        } else {
            dialogVisible.value = false
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.delete_file_no') })
        }
    } catch (error) {
        dialogVisible.value = false
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('other_tips') })
    }
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const { document: { id } } = data
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const rightmenu: any = document.querySelector('.rightmenu')
    const top = e.pageY
    const left = e.pageX

    nextTick(() => {
        const width = rightmenu.clientWidth
        const height = rightmenu.clientHeight
        rightmenu.style.left = left + width > viewportWidth ? (viewportWidth - width) + "px" : left + 'px'
        rightmenu.style.top = top + height > viewportHeight ? (viewportHeight - height) + 'px' : top + 'px'
    })

    if ((e.target as HTMLElement).closest('.el-table-v2__row')) {
        rightmenu.style.display = 'block'
    }

    docId.value = id
    mydata.value = data
}
watch(() => route.params.id, (newid) => {
    if (newid != undefined) {
        GetrecycleLists(newid.toString())
    }
})

onMounted(() => {
    GetrecycleLists(props.currentProject.project.id)
})

onUnmounted(() => {

})
</script>

<style lang="scss" scoped>
main {
    height: auto;
}

.dialog-footer>.el-button {
    &:hover {
        background-color: #fff;
        color: #000;
    }

    &:active {
        background-color: white;
    }
}

.dialog-footer>.el-button--primary {
    background-color: #9775fa;
    color: white;
    border-color: #9775fa;

    &:hover {
        background-color: #9775fa;
        border-color: #9675fa91;
        color: #fff;
    }

    &:active {
        background-color: #9775fa;
    }

    &[disabled] {
        background: #e5dbff;
        border: 1px #e5dbff solid;
    }
}
</style>
