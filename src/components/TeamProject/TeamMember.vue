<template>
    <div v-if="!noNetwork" class="container" style="height: calc(100vh - 224px);">
        <div class="hearder-container">
            <div class="title" v-for="item in titles " :key="item.type" @click.stop="titleClickEvent(item.type)">
                {{ item.label }}
                <div v-if="item.type === 1" class="shrink">
                    <svg-icon icon-class="down"
                        :style="{ transform: fold ? 'rotate(-180deg)' : 'rotate(0deg)', color: '#000000' }"></svg-icon>
                </div>
                <transition name="el-zoom-in-top">
                    <ul class="filterlist2" v-if="item.type === 1 && fold" ref="menu">
                        <li class="item" :style="{ fontWeight: item.type == fontName ? 500 : '',color: item.type == fontName ? '#262626' : '' }"
                            v-for="item in  filteritems " :key="item.type" @click.stop="filterEvent(item.type)">
                            {{ item.label }}
                            <div class="choose" :style="{ visibility: item.type == fontName ? 'visible' : 'hidden' }"></div>
                        </li>
                    </ul>
                </transition>
            </div>
        </div>
        <div class="main">
            <el-scrollbar v-if="SearchList.length !== 0" height="100%">
                <div class="member-item"
                    v-for=" { team_member: { nickname: teamname }, user: { nickname, id, avatar }, perm_type }  in  SearchList "
                    :key="id">
                    <div class="member-name">
                        <img :src="avatar" alt="icon" style="width: 32px;height: 32px;border-radius: 50%;">
                        <div class="nametext"> {{ teamname ? teamname : nickname }}</div>
                        <div v-if="perm_type < usertype2 || id === userID" class="changeName"
                            @click="() => openDialog(teamname ? teamname : nickname, id)">
                            <el-tooltip class="tips" effect="dark" :content="`${t('teammember.change_name')}`"
                                placement="bottom" :show-after="600" :offset="10" :hide-after="0">
                                <svg-icon icon-class="editname"></svg-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <div class="member-jurisdiction">
                        <div class="member-jurisdiction-container">
                            {{ membertype(perm_type) }}
                            <div v-if="perm_type < usertype2 || (id === userID && usertype2 != TeamPermisssions.creator)"
                                class="shrink" @click.stop="folds = !folds, fold = false, userid = id">
                                <svg-icon icon-class="down"
                                    :style="{ transform: folds && userid === id ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                            </div>
                            <transition name="el-zoom-in-top">
                                <ul class="filterlist" v-if="userid === id && folds" ref="listmenu">
                                    <li class="item" :style="{ fontWeight: item === membertype(perm_type) ? 500 : '' }"
                                        v-for="(item, index) in typeitems((usertype2 === TeamPermisssions.adminstartors && userID === id) ? 1 : usertype2) "
                                        :key="index" @click.stop="itemEvent(item, teamID, id, perm_type, nickname)">
                                        {{ item }}
                                        <div class="choose"
                                            :style="{ visibility: item === membertype(perm_type) ? 'visible' : 'hidden' }">
                                        </div>
                                    </li>
                                </ul>
                            </transition>
                        </div>
                    </div>
                </div>
                <Loading v-if="SearchList.length === 0 && searchvalue === '' && fontName === 4" :size="20" />
            </el-scrollbar>
            <div v-else class="empty">
                <div v-html="emptytips"></div>
            </div>
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
    <ProjectDialog :projectVisible="dialogVisible" :context="t('teammember.modifyNickname_title')"
        :title="t('teammember.change_teamname')" :showinput="true" :inputvalue="inputvalue"
        :confirm-btn="t('home.rename_ok')" @clode-dialog="closeChangeName" @confirm="confirm_to_modify_name"
        @updateinputvalue="changeinputvalue"></ProjectDialog>
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
import { setTeamMemberNicknameAPI } from '@/request/team';
import PinyinMatch from 'pinyin-match'


interface Emits {
    (e: 'update'): void
}
interface Props {
    searchvalue?: string
}

