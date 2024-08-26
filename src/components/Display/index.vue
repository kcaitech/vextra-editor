<script setup lang="ts">
import { onBeforeMount, shallowRef } from "vue";
import { fetchConfig, parserDocument } from "./parser";
import { Context } from "@/context";
import { initpal } from "@/components/common/initpal";
import { message } from "@/utils/message";
import { PageView } from "@kcdesign/data";
import PreviewContent from "@/components/Preview/PreviewContent.vue";

const context = shallowRef<Context | undefined>(undefined);
const pageView = shallowRef<PageView | undefined>(undefined);

async function initContext() {
    await initpal();
    const __context = await parserDocument();
    if (__context) {
        const config = await fetchConfig();
        if (!config) return message('danger', '无法获取配置文件，请尝试重新打包下载');
        const page = await __context.data.pagesMgr.get(config.pageId);
        if (!page) return message('danger', '包异常，请尝试重新打包下载');
        pageView.value = __context.getPageDom(page).dom;
        __context.selection.selectPage(pageView.value);
        const home = pageView.value.getShape(config.boardId);
        if (!home) return message('danger', '无法获取首页，请尝试重新打包下载');
        __context.selection.selectShape(home);
        context.value = __context;
    } else {
        message('danger', '包解析失败，请尝试重新打包下载');
    }
}

onBeforeMount(initContext);
</script>
<template>
    <div class="main" style="height: 100vh;">
        <PreviewContent v-if="context && pageView" id="content" :context="context" :page="pageView"/>
    </div>
</template>
<style lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100vh;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }
}

#app {
    position: absolute;
    width: 100%;
    height: 100%;
}
.main {
    min-width: 460px;
    width: 100%;
    overflow-x: auto;

    @media (max-width: 460px) {
        overflow-x: scroll;
    }

    &::-webkit-scrollbar {
        display: none;
    }

    &::-webkit-scrollbar-track {
        display: none;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        display: none;
    }

    &::-webkit-scrollbar-thumb:active {
        display: none;
    }

    #content {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
    }
}
</style>
