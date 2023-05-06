<script setup lang="ts">
import { onMounted, reactive, toRefs, defineProps, defineEmits } from 'vue'
import { Search } from '@element-plus/icons-vue'




const errorHandler = () => true
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
})
const { circleUrl, uname, } = toRefs(state)

let inputiner: string
let searchlist =reactive(new Array) 
onMounted(() => {
    const historylist: any = document.querySelector('.searchhistory')
    const input: any = document.querySelector('.input')
    input.addEventListener('focus', (e: any) => {
        historylist.style.display = 'block',
            historylist.style.opacity = '1',
            historylist.style.transition = 'opacity 0.5s'

    })
    input.addEventListener('blur', () => {
        historylist.style.display = 'none',
            historylist.style.opacity = '0'

    })


    input.addEventListener('keyup', (e: any) => {
        if (e.key === 'Enter') {
            inputiner = input.value
            if(searchlist.length < 5){
                searchlist.unshift(inputiner)
            }else{
                searchlist.pop()
                searchlist.unshift(inputiner)
            }
        }
    })

})



</script>

<template>
    <div class="header">
        <div class="search">
            <el-icon size="20" class="icon">
                <Search />
            </el-icon><input class="input" type="search" placeholder="搜索文件" />
            <ul class="searchhistory">
                <li v-for="(item,index) in searchlist" :key="index">{{ item }}</li>
            </ul>
        </div>
        <div class="right">
            <div class="about">
                <span>关于</span>
                <div class="about-items">
                    <a href="#">帮助手册</a>
                    <el-divider class="fgx" />
                    <a href="#">关于软件</a>
                </div>
            </div>
            <div>
                <el-avatar :src="circleUrl" @error="errorHandler">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar><br />
                <span>{{ uname }}</span>
            </div>
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

        .search .icon {
            margin: auto 10px;
        }
    }

    .right {
        display: flex;
        flex-direction: row;
        align-items: center;

        .about {
            margin-right: 10px;
            position: relative;
            display: inline-block;

            .about-items {
                position: absolute;
                right: -40px;
                background-color: #f9f9f9;
                min-width: 80px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                padding: 12px 16px;
                z-index: 99;
                display: none;

                .fgx {
                    margin: 10px 0 10px 0;
                }

                a {
                    margin-left: 10px;
                }
            }

            &:hover .about-items {
                display: block;
            }

            &:hover span {
                background: rgba(217, 217, 217, 0.67);
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

    }
}

ul[data-v-22577da8] {
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
    position: absolute;
    top: 60px;
    left: calc(381px + 20px);
    width: 550px;
    background: white;
    z-index: 9999;
    box-shadow: 1px 1px 2px rgb(220, 220, 218);
    list-style-type: none;
    display: none;
    border-radius: 5px;

    :deep li {
        margin-bottom: 5px;
        margin-left: 0px;
        padding-inline-start: 0px;

        &:hover {
            background: rgba(217, 217, 217, 0.67);
        }
    }

}
</style>