
<template>
    <div class="team">
        <div class="left">
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
        <div class="right">
            <button type="button" v-if="itemid === 0 && teamSelfPermType > 0" @click.stop="showoverlay = true">
                <svg-icon icon-class="addfile-icon"></svg-icon>
                {{ t('teampage.addproject') }}
            </button>
            <button type="button" v-if="itemid === 1" @click.stop="showoverlay = true">
                <svg-icon icon-class="member-icon" style="padding: 0;"></svg-icon>
                {{ t('teampage.addmember') }}
            </button>
        </div>
    </div>
    <div class="team-header" :style="{ marginBottom: itemid === 2 ? '0px' : '' }">
        <ul class="menu">
            <li class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px', height: 2 + 'px' }"></li>
            <li class="item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items" :key="index"
                @click.stop="clickEvent(index, $event)">
                {{ item }}
            </li>
        </ul>
        <div class="addandsearch">
            <el-input v-if="itemid != 2" ref="inputRef" size="large" v-model="search" @focus="focusinput = true"
                @blur="focusinput = false"
                :placeholder="itemid === 0 ? t('teampage.search_default_tipsA') : t('teampage.search_default_tipsB')">
                <template #prefix>
                    <el-icon size="18">
                        <svg-icon icon-class="search-icon" :color="focusinput ? '#1878F5' : ''"></svg-icon>
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
    <div v-if="showoverlay" class="overlay">
        <addProject v-if="itemid === 0" class="inner" :teamid="teamID" @close="showoverlay = false" />
        <InviteMember v-if="itemid === 1" class="inner" :teamid="teamID" @close="showoverlay = false" />
    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject, ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import ProjectList from '@/components/TeamProject/ProjectList.vue'
import addProject from './addProject.vue'
import TeamMember from './TeamMember.vue'
import InviteMember from './InviteMember.vue'
import TeamSetting from './TeamSetting.vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showoverlay = ref(false)
const itemid = ref(0)
const items = [t('teampage.project'), t('teampage.members'), t('teampage.team_set')]
const img = ref(false)
const search = ref<string>('')
const route = useRoute()
const elwidth = ref()
const elleft = ref()
const focusinput = ref<boolean>(false)


interface data {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const { teamData, teamID, teamName, teamAvatar, teamDescription, teamSelfPermType } = inject('shareData') as {
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
    teamSelfPermType: Ref<number>;
}

const avatar = computed(() => {
    return teamAvatar.value != '' ? teamAvatar.value : teamName.value.slice(0, 1)
})

const clickEvent = (index: number, e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
    itemid.value = index
    sessionStorage.setItem('activateitem', index.toString())
}

const isIdInList = (id: any, list: Array<data>) => {
    return list.find(item => item.team.id === id) !== undefined;
}

watch(teamData, (newvalue) => {
    const a = isIdInList(route.params.id, newvalue)
    if (a) {
        return
    } else {
        router.push({ path: '/files' })
        sessionStorage.setItem('index', '1');
    }
})

watch(teamName, (newvalue) => {
    window.document.title = newvalue + ' - ' + t('product.name')
})

onMounted(() => {
    const x = sessionStorage.getItem('activateitem')
    if (x) {
        itemid.value = parseInt(x)
    }
    const items = document.querySelectorAll('.item')
    const rect = items[itemid.value].getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x

    window.document.title = teamName.value + ' - ' + t('product.name')
})

onUnmounted(() => {
    sessionStorage.setItem('activateitem', '0')
})
</script>
<style lang="scss" scoped>
:deep(.el-input__wrapper) {
    border-radius: 8px;
}

.overlay {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.activate {
    color: black;
    // border-bottom: 2px solid #9775fa;
}

.team-header {
    height: 40px;
    display: flex;
    gap: 16px;
    margin: 0px 8px 16px 8px;
    justify-content: space-between;
    align-items: center;
    box-shadow: inset 0px -1px 0px 0px #F0F0F0;

    .menu {
        display: flex;
        align-items: flex-end;
        list-style: none;
        line-height: 40px;
        padding: 0;
        margin: 0;
        gap: 24px;
        color: #666;

        .indicator {
            position: absolute;
            height: 2px;
            background-color: rgba(12, 111, 240, 1);
            border-radius: 2px;
            transition: all 0.2s ease-in-out;
        }

        .item {
            white-space: nowrap;
            font-size: 13px;
            font-weight: 500;
        }
    }

    .addandsearch {
        display: flex;
        align-items: center;

        .el-input {
            width: 178px;
            height: 34px;
            font-size: 12px;
            --el-input-border-color: rgba(240, 240, 240, 1);
            --el-input-hover-border-color: rgba(240, 240, 240, 1);
            --el-input-focus-border-color: rgba(12, 111, 240, 1);

            .close:hover {
                border-radius: 2px;
                background-color: #F7F7F9;
            }

            .el-icon {
                padding: 2px;
                color: rgba(51, 51, 51, 1);
            }
        }
    }
}

.team {
    display: flex;
    gap: 24px;
    height: 108px;
    margin: 0 8px 0 8px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;

    .left {
        display: flex;
        align-items: center;
        gap: 24px;

        .team-avatar {
            width: 60px;
            height: 60px;
            min-width: 60px;
            text-align: center;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(24, 120, 245, 1);

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
                    font-size: 18px;
                    font-weight: 600;
                    color: rgb(255, 255, 255);
                }
            }

        }

        .team-info {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .team-name {
                font-size: 18px;
                font-weight: 700;
                white-space: nowrap;
            }

            .team-description {
                font-size: 12px;
                font-weight: 400;
                white-space: nowrap;
                color: #808080;
            }
        }
    }

    .right {
        display: flex;
        align-items: center;
        justify-content: center;

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 108px;
            height: 36px;
            border: 1px solid rgba(24, 120, 245, 1);
            border-radius: 6px;
            background-color: rgba(24, 120, 245, 1);
            box-sizing: border-box;
            transition: all 0.5s ease-out;
            color: white;

            &:hover {
                background-color: rgba(51, 140, 255, 1);
            }

            &:active {
                background-color: rgba(12, 111, 240, 1);
            }

            svg {
                width: 16px;
                height: 16px;
                box-sizing: border-box;
            }
        }
    }
}
</style>
