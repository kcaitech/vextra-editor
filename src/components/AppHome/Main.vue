<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import { roleTypes } from 'element-plus';
interface Props {
    title: string,
    recycle: boolean
}

const route = useRoute()
const active = ref(true);
const props = defineProps<Props>();
const emits = defineEmits<{
    (e: 'dataUpdate', list: any[], title: string): void
}>();
//===>Apphome组件接收
const update = (data: any, searchtitle: string) => {
    //main目录下传过来的lists和title
    emits('dataUpdate', data, searchtitle)
}

const highlight = (state: boolean) => {
    active.value = state;
}

watch(() => route.name, () => {
    if (route.name === "recyclebin") {
        highlight(false)
    } else {
        highlight(true)
    }
})

onMounted(() => {
    if (route.name === "recyclebin") {
        highlight(false)
    }
})
</script>

<template>
    <div v-if="props.title != '' && $route.name != 'TeamPage' && $route.name != 'ProjectPage' && $route.name != 'ProjectShare'"
        class="title">
        <span v-if="recycle">
            <router-link to="/apphome/meshare">
                <span @click="highlight(true)"
                    :style="{ opacity: active ? '1' : '0.5', fontSize: active ? '18px' : '16px' }">{{ props.title }}</span>
            </router-link>
        </span>
        <span v-else>{{ props.title }}</span>
        <span v-if="recycle" style="margin-left: 20px;">
            <router-link to="/apphome/recyclebin">
                <span @click="highlight(false)"
                    :style="{ opacity: active ? '0.5' : '1', fontSize: active ? '16px' : '18px' }">回收站</span>
            </router-link>
        </span>
    </div>
    <el-divider
        v-if="props.title != '' && $route.name != 'TeamPage' && $route.name != 'ProjectPage' && $route.name != 'ProjectShare'" />
    <div class="main">
        <RouterView @dataUpdate="update" />
    </div>
</template>

<style lang="scss" scoped>
.el-divider {
    margin: 10px 0;
}

.title {
    margin-top: 20px;

    span {
        font-size: 18px;
        width: auto;
        font-weight: 600;
        letter-spacing: 2px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #000;

        a {
            text-decoration: none;

        }
    }
}

.main {
    overflow: hidden;
}
</style>