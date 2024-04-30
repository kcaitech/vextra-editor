<template>
    <div class="title">
        <div class="left"> {{ t('home.shared_file_received') }}</div>
    </div>
    <div class="tatle" style="height: calc(100vh - 144px);">
        <tablelist :data="searchlists" :iconlist="iconlists" @share="Sharefile" @exit_share="Exitshar"
            @dbclickopen="openDocument" @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork"
            @refreshDoc="refreshDoc" :nulldata="nulldata" />
    </div>
    <listrightmenu :items="items" :data="mydata" @ropen="openDocument" @r-sharefile="Sharefile" @r-starfile="Starfile"
        @r-exitshare="Exitshar" />
    <div v-if="showFileShare" class="overlay">
        <FileShare @close="closeShare" :docId="docId" :projectPerm="projectPerm">
        </FileShare>
    </div>
</template>
<script setup lang="ts">
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, nextTick, inject, Ref, watchEffect } from 'vue'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { useI18n } from 'vue-i18n'
import listrightmenu from "../listrightmenu.vue"
import Bus from '@/components/AppHome/bus'
import PinyinMatch from 'pinyin-match'
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
    document_permission: {
        id: string
        perm_source_type: number
        perm_type: number
    }
    project_perm: number
}

let items = ['open', 'newtabopen', 'share', 'exit_share', 'target_star']
const iconlists = ref(['star', 'share', 'EXshare'])
const { t } = useI18n()
const showFileShare = ref<boolean>(false);
const docId = ref('')
const mydata = ref()
const noNetwork = ref(false)
let lists = ref<any[]>([])
const projectPerm = ref()
const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
};

async function ShareLists() {
    try {
        const { data } = await user_api.ShareLists()
        if (data == null) {
            noNetwork.value = true
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        } else {
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
    ShareLists()
}

const searchlists = ref<any[]>([])
const searchvalue = ref('');
const nulldata = ref(false)
Bus.on('searchvalue', (str: string) => {
    searchvalue.value = str
})

watchEffect(() => {
    if (!searchvalue.value) return searchlists.value = lists.value, nulldata.value = false
    searchlists.value = lists.value.filter((el: any) => PinyinMatch.match(el.document.name.toLowerCase(), searchvalue.value.toLowerCase()))
    if (searchlists.value.length === 0 && searchvalue.value !== '') {
        nulldata.value = true
    }
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


//右键打开或双击打开
const openDocument = (id: string, name: string) => {
    window.sessionStorage.setItem("kcdesk_document_name", name);
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
    docId.value = data.document.id
    projectPerm.value = data.project_perm;
    showFileShare.value = true
}

//退出分享入口
const Exitshar = async (data: data) => {
    const { document_permission: { id } } = data
    try {
        const { code } = await user_api.ExitSharing({ share_id: id })
        if (code === 0) {
            ElMessage.closeAll('success')
            ElMessage.success({ duration: 1500, message: t('home.exit_share_success') })
            lists.value = lists.value.filter(item => item.document.id != data.document.id)
        } else {
            ElMessage.error(t('home.exit_share_fail'))
        }
    } catch (error) {
        ElMessage.error(t('home.other_tips'))
    }
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const elstar = document.querySelector('.target_star')! as HTMLElement
    const { document: { id,user_id }, document_favorites: { is_favorite }, project_perm } = data
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
    })
    docId.value = id
    mydata.value = data
}

const closeShare = () => {
    showFileShare.value = false
}

onMounted(() => {
    ShareLists()
})

</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px 8px;
    box-sizing: border-box;

    .left {
        font-size: 18px;
        font-weight: 500;
        line-height: 36px;
        white-space: nowrap;
    }
}
</style>