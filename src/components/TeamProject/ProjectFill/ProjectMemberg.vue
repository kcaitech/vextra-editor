<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import * as team_api from '@/request/team';
import { useI18n } from 'vue-i18n';
import ProjectDialog from '@/components/TeamProject/ProjectDialog.vue';

const props = defineProps<{
    showcontainer: boolean,
    projectMembergDialog: boolean
    currentProject: any
}>();

const emit = defineEmits<{
    (e: 'closeDialog'): () => void;
    (e: 'exitProject', id: string, state: boolean): void;
    (e: 'memberLength', num: number): void;
}>();


const { t } = useI18n();
const innerVisible = ref(false)
const isshow = ref(false)
const memberList = ref<any[]>([]);
const permission = ref([`${t('share.no_authority')}`, `${t('share.readOnly')}`, `${t('share.reviewable')}`, `${t('share.editable')}`, '管理员', '创建者'])
const permList = ref([`${t('Createteam.all')}`, `${t('Createteam.creator')}`, `${t('Createteam.manager')}`, `${t('share.editable')}`, `${t('share.reviewable')}`, `${t('share.readOnly')}`])
const permFilter = ref(0);
const memberList2 = ref<any[]>([]);
const transferVisible = ref(false);
const memberInfo = ref<any>({});

const getProjectMemberList = async () => {
    try {
        const { data } = await team_api.getProjectMemberListAPI({ project_id: props.currentProject.project.id });
        memberList.value = data.map((item: { isTeam: boolean; }) => {
            item.isTeam = false;
            return item;
        });
        memberList2.value = data.map((item: { isTeam: boolean; }) => {
            item.isTeam = false;
            return item;
        });
        getTeamMemberList();
    } catch (err) {
        console.log(err);
    }
}

const getTeamMemberList = async () => {
    try {
        const { data } = await team_api.getTeamMemberListAPI({ team_id: props.currentProject.project.team_id });
        for (let i = 0; i < data.length; i++) {
            const team_member_id = data[i].user.id;
            memberList.value.forEach(item => {
                if (item.user.id === team_member_id) {
                    item.isTeam = true;
                }
            })
            memberList2.value.forEach(item => {
                if (item.user.id === team_member_id) {
                    item.isTeam = true;
                }
            })
        }
    } catch (err) {
        console.log(err);
    }
}
watch(() => memberList2.value.length, (v) => {
    emit('memberLength', v)
})

watch(() => props.showcontainer, (newval) => {
    isshow.value = newval
})

const handleCommand = (command: number) => {
    permFilter.value = command;
    switch (command) {
        case 0:
            memberList.value = memberList2.value;
            break;
        case 1:
            memberList.value = memberList2.value.filter(item => item.perm_type === 5);
            break;
        case 2:
            memberList.value = memberList2.value.filter(item => item.perm_type === 4);
            break;
        case 3:
            memberList.value = memberList2.value.filter(item => item.perm_type === 3);
            break;
        case 4:
            memberList.value = memberList2.value.filter(item => item.perm_type === 2);
            break;
        case 5:
            memberList.value = memberList2.value.filter(item => item.perm_type === 1);
            break;
        default:
            memberList.value = memberList2.value;
            break
    }
    showpermlist.value = false
}

const handleCommandPerm = (data: any) => {
    const { member, perm, command, index } = data;
    const params = { project_id: props.currentProject.project.id, user_id: member.user.id, perm_type: perm };
    const del_params = { project_id: props.currentProject.project.id, user_id: member.user.id };
    const i = memberList2.value.findIndex(item => item.user.id === member.user.id);
    switch (command) {
        case 1:
            if (command === 1) {
                setProjectmemberPerm(params);
                memberList.value[index].perm_type = perm;
                memberList2.value[i].perm_type = perm;
            }
            break;
        case 2:
            if (command === 2) {
                transferVisible.value = true;
                memberInfo.value = data;
            }
            break;
        case 3:
            if (command === 3) {
                delProjectmember(del_params);
                memberList.value.splice(index, 1);
                memberList2.value.splice(i, 1);
            }
            break;
        default:
            break
    }
    showmemberlist.value = false
}

const setProjectmemberPerm = async (params: { project_id: string, user_id: string, perm_type: number }) => {
    try {
        await team_api.setProjectmemberPermAPI(params)
    } catch (err) {
        console.log(err);
    }
}

const delProjectmember = async (params: { project_id: string, user_id: string }) => {
    try {
        await team_api.delProjectmemberAPI(params)
    } catch (err) {
        console.log(err);
    }
}

