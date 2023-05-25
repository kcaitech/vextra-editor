
<script setup lang="ts">
import { onMounted, reactive, toRefs, ref, onUnmounted } from 'vue'
import { Search, User, SwitchButton, Close } from '@element-plus/icons-vue'
import Inform from './Inform.vue'
import * as share_api from '@/apis/share'
import * as user_api from '@/apis/users'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
})
const { circleUrl, uname, } = toRefs(state)
const num = ref(0)
const showInForm = ref(false)
const applyList = ref<any[]>([])
const closeInForm = () => {
    showInForm.value = false
}
const getApplyList = async () => {
    try {
        const { data } = await share_api.getApplyListAPI()
        if (data) {
            applyList.value = data
            num.value = applyList.value.filter(item => item.apply.status === 0).length
        }
    } catch (err) {
        console.log(err)
    }
}

let timer: any = null
getApplyList()

onMounted(() => {
    timer = setInterval(() => {
        getApplyList()
    }, 60000)
})

onUnmounted(() => {
    clearInterval(timer)
})

const errorHandler = () => true


let search = ref('')
let SearchList = ref<any[]>([])
let lists = ref<any[]>([])

function searchhistoryshow() {
    const historylist: any = document.querySelector('.searchhistory')
    historylist.style.display = "block"
    getUserdata()

}

function closeclick() {
    const historylist: any = document.querySelector('.searchhistory')
    const close: any = document.querySelector('.CloseIcon')
    search.value = ''
    close.style.display = "none"
    historylist.style.display = "none"
}

const getUserdata = async () => {
    if (location.hash.toLowerCase() == "#/apphome/recently") {
        const { data } = await user_api.GetDocumentsList()
        lists.value = data
    }
    if (location.hash.toLowerCase() == "#/apphome/starfile") {
        const { data } = await await user_api.GetfavoritesList()
        lists.value = data
    }
    if (location.hash.toLowerCase() == "#/apphome/meshare") {
        const { data } = await share_api.getDoucmentListAPI()
        lists.value = data
    }
    if (location.hash.toLowerCase() == "#/apphome/shareme") {
        const { data } = await user_api.ShareLists()
        lists.value = data
    }
    if (location.hash.toLowerCase() == "#/apphome/recyclebin") {
        const { data } = await user_api.GetrecycleList()
        lists.value = data
    }
    if (lists.value == null) {
        ElMessage.error("文档列表获取失败")
    } else {
        for (let i = 0; i < lists.value.length; i++) {
            let { document: { size }, document_access_record: { last_access_time } } = lists.value[i]
            lists.value[i].document.size = sizeTostr(size)
            lists.value[i].document_access_record.last_access_time = last_access_time.slice(0, 19)
        }

    }
}

function screenout() {
    const close: any = document.querySelector('.CloseIcon')
    if (search.value != '') {
        close.style.display = "block"
    } else {
        close.style.display = "none"
    }
    SearchList.value = lists.value.filter((el: any) => el.document.name.toLowerCase().includes(search.value.toLowerCase()))
}

function sizeTostr(size: any) {
    if ((size / 1024 / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024 / 1024).toFixed(2) + "GB"
    } else if ((size / 1024 / 1024) > 1) {
        size = (size / 1024 / 1024).toFixed(2) + "MB"
    } else if ((size / 1024) > 1) {
        size = (size / 1024).toFixed(2) + "KB"
    } else {
        size = Math.round(size * 100) / 100 + "B"
    }
    return size
}

function userinfo() {
    router.push({ path: '/pcenter' })
}

function loginout() {
    localStorage.clear()
    router.push({ path: '/login' })
}

const reviewed = () => {
    getApplyList()
}

const toDocument = (row: any) => {
    const docId = row.document.id
    const Name = 'document'
    const query = { id: docId }
    const url = router.resolve({ name: Name, query: query }).href
    window.open(url, '_blank')
}

document.addEventListener('click', (el) => {
    const nullcontent: any = document.querySelector('.nullcontent')
    const content: any = document.querySelector('.content')
   console.log(el);
   
    // if (!isClickInsideSearchPanel) {
    //     searchPanel.style.display = 'none';
    // }

})

