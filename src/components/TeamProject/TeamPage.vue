<template>
    <div class="team">
        <div class="team-avatar">
            <div v-if="avatar.length > 4" class="img">
                <img :src="avatar" alt="team avatar">
            </div>
            <div v-else class="text">
                <span>{{ avatar }}</span>
            </div>
        </div>
        <div class="team-info">
            <div class="team-name">{{ teamName }}</div>
            <div class="team-description">{{ teamDescription }}</div>
        </div>
    </div>
    <div class="team-header">
        <ul class="menu">
            <li class="item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items" :key="index"
                @click.stop="clickEvent(index)">
                {{ item }}
            </li>
        </ul>
        <div class="addandsearch">
            <button type="button" v-if="itemid === 0" @click.stop="showoverlay = true">新建项目</button>
            <button type="button" v-if="itemid === 1" @click.stop="showoverlay = true">邀请成员</button>
            <el-input v-if="itemid != 2" ref="inputRef" size="large" v-model="search"
                :placeholder="itemid === 0 ? '搜索项目/创建者' : '搜索成员'">
                <template #prefix>
                    <el-icon size="18">
                        <Search />
                    </el-icon>
                </template>
                <template #suffix>
                    <el-icon v-if="search != ''" class="close" size="18" @click.stop="search = ''">
                        <Close />
                    </el-icon>
                </template>
            </el-input>
        </div>
    </div>
    <ProjectList v-if="itemid === 0" :searchvalue="search" @addproject="showoverlay = true" />
    <TeamMember v-if="itemid === 1" :searchvalue="search" />
    <TeamSetting v-if="itemid === 2" />
    <transition name="nested" :duration="550">
        <div v-if="showoverlay" class="overlay">
            <addProject v-if="itemid === 0" class="inner" :teamid="teamID" @close="showoverlay = false" />
            <InviteMember v-if="itemid === 1" class="inner" :teamid="teamID" @close="showoverlay = false" />
        </div>
    </transition>
    <div class="test">

    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Close } from '@element-plus/icons-vue'
import ProjectList from '@/components/TeamProject/ProjectList.vue'
import addProject from './addProject.vue'
import TeamMember from './TeamMember.vue'
import InviteMember from './InviteMember.vue'
import TeamSetting from './TeamSetting.vue'
import { router } from '@/router'
import * as user_api from '@/apis/users'

const showoverlay = ref(false)
const itemid = ref(0)
const items = ['项目', '成员', '团队设置']
const img = ref(false)
const search = ref<string>('')
const route = useRoute()


interface data {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const { teamData, teamID, teamName, teamAvatar, teamDescription } = inject('shareData') as {
    teamData: Ref<[{
        team: {
            id: string,
            name: string,
            avatar: string,
            description: string
        }
    }]>;
    teamID: Ref<string>;
    teamName: Ref<string>;
    teamAvatar: Ref<string>;
    teamDescription: Ref<string>;
}

const avatar = computed(() => {
    return teamAvatar.value != '' ? teamAvatar.value : teamName.value.slice(0, 1)
})

const clickEvent = (index: number) => {
    itemid.value = index
    sessionStorage.setItem('activateitem', index.toString())
}

const isIdInList = (id: any, list: Array<data>) => {
    return list.find(item => item.team.id === id) !== undefined;
}

const Getjoinlist = async () => {
    try {
        const { code } = await user_api.Getjoinlist({team_id:'',start_time:''})
    } catch (error) {

    }
}

watch(teamData, (newvalue) => {
    const a = isIdInList(route.params.id, newvalue)
    if (a) {
        console.log('在');
    } else {
        router.push({ path: '/apphome' })
    }
})

onMounted(() => {
    const x = sessionStorage.getItem('activateitem')
    if (x) {
        itemid.value = parseInt(x)
    }
})
</script>
<style lang="scss" scoped>
.test {
    position: absolute;
    height: 320px;
    width: 480px;
    left: 50%;
    top: 400px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0px 0px 3px #5b5b5b;
}

.nested-enter-active,
.nested-leave-active {
    transition: all 0.3s ease-in-out;
}

.nested-leave-active {
    transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
    transform: translateY(400px);
    opacity: 0;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
    transition: all 0.3s ease-in-out;
}

.nested-enter-active .inner {
    transition-delay: 0.25s;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.001;
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

.activate {
    color: black;
    border-bottom: 2px solid #9775fa;
}

.team-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 32px 24px 8px 24px;
    padding: 12px;
    border-bottom: 1px solid #c4c4c4cf;

    .menu {
        cursor: pointer;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;

        color: #666;

        .item {
            margin-right: 32px;
            font-size: 18px;
            font-weight: 600;
            padding-bottom: 6px;
        }
    }

    .addandsearch {
        display: flex;

        button {
            cursor: pointer;
            border: none;
            width: 120px;
            height: 40px;
            border-radius: 4px;
            background-color: #9775fa;
            box-sizing: border-box;
            margin-right: 12px;
            transition: all 0.5s ease-out;
            color: white;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }
        }

        .el-input {
            width: 280px;
            height: 40px;
            font-size: 12px;
            --el-input-border-color: #f3f0ff;
            --el-input-hover-border-color: #e5dbff;
            --el-input-focus-border-color: #9775fa;

            .close:hover {
                border-radius: 2px;
                cursor: pointer;
                background-color: #f3f0ff;
            }

            .el-icon {
                padding: 2px;
                color: #9775fa;
            }
        }
    }
}

.team {
    display: flex;
    margin: 16px 24px;
    align-items: center;

    .team-avatar {
        width: 64px;
        height: 64px;
        min-width: 64px;
        background-color: #9775fa;
        text-align: center;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        .img {
            width: 100%;
            height: 100%;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;

            }
        }

        .text {
            line-height: 0;

            span {
                width: 100%;
                height: 100%;
                font-size: 24px;
                font-weight: 600;
                color: white;
            }
        }

    }

    .team-info {
        display: flex;
        flex-direction: column;
        margin: 0 12px;

        .team-name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .team-description {
            font-size: 14px;
            color: #3D3D3D;
        }
    }
}
</style>