const handleClose = () => {
    innerVisible.value = false;
}
const transferClose = () => {
    transferVisible.value = false;
}
const quitProject = () => {
    innerVisible.value = false;
    exitProject();
    const user_id = localStorage.getItem('userId');
    let state = false;
    memberList2.value.forEach(item => {
        if (user_id === item.user.id) {
            state = item.isTeam;
            return;
        }
    })
    emit('exitProject', props.currentProject.team_id, state);
}
const exitProject = async () => {
    try {
        await team_api.exitProjectAPI({ project_id: props.currentProject.project.id })
    } catch (err) {
        console.log(err);
    }
}
const transferProject = () => {
    const { member, perm, index } = memberInfo.value;
    const i = memberList2.value.findIndex(item => item.user.id === member.user.id);
    const creatori2 = memberList2.value.findIndex(item => item.perm_type === 5);
    const creatori = memberList.value.findIndex(item => item.perm_type === 5);
    memberList.value[creatori].perm_type = 4;
    memberList2.value[creatori2].perm_type = 4;
    memberList.value[index].perm_type = 5;
    memberList2.value[i].perm_type = 5;
    transferProjectCreator(member.user.id);
    transferVisible.value = false;
}

const transferProjectCreator = async (id: string) => {
    try {
        await team_api.transferProjectCreatorAPI({ project_id: props.currentProject.project.id, user_id: id })
    } catch (err) {
        console.log(err);
    }
}

watch(() => props.projectMembergDialog, (v) => {
    if (v) {
        permFilter.value = 0;
        memberList.value = memberList2.value;
    }
})

const onExitProject = () => {
    innerVisible.value = true;
    document.addEventListener('keydown', escClose);
}
const escClose = () => {
    innerVisible.value = false;
    transferVisible.value = false;
}

watch(transferVisible, (v) => {
    if (!v) {
        document.removeEventListener('keydown', escClose);
    }
})

watch(innerVisible, (v) => {
    if (!v) {
        document.removeEventListener('keydown', escClose);
    }
})

onMounted(() => {
    getProjectMemberList();
})

const showpermlist = ref<boolean>(false)
const showmemberlist = ref<boolean>(false)
const memberid = ref<number>()
</script>

<template>
    <div class="overlay"></div>
    <div class="container" v-if="isshow">
        <div class="header">
            <div class="title">{{ t('Createteam.membersed') }}</div>
            <div class="close" @click.stop="emit('closeDialog')">
                <svg-icon icon-class="close"></svg-icon>
                <!-- 测试 -->
            </div>
        </div>
        <div class="content_title">
            <div class="name_title">{{ t('Createteam.username') }}</div>
            <div class="perm_title" @click="showpermlist = !showpermlist">
                <span class="text">{{ t('Createteam.jurisdiction') }}</span>
                <svg-icon icon-class="down"
                    :style="{ transform: showpermlist ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                <Transition name="el-zoom-in-top">
                    <ul v-if="showpermlist" class="perm_list">
                        <li class="perm_item" :style="{ color: index == permFilter ? '#000000' : '' }"
                            v-for="(item, index) in permList" :key="index" @click.stop="handleCommand(index)">
                            <div class="choose" :style="{ visibility: index == permFilter ? 'visible' : 'hidden' }">
                            </div>
                            {{ item }}
                        </li>
                    </ul>
                </Transition>
            </div>
        </div>
        <el-scrollbar class="myscrollbar" height="300px">
            <div class="content">
                <div class="member-item1" v-for="(item, index) in memberList" :key="index">
                    <div class="name">
                        <img :src="item.user.avatar" alt="user_avatar" />
                        <span>{{ item.user.nickname }}</span>
                    </div>
                    <div class="type">
                        <span>{{ permission[item.perm_type] }}</span>
                        <div @click.stop="showmemberlist = !showmemberlist, memberid = index">
                            <svg-icon
                                v-if="(props.currentProject.self_perm_type === 5 && item.perm_type !== 5) || (props.currentProject.self_perm_type === 4 && (item.perm_type !== 4 && item.perm_type !== 5))"
                                icon-class="down"
                                :style="{ transform: showmemberlist ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                        </div>
                        <Transition name="el-zoom-in-top">
                            <ul v-if="showmemberlist && memberid === index" class="member_list">
                                <li class="member_item"
                                    v-if="props.currentProject.self_perm_type === 5 && item.perm_type != 4"
                                    @click.stop="handleCommandPerm({ member: item, perm: 4, command: 1, index })">
                                    {{ t('Createteam.manager') }}</li>
                                <li class="member_item"
                                    @click.stop="handleCommandPerm({ member: item, perm: 3, command: 1, index })">{{
                                        t('Createteam.editable') }}</li>
                                <li class="member_item"
                                    @click.stop="handleCommandPerm({ member: item, perm: 2, command: 1, index })">{{
                                        t('Createteam.reviewed') }}</li>
                                <li class="member_item"
                                    @click.stop="handleCommandPerm({ member: item, perm: 1, command: 1, index })">{{
                                        t('Createteam.Readonly') }}</li>
                                <li class="member_item" v-if="props.currentProject.self_perm_type === 5 && item.isTeam"
                                    @click.stop="handleCommandPerm({ member: item, perm: 0, command: 2, index })">{{
                                        t('Createteam.transferor') }}</li>
                                <li class="member_item"
                                    @click.stop="handleCommandPerm({ member: item, perm: 0, command: 3, index })">{{
                                        t('Createteam.moveoutproject') }}</li>
                            </ul>
                        </Transition>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <div class="footer">
            <div class="project_perm">
                <div v-if="props.currentProject.project.public_switch">{{ t('Createteam.pertipsA') }}</div>
                <div v-else>{{ t('Createteam.pertipsB') }}</div>
            </div>
            <div class="exitbnt" v-if="props.currentProject.self_perm_type !== 5">
                <button type="button" @click="onExitProject">{{ t('Createteam.projectexittitle') }}</button>
            </div>
        </div>
    </div>
    <ProjectDialog :projectVisible="innerVisible" :context="t('Createteam.projectexitcontext')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.ok_exit')" @clode-dialog="handleClose"
        @confirm="quitProject"></ProjectDialog>
    <ProjectDialog :projectVisible="transferVisible" :context="t('Createteam.Transfertips')"
        :title="t('Createteam.projectexittitle')" :confirm-btn="t('Createteam.confirmTransfer')" @clode-dialog="transferClose"
        @confirm="transferProject"></ProjectDialog>
