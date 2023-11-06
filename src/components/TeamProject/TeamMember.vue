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
            <el-scrollbar height="100%">
                <div class="member-item"
                    v-for=" { user: { nickname, id, avatar }, perm_type }  in  searchvalue === '' ? ListData : SearchList "
                    :key="id">
                    <div class="member-name">
                        <img :src="avatar" alt="icon"
                            style="width: 20px;height: 20px;;border-radius: 50%;margin-right: 4px;">
                            {{ nickname }}
                        <!-- <div class="nickname" v-if="value === ''">{{ nickname }}</div>
                        <div class="nickname" v-else>
                            <div v-for="{ team_member: { nickname } } in value" :key="teamID">{{ team_member.nickname }}</div>
                        </div> -->
                        <div class="changeName">
                            <el-tooltip class="tips" effect="dark" :content="`${t('teammember.change_name')}`"
                                placement="bottom" :show-after="600" :offset="10" :hide-after="0">
                                <button class="button" @click="() => openDialog(nickname)">修改</button>
                            </el-tooltip>
                        </div>
                    </div>
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
                <el-dialog v-model="dialogVisible" :title="t('teammember.change_teamname')" width="500" align-center>
                    <span>仅针对当前团队修改，不影响在其他团队的姓名</span>
                    <input class="change" type="text" ref="changeinput" />
                    <template #footer>
                        <span class="dialog-footer" style="text-align: center;">
                            <el-button class="confirm" type="primary" style="background-color: none;">
                                {{ t('home.rename_ok') }}
                            </el-button>
                            <el-button class="cancel" @click="dialogVisible = false">{{ t('home.cancel')
                            }}</el-button>
                        </span>
                    </template>
                </el-dialog>
                <div v-if="SearchList.length === 0 && searchvalue !== ''" class="empty">
                    <svg-icon icon-class="member"></svg-icon>
                    没有找到该成员
                </div>
                <Loading v-if="SearchList.length === 0 && searchvalue == ''" :size="20" />
            </el-scrollbar>
        </div>
    </div>
    <NetworkError v-else @refresh-doc="GetteamMember"></NetworkError>
    <ProjectDialog :projectVisible="transferCreator" :context="t('teammember.transferCreator_context')"
        :title="t('teammember.transferCreator_title')" :confirm-btn="t('teammember.transferCreator_confirm')"
        @clode-dialog="closetransferCreator" @confirm="confirmTransferCreator"></ProjectDialog>
    <ProjectDialog :projectVisible="outTeamDialog" :context="t('teammember.outTeamDialog_context')"
        :title="t('teammember.outTeamDialog_title')" :confirm-btn="t('teammember.outTeamDialog_confirm')"
        @clode-dialog="closeOutTeamDialog" @confirm="confirmOutTeamDialog"></ProjectDialog>
    <ProjectDialog :projectVisible="exitTeamDialog" :context="t('teammember.exitTeamDialog_context')"
        :title="t('teammember.exitTeamDialog_title')" :confirm-btn="t('teammember.exitTeamDialog_confirm')"
        @clode-dialog="closeExitTeamDialog" @confirm="confirmExitTeamDialog"></ProjectDialog>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, Ref, watch, computed, nextTick } from 'vue';
import NetworkError from '@/components/NetworkError.vue'
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { router } from '@/router';
import ProjectDialog from './ProjectDialog.vue';
import Loading from '../common/Loading.vue';
interface Props {
    searchvalue?: string
    value: string
}

const props = withDefaults(defineProps<Props>(), {
    searchvalue: '',
    value: ''
})

