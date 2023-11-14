<template>
    <div class="tatle" style="height: 100%;">
        <tablelist :data="searchlists" :iconlist="iconlists" @restore="Restorefile" @ndelete="Deletefile" @rightMeun="rightmenu"
            :noNetwork="noNetwork" @refreshDoc="refreshDoc" />
    </div>
    <listrightmenu :items="items" :data="mydata" @getrecycle-lists="GetrecycleLists" @r-deletefile="Deletefile"
        @r-restorefile="Restorefile" />
    <DeleteDialog :projectVisible="dialogVisible" :context="t('home.delete_tips')" :title="t('home.completely_delete')"
        :confirm-btn="t('home.delete_ok')" @clode-dialog="dialogVisible = !dialogVisible" @confirm="Qdeletefile(docId)">
    </DeleteDialog>
</template>
<script setup lang="ts">
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import tablelist from '@/components/AppHome/tablelist.vue'
import listrightmenu from "../listrightmenu.vue"
import DeleteDialog from '@/components/TeamProject/ProjectDialog.vue';
import Bus from '@/components/AppHome/bus'
const items = ['restore', 'completely_delete']
const { t } = useI18n()
const dialogVisible = ref(false)
const docId = ref('')
const mydata = ref()
const noNetwork = ref(false)
let lists = ref<any[]>([])
const iconlists = ref(['restore', 'Delete'])
const emits = defineEmits<{
    (e: 'dataUpdate', list: any[], title: string): void
}>()
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
    try {
        const { data } = await user_api.GetrecycleList()
        if (data == null) {
            noNetwork.value = true
            ElMessage.error(t('home.failed_list_tips'))
        } else {
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
                let { document: { size, deleted_at } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document.deleted_at = deleted_at.slice(0, 19)
            }
        }
        lists.value = Object.values(data)
    } catch (error:any) {
        if (error.data.code === 401) {
            return
        } else {
            noNetwork.value = true
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        }
    }
}

const refreshDoc = () => {
    GetrecycleLists()
}
let searchlists = ref<any[]>([])
const searchvalue = ref('');

Bus.on('searchvalue', (str: string) => {
    searchvalue.value = str
})

watchEffect(() => {
    console.log(lists.value);
    
    searchlists.value = lists.value.filter((el: any) => el.document.name.toLowerCase().includes(searchvalue.value.toLowerCase()))
})

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

const changemargin = () => {
    const el = document.querySelector('.el-dialog__header') as HTMLElement
    el.style.marginRight = '0px'
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

watch(lists, (Nlist) => {
    emits('dataUpdate', Nlist, t('home.delete_file_time'))
}, { deep: true })

onMounted(() => {
    GetrecycleLists()
})

onUnmounted(() => {

})
</script>

<style lang="scss" scoped>
.my-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        color: var(--title-color);
        font-weight: var(--title-weight);
    }
}

main {
    height: auto;
}

.dialog-footer>.el-button {
    outline: none;

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
        color: white;
        border-color: #9675fa91 !important;
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