enum TeamPermisssions {
    onlyRead = 0,
    edit = 1,
    adminstartors = 2,
    creator = 3,
    noPermisssion = 255
}

const props = withDefaults(defineProps<Props>(), {
    searchvalue: '',
})

const emits = defineEmits<Emits>();
const userID = ref(localStorage.getItem('userId'))
const userid = ref()
const { t } = useI18n()
const dialogVisible = ref(false)
const confirmLoading = ref(false)
const titles = [
    { type: 0, label: t('teammember.name') },
    { type: 1, label: t('teammember.team_permission') }
]
const filteritems = [
    { type: 4, label: t('teammember.all') },
    { type: 3, label: t('teammember.creator') },
    { type: 2, label: t('teammember.manager') },
    { type: 1, label: t('teammember.editable') },
    { type: 0, label: t('teammember.Readonly') },
]
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
const dialogData = ref<any>({});
let user_id = '';
const inputvalue = ref<any>()

const titleClickEvent = (type: number) => {
    if (type === 1) {
        fold.value = !fold.value
        folds.value = false
    }
    return
}

const openDialog = (name: string, userid: string) => {
    inputvalue.value = name
    dialogVisible.value = true;
    user_id = userid;
};

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

const emptytips = computed(() => {
    return props.searchvalue !== '' ? '没有找到该成员' : fontName.value !== 4 ? `没有成员属于<b>[${filteritems.filter(item => item.type === fontName.value)[0].label}]</b>权限类型` : ''
})


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

