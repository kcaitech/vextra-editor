
<template>
    <tablelist :data="lists" :iconlist="iconlists" @share="Sharefile" @deletefile="Deletefile" @dbclickopen="openDocument" :type="currentProject.self_perm_type > 2 ? 'project' : ''"
        @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc" @newProjectFill="newProjectFill"/>

    <listrightmenu :items="items" :data="mydata" @get-doucment="getDoucment" @r-starfile="Starfile" @r-sharefile="Sharefile"
        @r-removefile="Deletefile" @ropen="openDocument" @moveFillAddress="moveFillAddress"/>

    <div v-if="showFileShare" class="overlay"></div>
    <FileShare v-if="showFileShare" @close="closeShare" :docId="docId" :selectValue="selectValue" :userInfo="userInfo"
        :docUserId="docUserId" @select-type="onSelectType" @switch-state="onSwitch" :shareSwitch="shareSwitch"
        :pageHeight="pageHeight" :project="is_project">
    </FileShare>
    <MoveProjectFill :title="'移动文件位置'" :confirm-btn="'移动'"  :projectItem="projectItem" :doc="mydata" :projectVisible="moveVisible" @clodeDialog="clodeDialog" @moveFillSeccess="moveFillSeccess"></MoveProjectFill>
</template>

<script setup lang="ts">
import * as user_api from '@/apis/users'
import * as team_api from '@/apis/team'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted, nextTick, Ref, inject } from "vue"
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listrightmenu from "@/components/AppHome/listrightmenu.vue"
import MoveProjectFill from '../MoveProjectFill.vue';
import { Repository, CoopRepository, Document } from '@kcdesign/data';
import { createDocument } from '@kcdesign/data';
import { DocEditor } from '@kcdesign/data';

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
}

const items = ['open', 'newtabopen', 'share', 'target_star', 'movefill', 'rename', 'copyfile', 'deletefile']

const props = defineProps<{
    currentProject: any
}>()
const { t } = useI18n()
const isLoading = ref(false)
const showFileShare = ref<boolean>(false)
const shareSwitch = ref(true)
const pageHeight = ref(0)
const docId = ref('')
const mydata = ref<data>()
const selectValue = ref(1)
const docUserId = ref('')
const noNetwork = ref(false)
const lists = ref<any[]>([])
const userInfo = ref<UserInfo | undefined>()
const iconlists = ref(['star', 'share', 'delete']);
const moveVisible = ref(false);
const projectItem = ref<any>({});
const is_project = ref(false);
//获取服务器我的文件列表
async function getDoucment() {
    isLoading.value = true
    try {
        const { data } = await team_api.getDoucmentListAPI({project_id: props.currentProject.project.id})
        if (data == null) {
            noNetwork.value = true
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
    }
    isLoading.value = false
}

const { projectList, saveProjectData, is_favor, favoriteList, updateFavor, is_team_upodate, teamUpdate } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;
};

const refreshDoc = () => {
    getDoucment()
}

const newProjectFill = () => {
    localStorage.setItem('project_id', props.currentProject.project.id);
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo);
    const coopRepo = new CoopRepository(nd, repo)
    const editor = new DocEditor(nd, coopRepo);
    const page = editor.create(t('system.page1'));
    editor.insert(0, page);
    window.document.title = nd.name;
    (window as any).skrepo = coopRepo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document'});
}

const moveFillAddress = (data: any) => {
    moveVisible.value = true;
}

const clodeDialog = () => {
    moveVisible.value = false;
}
const moveFillSeccess = () => {
    clodeDialog();
    const tiemr = setTimeout(() => {
        refreshDoc();
        clearTimeout(tiemr);
    }, 300)
}

//转换文件大小格式
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

//右键打开或双击列表打开
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
    if(data.document.project_id && data.document.project_id !== '0') {
        is_project.value = true;
    }else {
        is_project.value = false;
    }
    docUserId.value = data.document.user_id
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    userInfo.value = userData.value
    showFileShare.value = true
}


//删除文件入口
const Deletefile = async (data: data) => {
    const { document: { id } } = data
    const { code } = await user_api.MoveFile({ doc_id: id })
    if (code === 0) {
        lists.value = lists.value.filter((item: any) => item.document.id != data.document.id)
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('home.delete_ok_tips') })
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.delete_no_tips') })
    }
}

function filterItemsByIndexes(sourceArray: any, indexesToDelete: any) {
    return sourceArray.filter((_: any, index: number) => !indexesToDelete.includes(index));
}

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const el = document.querySelector('.target_star')! as HTMLElement
    const elrename = document.querySelector('.rename')! as HTMLElement
    const elcopyfile = document.querySelector('.copyfile')! as HTMLElement
    const eldeletefile = document.querySelector('.deletefile')! as HTMLElement
    const { document: { id,user_id,project_id }, document_favorites: { is_favorite } } = data
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
            el.innerHTML = t('homerightmenu.unstar')
        } else {
            el.innerHTML = t('homerightmenu.target_star')
        }
        if (user_id != localStorage.getItem('userId')) {
            elrename.style.display = "none"
            elcopyfile.style.display = "none"
            eldeletefile.style.display="none"
        } else {
            elrename.style.display = "block"
            elcopyfile.style.display = "block"
            eldeletefile.style.display="block"
        }
    })
    docId.value = id
    mydata.value = data
    projectItem.value = projectList.value.filter(item => item.project.id === data.document.project_id)[0];
}

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

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

// watch(lists, (Nlist) => {
//     emits('data-update', Nlist, t('home.modification_time'))
// }, { deep: true })

onMounted(() => {
    getDoucment()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
})

onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
})

function emit(arg0: string) {
    throw new Error("Function not implemented.")
}

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
