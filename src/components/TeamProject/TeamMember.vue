<template>
    <div class="container">
        <div class="hearder-container">
            <div class="title" v-for="(item, index) in  titles " :key="index">
                <div>{{ item }}
                    <div v-if="index === 1" class="shrink" @click="fold = !fold">
                        <svg-icon icon-class="down"
                            :style="{ transform: fold ? 'rotate(-180deg)' : 'rotate(0deg)' }"></svg-icon>
                    </div>
                    <transition name="el-zoom-in-top">
                        <ul class="filterlist" v-if="index === 1 && fold" ref="menu">
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
        <div class="main" v-if="!noNetwork">
            <div class="member-item"
                v-for=" { user: { nickname, id }, perm_type }  in  searchvalue === '' ? ListData : SearchList " :key="id">
                <div class="member-name">{{ nickname }}</div>
                <div class="member-jurisdiction">{{ membertype(perm_type) }}</div>
            </div>
        </div>
        <NetworkError v-else></NetworkError>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, Ref, watch, computed } from 'vue';
import NetworkError from '@/components/NetworkError.vue'
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

interface Props {
    searchvalue?: string
}

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})
const { t } = useI18n()
const titles = ['姓名', '团队权限']
const filteritems = ['仅阅读', '可编辑', '管理员', '创建者', '全部']
const noNetwork = ref(false)
const teammemberdata = ref<any[]>([])
const fold = ref(false)
const fontName = ref(4)
const menu = ref<HTMLElement>()

const { teamID } = inject('shareData') as {
    teamID: Ref<string>;
}

const GetteamMember = async () => {
    try {
        if (teamID.value) {
            const { code, data, message } = await user_api.GetteamMember({ team_id: teamID.value })
            if (code === 0) {
                teammemberdata.value = data
                ElMessage.success('成功获取团队成员列表')
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
            return '只读'
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
}

watch(teamID, () => {
    GetteamMember()
})

onMounted(() => {
    GetteamMember()

})

onUnmounted(() => {

})
</script>
<style lang="scss" scoped>
.container {
    margin: 0 32px;

    .hearder-container {
        display: flex;

        .title {
            width: 200px;
            font-weight: 600;
            display: flex;
            align-items: center;

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
            }

            .filterlist {
                position: fixed;
                list-style-type: none;
                font-size: 14px;
                font-weight: 500;
                min-width: 88px;
                margin: 0;
                padding: 0 8px;
                margin-top: 8px;
                border-radius: 4px;
                background-color: white;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

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

    .member-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 40px;
        border-radius: 4px;
        margin: 6px 0;

        .member-name,
        .member-jurisdiction {
            width: 200px;
        }
    }
}
</style>
