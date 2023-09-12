<template>
    <div v-if="!noNetwork" class="container">
        <div class="hearder-container">
            <div class="title" v-for="(item, index) in  titles " :key="index">
                <div class="content">{{ item }}
                    <div v-if="index === 1" class="shrink" @click.stop="handleEvent">
                        <svg-icon icon-class="down"
                            :style="{ transform: fold ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                        <transition name="el-zoom-in-top">
                            <ul class="filterlist" v-if="fold" ref="menu">
                                <li class="item" v-for="(item, index) in  filteritems " :key="index"
                                    @click.stop="filterEvent(index)">
                                    <div class="choose" :style="{ visibility: index == fontName ? 'visible' : 'hidden' }">
                                    </div>
                                    {{ item }}
                                </li>
                            </ul>
                        </transition>
                    </div>
                </div>
            </div>
        </div>
        <div class="main">
            <div class="member-item"
                v-for=" { user: { nickname, id }, perm_type }  in  searchvalue === '' ? ListData : SearchList " :key="id">
                <div class="member-name">{{ nickname }}</div>
                <div class="member-jurisdiction">
                    <div class="member-jurisdiction-container">
                        {{ membertype(perm_type) }}
                        <div v-if="usertype(perm_type, id)" class="shrink" @click.stop="handleEventitem(id)">
                            <svg-icon icon-class="down"
                                :style="{ transform: folds && userid === id ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                            <transition name="el-zoom-in-top">
                                <ul class="filterlist" v-if="userid === id && folds" ref="listmenu">
                                    <li class="item"
                                        v-for="(item, index) in  typeitems((userperm === 2 && userID === id) ? 1 : userperm) "
                                        :key="index" @click.stop="itemEvent(item, teamID, id, perm_type, nickname)">
                                        <div v-if="true" class="choose"
                                            :style="{ visibility: item === membertype(perm_type) ? 'visible' : 'hidden' }">
                                        </div>
                                        {{ item }}
                                    </li>
                                </ul>
                            </transition>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <NetworkError v-else @refresh-doc="GetteamMember"></NetworkError>
    <ProjectDialog :projectVisible="transferCreator" :context="'转让创建者权限后，您将不再拥有该团队，后续作为管理员留在项目中。'" :title="'转移创建者权限'"
        :confirm-btn="'确定转移'" @clode-dialog="closetransferCreator" @confirm="confirmTransferCreator"></ProjectDialog>
    <ProjectDialog :projectVisible="outTeamDialog" :context="'移出团队后，该成员无法再访问团中的项目及资源。'" :title="'移出团队'"
        :confirm-btn="'确认移出'" @clode-dialog="closeOutTeamDialog" @confirm="confirmOutTeamDialog"></ProjectDialog>
    <ProjectDialog :projectVisible="exitTeamDialog" :context="'退出团队后，团队中的所有项目，文件及资源，将无法再进行访问。'" :title="'离开团队'"
        :confirm-btn="'确认离开'" @clode-dialog="closeExitTeamDialog" @confirm="confirmExitTeamDialog"></ProjectDialog>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, Ref, watch, computed } from 'vue';
import NetworkError from '@/components/NetworkError.vue'
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { router } from '@/router';
import { all } from 'axios';
import ProjectDialog from './ProjectDialog.vue';

interface Props {
    searchvalue?: string
}

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const userID = ref(localStorage.getItem('userId'))
const userid = ref()
const { t } = useI18n()
const titles = ['姓名', '团队权限']
const filteritems = ['仅阅读', '可编辑', '管理员', '创建者', '全部']

const noNetwork = ref(false)
const teammemberdata = ref<any[]>([])
const fold = ref(false)
const folds = ref(false)
const fontName = ref(4)
const menu = ref<HTMLElement>()
const listmenu = ref()
const transferCreator = ref(false);
const outTeamDialog = ref(false);
const exitTeamDialog = ref(false);
const dialogData = ref<any>({})
const { teamID, teamData, upDateTeamData, is_team_upodate, teamUpdate } = inject('shareData') as {
    teamID: Ref<string>;
    teamData: Ref<[{
        team: {
            id: string,
            name: string,
            avatar: string,
            description: string
        }
    }]>;
    upDateTeamData: (data: any[]) => void;
    is_team_upodate: Ref<boolean>;
    teamUpdate: (b: boolean) => void;
}
const userperm = ref()
const usertype = (p: number, id: string) => {
    const text = teammemberdata.value.find((item) => item.user.id === userID.value)
    userperm.value = text.perm_type
    if (text.perm_type === 3) {
        if (text.perm_type === p) {
            return false
        } else {
            return true
        }
    } else if (text.perm_type === 2) {
        if (text.perm_type === p && userID.value === id) {
            return true
        } else if (p === 2 || p === 3) {
            return false
        } else {
            return true
        }
    } else if (text.perm_type === 1 || text.perm_type === 0) {
        if (userID.value === id) {
            return true
        } else {
            return false
        }
    }
}

