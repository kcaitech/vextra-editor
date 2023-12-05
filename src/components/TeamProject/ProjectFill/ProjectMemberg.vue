<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { ArrowDown, Check } from '@element-plus/icons-vue';
import * as team_api from '@/request/team';
import { useI18n } from 'vue-i18n';
import CloseIcon from '@/components/common/CloseIcon.vue';

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

const changemargin = () => {
    nextTick(() => {
        let el = document.querySelectorAll('.el-dialog__header')
        for (let i = 0; i < el.length; i++) {
            (el[i] as HTMLElement).style.marginRight = '0px'
        }
    })
}

const showpermlist = ref<boolean>(false)

</script>

<template>
    <div class="container" v-if="isshow">
        <div class="header">
            <div class="title">{{ t('Createteam.membersed') }}</div>
            <div class="close" @click.stop="emit('closeDialog')">
                <svg-icon icon-class="close"></svg-icon>
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
        <div class="content">
            <div class="member-item1" v-for="(item, index) in memberList" :key="index">
                <div class="name">
                    <img :src="item.user.avatar" alt="user_avatar" />
                    <span>{{ item.user.nickname }}</span>
                </div>
                <div class="type">
                    <span>{{ permission[item.perm_type] }}</span>
                </div>
            </div>
        </div>
        <div class="footer"></div>
    </div>
    <el-dialog v-model="isshow" width="350px" align-center :close-on-click-modal="false" :show-close="false"
        @open="changemargin" @close="emit('closeDialog')">
        <template #header>
            <div class="my-header">
                <div class="title">{{ t('Createteam.membersed') }}</div>
                <CloseIcon :size="20" @close="emit('closeDialog')" />
            </div>
        </template>
        <div class="perm_title">
            <div class="name">{{ t('Createteam.username') }}</div>
            <el-dropdown trigger="click" :hide-on-click="false" @command="handleCommand">
                <span class="el-dropdown-link">
                    {{ t('Createteam.jurisdiction') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="(item, index) in permList" :key="item" :command="index">
                            <div style="padding: 0 16px;">
                                <el-icon>
                                    <Check v-if="permFilter === index" />
                                </el-icon>
                                {{ item }}
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div class="body">
            <el-scrollbar height="250px">
                <div class="member-item" v-for="(item, index) in memberList" :key="index">
                    <div class="name">
                        <img :src="item.user.avatar" alt="icon">
                        <span>{{ item.user.nickname }}</span>
                    </div>
                    <el-dropdown trigger="click" @command="handleCommandPerm"
                        :disabled="item.perm_type === 5 || (item.perm_type === 4 && props.currentProject.self_perm_type !== 5)">
                        <span class="el-dropdown-link">
                            {{ permission[item.perm_type] }}<el-icon class="el-icon--right"><arrow-down
                                    v-if="(props.currentProject.self_perm_type === 5 && item.perm_type !== 5) || (props.currentProject.self_perm_type === 4 && (item.perm_type !== 4 && item.perm_type !== 5))" /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item :command="{ member: item, perm: 4, command: 1, index }"
                                    v-if="props.currentProject.self_perm_type === 5 && item.perm_type != 4">
                                    <div style="padding: 0 16px;">{{ t('Createteam.manager') }}</div>
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ member: item, perm: 3, command: 1, index }">
                                    <div style="padding: 0 16px;">{{ t('Createteam.editable') }}</div>
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ member: item, perm: 2, command: 1, index }">
                                    <div style="padding: 0 16px;">{{ t('Createteam.reviewed') }}</div>
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ member: item, perm: 1, command: 1, index }">
                                    <div style="padding: 0 16px;">{{ t('Createteam.Readonly') }}</div>
                                </el-dropdown-item>
                                <div style="width: 120px; height: 1px; background-color: #ccc; margin: 5px 0;"></div>
                                <el-dropdown-item :command="{ member: item, perm: 0, command: 2, index }"
                                    v-if="props.currentProject.self_perm_type === 5 && item.isTeam">
                                    <div style="padding: 0 16px;">{{ t('Createteam.transferor') }}</div>
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ member: item, perm: 0, command: 3, index }">
                                    <div style="padding: 0 16px;">{{ t('Createteam.moveoutproject') }}</div>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-scrollbar>
        </div>
        <div class="project_perm">
            <div v-if="props.currentProject.project.public_switch">{{ t('Createteam.pertipsA') }}</div>
            <div v-else>{{ t('Createteam.pertipsB') }}</div>
        </div>
        <div v-if="props.currentProject.self_perm_type !== 5">
            <div class="button"><button @click="onExitProject">{{ t('Createteam.projectexittitle') }}</button></div>
        </div>
        <el-dialog v-model="innerVisible" width="250px" :title="t('Createteam.projectexittitle')" append-to-body
            align-center :close-on-click-modal="false" :before-close="handleClose">
            <div class="context">
                {{ t('Createteam.projectexitcontext') }}
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button class="quit" @click="quitProject">{{ t('Createteam.ok_exit') }}</el-button>
                    <el-button class="quit" @click="innerVisible = false">
                        {{ t('Createteam.cancel') }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-dialog v-model="transferVisible" width="250px" :title="t('Createteam.projectexittitle')" append-to-body
            align-center :close-on-click-modal="false" :before-close="transferClose">
            <div class="context">
                {{ t('Createteam.Transfertips') }}
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button class="quit" @click="transferProject">{{ t('Createteam.confirmTransfer') }}</el-button>
                    <el-button class="quit" @click="transferVisible = false">
                        {{ t('Createteam.cancel') }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<style scoped lang="scss">
.container {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -25%);
    width: 400px;
    padding: 0 24px;
    border-radius: 16px;
    background: #FFFFFF;
    box-sizing: border-box;
    border: 1px solid #F0F0F0;
    z-index: 9999;

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
        height: 240px;

        .member-item1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            gap: 18px;

            .name {
                display: flex;
                align-items: center;
                width: 282px;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                color: rgba(0, 0, 0, 1);

                img {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                }
            }

            .type {
                display: flex;
                align-items: center;
                width: 52px;
                font-size: 12px;
                font-weight: 500;
                color: rgba(38, 38, 38, 1);
            }
        }
    }

    .footer {
        height: 38px;
    }
}

