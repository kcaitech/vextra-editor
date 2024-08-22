<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BoardLoader, BoardMenuItem } from "@/components/Document/Toolbar/Others/Publish/BoardMenu/boardLoader";
import { Context } from "@/context";
import BoardMenu from "@/components/Document/Toolbar/Others/Publish/BoardMenu/BoardMenu.vue";

const t = useI18n().t;

const props = defineProps<{
    context: Context
}>()
const emits = defineEmits<{
    (e: 'close'): void;
    (e: 'loaded'): void;
}>()
const loading = ref<boolean>(false);

const boardList = ref<BoardMenuItem[]>([]);
const lister = ref<BoardLoader>(new BoardLoader(props.context, boardList.value as BoardMenuItem[]));

function boardLoaded() {
    loading.value = false;
    console.log('__board_list__', boardList.value);
}

function init() {
    loading.value = true;
    lister.value.load(boardLoaded, () => {
    });
}

onMounted(init);
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
            <div v-else style="height: fit-content; width: 100%;">
                <BoardMenu :context="context" :lister="lister as BoardLoader"
                           :board-list="boardList as BoardMenuItem[]"/>
                <div class="download">
                    <div
                        style="width: fit-content; height: 32px;
                        display: flex;align-items:center;
                        cursor: pointer;padding: 0 6px;
                        background-color: var(--active-color); border-radius: 4px;
                        color: var(--theme-color-anti); font-size: 13px;"
                    >
                        {{ t('home.download') }}
                    </div>
                </div>
            </div>

        </div>
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
        width: 462px;
        padding: 0 24px 8px 24px;
        margin: 120px auto auto;
        transform: translateY(0);
        border: 1px solid #F0F0F0;
        border-radius: 16px;
        background-color: white;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 1000;
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.18);
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