const typeitems = (num: number) => {
    switch (num) {
        case 0:
            return ['离开团队']
        case 1:
            return ['离开团队']
        case 2:
            return ['可编辑', '仅阅读', '移出团队']
        case 3:
            return ['管理员', '可编辑', '仅阅读', '转移创建者', '移出团队']
        default:
            return null
    }
}

const closetransferCreator = () => {
    transferCreator.value = false;
}
const confirmTransferCreator = () => {
    transferCreator.value = false;
    setcreator(dialogData.value.team_id, dialogData.value.user_id, dialogData.value.name)
}

const closeOutTeamDialog = () => {
    outTeamDialog.value = false;
}
const confirmOutTeamDialog = () => {
    outTeamDialog.value = false;
    deletemember(dialogData.value.team_id, dialogData.value.user_id)
}
const closeExitTeamDialog = () => {
    exitTeamDialog.value = false;
}
const confirmExitTeamDialog = () => {
    exitTeamDialog.value = false;
    outteam(dialogData.value.team_id)
}

const GetteamMember = async () => {
    try {
        if (teamID.value) {
            const { code, data, message } = await user_api.GetteamMember({ team_id: teamID.value })
            if (code === 0) {
                teammemberdata.value = data
                if (noNetwork.value) noNetwork.value = false
            } else {
                ElMessage({ type: 'error', message: message })
            }
        }
    } catch (error) {
        noNetwork.value = true
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
    }

}

const membertype = (num: number) => {
    switch (num) {
        case 0:
            return '仅阅读'
        case 1:
            return '可编辑'
        case 2:
            return '管理员'
        case 3:
            return '创建者'
        default:
            return null
    }
}

//通过计算属性，筛选出与搜索匹配的成员
const SearchList = computed(() => {
    return ListData.value.filter((el: any) => {
        return el.user.nickname.toLowerCase().includes(props.searchvalue.toLowerCase())
    })
})

//通过计算属性，筛选出符合当前权限类型的成员
const ListData = computed(() => {
    if (fontName.value < 4) {
        return teammemberdata.value.filter((el: any) => {
            return el.perm_type === fontName.value
        })
    } else {
        return teammemberdata.value
    }
})

const filterEvent = (index: number = 4) => {
    fontName.value = index
    fold.value = false
    folds.value = false
}

function multiplyArrayElement(item: any, P: number, U: string) {
    if (item.user.id === U) {
        item.perm_type = P
    }
    return item
}

//设置成员权限
const setPerm = async (T: string, U: string, P: number) => {
    try {
        const { code, message } = await user_api.Setteammemberperm({ team_id: T, user_id: U, perm_type: P })
        if (code === 0) {
            ElMessage.closeAll()
            ElMessage.success(`已设为：${membertype(P)}`)
            teammemberdata.value.map(item => multiplyArrayElement(item, P, U))
        } else {
            ElMessage.error(message)
        }
    } catch (error) {

    }
}

//转移团队创建者
const setcreator = async (T: string, U: string, N: string) => {
    try {
        const { code, message } = await user_api.Setteamcreator({ team_id: T, user_id: U })
        if (code === 0) {
            ElMessage.closeAll()
            ElMessage.success(`已转让给：${N}`)
            GetteamMember()
        } else {
            ElMessage.error(message)
        }

    } catch (error) {

    }
}

//移除团队成员
const deletemember = async (T: string, U: string) => {
    try {
        const { code, message } = await user_api.Deletteamemember({ team_id: T, user_id: U })
        if (code === 0) {
            ElMessage.success(message)
            teammemberdata.value = teammemberdata.value.filter(item => item.user.id != U)
        } else {
            ElMessage.error(message)
        }

    } catch (error) {

    }
}

//离开团队
const outteam = async (T: string) => {
    try {
        const { code, message } = await user_api.Leaveteam({ team_id: T })
        if (code === 0) {
            ElMessage.success(message)
            router.push({ path: '/apphome' })
            sessionStorage.setItem('index', '1');
            upDateTeamData(teamData.value.filter(item => item.team.id != T))
            teamUpdate(!is_team_upodate.value)
        } else {
            ElMessage.error(message)
        }
    } catch (error) {

    }
}

