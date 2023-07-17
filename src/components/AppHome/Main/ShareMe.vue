<template>
    <tablelist :data="lists" :iconlist="iconlists" @share="Sharefile" @exit_share="Exitshar" @dbclickopen="openDocument"
        @updatestar="Starfile" @rightMeun="rightmenu" />

    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu">
        <ul>
            <li @click="openDocument(docId)">{{ t('homerightmenu.open') }}</li>
            <li @click="openNewWindowDocument">{{ t('homerightmenu.newtabopen') }}</li>
            <div></div>
            <li @click.stop="rSharefile">{{ t('homerightmenu.share') }}</li>
            <li @click="rStarfile" ref="isshow">{{ t('homerightmenu.target_star') }}</li>
        </ul>
    </div>
    <FileShare v-if=" showFileShare " @close=" closeShare " :docId=" docId " :selectValue=" selectValue " :docUserId="docUserId" :userInfo="userInfo"
        @select-type=" onSelectType " @switch-state=" onSwitch " :shareSwitch=" shareSwitch " :pageHeight=" pageHeight ">
    </FileShare>
    <div v-if="showFileShare" class="overlay"></div>
</template>
<script setup lang="ts">
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { router } from '@/router'
import FileShare from '@/components/Document/Toolbar/Share/FileShare.vue'
import tablelist from '@/components/AppHome/tablelist.vue'
import { useI18n } from 'vue-i18n'
import { UserInfo } from '@/context/user';

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
}

const { t } = useI18n()
const isLoading = ref(false);
const showFileShare = ref<boolean>(false);
const shareSwitch = ref(true)
const pageHeight = ref(0)
const docUserId = ref('')
const selectValue = ref(1)
const menu = ref<HTMLElement>()
const isshow = ref<HTMLElement>()
const userInfo = ref<UserInfo | undefined>()
const docId = ref('')
const mydata = ref()
let lists = ref<any[]>([])
const iconlists = ref(['star', 'share', 'EXshare'])

const emits = defineEmits(['data-update'])

async function ShareLists() {
    // loading
    isLoading.value = true
    try {
        const { data } = await user_api.ShareLists()
        if (data == null) {
            ElMessage.closeAll('error')
            ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
        } else {
            for (let i = 0; i < data.length; i++) {
                let { document: { size }, document_access_record: { last_access_time } } = data[i]
                data[i].document.size = sizeTostr(size)
                data[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
            }
        }
        lists.value = Object.values(data)
    } catch (error) {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
    }

    // // unloading  
    isLoading.value = false;
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

const userData = ref({
    avatar: localStorage.getItem('avatar') || '',
    id: localStorage.getItem('userId') || '',
    nickname: localStorage.getItem('nickname') || ''
})

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

//右键标星
const rStarfile = () => {
    Starfile(mydata.value)
    if (menu.value) {
        menu.value.style.display = 'none'
    }
}

//右键分享
const rSharefile = () => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    Sharefile(mydata.value)

}

const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
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
    ShareLists()
    getPageHeight()
    window.addEventListener('resize', getPageHeight)
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('resize', getPageHeight)
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style lang="scss" scoped>
.item {
    height: calc(100vh - 194px);
}

@media screen and (max-width: 1000px) {
    .item {
        height: calc(100vh - 154px);
    }
}

.title {
    display: flex;
    justify-content: space-between;
    padding: 0 10px 6px 10px;
    color: #606266;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;

    span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 10px;
    }

    span:nth-child(1) {
        flex: 2;
    }

    span:not(:nth-child(1)) {
        flex: 1;

    }

    div {
        flex: 1;
        padding: 0 10px 6px 0;
        display: flex;

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

.el-icon {
    display: none;
    position: relative;
    top: 5px;

    &:hover {
        color: #6395f9;
    }

    &:active {
        color: #145ff6;

    }

    &:focus-visible {
        outline: none;
    }
}

:deep(.el-icon) {
    &>:focus {
        outline: none;
    }

    &>:focus-visible {
        outline: none;
    }
}

.el-table__row:hover .el-icon {
    display: inline-block;
}

:deep(.el-table_2_column_7) {
    text-align: center;
}

:deep(.el-table__row) {
    height: 56px;
    font-weight: 18px;
}

:deep(.el-table__cell) {
    padding: 0;
}

:deep(.el-table__cell .cell) {
    line-height: 56px;
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