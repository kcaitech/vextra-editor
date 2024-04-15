<template>
    <div class="container">
        <div class="header">
            <img src="@/assets/h-logo2.svg" alt="logo">
        </div>
        <div class="main">
            <div v-if="activebnt !== 'About'" class="search">
                <div class="search-input">
                    <div class="s-header">
                        <svg-icon icon-class="search-icon2"></svg-icon>
                    </div>
                    <input type="text" placeholder="搜索文件" v-model="searchKey">
                    <div v-if="searchKey.trim()" class="s-footer" @click="searchKey = ''">
                        <svg-icon icon-class="close"></svg-icon>
                    </div>
                </div>
                <div class="notice" @click="showInForm = !showInForm">
                    <svg-icon icon-class="m-notice"></svg-icon>
                    <div class="num after" v-if="total > 0" :class="{ after: total > 99 }">{{ total > 99 ? 99 : total }}
                    </div>
                </div>
            </div>
            <div class="content" :style="{ height: activebnt !== 'About' ? 'calc(100% - 54px)' : '100%' }">
                <component :is="tabs.get(activebnt)||Home" @testevnt="testevent"></component>
                <Transition name="fade">
                    <div v-if="searchKey" class="search-list">
                        <FilesItem :err-network="errnetwork" :data="searchData" @changeStar="changeStar"
                            @openfile="openfile" @refresh="refreshTab" @sharefile="data" :index=listindex>
                        </FilesItem>
                    </div>
                </Transition>
            </div>
        </div>
        <div class="footer">
            <div class="bnt" :class="{ 'bnt-selct': activebnt === item.value }" v-for="(item, index) in bntdata"
                :key=index @click="changetab(item.value)">
                <div class="icon">
                    <svg-icon :icon-class="activebnt === item.value ? item.icon.select : item.icon.normal"></svg-icon>
                </div>
                <div class="label">{{ item.label }}</div>
            </div>
        </div>
        <Transition @after-enter="tsDone = true" name="fade">
            <Inform class="inform" v-if="showInForm" @close="closeInForm" :applyList="applyList"
                :teamApplyList="totalList" :done="tsDone">
            </Inform>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import * as share_api from '@/request/share';
import * as team_api from '@/request/team';
import FilesItem from './FilesItem.vue'
import Home from './HomePage.vue';
import MyFile from './MyFile.vue';
import Team from './Team.vue';
import About from './About.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Inform from './MessageInfo.vue';
import { useSearchData } from './search'
import { storeToRefs } from 'pinia';
import { router } from '@/router';


const Data = useSearchData()
const { searchKey, searchData } = storeToRefs(Data)


const bntdata = [
    { label: '首页', value: 'Home', icon: { normal: 'mhome-normal', select: 'mhome-select' } },
    { label: '我的文件', value: 'MyFiles', icon: { normal: 'mfiles-normal', select: 'mfiles-select' } },
    { label: '团队', value: 'Team', icon: { normal: 'mteam-normal', select: 'mteam-select' } },
    { label: '我的', value: 'About', icon: { normal: 'mabout-normal', select: 'mabout-select' } },
]

const activebnt = ref(sessionStorage.getItem('selectTab') || 'Home')

const projectApplyList = ref<any>([]);
const notifyPApplyList = ref<any>([]);
const notifyTApplyList = ref<any>([]);
const applynum = ref(0);
const teamnum = ref(0);
const applyList = ref<any[]>([]);
const teamApplyList = ref<any>([]);
const totalList = ref<any[]>([])
const showInForm = ref(false);
const tsDone = ref(false)

const closeInForm = () => {
    showInForm.value = false;
    tsDone.value = false
}

const docid = ref<string>()
const total = computed(() => {
    return applynum.value + teamnum.value ?? 99;
})


const tabs = new Map([
    ['Home', Home,],
    ['MyFiles', MyFile],
    ['Team', Team],
    ['About', About],
]);

const openfile = (id: number, index: number) => {
    sessionStorage.setItem('scrolltop', index.toString())
    router.push(({ name: 'pageviews', query: { id: id } }))
}


const changetab = (tab: string) => {
    activebnt.value = tab;
    sessionStorage.setItem('selectTab', tab);
    (window as any).wx.miniProgram.postMessage({data:{index:1,title:'哈哈'}});
    (window as any).wx.miniProgram.navigateBack({delta: 1})
}

const testevent = (data: any) => {
    docid.value = data.data.document.id
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
                const timeA = new Date(a.request.created_at.replace('-', '/')).getTime();
                const timeB = new Date(b.request.created_at.replace('-', '/')).getTime();
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
                const timeA = new Date(a.request.created_at.replace('-', '/')).getTime();
                const timeB = new Date(b.request.created_at.replace('-', '/')).getTime();
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
                const timeA = new Date(a.request.created_at.replace('-', '/')).getTime();
                const timeB = new Date(b.request.created_at.replace('-', '/')).getTime();
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
                const timeA = new Date(a.request.created_at.replace('-', '/')).getTime();
                const timeB = new Date(b.request.created_at.replace('-', '/')).getTime();
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

getApplyList();
getTeamApply();
getProjectNotice();
getTeamNotice();
getProjectApplyList();
let timer: any = null
onMounted(() => {
    timer = setInterval(() => {
        getApplyList();
        getTeamApply();
        getProjectNotice();
        getTeamNotice();
        getProjectApplyList();
    }, 60000)
})

onUnmounted(() => {

    clearInterval(timer)

})

</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateX(500px);
    opacity: 0.5;
}

.num {
    position: relative;
    font-size: 10px;
    top: -8px;
    left: 8px;
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

.search-list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 14px;
    box-sizing: border-box;
    background-color: #FAFAFA;
}

.bnt-selct {
    color: #262626 !important;
}

.container {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #FAFAFA;
    overflow: hidden;

    .header {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 44px;
        position: sticky;
        top: 0;
        background-color: #FAFAFA;
        box-sizing: border-box;
        z-index: 1;

        img {
            margin-left: 14px;
            height: 34px;
        }
    }

    .main {
        flex: 1;
        overflow: hidden;
        position: relative;

        .search {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 0 14px;
            position: sticky;
            width: 100%;
            height: 54px;
            background-color: #FAFAFA;
            box-sizing: border-box;
            z-index: 1;

            .search-input {
                flex: 80%;
                display: flex;
                align-items: center;
                height: 34px;
                border-radius: 8px;
                background: #FFFFFF;
                box-sizing: border-box;
                border: 1px solid #F5F5F5;

                &:focus-within {
                    border-color: rgba(24, 120, 245, 1);
                }

                .s-header,
                .s-footer {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 8px;

                    svg {
                        width: 100%;
                        height: 100%;
                    }

                }

                input {
                    flex: 1;
                    height: 100%;
                    outline: none;
                    border: none;
                    background-color: initial;
                    padding: 0;
                    box-sizing: border-box;
                }
            }

            .notice {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                svg {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                }
            }

        }


        .content {
            position: relative;
            height: calc(100% - 54px)
        }
    }



    .footer {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        position: sticky;
        bottom: 0;
        min-height: 58px;
        font-size: 10px;
        font-weight: 500;
        background-color: #FFFFFF;
        color: #BFBFBF;
        border-width: 1px 0px 0px 0px;
        border-style: solid;
        border-color: #F1F2F2;
        padding: 6px 0 0 0;
        box-sizing: border-box;

        .bnt {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .icon {
                width: 24px;
                height: 24px;

                svg {
                    width: 100%;
                    height: 100%;
                }
            }

        }
    }
}
</style>
