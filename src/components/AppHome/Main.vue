<script setup lang="ts">
import { RouterView } from 'vue-router';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
import { createDocument } from '@kcdesign/data';
import { Repository, CoopRepository, Document } from '@kcdesign/data';
import { DocEditor } from '@kcdesign/data';
import { FilePicker } from '../common/filepicker';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { importSketch } from '@kcdesign/data';
import { Zip } from "@pal/zip";

const { t } = useI18n();
const route = useRoute()
const active = ref(true);
const title = ref()
const recycle = ref(false)
const elwidth = ref()
const elleft = ref()
const myfile = ref<HTMLElement>()
const mydel = ref<HTMLElement>()

const emits = defineEmits<{
    (e: 'dataUpdate', list: any[]): void
}>();

//===>Apphome组件接收
const update = (data: any) => {
    //main目录下传过来的lists和title
    emits('dataUpdate', data,)
}

const highlight = (state: boolean, e?: MouseEvent, path?: string,) => {
    active.value = state;
    if (path) router.push({ path: path })
    if (e) {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        elwidth.value = rect.width
        elleft.value = rect.x
    }
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

function newFile() {
    const repo = new Repository();
    const nd = createDocument(t('system.new_file'), repo);
    const coopRepo = new CoopRepository(nd, repo)
    const editor = new DocEditor(nd, coopRepo);
    const page = editor.create(t('system.page1'));
    editor.insert(0, page);
    window.document.title = nd.name;
    (window as any).skrepo = coopRepo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document' });
}

const picker = new FilePicker('.sketch', (file) => {
    if (!file) return;
    const lzdata = new LzDataLocal(new Zip(file));
    const repo = new Repository();
    importSketch(file.name, lzdata, repo).then((document: Document) => {
        window.document.title = document.name;
        const coopRepo = new CoopRepository(document, repo);
        (window as any).skrepo = coopRepo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});

watch(() => route.name, () => {
    recycle.value = false
    if (title.value) title.value = undefined
    if (route.name != undefined) {
        title.value = settilte(route.name.toString())!
        if (route.name === titles.meshare || route.name === titles.recyclebin) {
            recycle.value = true
            if (route.path === '/apphome/meshare') {
                nextTick(() => {
                    elwidth.value = myfile.value?.getBoundingClientRect().width
                    elleft.value = myfile.value?.getBoundingClientRect().x
                })
            }
            if (route.path === '/apphome/recyclebin') {
                nextTick(() => {
                    elwidth.value = mydel.value?.getBoundingClientRect().width
                    elleft.value = mydel.value?.getBoundingClientRect().x
                })
            }
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
    if (route.path === '/apphome/meshare') {
        nextTick(() => {
            elwidth.value = myfile.value?.getBoundingClientRect().width;
            elleft.value = myfile.value?.getBoundingClientRect().x;
        })
    }
    if (route.path === '/apphome/recyclebin') {
        nextTick(() => {
            elwidth.value = mydel.value?.getBoundingClientRect().width
            elleft.value = mydel.value?.getBoundingClientRect().x
        })
    }

})
</script>

<template>
    <div v-if="title != undefined" class="title">
        <div v-if="recycle" class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px' }"></div>
        <div v-if="recycle" class="container">
            <div ref="myfile" class="title-text" style="cursor: pointer;"
                @click="highlight(true, $event, '/apphome/meshare')" :style="{ opacity: active ? '1' : '0.5' }">
                {{ title }}
            </div>
            <div ref="mydel" class="title-text" style="cursor: pointer;"
                @click="highlight(false, $event, '/apphome/recyclebin')" :style="{ opacity: active ? '0.5' : '1' }">
                {{ t('home.recycling_station') }}</div>
        </div>
        <div v-else class="title-text">{{ title }}</div>
    </div>
    <div v-if="route.name === 'recently'" class="newandopen">
        <div class="newfile" @click="newFile">
            <div class="left">
                <svg-icon icon-class="newfile-normal"></svg-icon>
                <div class="text">{{ t('home.New_file') }}</div>
            </div>
            <div class="right">
                <svg-icon icon-class="add-icon"></svg-icon>
            </div>
        </div>
        <div class="openfile" @click="picker.invoke()">
            <div class="left">
                <svg-icon icon-class="openfile-normal"></svg-icon>
                <div class="text">{{ t('home.open_local_file') }}</div>
            </div>
            <div class="right">
                <svg-icon icon-class="add-icon"></svg-icon>
            </div>
        </div>
    </div>
    <div class="main">
        <RouterView @dataUpdate="update" />
    </div>
</template>

<style lang="scss" scoped>
.newandopen {
    display: flex;
    align-items: center;
    margin: 0 32px;
    gap: 32px;

    .newfile,
    .openfile {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 260px;
        height: 56px;
        font-size: 14px;
        border-radius: 8px;
        border: 1px solid rgba(240, 240, 240, 1);
        box-sizing: border-box;

        &:hover {
            background-color: rgba(248, 248, 250, 1);
        }

        .left {
            display: flex;
            align-items: center;
            margin-left: 16px;

            svg {
                color: rgba(51, 51, 51, 1);
                width: 30px;
                height: 30px;
            }
        }

        .right {
            display: flex;
            align-items: center;
            margin-right: 16px;

            svg {
                width: 16px;
                height: 16px;
            }
        }

    }

}

.title {
    display: flex;
    margin: 24px 32px;
    box-sizing: border-box;

    .indicator {
        margin-top: 30px;
        position: absolute;
        height: 2px;
        background-color: rgba(24, 120, 245, 1);
        border-radius: 2px;
        transition: all 0.2s ease-in-out;
    }

    .container {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .title-text {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 2px;
        // overflow: hidden;
        // white-space: nowrap;
        // text-overflow: ellipsis;
        color: #000;
    }
}

.main {
    margin: 24px 24px 0 24px;
    overflow: hidden;
    height: calc(100% - 152px);
}
</style>