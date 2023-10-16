<script setup lang="ts">
import { onMounted, reactive, toRefs, ref, onUnmounted, computed, watch } from 'vue'
import { Search, User, SwitchButton, Close, Bell } from '@element-plus/icons-vue'
import Inform from './Inform.vue'
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import avatar from '@/assets/pd-logo-svg.svg';
import Loading from '../common/Loading.vue';
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
const historyList = ref<any[]>([]);
const menuAbout = ref(false);
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
    if (e.closest('.el-input') === null && e.closest('.searchhistory') === null) {
        closeclick();
    }
    if (e.closest('.menu') === null) {
        menuAbout.value = false;
    }
    if (e.closest('.inform') === null && e.closest('.bell') === null) {
        showInForm.value = false;
    }
    if (e.closest('.avatar-area') === null) {
        menuUser.value = false;
    }
}

function closeclick() {
    search.value = ''
    inputRef.value?.blur()
    showSearchHistory.value = false
}

let timer2: any
const screenout = async () => {
    clearTimeout(timer2)
    if (!search.value) return
    isLoading.value = true
    SearchList.value = []
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (props.items)
        SearchList.value = props.items.filter((el: any) => el.document.name.toLowerCase().includes(search.value.toLowerCase()))
    isLoading.value = false;
}

function userinfo() {
    localStorage.setItem('location', location.href)
    router.push({ path: '/pcenter' })
}

function loginout() {
    localStorage.clear()
    router.push({ path: '/login' })
}

const reviewed = () => {
    getApplyList();
    getTeamApply();
    getProjectApplyList();
}

const toDocument = (row: any, column: any) => {
    if (row.document.deleted_at != null) return
    if (column.label === t('home.file_name')) {
        const x = { keyword: search.value }
        const maxLength = 15
        historyList.value = historyList.value.filter(item => item.keyword !== x.keyword)
        if (historyList.value.length >= maxLength) {
            historyList.value.pop()
        }
        historyList.value.unshift(x);
        localStorage.setItem('searchlist', JSON.stringify(historyList.value));
        const docId = row.document.id
        const Name = 'document'
        const query = { id: docId }
        const url = router.resolve({ name: Name, query: query }).href
        window.open(url, '_blank')

    }
}

const prpotitle = computed(() => {
    return props.title === t('home.delete_file_time')
        ? "document.deleted_at"
        : "document_access_record.last_access_time"
})

const clearSearchlist = () => {
    localStorage.removeItem('searchlist')
    historyList.value = []
    inputRef.value!.focus()
}

const itemClick = (e: MouseEvent) => {
    search.value = (e.target as HTMLElement).textContent!
    screenout()
    inputRef.value!.focus()
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
    document.addEventListener('mousedown', handleClickOutside)
    const searchList = localStorage.getItem('searchlist')
    historyList.value = searchList != null ? JSON.parse(searchList) : []
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    clearInterval(timer)

})


const mouseenter = (_: any, column: any, cell: any) => {
    if (column.label === t('home.file_name')) {
        cell.style.color = '#b197fc'
        cell.style.cursor = 'pointer'
    }
}

const mouseleave = (_: any, column: any, cell: any) => {
    if (column.label === t('home.file_name')) {
        cell.style.color = ''
    }

}

const textHighLight = (text: string) => {
    const regex = new RegExp(search.value, "ig");
    return text.replace(regex, `<span class="highlight">${search.value}</span>`)
}


