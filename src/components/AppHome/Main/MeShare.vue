
<template>
    <tablelist :data="lists" :iconlist="iconlists" @share="Sharefile" @deletefile="Deletefile" @dbclickopen="openDocument"
        @updatestar="Starfile" @rightMeun="rightmenu" :noNetwork="noNetwork" @refreshDoc="refreshDoc"/>

    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click="openDocument(docId)">{{ t('homerightmenu.open') }}</li>
            <li @click="openNewWindowDocument">{{ t('homerightmenu.newtabopen') }}</li>
            <div></div>
            <li @click.stop="rSharefile">{{ t('homerightmenu.share') }}</li>
            <li @click="rStarfile" ref="isshow">{{ t('homerightmenu.target_star') }}</li>
            <div></div>
            <li @click="rrename">{{ t('homerightmenu.rename') }}</li>
            <li @click="rcopyfile">{{ t('homerightmenu.copyfile') }}</li>
            <li @click="rDeletefile">{{ t('homerightmenu.deletefile') }}</li>
        </ul>
    </div>

    <!-- 重命名弹框 -->
    <el-dialog v-model="dialogVisible" :title="t('home.rename')" width="500" align-center>
        <input class="newname" type="text" v-model="newname" ref="renameinput" @keydown.enter="rename1" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" style="background-color: none;" @click="rename1"
                    :disabled="newname == '' ? true : false">
                    {{ t('home.rename_ok') }}
                </el-button>
                <el-button @click="dialogVisible = false">{{ t('home.cancel') }}</el-button>
            </span>
        </template>
    </el-dialog>
    <div v-if=" showFileShare " class="overlay"></div>
    <FileShare v-if=" showFileShare " @close=" closeShare " :docId=" docId " :selectValue=" selectValue " :userInfo="userInfo"
        @select-type=" onSelectType " @switch-state=" onSwitch " :shareSwitch=" shareSwitch " :pageHeight=" pageHeight ">
    </FileShare>
</template>

<script setup lang="ts">
import * as share_api from "@/apis/share"
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted, nextTick, computed, watch } from "vue"
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { UserInfo } from '@/context/user';
import listsitem from '@/components/AppHome/listsitem.vue'


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

const emits = defineEmits(['data-update'])
const { t } = useI18n()
const isLoading = ref(false)
const dialogVisible = ref(false)
const menu = ref<HTMLElement>()
const renameinput = ref()
const newname = ref()
const isshow = ref<HTMLElement>()
const showFileShare = ref<boolean>(false)
const shareSwitch = ref(true)
const pageHeight = ref(0)
const docId = ref('')
const mydata = ref()
const selectValue = ref(1)
const noNetwork = ref(false)
const lists = ref<any[]>([])
const userInfo = ref<UserInfo | undefined>()
const iconlists = ref(['star', 'share', 'delete'])

//获取服务器我的文件列表
async function getDoucment() {
    isLoading.value = true
    try {
        const { data } = await share_api.getDoucmentListAPI() as any
        if (data == null) {
            noNetwork.value = true
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
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
    isLoading.value = false
}

const refreshDoc = () => {
    getDoucment()
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
    const { document: { id }, document_favorites: { is_favorite } } = data
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
        if (isshow.value) {
            if (is_favorite == true) {
                isshow.value.innerHTML = t('homerightmenu.unstar')
            } else {
                isshow.value.innerHTML = t('homerightmenu.target_star')
            }
        }
    })
    docId.value = id
    mydata.value = data
}

//右键打开
const openDocument = (id: string) => {
    router.push({
        name: 'document',
        query: {
            id: id
        }
    })
}

//右键新窗口打开
const openNewWindowDocument = () => {
    const Name = 'document'
    const query = { id: docId.value }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

//右键标星
const rStarfile = () => {
    Starfile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}


//分享入口
const Sharefile = (data: data) => {
    if (showFileShare.value) {
        showFileShare.value = false
        return
    }
    docId.value = data.document.id
    selectValue.value = data.document.doc_type !== 0 ? data.document.doc_type : data.document.doc_type
    userInfo.value = userData.value
    showFileShare.value = true
}

//右键分享
const rSharefile = () => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    Sharefile(mydata.value)
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


//右键重命名
//弹框
const rrename = () => {
    newname.value = mydata.value.document.name
    if (dialogVisible.value) {
        dialogVisible.value = false
    } else {
        dialogVisible.value = true
        setTimeout(() => {
            renameinput.value.focus()
            renameinput.value.select()
        }, 100)
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }

}

//重命名
const rename1 = async () => {
    const { document: { id, name } } = mydata.value
    newname.value = renameinput.value.value
    if (newname.value == '') return
    if (newname.value != name)
        try {
            const { code } = await user_api.Setfilename({ doc_id: id, name: newname.value })
            if (code === 0) {
                ElMessage.closeAll('success')
                ElMessage.success({ duration: 1500, message: t('percenter.successtips') })
                getDoucment()
            } else {
                ElMessage.closeAll('error')
                ElMessage.error({ duration: 1500, message: t('percenter.errortips1') })
            }
        } catch (error) {
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.other_tips') })
        }
    dialogVisible.value = false
}

//右键创建副本
const rcopyfile = async () => {
    const { code } = await user_api.Copyfile({ doc_id: docId.value })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('homerightmenu.copyfile_ok') })
        getDoucment()
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('homerightmenu.copyfile_no') })
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键删除
const rDeletefile = async () => {
    Deletefile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//监听页面点击事件，
const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}


watch(lists, (Nlist) => {
    emits('data-update', Nlist, t('home.modification_time'))
}, { deep: true })

onMounted(() => {
    getDoucment()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
    document.removeEventListener('mousedown', handleClickOutside)
})

function emit(arg0: string) {
    throw new Error("Function not implemented.")
}

</script>
<style lang="scss" scoped>
main {
    height: auto;
}

.newname {
    outline: none;
    height: 30px;
    width: 460px;
    box-sizing: border-box;

    &:hover {
        border-radius: 2px;
        border: 2px #f3f0ff solid;

    }

    &:focus {
        border-radius: 2px;
        border: 2px #9775fa solid;
    }

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


.rightmenu {
    display: none;
    min-width: 200px;
    min-height: 100px;
    z-index: 999;
    position: absolute;
    background-color: white;
    padding: 10px 0;
    border-radius: 5px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

    ul {
        margin: 0;
        padding: 0 10px;

        li {
            display: block;
            padding: 10px 10px;
            font-size: 14px;
            text-decoration: none;
            color: rgba(13, 13, 13, 0.9);
            border-radius: 2px;
            cursor: pointer;

            &:hover {
                background-color: #f3f0ff;
            }
        }

        div {
            height: 1px;
            width: auto;
            background: #f3f0ff;
        }


    }
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
