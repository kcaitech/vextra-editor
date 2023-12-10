<template>
    <!-- 右键菜单 -->
    <div>
        <div class="rightmenu" ref="menu">
            <ul>
                <li :style="{ borderBottom: item === rightmenuitem.newtabopen || item === rightmenuitem.target_star ? '1px solid rgba(0,0,0,0.04)' : '' }"
                    v-for="item in props.items " :key="item" @click.stop="EventHandler(item)" :class="item">
                    {{ itemcontent(item) }}
                </li>
            </ul>
        </div>
        <!-- 重命名弹框 -->
        <ProjectDialog :projectVisible="dialogVisible" :context="''" :title="t('home.rename')" :showinput="true"
            :inputvalue="newname" :confirm-btn="t('home.rename_ok')" @clode-dialog="closeChangeName" @confirm="rename1"
            @updateinputvalue="changeinputvalue"></ProjectDialog>
    </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { onMounted, ref, onUnmounted, Ref, inject, watch } from 'vue';
import ProjectDialog from '@/components/TeamProject/ProjectDialog.vue';

const dialogVisible = ref(false)
const newname = ref()
const renameinput = ref<HTMLInputElement>()
const menu = ref<HTMLElement>()
const { t } = useI18n()

const props = defineProps<{
    items: string[],
    data: any,
}>()

const emits = defineEmits([
    'ropen',
    'rStarfile',
    'rSharefile',
    'rRemovehistory',
    'rRemovefile',
    'rExitshare',
    'rRestorefile',
    'rDeletefile',
    'getDoucment',
    'getUserdata',
    'GetrecycleLists',
    'projectrename',
    'showSettingDialog',
    'showMembergDialog',
    'cancelFixed',
    'delproject',
    'exitproject',
    'showMembergDialog',
    'moveFillAddress'
])

enum rightmenuitem {
    open = 'open',
    newtabopen = 'newtabopen',
    share = 'share',
    target_star = 'target_star',
    rename = 'rename',
    copyfile = 'copyfile',
    deletefile = 'deletefile',
    removefile = 'removefile',
    exit_share = 'exit_share',
    completely_delete = 'completely_delete',
    restore = 'restore',
    projectrename = 'projectrename',
    projectset = 'projectset',
    memberset = 'memberset',
    setfixed = 'setfixed',
    cancelfixed = 'cancelfixed',
    exitproject = 'exitproject',
    deleteproject = 'deleteproject',
    movefill = 'movefill'
}

const { menuState } = inject('shareData') as {
    menuState: Ref<boolean>;
}

const itemcontent = (item: string) => {
    switch (item) {
        case rightmenuitem.open:
            return t('homerightmenu.open')
        case rightmenuitem.newtabopen:
            return t('homerightmenu.newtabopen')
        case rightmenuitem.share:
            return t('homerightmenu.share')
        case rightmenuitem.target_star:
            return t('homerightmenu.target_star')
        case rightmenuitem.rename:
            return t('homerightmenu.rename')
        case rightmenuitem.copyfile:
            return t('homerightmenu.copyfile')
        case rightmenuitem.deletefile:
            return t('homerightmenu.deletefile')
        case rightmenuitem.removefile:
            return t('homerightmenu.removed_record')
        case rightmenuitem.exit_share:
            return t('homerightmenu.exit_share')
        case rightmenuitem.restore:
            return t('homerightmenu.restore')
        case rightmenuitem.completely_delete:
            return t('homerightmenu.completely_delete')
        case rightmenuitem.movefill:
            return t('Createteam.movetip')
        case rightmenuitem.projectrename:
            return t('homerightmenu.rename')
        case rightmenuitem.projectset:
            return t('Createteam.projectsetting')
        case rightmenuitem.memberset:
            return t('Createteam.membersetting')
        case rightmenuitem.setfixed:
            return t('Createteam.fixed')
        case rightmenuitem.cancelfixed:
            return t('Createteam.cancelFixed')
        case rightmenuitem.exitproject:
            return t('Createteam.projectexittitle')
        case rightmenuitem.deleteproject:
            return t('Createteam.projectdeltitle')
        default:
            return ''
    }
}

const closeChangeName = () => {
    dialogVisible.value = false
}
const changeinputvalue = (value: any) => {
    newname.value = value
}