</script>
<template>
    <div class="header">
        <div class="logo">
            <img class="logo-image" :src="avatar" alt="ProtoDesign" />
            <div class="logo-text">ProtoDesign</div>
        </div>
        <div v-if="props.switch" class="search">
            <el-input ref="inputRef" v-model="search" size="large" :placeholder="`${t('system.placeholder')}`"
                @focus="showSearchHistory = true" @input="screenout">
                <template #prefix>
                    <el-icon v-if="isLoading" class="is-loading" size="18">
                        <Loading :size="18"/>
                    </el-icon>
                    <el-icon v-else size="18">
                        <Search />
                    </el-icon>
                </template>
                <template #suffix>
                    <el-icon v-if="search != ''" class="close" @click.stop="closeclick" size="18">
                        <Close />
                    </el-icon>
                </template>
            </el-input>
            <transition name="el-zoom-in-top">
                <div v-if="showSearchHistory" class="searchhistory" @click="inputRef?.focus()">
                    <div class="tabledata" v-if="search != ''">
                        <el-table :data="SearchList" max-height="600" @row-click="toDocument" @cell-mouse-enter="mouseenter"
                            @cell-mouse-leave="mouseleave">
                            <el-table-column :label="t('home.file_name')" header-align="left" align="left" :min-width="150"
                                show-overflow-tooltip>
                                <template #default="{ row: { document: { name } } }">
                                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        <span v-html="`${textHighLight(name)}`"></span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :prop=prpotitle :label=props.title header-align="center" align="center"
                                show-overflow-tooltip />
                            <template #empty>
                                <el-skeleton v-if="isLoading" style="width: 100%" :count="6" animated>
                                    <template #template>
                                        <div style="display: flex; align-items: center;justify-items: space-between;">
                                            <el-skeleton-item variant="text"
                                                style="margin:0px 16px 8px 10px;height: 39px;" />
                                            <el-skeleton-item variant="text"
                                                style="width: 50% ;height: 39px;margin:0px 16px 8px 10px;" />
                                        </div>
                                    </template>
                                </el-skeleton>
                                <span v-else class="results">{{ t('search.search_results') }}</span>
                            </template>

                        </el-table>
                    </div>
                    <div class="historyList" v-else-if="historyList.length != 0">
                        <div class="listTitle">
                            <div class="text">{{ t('search.search_history_title') }}</div>
                            <a href="" @click.stop.prevent="clearSearchlist">{{ t('search.search_history_clear') }}</a>

                        </div>
                        <ul class="historyListItem">
                            <li class="listItem" v-for="item in historyList" :key="item.keyword" @click.stop="itemClick">
                                <span>{{ item.keyword }}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="nullcontent" v-else style="line-height: 300px; font-size: 12px;">
                        {{ t('search.search_history') }}
                    </div>
                </div>
            </transition>
        </div>
        <div class="content">
            <div v-if="props.switch" class="bell">
                <div class="notice" :class="{ 'menu-select': showInForm, 'menu-hover': !showInForm }"
                    @click="showInForm = !showInForm">
                    <el-icon size="24">
                        <Bell />
                    </el-icon>
                    <div class="num" v-if="total > 0" :class="{ after: total > 99 }"
                        :style="{ paddingRight: total > 99 ? 9 + 'px' : 4 + 'px' }">{{ total > 99 ? 99 : total }}</div>
                </div>
            </div>
            <div class="menu" :class="{ 'menu-select': menuAbout, 'menu-hover': !menuAbout }"
                @click="menuAbout = !menuAbout">
                <el-icon size="24">
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke-width="1.5">
                        <g id="group-0" stroke="currentColor" fill="currentColor">
                            <path d="M2.5 3H13.5M2.5 8H13.5M2.5 13H13.5" stroke-linecap="round" stroke-linejoin="miter"
                                fill="none" vector-effect="non-scaling-stroke"></path>
                        </g>
                    </svg>
                </el-icon>
                <div v-if="menuAbout" class="about-items">
                    <div class="item">{{ t('system.help_manual') }}</div>
                    <div class="item">{{ t('system.about_software') }}</div>
                </div>
            </div>
            <div class="avatar-area" @click="menuUser = !menuUser">
                <el-avatar v-if="circleUrl" :src="circleUrl" @error="errorHandler" fit="cover" :size="30">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
                <el-avatar v-else fit="cover" :size="30"> {{ userName?.slice(0, 1) }} </el-avatar>
                <div v-if="menuUser" class="userinfo">
                    <div @click="userinfo"><el-icon size="20">
                            <User />
                        </el-icon>{{ t('system.personal_center') }}</div>
                    <div @click="loginout"><el-icon size="20">
                            <SwitchButton />
                        </el-icon>{{ t('system.login_out') }}</div>
                </div>
            </div>
        </div>
        <Inform class="inform" @close="closeInForm" v-if="showInForm" :applyList="applyList" :teamApplyList="totalList"
            @reviewed="reviewed"></Inform>
    </div>
</template>
<style lang="scss" scoped>
:deep(.el-table__empty-text) {
    line-height: 0;
    width: 100%;
}

