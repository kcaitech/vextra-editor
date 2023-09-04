<template>
    <tablelist :data="lists" :iconlist="iconlists" @restore="Restorefile" @ndelete="Deletefile" @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc" />
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
import * as user_api from '@/apis/users'
import * as team_api from '@/apis/team'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import tablelist from '@/components/AppHome/tablelist.vue'
import listrightmenu from "@/components/AppHome/listrightmenu.vue"

const items = ['restore', 'completely_delete']
const { t } = useI18n()
const isLoading = ref(false)
const dialogVisible = ref(false)
const docId = ref('')
const mydata = ref()
const noNetwork = ref(false)
let lists = ref<any[]>([])
const iconlists = ref(['restore', 'Delete'])
// const emits = defineEmits(['data-update']);
const emits = defineEmits<{
    (e: 'data-update', list: any, title: string): void
}>();
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
async function GetrecycleLists() {
    isLoading.value = true
    try {
        const { data } = await team_api.GetrecycleList({project_id: props.currentProject.project.id})
        if (data == null) {
            noNetwork.value = true
        } else {
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
                let { document: { size, deleted_at } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document.deleted_at = deleted_at.slice(0, 19).split('T')[0] + ' ' + deleted_at.slice(0, 19).split('T')[1]
            }
        }
        lists.value = Object.values(data)
    } catch (error) {
        noNetwork.value = true
    }
    isLoading.value = false;
}

const refreshDoc = () => {
    GetrecycleLists()
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

// watch(lists, (Nlist) => {
//     emits('data-update', Nlist, t('home.delete_file_time'))
// }, { deep: true })

onMounted(() => {
    GetrecycleLists()
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
        background-color: rgba(208, 208, 208, 0.167);
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
        background: #9675fa91;
        border-color: #9675fa91;
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