.my-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        color: #3D3D3D;
        font-weight: 600;
    }
}

// .perm_title {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     color: #3D3D3D;
//     padding-right: 10px;

//     .name {
//         font-size: 14px;
//         font-weight: bold;
//     }

//     .el-dropdown-link {
//         font-size: 14px;
//         font-weight: bold;
//         color: #3D3D3D;
//     }
// }

.body {
    margin-top: 10px;
    font-size: 14px;

    .member-item {
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 10px;
        height: 25px;
        margin-bottom: 6px;

        .name {
            width: 60%;
            display: flex;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
}

.project_perm {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.button {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    button {
        width: 85px;
        height: 35px;
        font-size: 12px;
        border: none;
        background-color: var(--active-color-beta);
        color: #fff;
        border: 1px solid var(--active-color-beta);
        border-radius: 4px;
        outline: none;
    }
}

.button2 {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    button {
        width: 70px;
        height: 30px;
        font-size: 12px;
        border: none;
        background-color: var(--active-color-beta);
        color: #fff;
        border: 1px solid var(--active-color-beta);
        border-radius: 4px;
        outline: none;
    }
}

:deep(.el-dropdown-menu__item:not(.is-disabled):focus) {
    background-color: #f3f0ff;
}

:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}

.dialog-footer {
    .quit {
        background-color: #9775fa;
        color: #fff;
    }
}

:deep(.el-dropdown-menu__item) {
    padding: 5px 0;
}

:deep(.el-dropdown.is-disabled) {
    cursor: pointer;
    color: #000;
}
</style>