const EventHandler = (item: string) => {
    if (item === rightmenuitem.open) {
        if (props.data.document != undefined) {
            emits('ropen', props.data.document.id) //右键打开 
        }
    }
    else if (item === rightmenuitem.newtabopen) {
        if (props.data.document != undefined) {
            openNewWindowDocument(props.data.document.id) //右键新窗口打开
        }

    }
    else if (item === rightmenuitem.share) {
        rSharefile(props.data) //右键分享
    }
    else if (item === rightmenuitem.target_star) {
        rStarfile(props.data) //右键标星
    }
    else if (item === rightmenuitem.rename) {
        if (props.data.document != undefined) {
            rrename(props.data.document.name) //右键重命名
            return
        }
        if (props.data.project.name != undefined) {
            rrename(props.data.project.name)
            return
        }
    }
    else if (item === rightmenuitem.copyfile) {
        if (props.data.document != undefined) {
            rcopyfile(props.data.document.id) //右键创建副本
        }
    }
    else if (item === rightmenuitem.deletefile) {
        rRemovefile(props.data) //右键删除文件
    }
    else if (item === rightmenuitem.removefile) {
        rRemovehistory(props.data) //右键移除记录
    }
    else if (item === rightmenuitem.exit_share) {
        rExitshare(props.data)//右键退出共享
    }
    else if (item === rightmenuitem.restore) {
        rRestorefile(props.data) //右键恢复删除文件
    }
    else if (item === rightmenuitem.completely_delete) {
        rDeletefile(props.data)//右键彻底删除文件
    }
    else if (item === rightmenuitem.projectset) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('showSettingDialog')
    }
    else if (item === rightmenuitem.memberset) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('showMembergDialog')
    }
    else if (item === rightmenuitem.setfixed || item === rightmenuitem.cancelfixed) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('cancelFixed')
    }
    else if (item === rightmenuitem.exitproject) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('exitproject', props.data)
    }
    else if (item === rightmenuitem.deleteproject) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('delproject', props.data);
    }
    else if (item === rightmenuitem.movefill) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
        emits('moveFillAddress', props.data);
    }
}

const changemargin = () => {
    const el = document.querySelector('.el-dialog__header') as HTMLElement
    el.style.marginRight = '0px'
}

//右键新窗口打开
const openNewWindowDocument = (id: string) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    const Name = 'document'
    const query = { id: id }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
}

//右键分享
const rSharefile = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rSharefile', data)
}

//右键标星
const rStarfile = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rStarfile', data)
}

//右键重命名
//弹框
let tiemr: any
const rrename = (name: string) => {
    newname.value = name
    if (dialogVisible.value) {
        dialogVisible.value = false
    } else {
        dialogVisible.value = true
        tiemr = setTimeout(() => {
            renameinput.value?.focus()
            renameinput.value?.select()
            clearTimeout(tiemr)
        }, 0);
    }
    if (menu.value) {
        menu.value.style.display = 'none'
    }

}

//重命名
const rename1 = async () => {
    if (props.data.project != undefined) {
        const { id, name } = props.data.project
        if (newname.value != name) {
            const data = {
                project_id: id,
                name: newname.value
            }
            emits('projectrename', data)
        }

    }
    if (props.data.document != undefined) {
        const { id, name } = props.data.document
        newname.value = renameinput.value?.value
        if (newname.value != name)
            try {
                const { code, message } = await user_api.Setfilename({ doc_id: id, name: newname.value })
                if (code === 0) {
                    ElMessage.closeAll('success')
                    ElMessage.success({ duration: 1500, message: t('percenter.successtips') })
                    emits('getDoucment')
                    emits('getUserdata')
                    dialogVisible.value = false
                } else {
                    ElMessage.closeAll('error')
                    ElMessage.error({ duration: 1500, message: message === '审核不通过' ? t('system.sensitive_reminder') : t('percenter.errortips1') })
                }
            } catch (error) {
                ElMessage.closeAll('error')
                ElMessage.error({ duration: 1500, message: t('home.other_tips') })
            }
    }
}

//右键创建副本
const rcopyfile = async (id: string) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    const { code } = await user_api.Copyfile({ doc_id: id })
    if (code === 0) {
        ElMessage.closeAll('success')
        ElMessage.success({ duration: 1500, message: t('homerightmenu.copyfile_ok') })
        emits('getDoucment')
        emits('getUserdata')
    } else {
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('homerightmenu.copyfile_no') })
    }
}

//右键删除
const rRemovefile = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRemovefile', data)
}

//右键移除历史记录
const rRemovehistory = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRemovehistory', data)
}

//右键退出共享
const rExitshare = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rExitshare', data)
}

//右键还原对应文件
const rRestorefile = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rRestorefile', data)
}

//右键删除对应文件
const rDeletefile = (data: any) => {
    if (menu.value) {
        menu.value.style.display = 'none'
    }
    emits('rDeletefile', data)
}
watch(menuState, (v) => {
    if (v) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
})

//监听页面点击事件，
const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('.rightmenu') == null) {
        if (menu.value) {
            menu.value.style.display = 'none'
        }
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style lang="scss" scoped>
.rightmenu {
    display: none;
    position: absolute;
    min-width: 180px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    z-index: 999;
    overflow: hidden;

    ul {
        margin: 0;
        padding: 0;

        li {
            display: flex;
            align-items: center;
            text-decoration: none;
            font-size: 13px;
            color: rgba(13, 13, 13, 0.9);
            height: 38px;
            padding: 0 24px;
            box-sizing: border-box;

            &:hover {
                background-color: rgba(245, 245, 245, 1);
            }
        }
    }
}
</style>
