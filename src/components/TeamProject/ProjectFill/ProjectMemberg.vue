<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ArrowDown, Check } from '@element-plus/icons-vue';
import * as team_api from '@/apis/team';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    projectMembergDialog: boolean
    currentProject: any
}>();

const emit = defineEmits<{
    (e: 'closeDialog'): void;
    (e: 'exitProject', id: string, state: boolean): void;
    (e: 'memberLength', num: number): void;
}>();


const { t } = useI18n();
const innerVisible = ref(false)
const isshow = ref(true)
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

const close = () => {
    emit('closeDialog');
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
</script>

<template>
    <el-dialog v-model="isshow" :title="t('Createteam.membersed')" width="350px" align-center :close-on-click-modal="false"
        :before-close="close">
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
                    <div class="name">{{ item.user.nickname }}</div>
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
.perm_title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #000;
    padding-right: 10px;

    .name {
        font-size: 14px;
        font-weight: bold;
    }

    .el-dropdown-link {
        font-size: 14px;
        font-weight: bold;
        color: #000;
    }
}

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

        .name {
            width: 60%;
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