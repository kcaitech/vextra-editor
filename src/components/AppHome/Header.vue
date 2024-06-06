<script setup lang="ts">
import { onMounted, reactive, toRefs, ref, onUnmounted, computed, watch, nextTick } from 'vue'
import { User, SwitchButton, Close } from '@element-plus/icons-vue'
import Inform from './Inform.vue'
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import Loading from '../common/Loading.vue';
import Bus from '@/components/AppHome/bus';
import Border from "@/components/Document/Attribute/Border/Border.vue";
import kcdesk from '@/kcdesk';
import { locale } from '@/locale';

interface Props {
    items?: Array<object>,
    title?: string | undefined
    switch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    switch: true
})
const { t } = useI18n();
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    userName: localStorage.getItem('nickname')
});
const { circleUrl, userName } = toRefs(state);
const applynum = ref(0);
const teamnum = ref(0);
const showInForm = ref(false);
const applyList = ref<any[]>([]);
const teamApplyList = ref<any>([]);
const projectApplyList = ref<any>([]);
const notifyPApplyList = ref<any>([]);
const notifyTApplyList = ref<any>([]);
const search = ref('');
const SearchList = ref<any[]>([]);
const showSearchHistory = ref(false);
const menuUser = ref(false);
const isLoading = ref(false);
const inputRef = ref<HTMLElement>();
const totalList = ref<any[]>([])
const total = computed(() => {
    return applynum.value + teamnum.value;
})
const errorHandler = () => true;
const closeInForm = () => {
    showInForm.value = false;
}

const getApplyList = async () => {
    try {
        const { data } = await share_api.getApplyListAPI();
        if (data) {
            applyList.value = data;
            applynum.value = applyList.value.filter(item => item.apply.status === 0).length;
        }
    } catch (err) {
        console.log(err);
    }
}

const getProjectApplyList = async () => {
    try {
        const { data } = await team_api.getTeamProjectApplyAPI();
        if (data) {
            projectApplyList.value = data;
            totalList.value = [...data, ...teamApplyList.value, ...notifyPApplyList.value, ...notifyTApplyList.value];
            totalList.value.sort((a: any, b: any) => {
                const timeA = new Date(a.request.created_at).getTime();
                const timeB = new Date(b.request.created_at).getTime();
                // 返回结果以实现降序排序
                return timeB - timeA;
            });
            teamnum.value = totalList.value.filter((item: any) => item.request.status === 0).length;
        }
    } catch (err) {
        console.log(err);
    }
}

const getTeamApply = async () => {
    try {
        const { data } = await team_api.getTeamApplyAPI();
        if (data) {
            teamApplyList.value = data;
            totalList.value = [...data, ...projectApplyList.value, ...notifyPApplyList.value, ...notifyTApplyList.value];
            totalList.value.sort((a: any, b: any) => {
                const timeA = new Date(a.request.created_at).getTime();
                const timeB = new Date(b.request.created_at).getTime();
                // 返回结果以实现降序排序
                return timeB - timeA;
            });
            teamnum.value = totalList.value.filter((item: any) => item.request.status === 0).length;
            getProjectApplyList();
        }
    } catch (err) {
        console.log(err);
    }
}
const getProjectNotice = async () => {
    try {
        const { data } = await team_api.getProjectNoticeAPI();
        if (data) {
            notifyPApplyList.value = data;
            totalList.value = [...data, ...projectApplyList.value, ...teamApplyList.value, ...notifyTApplyList.value];
            totalList.value.sort((a: any, b: any) => {
                const timeA = new Date(a.request.created_at).getTime();
                const timeB = new Date(b.request.created_at).getTime();
                // 返回结果以实现降序排序
                return timeB - timeA;
            });
        }
    } catch (err) {
        console.log(err);
    }
}
const getTeamNotice = async () => {
    try {
        const { data } = await team_api.getTeamNoticeAPI();
        if (data) {
            notifyTApplyList.value = data;
            totalList.value = [...data, ...projectApplyList.value, ...notifyPApplyList.value, ...teamApplyList.value];
            totalList.value.sort((a: any, b: any) => {
                const timeA = new Date(a.request.created_at).getTime();
                const timeB = new Date(b.request.created_at).getTime();
                // 返回结果以实现降序排序
                return timeB - timeA;
            });
        }
    } catch (err) {
        console.log(err);
    }
}

