<script setup lang="ts">
import { Context } from "@/context";
import { nextTick, onUnmounted, ref } from "vue";
import { useI18n } from 'vue-i18n';
import DownloadJS from "@/components/Document/Toolbar/Others/Publish/DownloadJS.vue";

const props = defineProps<{
    context: Context;
}>();
const popover = ref<boolean>(false);
const t = useI18n().t;
const downloadJs = ref<boolean>(false);

function exit(event: MouseEvent) {
    if (!popover.value) return;
    if (!(event?.target as Element).closest('.publish-options-wrap')) {
        popover.value = false;
        document.removeEventListener('mousedown', exit);
    }
}

function enter(event: MouseEvent) {
    event.stopPropagation()
    if (popover.value) {
        popover.value = false;
        document.removeEventListener('mousedown', exit);
    } else {
        popover.value = true;
        nextTick(() => {
            document.addEventListener('mousedown', exit);
        });
    }
}

onUnmounted(() => {
    document.removeEventListener('mousedown', exit);
})
</script>
<template>
<div>
    <div class="publish-enter" @mousedown="enter">
        <span style="font-size: 13px;">{{ t('home.publish') }}</span>
        <svg-icon style="width: 12px; height: 12px;flex: 0 0 12px;" icon-class="white-down"/>
    </div>
    <div v-if="popover" class="publish-options-wrap">
        <div>{{ t('home.publish') }}</div>
        <div @click="downloadJs = true;">{{ t('home.downloadJs') }}</div>
    </div>
    <teleport to="body">
        <DownloadJS v-if="downloadJs" @close="downloadJs = false" :context="context"/>
    </teleport>
</div>
</template>
<style scoped lang="scss">
.publish-enter {
    position: relative;
    height: 32px;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background-color: var(--active-color);
    color: var(--theme-color-anti);
    cursor: pointer;

    > svg {
        transition: 0.2s;
    }
}

.publish-enter:hover {
    > svg {
        transform: translateY(2px);
    }
}

.publish-options-wrap {
    border-radius: 4px;
    background-color: #262626;
    position: absolute;
    width: 93px;
    top: 41px;
    padding: 6px 0;

    > div {
        height: 32px;
        padding: 0 6px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        color: var(--theme-color-anti);
        box-sizing: border-box;
        font-size: 13px;
    }

    > div:hover {
        background-color: var(--active-color);
    }
}
</style>