const userID = ref(localStorage.getItem('userId'))
const userid = ref()
const { t } = useI18n()
const dialogVisible = ref(false)
const changeinput = ref<HTMLInputElement>()
const titles = [t('teammember.name'), t('teammember.team_permission')]
const filteritems = [t('teammember.Readonly'), t('teammember.editable'), t('teammember.manager'), t('teammember.creator'), t('teammember.all')]
const noNetwork = ref(false)
const teammemberdata = ref<any[]>([])
const memberdata = ref<any[]>([])
const fold = ref(false)
const folds = ref(false)
const fontName = ref(4)
const menu = ref<HTMLElement>()
const listmenu = ref()
const transferCreator = ref(false);
const outTeamDialog = ref(false);
const exitTeamDialog = ref(false);
const dialogData = ref<any>({});
const openDialog = (name: string) => {
    dialogVisible.value = true;
    nextTick(() => {
        if (changeinput.value) {
            changeinput.value.value = name;
            setTimeout(() => {
                changeinput.value?.select();
                changeinput.value?.focus();
            }, 100)
        }
    })
};

const loading = ref(true)
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
            return [t('teammember.leave_team')]
        case 1:
            return [t('teammember.leave_team')]
        case 2:
            return [t('teammember.editable'), t('teammember.Readonly'), t('teammember.move_team')]
        case 3:
            return [t('teammember.manager'), t('teammember.editable'), t('teammember.Readonly'), t('teammember.transfer_creator'), t('teammember.move_team')]
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
            return t('teammember.Readonly')
        case 1:
            return t('teammember.editable')
        case 2:
            return t('teammember.manager')
        case 3:
            return t('teammember.creator')
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
    console.log(memberdata.value, '1')
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
            ElMessage.success(`${t('teammember.permission_tips') + membertype(P)}`)
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
            ElMessage.success(`${t('teammember.transfer_tips') + N} `)
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
        case t('teammember.manager'):
            return (() => {
                if (perm_type != 2) setPerm(teamid, userid, 2);
            })()
        case t('teammember.editable'):
            return (() => {
                if (perm_type != 1) setPerm(teamid, userid, 1);
            })()
        case t('teammember.Readonly'):
            return (() => {
                if (perm_type != 0) setPerm(teamid, userid, 0);
            })()
        case t('teammember.transfer_creator'):
            return (() => {
                transferCreator.value = true;
                dialogData.value = {
                    team_id: teamid,
                    user_id: userid,
                    name
                }
            })()
        case t('teammember.move_team'):
            return (() => {
                outTeamDialog.value = true;
                dialogData.value = {
                    team_id: teamid,
                    user_id: userid,
                }
            })()
        case t('teammember.leave_team'):
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
    height: 100%;

    .hearder-container {
        display: flex;

        .title {
            width: 200px;
            font-weight: 600;
            display: flex;
            align-items: center;
            font-size: 14px;

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

    .member-name {
        width: 200px;
        display: flex;

        .changeName {
            margin-left: auto;
            height: 10px;


            .button {
                width: 50px;
                height: 20px;
                margin: 0px 0 20px 0;
                border: none;
                font-size: 10px;
                letter-spacing: 1px;
                font-weight: 500;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                background-color: #9775fa;
                color: #ffffff;

                &:hover {
                    background-color: #9675fadc;
                }
            }
        }
    }

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

.container {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.main {
    height: calc(100vh - 96px - 56px - 56px - 20px);

    .change {
        outline: none;
        height: 30px;
        width: 440px;
        box-sizing: border-box;
        margin-top: 22px;
        border-radius: 4px;

        &:hover {
            border-radius: 2px;
            border: 2px #f3f0ff solid;

        }

        &:focus {
            border-radius: 2px;
            border: 2px #9775fa solid;
        }
    }

    .confirm {
        background-color: #9775fa;
        color: white;
        border-color: #9775fa;

        &:hover {
            background: #9675fa91;
            border-color: #9675fa91;
        }

        &:active {
            background-color: #9775fa;
            border-color: #9775fa;
        }

    }

    .cancel {

        &:hover {
            background-color: #ffffff;
            color: #9775fa;
            border-color: #9775fa;
        }

        &:active {
            background-color: #ffffff;
        }

        &:focus {
            background-color: white;
            color: #9775fa;
            border-color: #9775fa;
        }
    }

    :deep(.el-button--primary) {
        background-color: #9775fa;
    }

    .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 25%;
        font-size: 14px;

        svg {
            color: #9775fa;
            width: 22px;
            height: 22px;
            margin-right: 4px;
        }
    }
}
</style>