watch(totalList, () => {
    teamnum.value = totalList.value.filter((item: any) => item.request.status === 0).length;
}, { deep: true })
watch(applyList, () => {
    applynum.value = applyList.value.filter(item => item.apply.status === 0).length;
}, { deep: true })

const handleClickOutside = (event: MouseEvent) => {
    const e = event.target as HTMLElement
    if (e.closest('.inform') === null && e.closest('.bell') === null) {
        showInForm.value = false;
    }
    if (e.closest('.avatar-area') === null && e.closest('.userinfo') === null) {
        menuUser.value = false;
    }
}

function closeclick() {
    nextTick(() => {
        search.value = ''
        inputRef.value!.blur()
        showSearchHistory.value = false
    })

}

let timer1: any
watch(search, () => {
    clearTimeout(timer1)
    timer1 = setTimeout(() => {
        Bus.emit('searchvalue', search.value)
        clearTimeout(timer1)
    }, 200);
})

const screenout = async () => {
    if (!search.value) return
    isLoading.value = true
    SearchList.value = []
    await new Promise((resolve) => setTimeout(resolve, 200));
    isLoading.value = false;
}

function userinfo() {
    router.push({ path: '/pcenter' })
}

function loginout() {
    localStorage.clear()
    kcdesk?.setLogined(false);
    router.push({ path: '/login' })
}

const reviewed = () => {
    getApplyList();
    getTeamApply();
    getProjectApplyList();
}

let timer: any = null
getApplyList();
getTeamApply();
getProjectNotice();
getTeamNotice();
getProjectApplyList();
onMounted(() => {
    timer = setInterval(() => {
        getApplyList();
        getTeamApply();
        getProjectNotice();
        getTeamNotice();
        getProjectApplyList();
    }, 60000)
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    clearInterval(timer)

})


const bell = ref<HTMLElement>()
const avatar = ref<HTMLElement>()
const rect_y = ref<number>()
const rect_x = ref<number>()
const showinform = (el: HTMLElement, w: number) => {
    showInForm.value = !showInForm.value
    if (showInForm.value) {
        const { y, x } = getElXY(el, w)
        rect_y.value = y
        rect_x.value = x
    }
}

const showuserinfo = (el: HTMLElement, w: number) => {
    menuUser.value = !menuUser.value
    if (menuUser.value) {
        const { y, x } = getElXY(el, w)
        rect_y.value = y
        rect_x.value = x
    }
}

const getElXY = (el: HTMLElement, elwidth: number = 0) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const rect = el.getBoundingClientRect()
    const y = rect?.bottom + 8
    const x = rect?.x + elwidth > viewportWidth ? (viewportWidth - elwidth - 20) : rect?.x
    return { y, x }
}

</script>

