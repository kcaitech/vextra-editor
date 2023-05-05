<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { reactive, toRefs } from 'vue'
import Inform from './Inform.vue'
import * as share_api from '@/apis/share'
const docID = '1672502400000'
const input = ref('')
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
    }catch(err) {
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
</script>

<template>
    <div class="header">
        <div class="search">
            <el-icon size="20" class="icon">
                <Search />
            </el-icon><input class="input" type="search" placeholder="搜索文件" />
        </div>
        <div class="right">
            <div class="notice" @click="showInForm = true">
                <svg-icon class="svg" icon-class="notice"></svg-icon>
                <div class="num" v-if="num > 0" :class="{after: num > 99}" :style="{paddingRight: num>99 ? 9+'px': 4+ 'px'}">{{ num > 99 ? 99 : num }}</div>
            </div>
            <div class="about">
                <span>关于</span>
                <div class="about-items">
                    <a href="#">帮助手册</a>
                    <el-divider class="fgx" />
                    <a href="#">关于软件</a>
                </div>
            </div>
            <div>
                <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <Inform @close="closeInForm" v-if="showInForm" :applyList="applyList"></Inform>
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

        .icon {
            margin: auto 10px;
        }
    }

    .right {
        display: flex;
        position: relative;
        flex-direction: row;
        align-items: center;
        .notice {
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
                top: 0;
                left: 8px;
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
            margin-right: 10px;
            position: relative;
            display: inline-block;

            .about-items {
                display: none;
                position: absolute;
                right: -40px;
                background-color: #f9f9f9;
                min-width: 80px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                padding: 12px 16px;
                z-index: 99;

                .fgx {
                    margin: 10px 0 10px 0;

                }

                a {
                    margin-left: 10px;

                }
            }

            &:hover .about-items {
                display: block;
            } &:hover span {
                background: rgba(217, 217, 217, 0.67);
            }
        }
        span{
            display: inline-block;
            width: 40px;
            text-align: center;
            &:hover{
                background: rgba(217, 217, 217, 0.67);
            }
        }

    }
}</style>