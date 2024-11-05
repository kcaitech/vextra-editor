<template>
    <div class="container">
        <div class="search">
            <div class="icon">
                <svg-icon icon-class="search"></svg-icon>
            </div>
            <div class="filter" @click.stop="showfilter = !showfilter">
                <svg-icon icon-class="arrow"></svg-icon>
            </div>
            <input type="text" property="搜索样式">
            <div v-if="showfilter" class="filter-list">
                <div class="list-item" v-for="i in 4" :key="i">
                    <div>
                        <svg-icon icon-class=""></svg-icon>
                    </div>
                    <span> {{ i }}</span>
                </div>
            </div>
        </div>
        <div class="content">
            <div class="style-item" v-for="i in test" :key="i.type">
                <div class="type">{{ i.type }}</div>
                <div class="styles" v-for="s in i.styles">
                    <div class="centent">{{ s.content }}</div>
                    <div class="name">{{ s.name }}</div>
                </div>
            </div>
        </div>
    </div>

</template>
<script setup lang="ts">
import { ref } from 'vue';



const showfilter = ref<boolean>(false)

const test=[
    {type:'location',styles:[{name:'1',content:[1,2,3,4]},{name:'2',content:[1,2,3,4]}]},
    {type:'ios',styles:[{name:'1',content:[1,2,3,4]},{name:'2',content:[1,2,3,4]}]},
    {type:'android',styles:[{name:'1',content:[1,2,3,4]},{name:'2',content:[1,2,3,4]}]}
]

</script>
<style lang="scss" scoped>
.search {
    position: relative;
    display: flex;
    align-items: center;
    height: 32px;
    background-color: #F5F5F5;
    border-radius: 6px;
    border: 1px solid transparent;
    gap: 4px;
    padding: 0 8px;
    box-sizing: border-box;

    .icon,
    .filter {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 32px;

        svg {
            height: 100%;
            width: 14px;
        }
    }

    input {
        flex: 1;
        height: 100%;
        width: 100%;
        outline: none;
        border: none;
        padding: 0;
        background-color: transparent;
        box-sizing: border-box;
    }

    &:has(input:focus) {
        border: 1px solid #1878F5;
    }

    .filter-list {
        position: absolute;
        top: 36px;
        width: 100%;
        left: 0;
        border: 1px solid #e5e5e5e5;
        border-radius: 4px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;

        .list-item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;

        }
    }
}
</style>