</script>
<template>
    <div class="header">
        <div class="search">
            <el-icon size="20" class="SearchIcon" style="margin: 10px;">
                <Search />
            </el-icon><input v-model="search" class="input" :placeholder="`${t('system.placeholder')}`"
                @focus="searchhistoryshow" @input="screenout" />
            <el-icon size="20" class="CloseIcon" style="margin: 10px;" @click="closeclick">
                <Close />
            </el-icon>
            <div class="searchhistory">
                <div class="content" v-if="search != ''">
                    <el-table :data="SearchList || []" style="width: 100%;" height="300" size="small" empty-text="没有匹配的结果"
                        @row-click="toDocument">
                        <el-table-column prop="document.name" :label="t('home.file_name')" />
                        <el-table-column prop="document_access_record.last_access_time"
                            :label="t('home.modification_time')" />
                        <el-table-column prop="document.size" :label="t('home.size')" />
                    </el-table>
                </div>
                <div class="nullcontent" v-else style="line-height: 300px; font-size: 12px;">没有搜索记录</div>
            </div>
        </div>
        <div class="right">
            <div class="notice" @click="showInForm = true">
                <svg-icon class="svg" icon-class="notice"></svg-icon>
                <div class="num" v-if="num > 0" :class="{ after: num > 99 }"
                    :style="{ paddingRight: num > 99 ? 9 + 'px' : 4 + 'px' }">{{ num > 99 ? 99 : num }}</div>
            </div>
            <div class="about">
                <span>{{ t('system.about') }}</span>
                <div class="about-items">
                    <div>{{ t('system.help_manual') }}</div>
                    <div>{{ t('system.about_software') }}</div>
                </div>
            </div>
            <div class="user">
                <el-avatar :src="circleUrl" @error="errorHandler">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
                <span style="display: block" class="username">{{ uname }}</span>
                <div class="userinfo">
                    <div @click="userinfo"><el-icon size="20">
                            <User />
                        </el-icon>{{ t('system.personal_center') }}</div>
                    <div @click="loginout"><el-icon size="20">
                            <SwitchButton />
                        </el-icon>{{ t('system.login_out') }}</div>
                </div>
            </div>
            <!-- <button @click="toDocument">跳转</button> -->
            <Inform @close="closeInForm" v-if="showInForm" :applyList="applyList" @reviewed="reviewed"></Inform>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.header {
    width: calc(100vw - 381px - 50px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;


    .search {
        display: flex;
        flex-direction: row;
        align-items: center;
        background: rgba(217, 217, 217, 0.67);
        width: 550px;
        height: 45px;
        border-radius: 20px;

        .input {
            width: 550px;
            height: 45px;
            margin: 0;
            outline: none;
            border: none;
            background: none;

        }

        .CloseIcon {
            display: none;

            :hover {
                color: blue
            }
        }
    }

    .right {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;

        .notice {
            position: relative;
            width: 20px;
            height: 20px;
            margin-right: 10px;

            >.svg {
                width: 100%;
                height: 100%;
            }

            >.num {
                position: absolute;
                font-size: var(--font-default-fontsize);
                top: -10px;
                left: 10px;
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

        .about {
            margin: 0 20px;
            font-size: 16px;
            position: relative;
            display: inline-block;

            .about-items {
                position: absolute;
                background-color: #f9f9f9;
                min-width: 80px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                right: -30px;
                z-index: 99;
                padding: 0 10px;
                border-radius: 2px;
                display: none;

                div {
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 2px;
                    margin: 10px 0;
                }

                div:hover {
                    background: rgba(217, 217, 217, 0.67);

                    &:active {
                        background: rgb(113, 110, 110);
                    }
                }
            }

            &:hover .about-items {
                display: block;
            }
        }

        span {
            display: inline-block;
            width: 40px;
            text-align: center;

            &:hover {
                background: rgba(217, 217, 217, 0.67);
            }
        }

        .userinfo {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 80px;
            right: -30px;
            z-index: 99;
            padding: 0 10px;
            border-radius: 2px;
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

            div {
                border-radius: 2px;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px 0;
            }

            div:hover {
                background: rgba(217, 217, 217, 0.67);

                &:active {
                    background: rgb(113, 110, 110);
                }
            }

        }

        .user:hover .userinfo {
            display: block;
        }

        .user {
            .username {
                display: block;
                white-space: nowrap;
                width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 10px;
            }
        }
    }
}

.searchhistory {
    margin-top: 20px;
    box-sizing: border-box;
    position: absolute;
    top: 60px;
    left: calc(381px + 20px);
    width: 550px;
    min-height: 300px;
    max-height: 600px;
    background: white;
    z-index: 9999;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    display: none;
    border-radius: 5px;
    text-align: center;
}
</style>