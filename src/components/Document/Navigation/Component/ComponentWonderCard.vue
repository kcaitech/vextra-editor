<script setup lang="ts">
import { h } from 'vue';
import comsMap from '@/components/Document/Content/comsmap';
import { SymbolShape } from "@kcdesign/data";
import { renderSymbolPreview as r } from "@kcdesign/data";
import { initCommonShape } from "@/components/Document/Content/common";

interface Props {
    data: SymbolShape
}
const props = defineProps<Props>();
const common = initCommonShape(props);
function gen_view_box() {
    const frame = props.data.frame;
    return `0 0 ${frame.width} ${frame.height}`;
}
function render() {
    const ret = r(h, props.data, comsMap, common.reflush);
    return ret;
}
</script>
<template>
    <div class="compo-preview-container">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" width="96px" height="96px"
            :viewBox='gen_view_box()' overflow="visible" class="render-wrap">
            <render></render>
        </svg>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100px;
    height: 100px;

    .render-wrap {
        margin-top: 2px;
        margin-left: 2px;
    }
}
</style>