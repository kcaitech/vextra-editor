
<template>
    <div class="tatle" style="height: calc(100vh - 224px);">
        <tablelist :data="searchlists" :iconlist="iconlists" @share="Sharefile" @deletefile="Deletefile"
            @dbclickopen="openDocument" :addfile="currentProject.self_perm_type" @updatestar="Starfile"
            @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc" @newProjectFill="newProjectFill"
            :creator="true" :perm="currentProject.self_perm_type" :nulldata="nulldata" />
    </div>
    <listrightmenu :items="items" :data="mydata" @get-doucment="getDoucment" @r-starfile="Starfile" @r-sharefile="Sharefile"
        @r-removefile="Deletefile" @ropen="openDocument" @moveFillAddress="moveFillAddress" />
    <div v-if="showFileShare" class="overlay">
        <FileShare @close="closeShare" :docId="docId" :projectPerm="projectPerm">
        </FileShare>
    </div>
    <MoveProjectFill :title="t('Createteam.movetip')" :confirm-btn="t('Createteam.move')" :projectItem="projectItem"
        :doc="mydata" :projectVisible="moveVisible" @clodeDialog="clodeDialog" @moveFillSeccess="moveFillSeccess">
    </MoveProjectFill>
</template>

<script setup lang="ts">
import * as user_api from '@/request/users'
import * as team_api from '@/request/team'
import { ElMessage } from 'element-plus'
import { onMounted, ref, nextTick, Ref, inject, watch, watchEffect } from "vue"
import { useI18n } from 'vue-i18n'
import { router } from '@/router';
import { useRoute } from 'vue-router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listrightmenu from "@/components/AppHome/listrightmenu.vue"
import MoveProjectFill from '../MoveProjectFill.vue';
import { Repository, CoopRepository } from '@kcdesign/data';
import { createDocument } from '@kcdesign/data';
import { DocEditor } from '@kcdesign/data';
import Bus from '@/components/AppHome/bus'
import PinyinMatch from 'pinyin-match'

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
    project_perm: number
}

let items = ['open', 'newtabopen', 'share', 'target_star']

const props = defineProps<{
    currentProject: any
}>()


const { t } = useI18n()
const route = useRoute();
const showFileShare = ref<boolean>(false)
const docId = ref('')
const mydata = ref<data>()
const noNetwork = ref(false)
const lists = ref<any[]>([])
const iconlists = ref(['star', 'share', 'delete_p']);
const moveVisible = ref(false);
const projectItem = ref<any>({});
const nulldata = ref(false)
const projectPerm = ref()

//获取服务器我的文件列表
async function getDoucment(id: string) {
    let projectId = id
    if (!id || id === '0') {
        projectId = route.params.id as string
    }
    try {
        const { data } = await team_api.getDoucmentListAPI({ project_id: projectId })
        if (data == null) {
            noNetwork.value = true
        } else {
            noNetwork.value = false
            for (let i = 0; i < data.length; i++) {
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
    } catch (error) {
        noNetwork.value = true
    }
}

const searchvalue = ref('');
const searchlists = ref<any[]>([])
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

const { projectList } = inject('shareData') as {
    projectList: Ref<any[]>;
};

watch(projectList, () => {
    getDoucment(props.currentProject.project.id)
})

const refreshDoc = () => {
    getDoucment(props.currentProject.project.id)
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
    router.push({ name: 'document' });
}

defineExpose({
    newProjectFill
})

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
    docId.value = data.document.id
    projectPerm.value = data.project_perm
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

//右键菜单入口
const rightmenu = (e: MouseEvent, data: data) => {
    const el = document.querySelector('.target_star')! as HTMLElement
    const { document: { id, user_id, project_id }, document_favorites: { is_favorite }, project_perm } = data
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
    })
    items = ['open', 'newtabopen', 'share', 'target_star']
    const userId = localStorage.getItem('userId');
    if (project_perm > 3) {
        items.push('movefill', 'rename', 'copyfile', 'deletefile');
    } else if (project_perm === 3) {
        if (user_id === userId) {
            items.push('movefill', 'rename', 'copyfile', 'deletefile')
        }
    } else if (project_perm < 3) {
        items.push()
    } else {
        if (user_id === userId) {
            items.push('movefill', 'rename', 'copyfile', 'deletefile')
        }
    }
    docId.value = id
    mydata.value = data
    projectItem.value = projectList.value.filter(item => item.project.id === project_id)[0];
}

const closeShare = () => {
    showFileShare.value = false
}

watch(() => route.params, (v) => {
    getDoucment(v.id as string);
})

onMounted(() => {
    const id = props.currentProject.project.id
    getDoucment(id)
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
</style>