const closeChangeName = () => {
    dialogVisible.value = false
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

const membertype = (num: number) => {
    switch (num) {
        case TeamPermisssions.onlyRead:
            return t('teammember.Readonly')
        case TeamPermisssions.edit:
            return t('teammember.editable')
        case TeamPermisssions.adminstartors:
            return t('teammember.manager')
        case TeamPermisssions.creator:
            return t('teammember.creator')
        default:
            return null
    }
}

const usertype2 = ref()

//通过计算属性，筛选出与搜索匹配的成员
const SearchList = computed(() => {
    return props.searchvalue.toLowerCase() ? ListData.value.filter((el: any) => {
        if (el.user.id === userID.value) {
            usertype2.value = el.perm_type
        }
        return PinyinMatch.match(el.team_member.nickname.toLowerCase(), props.searchvalue.toLowerCase())
    }) : ListData.value.filter((el: any) => {
        if (el.user.id === userID.value) {
            usertype2.value = el.perm_type
        }
        return ListData.value
    })
})

//通过计算属性，筛选出符合当前权限类型的成员
const ListData = computed(() => {
    return fontName.value === 4 ? teammemberdata.value : teammemberdata.value.filter(item => item.perm_type === fontName.value)
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
            router.push({ path: '/files' })
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

// 修改名称 --确认
async function confirm_to_modify_name() {
    if (confirmLoading.value) { return; }
    const params = get_params_for_modify_name();
    // 1. 校验
    if (inputvalue.value && inputvalue.value.length > 0 && inputvalue.value.length < 20) {
        confirmLoading.value = true;
        try {
            // 2. 执行修改接口
            const result = await setTeamMemberNicknameAPI(params);
            if (result?.code === 0) {
                // 3. 更新列表
                const n = teammemberdata.value.findIndex(i => i.user.id === user_id);
                if (n > -1) {
                    teammemberdata.value[n].team_member.nickname = params.nickname;
                }
                ElMessage.closeAll('success');
                ElMessage.success({ duration: 1500, message: t('percenter.successtips') });
                // 4. 关闭对话
                dialogVisible.value = false;
            } else {
                // 5. 失败提醒
                ElMessage.closeAll('error');
                ElMessage.error({ duration: 1500, message: result.message === '审核不通过' ? t('system.sensitive_reminder') : t('percenter.errortips1') });
            }
        } catch (error) {
            ElMessage.closeAll('error');
            ElMessage.error({ duration: 1500, message: t('percenter.error_occurred') });
        } finally {
            // 结束加载状态，无论成功还是失败
            confirmLoading.value = false;
        }
    } else {
        ElMessage.closeAll('warning');
        ElMessage.warning({ duration: 1500, message: t('percenter.nicknametips_length') });
    }
}
function get_params_for_modify_name() {
    const params: any = {};
    if (inputvalue.value) {
        params['nickname'] = inputvalue.value;
    }
    params['user_id'] = user_id;
    params['team_id'] = teamID.value;
    return params;
}

const changeinputvalue = (value: any) => {
    inputvalue.value = value
}

watch(teamID, () => {
    GetteamMember()
})

const handleClickOutside = (event: MouseEvent) => {
    const list1 = document.querySelector('.member-jurisdiction-container .filterlist ')!;
    const list2 = document.querySelector('.title .filterlist2')!;
    function handleFoldState(list: Element, foldState: boolean) {
        if (list && event.target instanceof Element && event.target.closest('.filterlist') == null) {
            if (foldState) {
                folds.value = fold.value = false;
            }
        }
    }
    handleFoldState(list1, folds.value)
    handleFoldState(list2, fold.value)
}

onMounted(() => {
    GetteamMember()
    document.addEventListener("click", handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside)
})
</script>
<style lang="scss" scoped>
.container {
    margin: 0 8px 0px 8px;

    .hearder-container {
        display: flex;
        gap: 16px;
        line-height: 24px;
        height: 24px;

        .title {
            position: relative;
            width: 362px;
            min-width: 200px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            color: rgba(168, 168, 168, 1);
            white-space: nowrap;


            .shrink {
                display: flex;
                align-items: center;
                width: 14px;
                height: 14px;

                >svg {
                    transition: 0.5s;
                    width: 100%;
                    height: 100%;
                }
            }

            .filterlist2 {
                position: absolute;
                list-style-type: none;
                font-size: 12px;
                padding: 6px 0;
                top: 16px;
                min-width: 102px;
                left: 0px;
                border-radius: 6px;
                background-color: white;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                box-sizing: border-box;
                overflow: hidden;
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
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 32px;
                    font-weight: 400;
                    padding: 8px 12px;
                    box-sizing: border-box;
                    // color: #262626;

                    &:hover {
                        background-color: rgba(245, 245, 245, 1);
                    }
                }
            }

        }
    }

    .member-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 56px;
        gap: 16px;
    }

    .member-name {
        color: #333333;
        width: 362px;
        min-width: 200px;
        display: flex;
        align-items: center;
        gap: 8px;

        .nametext {
            white-space: nowrap;
        }

        .changeName {
            display: flex;
            align-items: center;
            border-radius: 6px;
            padding: 4px;


            svg {
                width: 14px;
                height: 14px;
                color: #333333;
                outline: none;
            }

            &:hover {
                background-color: #F7F7F9;
            }

        }
    }

    .member-jurisdiction {
        width: 362px;
        min-width: 200px;
        line-height: 24px;
        height: 24px;
        display: flex;

        .member-jurisdiction-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333333;
            gap: 4px;
            white-space: nowrap;

            .shrink {
                position: relative;
                display: flex;
                align-items: center;
                width: 14px;
                height: 14px;

                &::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -48px;
                    right: 0px;
                    bottom: 0;
                }

                >svg {
                    transition: 0.5s;
                    width: 100%;
                    height: 100%;
                }
            }

            .filterlist {
                position: absolute;
                list-style-type: none;
                font-size: 12px;
                min-width: 102px;
                padding: 6px 0;
                margin: 0;
                top: 32px;
                left: 0px;
                border-radius: 6px;
                background-color: white;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                box-sizing: border-box;
                overflow: hidden;
                z-index: 2;

                .item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 32px;
                    font-weight: 400;
                    padding: 8px 12px;
                    box-sizing: border-box;

                    &:hover {
                        background-color: rgba(245, 245, 245, 1);
                    }

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

.container {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.main {
    height: calc(100vh - 224px - 16.5px);

    .empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 400;
        color: rgb(191, 191, 191);
        gap: 4px;

        svg {
            width: 22px;
            height: 22px;
        }
    }
}
</style>
