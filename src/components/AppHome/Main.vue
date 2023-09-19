<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';

// interface Props {
//     // title?: string,
//     // recycle?: boolean
// }

const { t } = useI18n();
const route = useRoute()
const active = ref(true);
// const props = defineProps<Props>();
const title = ref('')
const recycle = ref(false)

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

enum titles {
    recently = 'recently',
    starfile = 'starfile',
    meshare = 'meshare',
    recyclebin = 'recyclebin',
    shareme = 'shareme',
}

const settilte = (title: string) => {
    switch (title) {
        case titles.recently:
            return t('home.recently_opened')
        case titles.starfile:
            return t('home.star_file')
        case titles.meshare:
            return t('home.file_shared')
        case titles.recyclebin:
            return t('home.file_shared')
        case titles.shareme:
            return t('home.shared_file_received')
        default:
            break;
    }
}

watch(() => route.name, () => {
    recycle.value = false
    if (title.value) title.value = ''
    if (route.name != undefined) {
        title.value = settilte(route.name.toString())!
        if (route.name === titles.meshare || route.name === titles.recyclebin) {
            recycle.value = true
        }
        if (route.name === titles.recyclebin) {
            highlight(false)
        } else {
            highlight(true)
        }
    }
})

onMounted(() => {
    if (route.name === "recyclebin") {
        highlight(false)
    }
    if (route.name != undefined) {
        title.value = settilte(route.name.toString())!
        if (route.name === titles.meshare || route.name === titles.recyclebin) {
            recycle.value = true
        }
    }

})
</script>

<template>
    <div v-if="title != ''" class="title">
        <span v-if="recycle">
            <router-link to="/apphome/meshare">
                <span @click="highlight(true)"
                    :style="{ opacity: active ? '1' : '0.5', fontSize: active ? '18px' : '16px' }">{{ title }}</span>
            </router-link>
        </span>
        <span v-else>{{ title }}</span>
        <span v-if="recycle" style="margin-left: 20px;">
            <router-link to="/apphome/recyclebin">
                <span @click="highlight(false)"
                    :style="{ opacity: active ? '0.5' : '1', fontSize: active ? '16px' : '18px' }">回收站</span>
            </router-link>
        </span>
    </div>
    <el-divider v-if="title != ''" />
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
    height: calc(100% - 56px);
}
</style>