<template>
    <div class="header">
        <div v-if="props.switch" class="search">
            <el-input ref="inputRef" v-model="search" size="large" :placeholder="search ? `正在搜索
                ${search}` : `${t('system.placeholder')}`" @focus="showSearchHistory = true" @input="screenout"
                @blur="showSearchHistory = false">
                <template #prefix>
                    <el-icon v-if="isLoading" class="is-loading" size="18">
                        <Loading :size="18" :color="'#1878F5'" />
                    </el-icon>
                    <el-icon v-else size="18">
                        <svg-icon icon-class="search-icon"
                            :color="showSearchHistory ? '#1878F5' : '#333333'"></svg-icon>
                    </el-icon>
                </template>

                <template #suffix>
                    <el-icon v-if="search !== ''" class="close" @click.stop="closeclick" size="18">
                        <Close />
                    </el-icon>


                </template>
            </el-input>
        </div>
        <div class="content">
            <div v-if="props.switch" class="bell">
                <div ref="bell" class="notice" :class="{ 'menu-select': showInForm, 'menu-hover': !showInForm }"
                    @click="showinform(bell!, 320)">
                    <svg-icon :icon-class="showInForm ? 'bell-select' : 'bell'"></svg-icon>
                    <div class="num after" v-if="total > 0" :class="{ after: total > 99 }">{{ total > 99 ? 99 : total }}
                    </div>
                </div>
            </div>
            <div ref="avatar" class="avatar-area" @click="showuserinfo(avatar!, 120)">
                <img v-if="circleUrl" :src="circleUrl" alt="Avatar">
                <div v-else>{{ userName?.slice(0, 1) }}</div>
            </div>
        </div>
        <Inform class="inform" @close="closeInForm" v-if="showInForm" :applyList="applyList" :teamApplyList="totalList"
            @reviewed="reviewed" :y="rect_y" :x="rect_x"></Inform>
        <Teleport to="body">
            <div v-if="menuUser" class="userinfo" :style="{ top: rect_y + 'px', left: rect_x + 'px' }" :lang="locale">
                <div @click="router.push({path:'/introduction'})">
                    <svg-icon icon-class="Internet"></svg-icon>
                    <span>{{ t('system.internet') }}</span>
                </div>
                <div @click="userinfo">
                    <svg-icon icon-class="user"></svg-icon>
                    <span>{{ t('system.personal_center') }}</span>
                </div>
                <div @click="loginout">
                    <svg-icon icon-class="exit"></svg-icon>
                    <span>{{ t('system.login_out') }}</span>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style lang="scss" scoped>
.menu-select {
    background-color: rgba(24, 120, 245, 0.1);
    color: #1878F5 !important;
}

.menu-hover:hover {
    background-color: rgba(243, 243, 245, 1);
}

.el-icon {
    padding: 2px;
    color: #333333;
}

:deep(.el-input__wrapper) {
    padding: 1px 15px 1px 32px;
    background-color: transparent;
    border-radius: 8px !important;

    &:hover {
        background-color: rgba(255, 255, 255, 1) !important;
    }

    &:focus {
        background-color: rgba(255, 255, 255, 1) !important;
    }
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;

    .search {
        width: 42%;
        min-width: 300px;
        max-width: 668px;
        position: relative;

        .el-input {
            font-size: 12px;
            --el-input-height: 32px;
            --el-input-border-color: rgb(250, 250, 250);
            --el-input-hover-border-color: #F0F0F0;
            --el-input-focus-border-color: #1878F5;

            &:focus {
                background-color: white !important;
            }

            .close:hover {
                cursor: pointer;
                border-radius: 4px;
                background-color: rgba(243, 243, 245, 1);
            }
        }

    }

    .content {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        gap: 20px;

        .notice {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;

            svg {
                width: 20px;
                height: 20px;
            }

            >.num {
                position: absolute;
                font-size: 10px;
                top: 0px;
                left: 16px;
                min-width: 14px;
                min-height: 14px;
                background-color: red;
                color: #fff;
                border-radius: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .after::after {
                content: '+';
                position: absolute;
                display: block;
                top: -4px;
                left: 16px;
                color: #fff;
            }
        }

        .avatar-area {
            display: flex;
            cursor: pointer;
            width: 32px;
            height: 32px;
            background-color: var(--active-color);
            border-radius: 50%;
            overflow: hidden;

            >img {
                width: 100%;
                height: 100%;
                object-fit: cover;

            }

            >div {
                width: 100%;
                height: 100%;
                text-align: center;
                line-height: 32px;
                color: var(--theme-color-anti);
                font-weight: 700;
            }
        }
    }
}

.userinfo {
    background-color: white;
    position: relative;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    z-index: 9;
    padding: 8px 0;
    font-size: 13px;
    width: 120px;
    overflow: visible;

    div {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: auto;
        grid-template-areas: "icon text text";
        padding: 8px 12px;
        align-items: center;
        justify-content: space-evenly;
        height: 40px;
        box-sizing: border-box;

        &:hover {
            background-color: #1878F5;

            span {
                color: #fff;
            }

            svg {
                fill: currentColor;
                color: #fff;
            }
        }

        svg {
            fill: currentColor;
            color: #262626;
            grid-area: icon;
            width: 16px;
            height: 16px;
        }

        span {
            color: #262626;
            grid-area: text;
            text-wrap: nowrap;
        }
    }

    &::before {
        content: "";
        position: absolute;
        clear: both;
        top: -7px;
        right: 9px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 7px solid #ffffff;
        filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.12));

    }

    :lang(en) {
        font-size: 11px;
    }
}
</style>