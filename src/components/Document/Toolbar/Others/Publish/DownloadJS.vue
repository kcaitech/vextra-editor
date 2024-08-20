<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BoardLoader, BoardMenuItem } from "@/components/Document/Toolbar/Others/Publish/BoardMenu/boardLoader";
import { Context } from "@/context";
import BoardMenu from "@/components/Document/Toolbar/Others/Publish/BoardMenu/BoardMenu.vue";
import { MossPacker } from "@/components/Document/Toolbar/Others/Publish/downloadJS";

const t = useI18n().t;

const props = defineProps<{
    context: Context
}>()
const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'loaded'): void;
}>()
const loading = ref<boolean>(false);
const downloading = ref<boolean>(false);
const boardList = ref<BoardMenuItem[]>([]);
const lister = ref<BoardLoader>(new BoardLoader(props.context, boardList.value as BoardMenuItem[]));
const toast = ref<{ show: boolean; type: 0 | 1; content: string }>({
    show: false,
    type: 1,
    content: t('home.downloaded')
});

function boardLoaded() {
    loading.value = false;
}

function init() {
    loading.value = true;
    lister.value.load(boardLoaded, () => {
    });
}

const timerSet = new Set<any>();

function showToast(type: 0 | 1) {
    toast.value.show = true;
    toast.value.type = type;
    toast.value.content = type ? t('home.downloaded') : '下载失败';
    timerSet.add(setTimeout(() => {
        toast.value.show = false;
    }, 2000));
}


async function download() {
    downloading.value = true;
    const packer = new MossPacker(props.context);
    const config = (() => {
        let pageId: string = '';
        let boardId: string = '';
        for (const li of boardList.value) {
            if (!li.selected) continue;
            pageId = li.page.id;
            boardId = li.selected.id;
            break;
        }
        return { pageId, boardId };
    })();
    await packer.pack(config);
    showToast(1);
    downloading.value = false;
}

onMounted(init);
onUnmounted(() => {
    timerSet.forEach(t => {
        clearTimeout(t);
        t = null;
    });
    timerSet.clear();
})
</script>
<template>
<div class="overlay" @click="emits('close')">
    <div class="download-js-wrap" @click.stop>
        <div style="width: 100%;height: 32px; display: flex; align-items: center; justify-content: space-between">
            <div>{{ t('home.homePage') }}</div>
            <div class="close" @click="emits('close')">
                <svg-icon icon-class="close"/>
            </div>
        </div>
        <div style="width: 100%;height: fit-content; min-height: 120px; position: relative">
            <div v-if="loading" class="loader"/>
            <div v-else-if="boardList.length" style="height: fit-content; width: 100%;">
                <BoardMenu :context="context" :lister="lister as BoardLoader"
                           :board-list="boardList as BoardMenuItem[]"/>
                <div class="download">
                    <div
                        style="width: fit-content; height: 32px;
                        display: flex;align-items:center;
                        cursor: pointer;padding: 0 6px;
                        background-color: var(--active-color); border-radius: 4px;
                        color: var(--theme-color-anti); font-size: 13px;"
                        @click="download"
                    >
                        {{ downloading ? t('home.downloading') : t('home.download') }}
                    </div>
                </div>
            </div>
            <div v-else style="
            width: 100%; height: 72px;
            color: grey;
            font-size: 13px;
            display: flex; align-items: center;justify-content: center">{{ t('home.no_board') }}
            </div>
        </div>
        <div :style="{
            width: '100%',
            height: '100%',
            'background-color': downloading ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
            transition: '0.2s',
            'pointer-events': downloading? 'auto' : 'none',
            'z-index': downloading ? 1 : -1,
            top: 0,
            left: 0,
            position: 'absolute'
        }">
        </div>
        <div v-if="toast.show" class="toast" :style="{color: toast.type ? '#fff' : 'red'}">{{ toast.content }}</div>
    </div>
</div>
</template>
<style scoped lang="scss">
.overlay {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: transparent;

    .download-js-wrap {
        position: relative;
        width: 500px;
        padding: 0 24px 8px 24px;
        margin: 120px auto auto;
        border: 1px solid #F0F0F0;
        border-radius: 16px;
        background-color: white;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 1000;
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.18);
        transform: translateY(0);
        animation: move 0.25s ease-in-out;

        .close {
            width: 16px;
            height: 16px;
            padding: 4px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.1s;
        }

        .close:hover {
            background-color: rgb(243, 243, 245);
        }
    }
}

.download {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
}

.loader {
    width: 18px;
    height: 18px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid transparent;
    border-top: 2px solid var(--active-color);
    border-left: 2px solid var(--active-color);;
    border-radius: 50%;
    box-sizing: border-box;

    & {
        animation: spin 1s linear infinite;
    }
}

.toast {
    position: absolute;
    width: fit-content;
    height: 32px;
    border-radius: var(--default-radius);
    padding: 0 6px;
    background-color: var(--theme-color);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    z-index: 1;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.18);
}

@keyframes move {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>