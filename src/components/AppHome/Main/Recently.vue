
<template>
    <Transition>
    <div class="tatle" style="height:100%;">
        <tablelist :data="searchlists" :iconlist="iconlists" @share="Sharefile" @remove="Removefile" @dbclickopen="openDocument"
            :address="true" @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc" />
    </div>
</Transition>
    <listrightmenu :items="items" :data="mydata" @get-userdata="getUserdata" @r-starfile="Starfile" @r-sharefile="Sharefile"
        @r-removehistory="Removefile" @ropen="openDocument" />
    <FileShare v-if="showFileShare" @close="closeShare" :docId="docId" @switch-state="onSwitch" :userInfo="userInfo"
        :docUserId="docUserId" :project="is_project" :selectValue="selectValue" @select-type="onSelectType"
        :shareSwitch="shareSwitch" :pageHeight="pageHeight" :projectPerm="projectPerm">
    </FileShare>
    <div v-if="showFileShare" class="overlay"></div>
</template>

<script setup lang="ts">
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch, inject, Ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listrightmenu from "../listrightmenu.vue"
import Bus from '@/components/AppHome/bus';

const { t } = useI18n()
const items = ['open', 'newtabopen', 'share', 'target_star', 'rename', 'copyfile', 'removefile']
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
const is_project = ref(false);
const emits = defineEmits<{
    (e: 'dataUpdate', list: any[], title: string): void
}>()
const projectPerm = ref()
const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
};


interface data {
    document: {
        id: string
        name: string
        doc_type: number
        user_id: string
        project_id: string
    }
    document_favorites: {
        is_favorite: boolean
    }
    document_access_record: {
        id: string
    }
    project_perm: number
}

//获取服务器我的文件列表
async function getUserdata() {
    try {
        const { data } = await user_api.GetDocumentsList() as any
        if (data == null) {
            noNetwork.value = true
            ElMessage.error(t('home.failed_list_tips'))
        } else {
            //data = data.filter((docItem: any) => !docItem.project || !!projectList.value.find(projectItem => projectItem.project.id === docItem.project.id))
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
                data[i].project_perm = undefined;
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)

                if (data[i].project) {
                    const project = projectList.value.filter(item => item.project.id === data[i].project.id)[0];
                    if (project) {
                        data[i].project_perm = project.self_perm_type;
                    }
                }
            }
        }
        lists.value = Object.values(data)
    } catch (error: any) {
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
    getUserdata()
}

let searchvalue = ref('');
const searchlists = ref<any[]>([])
Bus.on('searchvalue', (str: string) => {
    searchvalue.value = str
})

watchEffect(() => {
    searchlists.value = lists.value.filter((el: any) => el.document.name.toLowerCase().includes(searchvalue.value.toLowerCase()))
})

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
    if (data.document.project_id && data.document.project_id !== '0') {
        is_project.value = true;
    } else {
        is_project.value = false;
    }
    docUserId.value = data.document.user_id
    userInfo.value = userData.value
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    projectPerm.value = data.project_perm;
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
    emits('dataUpdate', Nlist, t('home.modification_time'))
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
.v-enter-active,
.v-leave-active {
  transition: height 0.2s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  height: 100%;
}
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: var(--overlay-bg-color);
}
</style>
