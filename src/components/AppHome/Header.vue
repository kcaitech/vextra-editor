<template>
    <div class="header">
        <div class="search">
            <el-icon size="20" class="SearchIcon" style="margin: 10px;">
                <Search />
            </el-icon><input v-model="search" class="input" :placeholder="`${t('system.placeholder')}`" />
            <el-icon size="20" class="CloseIcon" style="margin: 10px;">
                <Close />
            </el-icon>
            <div class="searchhistory" >
                <div v-if="search!=''">
                    <el-table :data="SearchList||[]" style="width: 100%;" height="300" size="small" empty-text="没有匹配的结果">
                        <el-table-column prop="name" :label="t('home.file_name')"/>
                        <el-table-column prop="updated_at" :label="t('home.modification_time')" />
                        <el-table-column prop="size" :label="t('home.size')" />
                    </el-table>
                </div>
                <div v-else>没有搜索记录</div>
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
                <span style="display: block">{{ uname }}</span>
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
            <Inform @close="closeInForm" v-if="showInForm" :applyList="applyList"></Inform>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, toRefs, ref, onUnmounted, computed } from 'vue'
import { Search, User, SwitchButton, Close } from '@element-plus/icons-vue'
import Inform from './Inform.vue'
import * as share_api from '@/apis/share'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'

const { t } = useI18n()
const tableData = ref<any[]>([])
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
})
const { circleUrl, uname, } = toRefs(state)

const docID = '1672502400000'
const num = ref(0)
const showInForm = ref(false)
const applyList: any = ref([])
const closeInForm = () => {
    showInForm.value = false
}
const getApplyList = async () => {
    try {
        const { data } = await share_api.getApplyListAPI({ doc_id: docID })
        num.value = data.length
        applyList.value = data
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
let SearchList = ref<any[]>([]);

function getSearch() {
    const historylist: any = document.querySelector('.searchhistory')
    const close: any = document.querySelector('.CloseIcon')
    const input: any = document.querySelector('.input')

    input.addEventListener('focus', () => {
        SearchList = computed(() => SearchList.value.filter((data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())))
        historylist.style.display = 'block'
    
    })
    historylist.addEventListener('blur', () => {
        search.value = ''
        historylist.style.display = 'none'
    })

    input.addEventListener('keyup', (e: any) => {
        if (search.value !== '') {
            close.style.display = 'block'
        } else {
            close.style.display = 'none'
        }
    })
    close.addEventListener('click', () => {
        search.value = ''
        close.style.display = 'none'
    })
}
function userinfo(){
    router.push({ path: '/pcenter' })
}

function loginout(){
    localStorage.clear()
    router.push({ path: '/login' })
}
onMounted(() => {
    getSearch()
})

</script>

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