:deep(.highlight) {
    background-color: #e5dbff !important;
}

.menu-select {
    background-color: #e5dbff;
}

.menu-hover:hover {
    background-color: #f3f0ff;
}

.results {
    line-height: 300px;
}

.el-icon {
    padding: 2px;
    color: #9775fa;
}



.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 40px;

        .logo-image {
            width: 48px;
            height: 48px;
        }

        .logo-text {
            font-size: 24px;
            letter-spacing: 1px;
            font-weight: 700;

        }

    }


    .search {
        flex: 1;
        position: relative;
        margin-left: 20px;

        .el-input {
            max-width: 480px;
            min-width: 160px;
            font-size: 12px;
            --el-input-height: 32px;
            --el-input-border-color: #f3f0ff;
            --el-input-hover-border-color: #e5dbff;
            --el-input-focus-border-color: #9775fa;

            .close:hover {
                border-radius: 2px;
                cursor: pointer;
                background-color: #f3f0ff;
            }
        }

        .searchhistory {
            font-size: 12px;
            max-width: 480px;
            width: 100%;
            position: absolute;
            top: 38px;
            left: 0;
            min-height: 300px;
            background: rgb(255, 255, 255);
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            text-align: center;
            z-index: 9;
            // animation: searchhistory 0.3s alternate forwards ease-in-out;

            .tabledata {
                padding: 0 10px;

                .el-table {
                    font-size: 12px;
                    --el-table-border-radius: 4px;
                    --el-table-border-color: none;
                }
            }

            .historyList {
                padding: 0 0 10px 0;

                .listTitle {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    height: 44px;
                    line-height: 44px;

                    .text {
                        font-weight: 600;
                        padding: 0 10px;
                    }

                    a {
                        padding: 0 10px;
                        text-decoration: none;
                        color: var(--el-text-color-regular);
                    }
                }

                .historyListItem {
                    width: 100%;
                    max-height: 556px;
                    list-style-type: none;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    overflow-y: auto;

                    &::-webkit-scrollbar {
                        width: 5px;
                        height: auto;
                    }

                    &:hover::-webkit-scrollbar-thumb {
                        border-radius: 3px;
                        background-color: #b5b5b5be;
                    }

                    .listItem {
                        color: var(--el-text-color-regular);
                        display: flex;
                        height: 40px;
                        line-height: 40px;
                        padding: 0 10px;
                        margin: 0 10px;

                        &:hover {
                            background-color: #f3f0ff;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                    }

                }

            }

            .nullcontent {
                color: var(--el-text-color-regular);

            }
        }

    }

    .content {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;

        .notice {
            flex: 1;
            position: relative;
            display: flex;
            padding: 4px;
            margin-left: 20px;
            border-radius: 4px;
            cursor: pointer;

            >.num {
                position: absolute;
                font-size: var(--font-default-fontsize);
                top: 0px;
                left: 16px;
                min-width: 8px;
                padding: 0 4px 0 4px;
                height: 14px;
                background-color: red;
                color: #fff;
                border-radius: 7px;
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

        .menu {
            padding: 4px;
            margin-left: 20px;
            border-radius: 4px;
            cursor: pointer;

            .about-items {
                width: 100px;
                position: absolute;
                top: 56px;
                right: 30px;
                background-color: white;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                z-index: 9;
                padding: 6px;
                border-radius: 4px;

                .item {
                    padding: 4px 8px;
                    text-align: center;
                    pointer-events: auto;

                    &:hover {
                        background-color: #f3f0ff;
                        border-radius: 3px;
                    }
                }

            }
        }

        .avatar-area {
            margin-left: 20px;
            cursor: pointer;

            .el-avatar {
                background: #9775fa !important;
                overflow: hidden;
                font-weight: 700;
            }

            .userinfo {
                padding: 6px;
                background-color: white;
                position: absolute;
                top: 56px;
                right: 6px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                z-index: 9;

                div {
                    padding: 4px 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &:hover {
                        background-color: #f3f0ff;
                        border-radius: 3px;
                    }
                }
            }
        }
    }
}

@keyframes searchhistory {
    from {
        opacity: 48px;
        transform: scale(0.9);

    }

    to {
        opacity: 38px;
        transform: scale(1)
    }
}
</style>