const itemEvent = (item: string, teamid: string, userid: string, perm_type: number, name: string) => {
    folds.value = false
    switch (item) {
        case '管理员':
            return (() => {
                if (perm_type != 2) setPerm(teamid, userid, 2);
            })()
        case '可编辑':
            return (() => {
                if (perm_type != 1) setPerm(teamid, userid, 1);
            })()
        case '仅阅读':
            return (() => {
                if (perm_type != 0) setPerm(teamid, userid, 0);
            })()
        case '转移创建者':
            return (() => {
                transferCreator.value = true;
                dialogData.value = {
                    team_id: teamid,
                    user_id: userid,
                    name
                }
            })()
        case '移出团队':
            return (() => {
                outTeamDialog.value = true;
                dialogData.value = {
                    team_id: teamid,
                    user_id: userid,
                }
            })()
        case '离开团队':
            return (() => {
                exitTeamDialog.value = true;
                dialogData.value = {
                    team_id: teamid,
                }
            })()
        default:
            break
    }
}

const handleEvent = () => {
    if (folds.value) {
        folds.value = false
        fold.value = !fold.value
    } else {
        fold.value = !fold.value
    }
}

const handleEventitem = (id: string) => {
    if (fold.value) {
        fold.value = false
        folds.value = !folds.value
        userid.value = id
    } else {
        folds.value = !folds.value
        userid.value = id
    }
}


watch(teamID, () => {
    GetteamMember()
})

onMounted(() => {
    GetteamMember()
    document.addEventListener("click", (event: MouseEvent) => {
        const list1 = document.querySelector('.member-jurisdiction-container .shrink .filterlist')
        const list2 = document.querySelector('.content .shrink .filterlist')
        if (list1) {
            if (event.target instanceof Element && event.target.closest('.filterlist') == null) {
                if (folds.value) {
                    folds.value = false
                }
            }
        }
        if (list2) {
            if (event.target instanceof Element && event.target.closest('.filterlist') == null) {
                if (fold.value) {
                    fold.value = false
                }
            }
        }
    })
})

onUnmounted(() => {

})
</script>
<style lang="scss" scoped>
.container {


    .hearder-container {
        display: flex;

        .title {
            width: 200px;
            font-weight: 600;
            display: flex;
            align-items: center;

            .content {
                display: flex;
                justify-content: center;

                .shrink {
                    width: 16px;
                    height: 16px;
                    float: right;
                    line-height: 25px;

                    >svg {
                        transition: 0.5s;
                        width: 100%;
                        height: 100%;
                        margin-left: 4px;
                    }

                    .filterlist {
                        position: relative;
                        list-style-type: none;
                        font-size: 14px;
                        font-weight: 500;
                        min-width: 72px;
                        margin: 0;
                        padding: 0 8px;
                        right: 72px;
                        border-radius: 4px;
                        background-color: white;
                        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                        z-index: 3;

                        .choose {
                            box-sizing: border-box;
                            width: 10px;
                            height: 6px;
                            margin-right: 4px;
                            margin-left: 2px;
                            border-width: 0 0 1px 1px;
                            border-style: solid;
                            border-color: rgb(0, 0, 0, .75);
                            transform: rotate(-45deg) translateY(-30%);
                        }

                        .item {
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            line-height: 32px;
                        }
                    }
                }

            }
        }
    }

    .member-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 40px;
        border-radius: 4px;
        margin: 6px 0;
    }

    .member-name,
    .member-jurisdiction {
        width: 200px;
        display: flex;

        .member-jurisdiction-container {
            display: flex;
            justify-content: center;

            .shrink {
                width: 16px;
                height: 16px;
                float: right;
                line-height: 25px;

                >svg {
                    transition: 0.5s;
                    width: 100%;
                    height: 100%;
                    margin-left: 4px;
                }

                .filterlist {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    list-style-type: none;
                    font-size: 14px;
                    font-weight: 500;
                    min-width: 88px;
                    margin: 0;
                    padding: 0 8px;
                    right: 64px;
                    border-radius: 4px;
                    background-color: white;
                    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                    z-index: 2;

                    .item {
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        line-height: 32px;

                        .choose {
                            box-sizing: border-box;
                            width: 10px;
                            height: 6px;
                            margin-right: 4px;
                            margin-left: 2px;
                            border-width: 0 0 1px 1px;
                            border-style: solid;
                            border-color: rgb(0, 0, 0, .75);
                            transform: rotate(-45deg) translateY(-30%);
                        }
                    }
                }

            }
        }


    }
}
</style>
