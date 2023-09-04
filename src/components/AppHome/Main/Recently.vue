
<template>
    <tablelist :data="lists" :iconlist="iconlists" @share="Sharefile" @remove="Removefile" @dbclickopen="openDocument"
        @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc"/>
    <listrightmenu :items="items" :data="mydata" @get-userdata="getUserdata" @r-starfile="Starfile" @r-sharefile="Sharefile"
        @r-removehistory="Removefile" @ropen="openDocument"/>
    <FileShare v-if="showFileShare" @close="closeShare" :docId="docId" @switch-state="onSwitch" :userInfo="userInfo"  :docUserId="docUserId"
        :selectValue="selectValue" @select-type="onSelectType" :shareSwitch="shareSwitch" :pageHeight="pageHeight">
    </FileShare>
    <div v-if="showFileShare" class="overlay"></div>
</template>

<script setup lang="ts">
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listrightmenu from "../listrightmenu.vue"

const { t } = useI18n()
const items = ['open', 'newtabopen', 'share', 'target_star', 'rename', 'copyfile', 'removefile']
const isLoading = ref(false)
const showFileShare = ref<boolean>(false);
const shareSwitch = ref(true)
const pageHeight = ref(0)
const lists = ref<any[]>([])
const selectValue = ref(1)
const userInfo = ref<UserInfo | undefined>()
const docId = ref('')
const docUserId = ref('')
const mydata = ref()
const noNetwork = ref(false)
const iconlists = ref(['star', 'share', 'remove'])
// const emits = defineEmits(['data-update'])
const emits = defineEmits<{
    (e: 'data-update', list: any[], title: string): void
}>()

interface data {
    document: {
        id: string
        name: string
        doc_type: number
        user_id: string
    }
    document_favorites: {
        is_favorite: boolean
    }
    document_access_record: {
        id: string
    }
}

//获取服务器我的文件列表
async function getUserdata() {
    // loading
    isLoading.value = true
    try {
        const { data } = await user_api.GetDocumentsList() as any
        if (data == null) {
            noNetwork.value = true
            ElMessage.error(t('home.failed_list_tips'))
        } else {
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        lists.value = Object.values(data)
    } catch (error) {
        noNetwork.value = true
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
    }
    // unloading  
    isLoading.value = false;
}
const refreshDoc = () => {
    getUserdata()
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

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

//右键打开或双击打开
const openDocument = (id: string) => {
    router.push({
        name: 'document',
        query: {
            id: id
        }
    })
}

//标星入口
const Starfile = async (data: data) => {
    const { document: { id } } = data
    data.document_favorites.is_favorite = data.document_favorites.is_favorite === true ? false : true
    if (data.document_favorites.is_favorite == true) {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: true })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_ok') })
        }
    } else {
        const { code } = await user_api.SetfavoriteStatus({ doc_id: id, status: false })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.star_cancel') })
        }
    }
}

//分享入口
const Sharefile = (data: data) => {
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    docUserId.value = data.document.user_id
    userInfo.value = userData.value
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    showFileShare.value = true
}

//移除历史记录入口
const Removefile = async (data: data) => {
    const { document_access_record: { id } } = data
    const { code } = (await user_api.DeleteList({ access_record_id: id }))
    if (code === 0) {
        lists.value = lists.value.filter((item: any) => item.document.id != data.document.id)
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.access_record_ok') })
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.access_record_no') })
    }

}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const elstar = document.querySelector('.target_star')! as HTMLElement
    const elrename = document.querySelector('.rename')! as HTMLElement
    const elcopyfile = document.querySelector('.copyfile')! as HTMLElement
    const { document: { id, user_id }, document_favorites: { is_favorite } } = data
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

    nextTick(() => {
        if (is_favorite == true) {
            elstar.innerHTML = t('homerightmenu.unstar')
        } else {
            elstar.innerHTML = t('homerightmenu.target_star')
        }
        if (user_id != localStorage.getItem('userId')) {
            elrename.style.display = "none"
            elcopyfile.style.display = "none"
        } else {
            elrename.style.display = "block"
            elcopyfile.style.display = "block"
        }
    })
    docId.value = id
    mydata.value = data
}

const closeShare = () => {
    showFileShare.value = false
}
const getPageHeight = () => {
    pageHeight.value = window.innerHeight
}
const onSwitch = (state: boolean) => {
    shareSwitch.value = state
}
const onSelectType = (type: number) => {
    selectValue.value = type
}

watch(lists, (Nlist) => {
    emits('data-update', Nlist, t('home.modification_time'))
}, { deep: true })

onMounted(() => {
    getUserdata()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
})
onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
})
</script>

<style lang="scss" scoped>
main {
    height: auto;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
