<template>
    <div class="container" @wheel.stop>
        <div class="search">
            <div class="icon">
                <svg-icon icon-class="search"></svg-icon>
            </div>
            <div class="filter" @click.stop="showfilter = !showfilter">
                <svg-icon icon-class="arrow"></svg-icon>
            </div>
            <input v-focus type="text" placeholder="搜索样式" v-model="searchval">
            <div v-if="showfilter" class="filter-list">
                <div class="list-item" @click.stop="Changefilter('全部')">
                    <span>全部</span>
                </div>
                <div class="list-item" v-for="i in test" :key="i.type" @click.stop="Changefilter(i.type)">
                    <span> {{ i.type }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="i in data" :key="i.type">
                    <div class="type" @click.stop="showtype(i.type)">
                        <svg-icon :icon-class="showtypes.has(i.type) ? 'triangle-down' : 'triangle-right'"></svg-icon>
                        <span>{{ i.type }}</span>
                    </div>
                    <template v-if="showtypes.has(i.type)">
                        <div class="styles" v-for="s in i.styles.filter(s => s.name.includes(searchval))">
                            <div class="color">
                                <div class="main" :style="{ backgroundColor:'#000',opacity: s.content[0] }">
                                    <div class="mask" :style="{ opacity: 1 - s.content[0] }"></div>
                                </div>
                            </div>
                            <div class="name">{{ s.name }}</div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length" class="null">没有搜索到相关样式</div>
            </div>
        </el-scrollbar>
    </div>

</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue';



const showfilter = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('')
const showtypes = ref(new Set<string>())

const Changefilter = (v: string) => {
    filterval.value = v;
    showfilter.value = false
    showtypes.value.add(v)
}

const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
}

const test = [
    { type: 'location', styles: [{ name: '33', content: [0.2] }, { name: '2', content: [1] }] },
    { type: 'ios', styles: [{ name: '1', content: [1, 2, 3, 4] }, { name: '12', content: [1, 2, 3, 4] }] },
    { type: 'android', styles: [{ name: '1', content: [1, 2, 3, 4] }, { name: '22', content: [1, 2, 3, 4] }] },
    { type: 'test', styles: [{ name: '1', content: [1, 2, 3, 4] }, { name: 'ss', content: [1, 2, 3, 4] }] },
    { type: '样式', styles: [{ name: 'ssq', content: [1, 2, 3, 4] }, { name: 'hs', content: [1, 2, 3, 4] }] },
    { type: '哈哈哈', styles: [{ name: 'jj', content: [1, 2, 3, 4] }, { name: '2', content: [1, 2, 3, 4] }] },
    { type: '啥啥啥', styles: [{ name: 'oop', content: [1, 2, 3, 4] }, { name: '2', content: [1, 2, 3, 4] }] },
    { type: '4898', styles: [{ name: '换行', content: [1, 2, 3, 4] }, { name: 'SHW', content: [1, 2, 3, 4] }] },
    { type: '你好SGG88', styles: [{ name: '瓦特', content: [1, 2, 3, 4] }, { name: '2', content: [1, 2, 3, 4] }] },
]

const data = computed(() => {
    let d;
    if (filterval.value && filterval.value !== '全部') {
        d = test.filter(i => i.type === filterval.value)
    } else {
        d = test
    }
    return d.filter(i => i.styles.filter(s => s.name.includes(searchval.value)).length !== 0)
})

watchEffect(() => {
    data.value.forEach(i => showtypes.value.add(i.type))
})

onMounted(() => {

})


</script>
<style lang="scss" scoped>
.container {
    margin-bottom: 8px;
}

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
    margin: 8px 12px;
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
        width: 60%;
        left: 0;
        background-color: #fff;
        border: 1px solid #e5e5e5e5;
        border-radius: 4px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        z-index: 9;

        .list-item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            border-radius: 6px;
            box-sizing: border-box;

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}

.content {
    display: flex;
    flex-direction: column;
    margin: 0 12px;
    max-height: 380px;
    min-height: 350px;

    .style-item .type {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 6px;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: #f5f5f5;
        }
    }

    .style-item .type svg {
        width: 14px;
        height: 14px;
    }

    .style-item .type span {
        font-weight: var(--font-weight-medium);
    }

    .style-item .styles {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 32px;
        padding: 6px;
        box-sizing: border-box;
    }

    .style-item .styles .color {
        width: 16px;
        height: 16px;
        background-color: #fff;
        border: 1px solid rgba(230, 230, 230, 0.7);
        border-radius: 3px;
        overflow: hidden;

        .main {
            width: 16px;
            height: 16px;
            background-color: #000;
            position: relative;

            .mask {
                position: absolute;
                top: 0;
                right: 0;
                width: 50%;
                height: 100%;
                background: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%226%22%20height%3D%226%22%20viewBox%3D%220%200%206%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%200H3V3H0V0Z%22%20fill%3D%22%23E1E1E1%22/%3E%3Cpath%20d%3D%22M3%200H6V3H3V0Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M3%203H6V6H3V3Z%22%20fill%3D%22%23E1E1E1%22/%3E%3Cpath%20d%3D%22M0%203H3V6H0V3Z%22%20fill%3D%22white%22/%3E%3C/svg%3E%0A");
            }
        }
    }

    .null {
        margin: auto;
    }
}
</style>