</template>

<style scoped lang="scss">
:deep(.is-horizontal) {
    display: none !important;
    visibility: hidden !important;
}

.myscrollbar {
    border: 1px solid #EBEBEB;
    padding: 8px 12px;
    border-radius: 6px;
}

@keyframes move {
    from {
        transform: translate(-50%, -20%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
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

.container {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 400px;
    padding: 0 24px;
    border-radius: 16px;
    background: #FFFFFF;
    box-sizing: border-box;
    border: 1px solid #F0F0F0;
    z-index: 999;
    animation: move 0.25s ease-in-out;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;

        .title {
            font-size: 16px;
            font-weight: 600;
            color: rgba(61, 61, 61, 1);
        }

        .close {
            width: 16px;
            height: 16px;
            padding: 4px;
            border-radius: 6px;

            &:hover {
                background-color: rgb(243, 243, 245);
                cursor: pointer;
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .content_title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        gap: 18px;
        font-size: 12px;
        color: rgba(140, 140, 140, 1);

        .name_title {
            width: 282px;
        }

        .perm_title {
            width: 52px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;

            .text {
                font-size: 12px;
                color: rgba(140, 140, 140, 1);
            }

            svg {
                transition: 0.5s;
                width: 12px;
                height: 12px;
            }

            .perm_list {
                position: absolute;
                list-style-type: none;
                padding: 0px;
                margin: 0px;
                top: 88px;
                right: 6px;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                width: 80px;
                background-color: white;
                border-radius: 6px;
                box-sizing: border-box;
                z-index: 3;

                .perm_item {
                    display: flex;
                    align-items: center;
                    height: 24px;
                    padding: 6px 8px;
                    box-sizing: border-box;

                    .choose {
                        box-sizing: border-box;
                        width: 10px;
                        height: 6px;
                        margin-right: 4px;
                        margin-left: 2px;
                        border-width: 0 0 1px 1px;
                        border-style: solid;
                        transform: rotate(-45deg) translateY(-30%);
                    }

                    &:hover {
                        background-color: rgba(245, 245, 245, 1);
                    }
                }
            }
        }
    }

    .content {
        height: 300px;

        .member-item1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            gap: 8px;

            .name {
                display: flex;
                align-items: center;
                flex: 1;
                width: 282px;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                color: rgba(0, 0, 0, 1);
                white-space: nowrap;
                overflow: hidden;

                img {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                }

                span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .type {
                position: relative;
                display: flex;
                align-items: center;
                width: 52px;
                font-size: 12px;
                font-weight: 500;
                color: rgba(38, 38, 38, 1);
                gap: 4px;

                >div {
                    display: flex;
                }

                svg {
                    transition: 0.5s;
                    width: 12px;
                    height: 12px;
                }

                .member_list {
                    position: absolute;
                    list-style-type: none;
                    padding: 0px;
                    margin: 0px;
                    top: 24px;
                    right: 1px;
                    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                    width: 80px;
                    background-color: white;
                    border-radius: 6px;
                    box-sizing: border-box;

                    .member_item {
                        display: flex;
                        align-items: center;
                        height: 24px;
                        padding: 6px 8px;
                        box-sizing: border-box;

                        .choose {
                            box-sizing: border-box;
                            width: 10px;
                            height: 6px;
                            margin-right: 4px;
                            margin-left: 2px;
                            border-width: 0 0 1px 1px;
                            border-style: solid;
                            transform: rotate(-45deg) translateY(-30%);
                        }

                        &:hover {
                            background-color: rgba(245, 245, 245, 1);
                        }
                    }
                }
            }
        }
    }

    .footer {
        display: flex;
        flex-direction: column;
        align-items: center;


        .project_perm {
            height: 38px;
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: rgba(140, 140, 140, 1);
        }

        .exitbnt {
            display: flex;
            height: 52px;

            button {
                cursor: pointer;
                outline: none;
                font-size: 13px;
                width: 70px;
                height: 36px;
                color: white;
                background-color: rgba(24, 120, 245, 1);
                border: none;
                border-radius: 6px;
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(66, 154, 255, 1);
                }

                &:active {
                    background-color: rgba(10, 89, 207, 1);
                }

                &:disabled {
                    background-color: rgba(189, 226, 255, 1);
                }

            }
        }
    }
}
</style>